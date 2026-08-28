const fetchWithTimeout = async (url, options, ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const safeJson = async (resp) => {
  const text = await resp.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: 'Réponse inattendue du service distant.' };
  }
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { token, form } = JSON.parse(event.body);
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const web3formsKey = process.env.WEB3FORMS_KEY;

    if (!recaptchaSecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No reCAPTCHA secret configured' }),
      };
    }

    if (!web3formsKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No Web3Forms key configured' }),
      };
    }

    const verifyParams = new URLSearchParams();
    verifyParams.append('secret', recaptchaSecret);
    verifyParams.append('response', token);

    const verifyResp = await fetchWithTimeout(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: verifyParams,
      },
      5000
    );

    const verifyData = await safeJson(verifyResp);

    if (!verifyData.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'reCAPTCHA verification failed', details: verifyData }),
      };
    }

    const payload = {
      access_key: web3formsKey,
      subject: form.subject || `Nouvelle demande - ${form.name}`,
      name: form.name,
      phone: form.phone,
      email: form.email,
      building: form.building || '-',
      city: form.city,
      reference: form.reference || '-',
      latitude: form.latitude || '',
      longitude: form.longitude || '',
      google_maps_url: form.google_maps_url || '',
      'g-recaptcha-response': token,
      service: form.service,
      message: form.message,
    };

    const resp = await fetchWithTimeout(
      'https://api.web3forms.com/submit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      5000
    );

    const data = await safeJson(resp);

    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    const message =
      err?.name === 'AbortError'
        ? 'Délai dépassé sur un service externe (Google ou Web3Forms).'
        : err.message;
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
};

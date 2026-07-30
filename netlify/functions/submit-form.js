export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    let requestBody = {}

    try {
      requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {}
    } catch {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON payload' }),
      }
    }

    const { token, form } = requestBody;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const web3formsKey = process.env.WEB3FORMS_KEY;

    if (!recaptchaSecret) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No reCAPTCHA secret configured' }),
      };
    }

    if (!web3formsKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No Web3Forms key configured' }),
      };
    }

    const verifyParams = new URLSearchParams();
    verifyParams.append('secret', recaptchaSecret);
    verifyParams.append('response', token);

    const verifyResp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyParams,
    });

    let verifyData = {}
    try {
      verifyData = await verifyResp.json()
    } catch {
      verifyData = {}
    }

    if (!verifyData.success) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
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

    const resp = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data = {}
    try {
      data = await resp.json()
    } catch {
      data = {}
    }

    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};

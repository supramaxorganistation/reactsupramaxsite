const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/chatbot', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.openrouter.ai/v1/chat/completions',
      req.body,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Request failed';

    res.status(status).json({ error: message });
  }
});

app.post('/api/verify-recaptcha', async (req, res) => {
  const { token } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: 'Missing reCAPTCHA token' });
  }

  try {
    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'reCAPTCHA verification failed';

    return res.status(status).json({ error: message });
  }
});

app.post('/api/submit-form', async (req, res) => {
  const { token, ...formData } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: 'Missing reCAPTCHA token' });
  }

  try {
    const verificationResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!verificationResponse.data.success) {
      return res.status(400).json({
        error: 'reCAPTCHA verification failed',
        details: verificationResponse.data,
      });
    }

    const submitResponse = await axios.post(
      'https://api.web3forms.com/submit',
      {
        ...formData,
        access_key: process.env.WEB3FORMS_KEY,
        'g-recaptcha-response': token,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(submitResponse.status).json(submitResponse.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Form submission failed';

    return res.status(status).json({ error: message });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const port = process.env.SERVER_PORT || 4000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

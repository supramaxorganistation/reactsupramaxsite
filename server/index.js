const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || process.env.VITE_RECAPTCHA_SECRET_KEY;
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct';

const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY);

const buildOpenAiResponse = (content) => ({
  choices: [
    {
      message: { role: 'assistant', content },
    },
  ],
});

const toGeminiContents = (messages = []) => {
  const contents = [];

  for (const message of messages) {
    if (!message?.content) continue;
    if (message.role === 'system') continue;

    const role = message.role === 'assistant' ? 'model' : 'user';
    contents.push({
      role,
      parts: [{ text: String(message.content) }],
    });
  }

  return contents;
};

const extractGeminiText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((part) => part?.text || '')
    .filter(Boolean)
    .join('')
    .trim();
};

const postGeminiChat = async (body) => {
  const payload = {
    systemInstruction: body.systemInstruction,
    contents: toGeminiContents(body.messages),
    generationConfig: {
      temperature: body.temperature,
      maxOutputTokens: body.max_tokens,
    },
  };

  return axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
    payload,
    {
      params: { key: process.env.GEMINI_API_KEY },
      headers: { 'Content-Type': 'application/json' },
      timeout: 8000,
    }
  );
};

const postOpenRouterChat = async (body) => {
  const payload = {
    model: openRouterModel,
    ...body,
  };

  return axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
};

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/chatbot', async (req, res) => {
  try {
    const body = req.body || {};

    if (isGeminiConfigured) {
      const response = await postGeminiChat(body);
      const content = extractGeminiText(response.data) || 'Désolé, je n\'ai pas pu générer une réponse.';
      return res.status(200).json(buildOpenAiResponse(content));
    }

    const response = await postOpenRouterChat(body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    if (isGeminiConfigured && process.env.OPENROUTER_API_KEY) {
      try {
        const fallbackResponse = await postOpenRouterChat(req.body || {});
        return res.status(fallbackResponse.status).json(fallbackResponse.data);
      } catch (fallbackError) {
        const fallbackStatus = fallbackError.response?.status || 500;
        const fallbackMessage =
          fallbackError.response?.data?.error?.message ||
          fallbackError.response?.data?.message ||
          fallbackError.message ||
          'Request failed';

        return res.status(fallbackStatus).json({ error: fallbackMessage });
      }
    }

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
        secret: recaptchaSecret,
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
  const { token, form = {} } = req.body || {};

  if (!token) {
    return res.status(400).json({ error: 'Missing reCAPTCHA token' });
  }

  try {
    const verificationResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: recaptchaSecret,
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
        ...form,
        access_key: process.env.WEB3FORMS_KEY,
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

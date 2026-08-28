export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
    const openRouterModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct';

    const body = JSON.parse(event.body || '{}');
    const maxTokens = Math.min(Number(body.max_tokens) || 800, 400);

    const buildOpenAiResponse = (content) => ({
      choices: [{ message: { role: 'assistant', content } }],
    });

    const toGeminiContents = (messages = []) =>
      messages
        .filter((message) => message?.content)
        .filter((message) => message.role !== 'system')
        .map((message) => ({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(message.content) }],
        }));

    const extractGeminiText = (data) =>
      (data?.candidates?.[0]?.content?.parts || [])
        .map((part) => part?.text || '')
        .filter(Boolean)
        .join('')
        .trim();

    if (geminiApiKey) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);

      let geminiResponse;
      try {
        geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              contents: toGeminiContents(body.messages),
              generationConfig: {
                temperature: body.temperature,
                maxOutputTokens: maxTokens,
              },
            }),
          }
        );
      } finally {
        clearTimeout(timer);
      }

      if (!geminiResponse.ok) {
        if (openRouterApiKey) {
          const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openRouterApiKey}`,
            },
            body: JSON.stringify({
              model: openRouterModel,
              ...body,
              max_tokens: maxTokens,
            }),
          });

          const fallbackData = await fallbackResponse.json();

          return {
            statusCode: fallbackResponse.status,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackData),
          };
        }

        const geminiError = await geminiResponse.text();
        return {
          statusCode: geminiResponse.status,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: geminiError || 'Gemini request failed' }),
        };
      }

      const geminiData = await geminiResponse.json();
      const content = extractGeminiText(geminiData) || 'Désolé, je n\'ai pas pu générer une réponse.';

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildOpenAiResponse(content)),
      };
    }

    if (!openRouterApiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No API key configured' }),
      };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterApiKey}`,
      },
      body: JSON.stringify({
        model: openRouterModel,
        ...body,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

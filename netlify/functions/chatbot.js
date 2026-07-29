export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (geminiApiKey) {
      const systemPrompt = body.messages?.find((message) => message.role === 'system')?.content || '';
      const conversation = (body.messages || [])
        .filter((message) => message.role !== 'system')
        .slice(-10);

      const contents = [];

      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: `Instructions système:\n${systemPrompt}` }],
        });
      }

      for (const message of conversation) {
        contents.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content || '' }],
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: body.temperature ?? 0.7,
              maxOutputTokens: body.max_tokens ?? 800,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          statusCode: response.status,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: data.error?.message || 'Gemini request failed',
          }),
        };
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n’ai pas pu traiter votre demande. Réessayez plus tard.';

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choices: [{ message: { role: 'assistant', content: reply } }],
        }),
      };
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'No API key configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.' }),
      };
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterApiKey}`,
      },
      body: event.body,
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

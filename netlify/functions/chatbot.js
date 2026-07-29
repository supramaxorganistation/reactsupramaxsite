export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body || {};
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    const openRouterModel = process.env.OPENROUTER_MODEL || '';
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content || '';

    const fallbackReply = (input) => {
      const text = (input || '').toLowerCase();
      if (text.includes('panneau') || text.includes('fonctionnent') || text.includes('solaire')) {
        return 'Les panneaux solaires convertissent la lumière du soleil en électricité. Ils produisent de l’énergie même par temps nuageux, avec une production réduite, et peuvent réduire votre facture d’électricité. Pour un projet sur mesure, nous pouvons vous accompagner depuis l’étude jusqu’à l’installation.';
      }
      if (text.includes('devis') || text.includes('prix')) {
        return 'Nous pouvons préparer un devis adapté à votre projet. Envoyez-nous vos besoins et nous vous orienterons vers la solution la plus adaptée.';
      }
      if (text.includes('contact') || text.includes('contacter')) {
        return 'Vous pouvez nous contacter par WhatsApp au +216 50 910 808 ou via le formulaire de contact sur le site.';
      }
      return 'Je peux vous aider sur les solutions solaires photovoltaïques, les services SupraMax Energy, le devis et le contact. Posez votre question pour que je vous guide.';
    };

    const sendGemini = async () => {
      if (!geminiApiKey) return null;

      const systemPrompt = messages.find((message) => message.role === 'system')?.content || '';
      const conversation = messages.filter((message) => message.role !== 'system').slice(-10);
      const contents = [];

      if (systemPrompt) {
        contents.push({ role: 'user', parts: [{ text: `Instructions système:\n${systemPrompt}` }] });
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
        throw new Error(data.error?.message || 'Gemini request failed');
      }

      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n’ai pas pu traiter votre demande. Réessayez plus tard.';
    };

    const sendOpenRouter = async () => {
      if (!openRouterApiKey) return null;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterApiKey}`,
        },
        body: JSON.stringify({
          model: openRouterModel || 'openai/gpt-4o-mini',
          messages,
          temperature: body.temperature ?? 0.7,
          max_tokens: body.max_tokens ?? 800,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenRouter request failed');
      }

      return data.choices?.[0]?.message?.content || 'Désolé, je n’ai pas pu traiter votre demande. Réessayez plus tard.';
    };

    try {
      const reply = await sendGemini();
      if (reply) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choices: [{ message: { role: 'assistant', content: reply } }] }),
        };
      }
    } catch {
      // Ignore Gemini errors and fall back to OpenRouter or a local reply.
    }

    if (openRouterApiKey) {
      try {
        const openRouterReply = await sendOpenRouter();
        if (openRouterReply) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choices: [{ message: { role: 'assistant', content: openRouterReply } }] }),
          };
        }
      } catch {
        // Fall through to the local fallback response.
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ choices: [{ message: { role: 'assistant', content: fallbackReply(lastUserMessage) } }] }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

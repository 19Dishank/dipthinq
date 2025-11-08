// Local development version of the chat API handler
// This uses CommonJS for compatibility with Express

async function chatHandler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, agentId, history = [], modelId = 'openai/gpt-4o-mini' } = req.body;

  if (!message || !agentId) {
    return res.status(400).json({ error: 'Message and agentId are required' });
  }

  // Import agents (using dynamic import for ES6 modules)
  const agentsModule = await import('../src/agents.js');
  const agent = agentsModule.getAgentById(agentId);

  if (!agent) {
    return res.status(400).json({ error: 'Invalid agent ID' });
  }

  // Get API key from environment variables
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set');
    return res.status(500).json({ 
      error: 'Server configuration error: API key not found',
      message: 'Please add OPENROUTER_API_KEY to your .env file'
    });
  }

  // Build conversation history
  const conversationHistory = history.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // Add current user message
  conversationHistory.push({
    role: 'user',
    content: message
  });

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'X-Title': 'DipThinq'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'system',
            content: agent.systemPrompt
          },
          ...conversationHistory
        ],
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      console.error('OpenRouter API error:', errorData);
      const errorMessage = errorData?.error?.message || errorData?.error || errorData || 'Unknown error';
      return res.status(response.status).json({ 
        error: 'Failed to get response from AI service',
        details: errorMessage,
        model: modelId
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format:', data);
      return res.status(500).json({ 
        error: 'Unexpected response format from AI service'
      });
    }

    const aiResponse = data.choices[0].message.content;
    const actualModel = data.model || 'unknown';

    return res.status(200).json({ 
      response: aiResponse,
      model: actualModel,
      requestedModel: modelId
    });

  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = chatHandler;


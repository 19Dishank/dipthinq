export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, agentId, history = [], modelId = 'openai/gpt-4o-mini' } = req.body;

  if (!message || !agentId) {
    return res.status(400).json({ error: 'Message and agentId are required' });
  }

  // Import agents (using dynamic import for serverless compatibility)
  const { agents, getAgentById } = await import('../src/agents.js');
  const agent = getAgentById(agentId);

  if (!agent) {
    return res.status(400).json({ error: 'Invalid agent ID' });
  }

  // Get API key from environment variables
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set');
    return res.status(500).json({ 
      error: 'Server configuration error: API key not found',
      message: 'Please configure OPENROUTER_API_KEY in Vercel environment variables'
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
        model: modelId, // Use the selected model from the request
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
      const errorData = await response.text();
      console.error('OpenRouter API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to get response from AI service',
        details: errorData
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

    return res.status(200).json({ 
      response: aiResponse,
      model: data.model || 'unknown'
    });

  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}


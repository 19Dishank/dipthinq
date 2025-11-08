// Available AI models from different providers
export const models = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    modelId: 'openai/gpt-4o-mini',
    description: 'Fast and efficient, great for most tasks',
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    modelId: 'openai/gpt-4o',
    description: 'Most capable model, best for complex tasks',
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    modelId: 'openai/gpt-3.5-turbo',
    description: 'Fast and cost-effective',
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    modelId: 'deepseek/deepseek-chat',
    description: 'Powerful reasoning and coding capabilities',
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    modelId: 'deepseek/deepseek-coder',
    description: 'Specialized for coding tasks',
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    modelId: 'google/gemini-pro',
    description: 'Google\'s advanced AI model',
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    modelId: 'anthropic/claude-3-haiku',
    description: 'Fast and efficient Claude model',
    maxTokens: 4000,
    temperature: 0.7
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    modelId: 'anthropic/claude-3-sonnet',
    description: 'Balanced performance and capability',
    maxTokens: 4000,
    temperature: 0.7
  }
];

export const getModelById = (id) => {
  return models.find(model => model.id === id) || models[0];
};

export const getModelsByProvider = (provider) => {
  return models.filter(model => model.provider === provider);
};

export const getProviders = () => {
  return [...new Set(models.map(model => model.provider))];
};


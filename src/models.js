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
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    modelId: 'openai/gpt-3.5-turbo',
    description: 'Fast and cost-effective',
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


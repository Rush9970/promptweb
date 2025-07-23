// config.ts

export const config = {
  api: {
    openrouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    openrouterBaseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    openrouterModel: import.meta.env.VITE_OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free',
    maxRetries: parseInt(import.meta.env.VITE_MAX_RETRIES || '3', 10),
    rateLimitPerMinute: parseInt(import.meta.env.VITE_RATE_LIMIT_PER_MINUTE || '50', 10),
    rateLimitPerDay: parseInt(import.meta.env.VITE_RATE_LIMIT_PER_DAY || '50', 10),
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AI Assistant Hub',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  }
};



// Validate required environment variables
export const validateEnvironment = (): { isValid: boolean; missingVars: string[] } => {
  const requiredVars = ['VITE_OPENROUTER_API_KEY'];
  const missingVars: string[] = [];

  requiredVars.forEach((varName) => {
    const value = import.meta.env[varName];
    if (!value) {
      missingVars.push(varName);
    }
  });

  return {
    isValid: missingVars.length === 0,
    missingVars
  };
};

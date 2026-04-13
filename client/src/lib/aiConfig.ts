export interface AIProvider {
  id: string;
  name: string;
  url: string;
  models: string[];
  keyPrefix?: string;     // if set, key must start with this
  keyPlaceholder: string;
  docsUrl: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'groq',
    name: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    url: 'https://api.mistral.ai/v1/chat/completions',
    models: ['mistral-large-latest', 'mistral-small-latest', 'open-mixtral-8x7b'],
    keyPlaceholder: 'Clé API Mistral...',
    docsUrl: 'https://console.mistral.ai/api-keys/',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: [
      'anthropic/claude-3-haiku',
      'meta-llama/llama-3.3-70b-instruct',
      'mistralai/mixtral-8x7b-instruct',
      'google/gemma-2-9b-it:free',
    ],
    keyPrefix: 'sk-or-',
    keyPlaceholder: 'sk-or-...',
    docsUrl: 'https://openrouter.ai/keys',
  },
];

// ── LocalStorage keys ─────────────────────────────────────────────────────────
const LS_PROVIDER = 'walle_ai_provider';
const LS_KEY      = 'walle_ai_key';
const LS_MODEL    = 'walle_ai_model';
const LS_OLD_KEY  = 'walle_openai_key'; // backward compat

/** Migrate old single-key setup to new multi-provider config */
function migrate() {
  const old = localStorage.getItem(LS_OLD_KEY);
  if (old && !localStorage.getItem(LS_KEY)) {
    localStorage.setItem(LS_KEY, old);
    localStorage.setItem(LS_PROVIDER, 'openai');
  }
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export function loadAIConfig(): AIConfig {
  migrate();
  const providerId  = localStorage.getItem(LS_PROVIDER) ?? 'openai';
  const provider    = AI_PROVIDERS.find(p => p.id === providerId) ?? AI_PROVIDERS[0];
  const apiKey      = localStorage.getItem(LS_KEY) ?? '';
  const storedModel = localStorage.getItem(LS_MODEL) ?? '';
  const model       = provider.models.includes(storedModel) ? storedModel : provider.models[0];
  return { provider, apiKey, model };
}

export function saveAIConfig(providerId: string, apiKey: string, model: string) {
  localStorage.setItem(LS_PROVIDER, providerId);
  localStorage.setItem(LS_KEY, apiKey);
  localStorage.setItem(LS_MODEL, model);
  // keep legacy key so any old code referencing walle_openai_key still works
  localStorage.setItem(LS_OLD_KEY, apiKey);
}

export function clearAIConfig() {
  [LS_PROVIDER, LS_KEY, LS_MODEL, LS_OLD_KEY].forEach(k => localStorage.removeItem(k));
}

export function isKeyValid(provider: AIProvider, key: string): boolean {
  if (!key.trim() || key.length < 8) return false;
  if (provider.keyPrefix) return key.startsWith(provider.keyPrefix);
  return true;
}

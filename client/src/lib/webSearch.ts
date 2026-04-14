/**
 * Real-time web search via Tavily or Serper.dev (both support browser CORS calls).
 *
 * Tavily  – AI-focused, free 1 000 req/month  → https://tavily.com
 * Serper  – Google results, free 2 500 req/month → https://serper.dev
 */

const LS_KEY      = 'walle_search_key';
const LS_PROVIDER = 'walle_search_provider';

// ── Types ─────────────────────────────────────────────────────────────────────
export type SearchProviderId = 'tavily' | 'serper';

export interface SearchProviderMeta {
  id: SearchProviderId;
  name: string;
  docsUrl: string;
  keyPlaceholder: string;
  freeQuota: string;
}

export const SEARCH_PROVIDERS: SearchProviderMeta[] = [
  {
    id: 'tavily',
    name: 'Tavily',
    docsUrl: 'https://tavily.com',
    keyPlaceholder: 'tvly-…',
    freeQuota: '1 000 req/mois gratuites',
  },
  {
    id: 'serper',
    name: 'Serper',
    docsUrl: 'https://serper.dev',
    keyPlaceholder: 'Clé Serper…',
    freeQuota: '2 500 req/mois gratuites',
  },
];

export interface SearchConfig { provider: SearchProviderId; key: string; }

export function loadSearchConfig(): SearchConfig {
  return {
    provider: (localStorage.getItem(LS_PROVIDER) ?? 'tavily') as SearchProviderId,
    key:      localStorage.getItem(LS_KEY) ?? '',
  };
}
export function saveSearchConfig(provider: SearchProviderId, key: string): void {
  localStorage.setItem(LS_PROVIDER, provider);
  localStorage.setItem(LS_KEY, key);
}
export function clearSearchConfig(): void {
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(LS_PROVIDER);
}
export function isSearchKeyValid(key: string): boolean {
  return key.trim().length >= 12;
}

// ── Result types ──────────────────────────────────────────────────────────────
export interface WebSearchResult {
  title:    string;
  snippet:  string;
  url:      string;
  source:   string;      // domain, e.g. "lemonde.fr"
  imageUrl?: string;     // inline thumbnail (Serper)
}

export interface LastSearchData {
  query:   string;
  results: WebSearchResult[];
  images:  string[];     // extra image URLs (Tavily include_images)
}

// ── Cache for inline cards ────────────────────────────────────────────────────
let lastSearch: LastSearchData | null = null;
export function getLastSearch(): LastSearchData | null { return lastSearch; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function domain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

interface ProviderResult { results: WebSearchResult[]; images: string[]; }

// ── Tavily ────────────────────────────────────────────────────────────────────
async function searchTavily(query: string, key: string): Promise<ProviderResult> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_images: true,
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return { results: [], images: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: WebSearchResult[] = (data.results ?? []).map((r: any) => ({
    title:   r.title   as string,
    snippet: ((r.content as string) ?? '').slice(0, 250),
    url:     r.url     as string,
    source:  domain(r.url as string),
  }));
  const images: string[] = (data.images ?? []).slice(0, 4) as string[];
  return { results, images };
}

// ── Serper ────────────────────────────────────────────────────────────────────
async function searchSerper(query: string, key: string): Promise<ProviderResult> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 5, hl: 'fr', gl: 'fr' }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return { results: [], images: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json();
  const results: WebSearchResult[] = [];
  if (data.answerBox?.answer) {
    results.push({ title: 'Réponse directe', snippet: data.answerBox.answer as string, url: '', source: '' });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (data.organic ?? []).slice(0, 5) as any[]) {
    results.push({
      title:    r.title    as string,
      snippet:  (r.snippet ?? '') as string,
      url:      (r.link ?? '')    as string,
      source:   domain((r.link ?? '') as string),
      imageUrl: r.imageUrl as string | undefined,
    });
  }
  const images: string[] = results
    .map(r => r.imageUrl)
    .filter((u): u is string => !!u)
    .slice(0, 4);
  return { results, images };
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function webSearch(query: string): Promise<string> {
  const { provider, key } = loadSearchConfig();
  if (!key) return '';
  try {
    const { results, images } = provider === 'serper'
      ? await searchSerper(query, key)
      : await searchTavily(query, key);

    if (!results.length) return '';

    // Store for inline card
    lastSearch = { query, results, images };

    const lines = results.map((r, i) =>
      `[${i + 1}] ${r.title}${r.snippet ? ` — ${r.snippet}` : ''}`
    );
    return `Résultats web en temps réel pour "${query}" :\n${lines.join('\n')}`;
  } catch {
    lastSearch = null;
    return '';
  }
}

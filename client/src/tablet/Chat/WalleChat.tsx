import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetMap } from '../../types/widgets';
import { AI_PROVIDERS, AIConfig, isKeyValid, loadAIConfig, saveAIConfig, clearAIConfig } from '../../lib/aiConfig';
import { buildWidgetContext, getLastContextData } from '../../lib/buildWidgetContext';

const SYSTEM_BASE = `Tu es Walle, l'assistant IA personnel et attachant d'un tableau de bord domestique installé sur un mur. Tu es curieux, bienveillant, légèrement espiègle, et tu parles toujours en français avec chaleur et naturel.

Règles :
- Réponds toujours en français
- Sois concis et naturel (2-4 phrases sauf si la question est complexe)
- Utilise les données en temps réel fournies ci-dessous pour répondre précisément
- Pour l'actualité, base-toi UNIQUEMENT sur les titres fournis dans le contexte. Ne jamais inventer ou supposer des événements récents. Si un sujet d'actualité n'est pas dans les titres fournis, dis-le clairement : "Je n'ai pas d'info là-dessus pour l'instant."
- Si une donnée est absente, dis-le honnêtement`;

type WidgetType = 'weather' | 'football' | 'brocante' | 'news';
interface ChatMessage { role: 'user' | 'assistant'; content: string; widget?: WidgetType; }

// Detect topic from user message to attach matching inline card
function detectTopic(text: string): WidgetType | undefined {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (/meteo|temps qu|temperature|degre|pluie|vent|soleil|nuage|chaud|froid|humidite|prevision|climat/.test(t)) return 'weather';
  if (/foot|match|score|but |equipe|psg|lyon|om |marseille|ligue|liga|champion|joue|buteur|stade/.test(t)) return 'football';
  if (/brocante|vide.?grenier|marche aux puces/.test(t)) return 'brocante';
  if (/actu|actualite|news|journal|nouvelles|titre|article|monde|presse/.test(t)) return 'news';
  return undefined;
}

// WMO code → emoji
function wmoEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌦️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '❄️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

// ── Inline widget card shown below assistant reply ────────────────────────────
function InlineWidgetCard({ type }: { type: WidgetType }) {
  const data = getLastContextData();
  const cardStyle: React.CSSProperties = {
    marginTop: 8,
    borderRadius: 14,
    background: 'rgba(0,0,0,0.28)',
    border: '1px solid rgba(255,255,255,0.09)',
    padding: '10px 13px',
    fontSize: 12,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.5,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(167,139,250,0.6)',
    marginBottom: 6,
  };
  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
  };
  const chipStyle: React.CSSProperties = {
    fontSize: 10,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 8,
    padding: '2px 7px',
    color: 'rgba(255,255,255,0.5)',
    whiteSpace: 'nowrap',
  };
  const dimStyle: React.CSSProperties = {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.4)',
  };

  // ── Weather ──────────────────────────────────────────────────────────────────
  if (type === 'weather') {
    const w = data.weather;
    if (!w) return null;
    return (
      <div style={cardStyle}>
        <div style={labelStyle}>☁ Météo · {w.city}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 26, lineHeight: 1 }}>{wmoEmoji(w.code)}</span>
          <span style={{ fontSize: 22, fontWeight: 300 }}>{w.temp}{w.sym}</span>
          <span style={dimStyle}>ressenti {w.feels}{w.sym} · {w.desc}</span>
        </div>
        <div style={{ ...rowStyle, marginBottom: 8 }}>
          <span style={chipStyle}>💧 {w.humidity}%</span>
          <span style={chipStyle}>💨 {w.wind} km/h</span>
        </div>
        {w.forecast.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {w.forecast.map((f, i) => (
              <div key={i} style={{
                flex: 1, textAlign: 'center', borderRadius: 10,
                background: 'rgba(255,255,255,0.05)', padding: '5px 4px',
              }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{f.day}</div>
                <div style={{ fontSize: 14 }}>{wmoEmoji(f.code)}</div>
                <div style={{ fontSize: 10, fontWeight: 500 }}>{f.high}°</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{f.low}°</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Football ─────────────────────────────────────────────────────────────────
  if (type === 'football') {
    const matches = data.football;
    if (!matches?.length) return null;
    const now = new Date();
    return (
      <div style={cardStyle}>
        <div style={labelStyle}>⚽ Matchs</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {matches.slice(0, 5).map((m, i) => {
            const diffDays = Math.round((m.date.getTime() - now.getTime()) / 86_400_000);
            const when = m.status === 'live' ? '🔴 En direct'
              : diffDays === 0 ? `auj. ${m.time}`
              : diffDays === 1 ? `dem. ${m.time}`
              : diffDays === -1 ? 'hier'
              : m.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ` ${m.time}`;
            const score = m.homeScore !== null ? `${m.homeScore}–${m.awayScore}` : 'vs';
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.04)',
              }}>
                <span style={{ fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.home} <b style={{ color: 'rgba(255,255,255,0.5)' }}>{score}</b> {m.away}
                </span>
                <span style={{ ...chipStyle, marginLeft: 6 }}>{when}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Brocante ─────────────────────────────────────────────────────────────────
  if (type === 'brocante') {
    const events = data.brocante;
    if (!events?.length) return null;
    return (
      <div style={cardStyle}>
        <div style={labelStyle}>🛍 Brocantes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {events.slice(0, 4).map((e, i) => (
            <div key={i} style={{ padding: '5px 8px', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 2 }}>{e.name}</div>
              <div style={rowStyle}>
                <span style={chipStyle}>📅 {e.date}</span>
                <span style={chipStyle}>📍 {e.location} · {e.distanceKm} km</span>
                <span style={chipStyle}>{e.exhibitors} expo.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── News ──────────────────────────────────────────────────────────────────────
  if (type === 'news') {
    const titles = data.news;
    if (!titles?.length) return null;
    return (
      <div style={cardStyle}>
        <div style={labelStyle}>📰 À la une · Le Monde</div>
        <ul style={{ margin: 0, padding: '0 0 0 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {titles.slice(0, 6).map((t, i) => (
            <li key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{t}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSpeechRec = (): (new () => any) | undefined => {
  if (typeof window === 'undefined') return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

// ── Voice helpers ─────────────────────────────────────────────────────────────
const LS_VOICE       = 'walle_tts_voice';
const FEMININE_NAMES = ['amélie', 'léa', 'elise', 'élise', 'hortense', 'julie', 'audrey', 'alice', 'céline', 'celine', 'google'];
const MASCULINE_NAMES = ['thomas', 'paul', 'nicolas', 'pierre', 'daniel'];

function pickFemFrVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const fr = voices.filter(v => v.lang.startsWith('fr'));
  return fr.find(v => FEMININE_NAMES.some(k => v.name.toLowerCase().includes(k)))
    ?? fr.find(v => !MASCULINE_NAMES.some(k => v.name.toLowerCase().includes(k)))
    ?? fr[0];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  widgetConfig: WidgetMap;
  avatarSize: number;
  autoStartVoice?: boolean;
}

export function WalleChat({ isOpen, onClose, widgetConfig, avatarSize, autoStartVoice = false }: Props) {
  const [cfg, setCfg]               = useState<AIConfig>(() => loadAIConfig());
  const [keyInput, setKeyInput]     = useState('');
  const [selProvider, setSelProvider] = useState(() => loadAIConfig().provider.id);
  const [selModel, setSelModel]     = useState(() => loadAIConfig().model);
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState('');
  const [streaming, setStreaming]   = useState(false);
  const [streamText, setStreamText] = useState('');
  const [listening, setListening]   = useState(false);
  const [speaking, setSpeaking]     = useState(false);
  const [voiceName, setVoiceName]   = useState(() => localStorage.getItem(LS_VOICE) ?? '');
  const [voicePickerOpen, setVoicePickerOpen] = useState(false);
  const [frVoices, setFrVoices]     = useState<SpeechSynthesisVoice[]>([]);

  const scrollRef         = useRef<HTMLDivElement>(null);
  const inputRef          = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef    = useRef<any>(null);
  const streamingRef      = useRef(false);
  const continuousModeRef = useRef(false);

  useEffect(() => { streamingRef.current = streaming; }, [streaming]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamText]);

  useEffect(() => {
    if (isOpen && cfg.apiKey) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen, cfg.apiKey]);

  // Sync continuous mode: active when chat is open with a valid key
  useEffect(() => {
    continuousModeRef.current = isOpen && !!cfg.apiKey;
  }, [isOpen, cfg.apiKey]);

  useEffect(() => {
    if (!isOpen) {
      continuousModeRef.current = false;
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      setListening(false);
      setSpeaking(false);
    }
  }, [isOpen]);

  // Load available voices + watch for changes
  useEffect(() => {
    const update = () => setFrVoices((window.speechSynthesis?.getVoices() ?? []).filter(v => v.lang.startsWith('fr')));
    update();
    window.speechSynthesis?.addEventListener('voiceschanged', update);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', update);
  }, []);

  // Auto-select best feminine voice on first load (no stored preference)
  useEffect(() => {
    if (!frVoices.length || voiceName) return;
    const auto = pickFemFrVoice(frVoices);
    if (auto) { setVoiceName(auto.name); localStorage.setItem(LS_VOICE, auto.name); }
  }, [frVoices, voiceName]);

  // Auto-start voice when chat opens (if key is set and browser supports it)
  const toggleVoiceRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (!isOpen || !autoStartVoice || !cfg.apiKey) return;
    const timer = setTimeout(() => toggleVoiceRef.current(), 700);
    return () => clearTimeout(timer);
  }, [isOpen, autoStartVoice, cfg.apiKey]);

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = 'fr-FR';
    utterance.rate  = 0.92;
    utterance.pitch = 1.0;

    const go = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice  = (voiceName ? voices.find(v => v.name === voiceName) : null)
        ?? pickFemFrVoice(voices);
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend   = () => {
        setSpeaking(false);
        // Continuous conversation: auto-restart mic after Walle finishes speaking
        if (continuousModeRef.current && !streamingRef.current) {
          setTimeout(() => toggleVoiceRef.current(), 600);
        }
      };
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) go();
    else window.speechSynthesis.addEventListener('voiceschanged', go, { once: true });
  }, [voiceName]);

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendText = useCallback(async (text: string) => {
    if (!text.trim() || streamingRef.current || !cfg.apiKey) return;

    const topic = detectTopic(text);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setStreaming(true);
    setStreamText('');

    try {
      // Fetch live widget data to inject as context
      const widgetData = await buildWidgetContext(widgetConfig);
      const systemPrompt = `${SYSTEM_BASE}\n\n## État actuel de ta maison :\n${widgetData}`;

      const reqHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      };
      const reqBody = JSON.stringify({
        model: cfg.model,
        max_tokens: 600,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: text },
        ],
      });

      let res = await fetch(cfg.provider.url, { method: 'POST', headers: reqHeaders, body: reqBody });

      // Auto-retry once on rate limit (free tiers: Gemini 2 RPM, etc.)
      if (res.status === 429) {
        setStreamText('⏳ Limite de requêtes atteinte, je réessaie dans 5 s…');
        await new Promise(r => setTimeout(r, 5000));
        setStreamText('');
        res = await fetch(cfg.provider.url, { method: 'POST', headers: reqHeaders, body: reqBody });
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const apiMsg  = (errBody as { error?: { message?: string } }).error?.message;
        if (res.status === 429) throw new Error('Trop de requêtes — attends encore quelques secondes ⏳');
        if (res.status === 401) throw new Error('Clé API invalide — vérifie ta clé 🔑');
        if (res.status === 403) throw new Error('Accès refusé — quota épuisé ou clé incorrecte 🔑');
        if (res.status >= 500) throw new Error('Erreur du service IA — réessaie dans un moment 🔄');
        throw new Error(apiMsg ?? `Erreur ${res.status}`);
      }

      if (!res.body) throw new Error('No stream body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer      = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parsed = JSON.parse(data) as any;
            const chunk  = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (chunk) { accumulated += chunk; setStreamText(accumulated); }
          } catch { /* skip malformed */ }
        }
      }

      if (accumulated) {
        setMessages(prev => [...prev, { role: 'assistant', content: accumulated, widget: topic }]);
        speak(accumulated);
      }
      setStreamText('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setMessages(prev => [...prev, { role: 'assistant', content: `Oups ! ${msg} 😅` }]);
      setStreamText('');
    } finally {
      setStreaming(false);
    }
  }, [cfg, messages, widgetConfig, speak]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendText(text);
  }, [input, sendText]);

  // ── Voice input ──────────────────────────────────────────────────────────────
  const toggleVoice = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); return; }
    const SpeechRecAPI = getSpeechRec();
    if (!SpeechRecAPI) { alert("Reconnaissance vocale non disponible sur ce navigateur."); return; }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    const rec = new SpeechRecAPI();
    rec.lang = 'fr-FR';
    rec.interimResults = false;
    rec.continuous = false;
    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onerror  = () => setListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      const transcript = (event.results?.[0]?.[0]?.transcript ?? '') as string;
      if (transcript) sendText(transcript);
    };
    rec.start();
    recognitionRef.current = rec;
  }, [listening, sendText]);

  // Keep ref in sync so auto-start effect always calls the latest version
  useEffect(() => { toggleVoiceRef.current = toggleVoice; }, [toggleVoice]);

  // ── Save config ───────────────────────────────────────────────────────────────
  const provider = AI_PROVIDERS.find(p => p.id === selProvider) ?? AI_PROVIDERS[0];

  const handleProviderChange = (pid: string) => {
    setSelProvider(pid);
    const p = AI_PROVIDERS.find(pr => pr.id === pid) ?? AI_PROVIDERS[0];
    setSelModel(p.models[0]);
    setKeyInput('');
  };

  const confirmKey = () => {
    const k = keyInput.trim();
    if (!isKeyValid(provider, k)) return;
    saveAIConfig(selProvider, k, selModel);
    setCfg(loadAIConfig());
    setKeyInput('');
  };

  const leftOffset = avatarSize + 40;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Bulle principale ──────────────────────────────────────────── */}
          <motion.div
            key="bubble"
            initial={{ opacity: 0, x: 30, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{
              position: 'fixed', left: leftOffset, right: 20, top: 70, bottom: 96,
              borderRadius: 24,
              background: 'rgba(8,4,22,0.92)', backdropFilter: 'blur(24px)',
              border: '1px solid rgba(167,139,250,0.28)',
              boxShadow: '0 0 0 1px rgba(167,139,250,0.07), 0 24px 60px rgba(0,0,0,0.55), 0 0 40px rgba(90,50,180,0.14)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 25,
            }}
          >
            {/* Flèche vers Walle */}
            <div style={{ position: 'absolute', left: -11, top: '42%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '11px solid transparent', borderBottom: '11px solid transparent', borderRight: '11px solid rgba(167,139,250,0.28)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: -9,  top: '42%', transform: 'translateY(-50%)', width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderRight: '10px solid rgba(8,4,22,0.92)', pointerEvents: 'none' }} />

            {/* Header */}
            <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <motion.div
                animate={{ scale: speaking ? [1, 1.5, 1] : [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: speaking ? 0.4 : 2, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: speaking ? 'rgba(100,220,150,0.9)' : 'rgba(167,139,250,0.9)', boxShadow: speaking ? '0 0 8px rgba(100,220,150,0.7)' : '0 0 8px rgba(167,139,250,0.7)' }}
              />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: speaking ? 'rgba(100,220,150,0.8)' : 'rgba(167,139,250,0.75)' }}>
                {speaking ? 'Walle parle…' : 'Walle'}
              </span>
              <div style={{ flex: 1 }} />
              {/* Provider badge + change */}
              {cfg.apiKey && (
                <button
                  onClick={() => {
                    setSelProvider(cfg.provider.id);
                    setSelModel(cfg.model);
                    clearAIConfig();
                    setCfg(loadAIConfig());
                  }}
                  title={`${cfg.provider.name} · ${cfg.model} — Changer`}
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 10, padding: '2px 8px', fontFamily: 'inherit' }}
                >{cfg.provider.name} · {cfg.model.split('/').pop()}</button>
              )}
              {/* Voice picker button */}
              {cfg.apiKey && (
                <button
                  onClick={() => setVoicePickerOpen(o => !o)}
                  title="Changer la voix"
                  style={{
                    background: voicePickerOpen ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${voicePickerOpen ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    color: voicePickerOpen ? 'rgba(167,139,250,0.85)' : 'rgba(255,255,255,0.35)',
                    fontSize: 10, padding: '2px 8px', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >🔊 {voiceName ? voiceName.split(' ').slice(0, 2).join(' ') : 'Voix'}</button>
              )}
              <button onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', fontSize: 16, padding: '2px 6px', lineHeight: 1 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}>✕</button>
            </div>

            {/* ── Voice picker panel ── */}
            {voicePickerOpen && cfg.apiKey && (
              <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(167,139,250,0.1)', background: 'rgba(0,0,0,0.18)', flexShrink: 0 }}>
                <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                  Voix françaises disponibles · clique pour tester
                </p>
                {frVoices.length === 0 ? (
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>Aucune voix française détectée sur cet appareil</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {frVoices.map(v => (
                      <button key={v.name} onClick={() => {
                        setVoiceName(v.name);
                        localStorage.setItem(LS_VOICE, v.name);
                        const u = new SpeechSynthesisUtterance('Bonjour, je suis Walle !');
                        u.voice = v; u.lang = 'fr-FR'; u.rate = 0.92; u.pitch = 1.0;
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(u);
                        setVoicePickerOpen(false);
                      }} style={{
                        padding: '5px 11px', borderRadius: 8, fontSize: 11, fontFamily: 'inherit',
                        border: voiceName === v.name ? '1px solid rgba(167,139,250,0.55)' : '1px solid rgba(255,255,255,0.1)',
                        background: voiceName === v.name ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.05)',
                        color: voiceName === v.name ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer', transition: 'all 0.12s',
                      }}>{v.name}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Saisie de la clé API si absente ── */}
            {!cfg.apiKey ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14, scrollbarWidth: 'none' }}>

                {/* Provider tabs */}
                <div>
                  <p style={{ margin: '0 0 7px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Fournisseur IA</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                    {AI_PROVIDERS.map(p => (
                      <button key={p.id} onClick={() => handleProviderChange(p.id)} style={{
                        padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                        border: selProvider === p.id ? '1px solid rgba(167,139,250,0.55)' : '1px solid rgba(255,255,255,0.09)',
                        background: selProvider === p.id ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.04)',
                        color: selProvider === p.id ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>{p.name}</button>
                    ))}
                  </div>
                </div>

                {/* Model select */}
                <div>
                  <p style={{ margin: '0 0 7px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Modèle</p>
                  <select value={selModel} onChange={e => setSelModel(e.target.value)} style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: '1px solid rgba(167,139,250,0.25)',
                    background: 'rgba(20,12,40,0.9)',
                    color: 'rgba(255,255,255,0.85)', fontSize: 13, outline: 'none',
                    fontFamily: 'inherit', cursor: 'pointer',
                  }}>
                    {provider.models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* API Key input */}
                <div>
                  <p style={{ margin: '0 0 7px', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>Clé API</p>
                  <input
                    autoFocus
                    type="password"
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && confirmKey()}
                    placeholder={provider.keyPlaceholder}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
                      border: '1px solid rgba(167,139,250,0.3)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.88)', fontSize: 13, outline: 'none', fontFamily: 'monospace',
                    }}
                  />
                </div>

                <motion.button
                  onClick={confirmKey}
                  disabled={!isKeyValid(provider, keyInput.trim())}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '11px 0', borderRadius: 11, border: 'none', width: '100%',
                    cursor: isKeyValid(provider, keyInput.trim()) ? 'pointer' : 'default',
                    background: isKeyValid(provider, keyInput.trim()) ? 'rgba(167,139,250,0.85)' : 'rgba(255,255,255,0.08)',
                    color: 'white', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                  }}
                >Valider</motion.button>

                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.6 }}>
                  Clé stockée localement · jamais partagée<br />
                  <span style={{ color: 'rgba(167,139,250,0.4)' }}>{provider.docsUrl}</span>
                </p>
              </div>
            ) : (
              /* ── Messages ── */
              <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'none' }}>
                {messages.length === 0 && !streamText && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.9, y: 0 }} transition={{ delay: 0.2 }}
                    style={{ margin: 'auto', textAlign: 'center', color: 'rgba(255,255,255,0.22)', fontSize: 13, lineHeight: 1.7 }}>
                    Bonjour ! Je suis Walle 👋<br />Parle-moi ou tape ta question.<br />Je connais ta maison !
                  </motion.div>
                )}

                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user' ? 'rgba(167,139,250,0.22)' : 'rgba(255,255,255,0.055)',
                      border: msg.role === 'user' ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                    }}>{msg.content}</div>
                    {msg.role === 'assistant' && msg.widget && <InlineWidgetCard type={msg.widget} />}
                  </motion.div>
                ))}

                {streaming && !streamText && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ alignSelf: 'flex-start' }}>
                    <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 5, alignItems: 'center' }}>
                      {[0,1,2].map(i => (
                        <motion.div key={i} animate={{ y: [0,-5,0] }} transition={{ duration: 0.55, repeat: Infinity, delay: i*0.14, ease: 'easeInOut' }}
                          style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(167,139,250,0.75)' }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {streamText && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ alignSelf: 'flex-start', maxWidth: '88%' }}>
                    <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                      {streamText}
                      <motion.span animate={{ opacity: [1,0,1] }} transition={{ duration: 0.7, repeat: Infinity }}
                        style={{ display: 'inline-block', marginLeft: 1, width: 2, height: '1em', background: 'rgba(167,139,250,0.85)', verticalAlign: 'text-bottom', borderRadius: 1 }} />
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* ── Barre de saisie (masquée si pas de clé) ──────────────────── */}
          {cfg.apiKey && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
              transition={{ delay: 0.08 }}
              style={{ position: 'fixed', left: leftOffset, right: 20, bottom: 20, display: 'flex', gap: 8, zIndex: 26 }}
            >
              {/* Micro */}
              <motion.button onClick={toggleVoice} disabled={streaming}
                whileTap={{ scale: 0.88 }}
                animate={listening ? { scale: [1, 1.12, 1] } : {}}
                transition={listening ? { duration: 0.7, repeat: Infinity } : {}}
                style={{
                  width: 50, height: 50, borderRadius: 14, border: 'none', flexShrink: 0,
                  cursor: streaming ? 'default' : 'pointer',
                  background: listening ? 'rgba(240,80,80,0.8)' : 'rgba(255,255,255,0.07)',
                  color: 'white', fontSize: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: listening ? '0 0 18px rgba(240,80,80,0.5)' : 'none',
                  transition: 'all 0.2s',
                }}>
                {listening ? '⏹' : '🎤'}
              </motion.button>

              {/* Texte */}
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={listening ? 'Écoute en cours…' : 'Ou tape ta question…'}
                disabled={streaming || listening}
                style={{
                  flex: 1, padding: '13px 18px', borderRadius: 16,
                  border: '1px solid rgba(167,139,250,0.22)',
                  background: 'rgba(8,4,22,0.92)', backdropFilter: 'blur(20px)',
                  color: 'rgba(255,255,255,0.88)', fontSize: 14, outline: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontFamily: 'inherit',
                }}
              />

              {/* Envoyer */}
              <motion.button onClick={handleSend} disabled={!input.trim() || streaming}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: 50, height: 50, borderRadius: 14, border: 'none', flexShrink: 0,
                  cursor: input.trim() && !streaming ? 'pointer' : 'default',
                  background: input.trim() && !streaming ? 'rgba(167,139,250,0.85)' : 'rgba(255,255,255,0.07)',
                  color: 'white', fontSize: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: input.trim() && !streaming ? '0 0 16px rgba(167,139,250,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}>↑</motion.button>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

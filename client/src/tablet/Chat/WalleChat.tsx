import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetMap } from '../../types/widgets';

// ── OpenAI key persisted in localStorage ────────────────────────────────────
const KEY_STORAGE = 'walle_openai_key';
const loadKey  = () => localStorage.getItem(KEY_STORAGE) ?? '';
const saveKey  = (k: string) => localStorage.setItem(KEY_STORAGE, k);

// ── Build system prompt from widget config (no server needed) ────────────────
function buildSystemPrompt(widgetConfig: WidgetMap): string {
  const ctx: string[] = [];
  const w = widgetConfig.weather;
  const b = widgetConfig.brocante;
  const f = widgetConfig.football;
  if (w?.id === 'weather')  ctx.push(`Météo configurée pour ${w.config.city} (${w.config.unit})`);
  if (b?.id === 'brocante') ctx.push(`Brocantes surveillées autour de ${b.config.city}, rayon ${b.config.radiusKm} km`);
  if (f?.id === 'football') ctx.push(`Équipes de foot suivies : ${f.config.teams.join(', ')}`);

  const context = ctx.length
    ? `\n\n## Configuration de la maison :\n${ctx.join('\n')}`
    : '';

  return `Tu es Walle, l'assistant IA personnel et attachant d'un tableau de bord domestique installé sur un mur. Tu es curieux, bienveillant, légèrement espiègle, et tu parles toujours en français avec chaleur et naturel.

Règles :
- Réponds toujours en français
- Sois concis et naturel (2-4 phrases sauf si la question est complexe)
- Sois utile, précis, et agréable
- Utilise le contexte de la maison fourni${context}`;
}

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSpeechRec = (): (new () => any) | undefined => {
  if (typeof window === 'undefined') return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  widgetConfig: WidgetMap;
  avatarSize: number;
}

export function WalleChat({ isOpen, onClose, widgetConfig, avatarSize }: Props) {
  const [apiKey, setApiKeyState]    = useState(loadKey);
  const [keyInput, setKeyInput]     = useState('');
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [input, setInput]           = useState('');
  const [streaming, setStreaming]   = useState(false);
  const [streamText, setStreamText] = useState('');
  const [listening, setListening]   = useState(false);
  const [speaking, setSpeaking]     = useState(false);

  const scrollRef      = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const streamingRef   = useRef(false);

  useEffect(() => { streamingRef.current = streaming; }, [streaming]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, streamText]);

  useEffect(() => {
    if (isOpen && apiKey) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen, apiKey]);

  useEffect(() => {
    if (!isOpen) {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      setListening(false);
      setSpeaking(false);
    }
  }, [isOpen]);

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance    = new SpeechSynthesisUtterance(text);
    utterance.lang     = 'fr-FR';
    utterance.rate     = 0.93;
    utterance.pitch    = 1.05;

    const go = () => {
      const voices  = window.speechSynthesis.getVoices();
      const frVoice = voices.find(v => v.lang.startsWith('fr') && v.localService)
        ?? voices.find(v => v.lang.startsWith('fr'));
      if (frVoice) utterance.voice = frVoice;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend   = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length > 0) go();
    else window.speechSynthesis.addEventListener('voiceschanged', go, { once: true });
  }, []);

  // ── Send message (direct OpenAI call) ────────────────────────────────────────
  const sendText = useCallback(async (text: string) => {
    if (!text.trim() || streamingRef.current || !apiKey) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setStreaming(true);
    setStreamText('');

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 600,
          stream: true,
          messages: [
            { role: 'system', content: buildSystemPrompt(widgetConfig) },
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text },
          ],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
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
        setMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
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
  }, [apiKey, messages, widgetConfig, speak]);

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

  // ── Save key ──────────────────────────────────────────────────────────────────
  const confirmKey = () => {
    const k = keyInput.trim();
    if (!k.startsWith('sk-')) return;
    saveKey(k);
    setApiKeyState(k);
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
              {/* Change API key */}
              {apiKey && (
                <button
                  onClick={() => { saveKey(''); setApiKeyState(''); }}
                  title="Changer la clé API"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.2)', fontSize: 12, padding: '2px 6px' }}
                >🔑</button>
              )}
              <button onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.28)', fontSize: 16, padding: '2px 6px', lineHeight: 1 }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}>✕</button>
            </div>

            {/* ── Saisie de la clé API si absente ── */}
            {!apiKey ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, gap: 16 }}>
                <span style={{ fontSize: 32 }}>🔑</span>
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  Pour parler à Walle, entre ta clé<br />
                  <strong style={{ color: 'rgba(167,139,250,0.9)' }}>OpenAI API key</strong><br />
                  <span style={{ fontSize: 11, opacity: 0.5 }}>Elle est sauvegardée localement sur ta tablette.</span>
                </p>
                <input
                  autoFocus
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && confirmKey()}
                  placeholder="sk-..."
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1px solid rgba(167,139,250,0.3)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.88)', fontSize: 14, outline: 'none', fontFamily: 'monospace',
                  }}
                />
                <motion.button
                  onClick={confirmKey}
                  disabled={!keyInput.startsWith('sk-')}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '10px 28px', borderRadius: 12, border: 'none', cursor: keyInput.startsWith('sk-') ? 'pointer' : 'default',
                    background: keyInput.startsWith('sk-') ? 'rgba(167,139,250,0.85)' : 'rgba(255,255,255,0.08)',
                    color: 'white', fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
                  }}
                >
                  Valider
                </motion.button>
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
                    style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user' ? 'rgba(167,139,250,0.22)' : 'rgba(255,255,255,0.055)',
                      border: msg.role === 'user' ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                    }}>{msg.content}</div>
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
          {apiKey && (
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

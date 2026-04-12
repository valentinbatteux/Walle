import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetMap } from '../../types/widgets';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  widgetConfig: WidgetMap;
  avatarSize: number;
}

export function WalleChat({ isOpen, onClose, widgetConfig, avatarSize }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput]       = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Scroll to bottom when content changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamText]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);
    setStreamText('');

    try {
      // Build a plain widget config (strip non-serialisable parts)
      const configPayload = Object.fromEntries(
        Object.entries(widgetConfig).map(([k, v]) => [k, { config: v.config }])
      );

      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10),
          widgetConfig: configPayload,
        }),
      });

      if (!res.body) throw new Error('No stream body');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data) as { text?: string };
            if (parsed.text) {
              accumulated += parsed.text;
              setStreamText(accumulated);
            }
          } catch { /* ignore parse errors */ }
        }
      }

      // Move streamed reply into history
      if (accumulated) {
        setMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
      }
      setStreamText('');
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Oups, j\'ai eu un petit souci ! Réessaie dans un instant. 😅' },
      ]);
      setStreamText('');
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, messages, widgetConfig]);

  const leftOffset = avatarSize + 40;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Speech bubble ── */}
          <motion.div
            key="bubble"
            initial={{ opacity: 0, x: 30, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            style={{
              position: 'fixed',
              left: leftOffset,
              right: 20,
              top: 70,
              bottom: 90,
              borderRadius: 24,
              background: 'rgba(8,4,22,0.90)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(167,139,250,0.28)',
              boxShadow:
                '0 0 0 1px rgba(167,139,250,0.08), 0 24px 60px rgba(0,0,0,0.55), 0 0 40px rgba(90,50,180,0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 25,
            }}
          >
            {/* Arrow pointing left toward Walle */}
            <div style={{
              position: 'absolute', left: -11, top: '42%',
              transform: 'translateY(-50%)',
              width: 0, height: 0,
              borderTop: '11px solid transparent',
              borderBottom: '11px solid transparent',
              borderRight: '11px solid rgba(167,139,250,0.28)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', left: -9, top: '42%',
              transform: 'translateY(-50%)',
              width: 0, height: 0,
              borderTop: '10px solid transparent',
              borderBottom: '10px solid transparent',
              borderRight: '10px solid rgba(8,4,22,0.90)',
              pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{
              padding: '14px 18px 10px',
              borderBottom: '1px solid rgba(167,139,250,0.12)',
              display: 'flex', alignItems: 'center', gap: 8,
              flexShrink: 0,
            }}>
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'rgba(167,139,250,0.9)',
                  boxShadow: '0 0 8px rgba(167,139,250,0.7)',
                }}
              />
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: 'rgba(167,139,250,0.75)',
              }}>
                Walle
              </span>
              <div style={{ flex: 1 }} />
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.28)', fontSize: 16,
                  padding: '2px 6px', lineHeight: 1, borderRadius: 6,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
              >
                ✕
              </button>
            </div>

            {/* Message list */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                scrollbarWidth: 'none',
              }}
            >
              {/* Empty state */}
              {messages.length === 0 && !streamText && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.9, y: 0 }}
                  transition={{ delay: 0.2 }}
                  style={{
                    margin: 'auto',
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.22)',
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  Bonjour ! Je suis Walle 👋<br />
                  Pose-moi une question sur tes<br />
                  tâches, tes brocantes, ta météo…
                </motion.div>
              )}

              {/* History */}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                  }}
                >
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user'
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? 'rgba(167,139,250,0.22)'
                      : 'rgba(255,255,255,0.055)',
                    border: msg.role === 'user'
                      ? '1px solid rgba(167,139,250,0.3)'
                      : '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.88)',
                    fontSize: 14,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Loading dots */}
              {streaming && !streamText && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <div style={{
                    padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
                    background: 'rgba(255,255,255,0.055)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    display: 'flex', gap: 5, alignItems: 'center',
                  }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14, ease: 'easeInOut' }}
                        style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: 'rgba(167,139,250,0.75)',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Streaming text (live typewriter) */}
              {streamText && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ alignSelf: 'flex-start', maxWidth: '88%' }}
                >
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'rgba(255,255,255,0.055)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.88)',
                    fontSize: 14,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {streamText}
                    {/* Blinking cursor */}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      style={{
                        display: 'inline-block',
                        marginLeft: 1,
                        width: 2, height: '1em',
                        background: 'rgba(167,139,250,0.85)',
                        verticalAlign: 'text-bottom',
                        borderRadius: 1,
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* ── Input bar ── */}
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 14 }}
            transition={{ delay: 0.08 }}
            style={{
              position: 'fixed',
              left: leftOffset,
              right: 20,
              bottom: 20,
              display: 'flex',
              gap: 8,
              zIndex: 26,
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Pose une question à Walle…"
              disabled={streaming}
              style={{
                flex: 1,
                padding: '13px 18px',
                borderRadius: 16,
                border: '1px solid rgba(167,139,250,0.22)',
                background: 'rgba(8,4,22,0.92)',
                backdropFilter: 'blur(20px)',
                color: 'rgba(255,255,255,0.88)',
                fontSize: 14,
                outline: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                fontFamily: 'inherit',
              }}
            />
            <motion.button
              onClick={send}
              disabled={!input.trim() || streaming}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 50, height: 50,
                borderRadius: 14,
                border: 'none',
                flexShrink: 0,
                cursor: input.trim() && !streaming ? 'pointer' : 'default',
                background: input.trim() && !streaming
                  ? 'rgba(167,139,250,0.85)'
                  : 'rgba(255,255,255,0.07)',
                color: 'white',
                fontSize: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: input.trim() && !streaming
                  ? '0 0 16px rgba(167,139,250,0.4)'
                  : 'none',
                transition: 'all 0.2s',
              }}
            >
              ↑
            </motion.button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

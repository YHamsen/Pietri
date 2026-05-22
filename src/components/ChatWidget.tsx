'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ChatWidget — Assistant IA flottant (Support + Shopping)
// Visible sur toutes les pages boutique, exclu de /admin et /auth
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

type Message = { role: 'user' | 'assistant'; content: string; ts?: number };
type Mode = 'support' | 'shop';

const SUGGESTED: Record<Mode, string[]> = {
  support: [
    'Quels sont les délais de livraison ?',
    'Comment faire un retour ?',
    'Quelle taille choisir ?',
    'Modes de paiement acceptés ?',
  ],
  shop: [
    'Je cherche un look streetwear pour sortir',
    'Quel produit pour offrir à un ami ?',
    'Les drops sont-ils disponibles ?',
    'Quelle différence entre les hoodies ?',
  ],
};

const GREETINGS: Record<Mode, string> = {
  support: 'Bonjour 👋 Je suis l\'assistant PIETRI. Comment puis-je t\'aider ?',
  shop: 'Salut ! Je suis ton conseiller shopping PIETRI 🖤 Dis-moi ce que tu cherches !',
};

// Pages où le widget doit être masqué
const HIDDEN_PATHS = ['/admin', '/auth/', '/connect/auth', '/connect/compte'];

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen]     = useState(false);
  const [mode, setMode]     = useState<Mode>('support');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]   = useState('');
  const [streaming, setStreaming] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const abortRef  = useRef<AbortController | null>(null);

  // Masquer sur certaines pages
  const hidden = HIDDEN_PATHS.some(p => pathname.startsWith(p));
  if (hidden) return null;

  // Init greeting quand on change de mode ou à l'ouverture
  useEffect(() => {
    setMessages([{ role: 'assistant', content: GREETINGS[mode], ts: Date.now() }]);
  }, [mode]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || streaming) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg, ts: Date.now() };
    const history = messages.filter(m => m.role !== 'assistant' || messages.indexOf(m) > 0);

    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', ts: Date.now() }]);
    setStreaming(true);

    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          mode,
          history: history.map(({ role, content }) => ({ role, content })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('Erreur serveur');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part.replace(/^data: /, '').trim();
          if (!line) continue;
          try {
            const evt = JSON.parse(line);
            if (evt.type === 'delta') {
              accumulated += evt.text;
              setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: accumulated, ts: Date.now() };
                return next;
              });
            }
          } catch {}
        }
      }

      if (!open) setUnread(u => u + 1);
    } catch (err: unknown) {
      if ((err as { name?: string }).name !== 'AbortError') {
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: 'Désolé, une erreur est survenue. Réessaie ou contacte-nous à contact@pietri.io',
            ts: Date.now(),
          };
          return next;
        });
      }
    } finally {
      setStreaming(false);
    }
  }, [input, messages, mode, open, streaming]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* ── Bouton flottant ─────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Assistant PIETRI"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9000,
          width: 52, height: 52, borderRadius: '50%',
          background: 'white', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          transition: 'transform 220ms cubic-bezier(0.32,0.72,0,1)',
          transform: open ? 'scale(0.92)' : 'scale(1)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = open ? 'scale(0.92)' : 'scale(1)'; }}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
        )}
        {unread > 0 && !open && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#f87171', color: 'white',
            fontSize: '0.6rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{unread}</span>
        )}
      </button>

      {/* ── Drawer / fenêtre chat ───────────────────────────── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 8999,
          width: 'min(380px, calc(100vw - 2rem))',
          height: 'min(520px, calc(100vh - 8rem))',
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'system-ui,-apple-system,sans-serif',
          animation: 'chatSlideIn 220ms cubic-bezier(0.32,0.72,0,1)',
        }}>

          {/* Header */}
          <div style={{
            padding: '0.85rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontFamily: "'Anton',sans-serif", fontSize: '0.65rem', color: '#050505', letterSpacing: '0.04em' }}>P</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Assistant PIETRI</p>
              <p style={{ margin: 0, fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)' }}>
                {streaming ? 'En train d\'écrire…' : '● En ligne'}
              </p>
            </div>
            {/* Mode tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '0.2rem' }}>
              {(['support', 'shop'] as Mode[]).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  style={{
                    padding: '0.28rem 0.6rem',
                    background: mode === m ? 'rgba(255,255,255,0.12)' : 'transparent',
                    border: 'none', borderRadius: 6,
                    color: mode === m ? 'white' : 'rgba(255,255,255,0.4)',
                    fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', cursor: 'pointer',
                    transition: 'all 150ms',
                  }}>
                  {m === 'support' ? 'SAV' : 'Shopping'}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '0.85rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '0.65rem',
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '82%',
                  padding: '0.55rem 0.85rem',
                  borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? 'white' : 'rgba(255,255,255,0.07)',
                  color: m.role === 'user' ? '#050505' : 'rgba(255,255,255,0.9)',
                  fontSize: '0.78rem', lineHeight: 1.55,
                  border: m.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  {m.content || (
                    <span style={{ opacity: 0.4 }}>
                      <span style={{ animation: 'blink 1.2s infinite' }}>●</span>
                      <span style={{ animation: 'blink 1.2s infinite 0.2s', marginLeft: 3 }}>●</span>
                      <span style={{ animation: 'blink 1.2s infinite 0.4s', marginLeft: 3 }}>●</span>
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Suggestions (seulement après le greeting) */}
            {messages.length === 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                {SUGGESTED[mode].map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 999, color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.65rem', cursor: 'pointer',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', gap: '0.5rem', alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={mode === 'shop' ? 'Dis-moi ce que tu cherches…' : 'Ta question…'}
              disabled={streaming}
              style={{
                flex: 1, padding: '0.6rem 0.85rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 999, color: 'white',
                fontSize: '0.78rem',
                fontFamily: 'system-ui,-apple-system,sans-serif',
                outline: 'none',
                opacity: streaming ? 0.5 : 1,
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: input.trim() && !streaming ? 'white' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !streaming ? '#050505' : 'rgba(255,255,255,0.3)'}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes blink {
          0%,100% { opacity: 0.2; }
          50%      { opacity: 1; }
        }
      `}</style>
    </>
  );
}

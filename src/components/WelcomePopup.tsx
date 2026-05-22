'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = '_pietri_welcome';

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { tr } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 2800);
    return () => clearTimeout(timer);
  }, [pathname]);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || loading) return;
    setLoading(true);
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'popup' }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
    sessionStorage.setItem(STORAGE_KEY, '1');
    setTimeout(close, 2600);
  };

  if (!visible) return null;

  /* ── Mobile: bottom sheet ── */
  if (isMobile) {
    return (
      <>
        <style>{`
          @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        `}</style>
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', animation: 'fadeIn 250ms ease' }}
          onClick={close}
        />
        <div
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 901,
            background: '#111', borderRadius: '20px 20px 0 0',
            padding: '2rem 1.5rem 2.5rem',
            animation: 'sheetUp 320ms cubic-bezier(0.32,0.72,0,1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 1.75rem' }} />
          <span style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '0.7rem' }}>{tr.popupBadge}</span>
          <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(1.6rem,8vw,2rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1, color: 'white', marginBottom: '0.75rem' }}>
            {tr.popupTitle}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{tr.popupSub}</p>
          {submitted ? (
            <div style={{ padding: '0.9rem 1.25rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>
              {tr.popupSuccess}
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', gap: 0 }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={tr.popupPlaceholder}
                required
                style={{ flex: 1, padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', borderRight: 'none', borderRadius: '10px 0 0 10px', color: 'white', fontSize: '0.8rem', outline: 'none', fontFamily: "'Inter', sans-serif" }}
              />
              <button type="submit" disabled={loading} style={{ padding: '0 1.1rem', background: loading ? 'rgba(255,255,255,0.5)' : 'white', color: '#0a0a0a', border: 'none', borderRadius: '0 10px 10px 0', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
                {loading ? <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0 0.2rem' }}>…</span> : <ArrowRight size={18} strokeWidth={2.5} />}
              </button>
            </form>
          )}
          <button onClick={close} style={{ marginTop: '1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', cursor: 'pointer', display: 'block', width: '100%', textAlign: 'center', padding: '0.4rem' }}>
            {tr.popupSkip}
          </button>
        </div>
      </>
    );
  }

  /* ── Desktop: centered modal ── */
  return (
    <>
      <style>{`
        @keyframes modalIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', animation: 'fadeIn 250ms ease' }}
        onClick={close}
      />
      <div
        style={{
          position: 'fixed', top: '50%', left: '50%', zIndex: 901,
          transform: 'translate(-50%,-50%)',
          background: '#111',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '2.75rem 2.5rem',
          width: '100%',
          maxWidth: '440px',
          animation: 'modalIn 320ms cubic-bezier(0.32,0.72,0,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={close}
          style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
        >
          <X size={14} strokeWidth={2} />
        </button>

        {/* Ghost PIETRI background text */}
        <div style={{ position: 'absolute', top: '0.5rem', left: 0, right: 0, textAlign: 'center', pointerEvents: 'none', overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '5rem', color: 'white', opacity: 0.03, lineHeight: 1, userSelect: 'none', display: 'block' }}>PIETRI</span>
        </div>

        <span style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: '0.85rem' }}>{tr.popupBadge}</span>

        <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(1.8rem,5vw,2.4rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.05, color: 'white', marginBottom: '0.9rem' }}>
          {tr.popupTitle}
        </p>

        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: '340px' }}>
          {tr.popupSub}
        </p>

        {submitted ? (
          <div style={{ padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', color: '#10b981', fontSize: '0.82rem', fontWeight: 600 }}>
            {tr.popupSuccess}
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', gap: 0 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={tr.popupPlaceholder}
              required
              style={{ flex: 1, padding: '0.9rem 1.1rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)', borderRight: 'none', borderRadius: '10px 0 0 10px', color: 'white', fontSize: '0.8rem', outline: 'none', fontFamily: "'Inter', sans-serif" }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '0 1.4rem', background: loading ? 'rgba(255,255,255,0.5)' : 'white', color: '#0a0a0a', border: 'none', borderRadius: '0 10px 10px 0', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {loading ? '…' : <>{tr.popupCta} <ArrowRight size={14} strokeWidth={2.5} /></>}
            </button>
          </form>
        )}

        <button onClick={close} style={{ marginTop: '1.1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem', cursor: 'pointer', display: 'block', padding: '0.25rem 0' }}>
          {tr.popupSkip}
        </button>
      </div>
    </>
  );
}

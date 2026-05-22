'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Lang } from '@/i18n/translations';

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
];

export default function LanguageSwitcher({ dark = true }: { dark?: boolean }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const current = LANGS.find(l => l.code === lang)!;
  const textColor = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const textColorActive = dark ? 'white' : '#0a0a0a';
  const bgHover = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';
  const dropdownBg = dark ? '#1a1a1a' : '#fff';
  const dropdownBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';

  /* ── Mobile : dropdown ── */
  if (isMobile) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            background: open ? bgHover : 'transparent',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}`,
            borderRadius: '6px',
            padding: '0.28rem 0.55rem',
            fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.08em',
            color: textColorActive,
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          <span>{current.flag}</span>
          <span>{current.label}</span>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}>
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
            background: dropdownBg,
            border: `1px solid ${dropdownBorder}`,
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: '100px',
          }}>
            {LANGS.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  width: '100%', padding: '0.65rem 0.9rem',
                  background: lang === l.code ? bgHover : 'transparent',
                  border: 'none',
                  fontSize: '0.72rem', fontWeight: lang === l.code ? 700 : 500,
                  color: lang === l.code ? textColorActive : textColor,
                  cursor: 'pointer',
                  textAlign: 'left',
                  letterSpacing: '0.06em',
                  transition: 'background 100ms',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>{l.flag}</span>
                <span>{l.label}</span>
                {lang === l.code && (
                  <span style={{ marginLeft: 'auto', color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)', fontSize: '0.6rem' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Desktop : boutons compacts ── */
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.flag}
          style={{
            background: lang === l.code ? (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)') : 'transparent',
            border: 'none',
            borderRadius: '6px',
            padding: '0.2rem 0.42rem',
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: dark
              ? lang === l.code ? 'white' : 'rgba(255,255,255,0.45)'
              : lang === l.code ? '#0a0a0a' : 'rgba(0,0,0,0.4)',
            cursor: 'pointer',
            transition: 'all 150ms',
            lineHeight: 1,
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import { useCurrency, Currency } from '@/contexts/CurrencyContext';

const OPTIONS: { code: Currency; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: 'EUR' },
  { code: 'XOF', symbol: 'F', label: 'FCFA' },
  { code: 'GBP', symbol: '£', label: 'GBP' },
  { code: 'USD', symbol: '$', label: 'USD' },
];

export default function CurrencySwitcher({ dark = true }: { dark?: boolean }) {
  const { currency, setCurrency } = useCurrency();
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

  const current = OPTIONS.find(o => o.code === currency)!;
  const textColorActive = dark ? 'white' : '#0a0a0a';
  const textColor = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)';
  const bgHover = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';
  const dropdownBg = dark ? '#1a1a1a' : '#fff';
  const dropdownBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';

  if (isMobile) {
    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            background: open ? bgHover : 'transparent',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}`,
            borderRadius: '6px', padding: '0.28rem 0.5rem',
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em',
            color: textColorActive, cursor: 'pointer', lineHeight: 1,
          }}
        >
          <span>{current.symbol}</span>
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}>
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
            background: dropdownBg, border: `1px solid ${dropdownBorder}`,
            borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: '90px',
          }}>
            {OPTIONS.map(o => (
              <button key={o.code} onClick={() => { setCurrency(o.code); setOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                padding: '0.6rem 0.85rem', background: currency === o.code ? bgHover : 'transparent',
                border: 'none', fontSize: '0.68rem', fontWeight: currency === o.code ? 700 : 500,
                color: currency === o.code ? textColorActive : textColor, cursor: 'pointer',
                textAlign: 'left', letterSpacing: '0.05em',
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: dark ? 'rgba(255,255,255,0.7)' : '#555', minWidth: 12 }}>{o.symbol}</span>
                <span>{o.label}</span>
                {currency === o.code && <span style={{ marginLeft: 'auto', fontSize: '0.55rem', opacity: 0.5 }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          background: open ? bgHover : 'transparent',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
          borderRadius: '6px', padding: '0.22rem 0.5rem',
          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.07em',
          color: textColorActive, cursor: 'pointer', lineHeight: 1,
        }}
      >
        <span>{current.label}</span>
        <svg width="7" height="7" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
          background: dropdownBg, border: `1px solid ${dropdownBorder}`,
          borderRadius: '10px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          minWidth: '100px',
        }}>
          {OPTIONS.map(o => (
            <button key={o.code} onClick={() => { setCurrency(o.code); setOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              padding: '0.55rem 0.85rem', background: currency === o.code ? bgHover : 'transparent',
              border: 'none', fontSize: '0.68rem', fontWeight: currency === o.code ? 700 : 500,
              color: currency === o.code ? textColorActive : textColor, cursor: 'pointer',
              textAlign: 'left', letterSpacing: '0.05em', transition: 'background 100ms',
            }}>
              <span style={{ fontWeight: 700, opacity: 0.6, minWidth: 14 }}>{o.symbol}</span>
              <span>{o.label}</span>
              {currency === o.code && <span style={{ marginLeft: 'auto', opacity: 0.4, fontSize: '0.6rem' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

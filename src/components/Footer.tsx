'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.72a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  );
}

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/pietri.io',  icon: <IconInstagram /> },
  { label: 'X',         href: 'https://x.com/pietri_io',          icon: <IconX /> },
  { label: 'TikTok',    href: 'https://tiktok.com/@pietri.io',    icon: <IconTikTok /> },
  { label: 'Facebook',  href: 'https://facebook.com/pietri.io',   icon: <IconFacebook /> },
];


const linkStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  color: 'white',
  opacity: 0.55,
  textDecoration: 'none',
  marginBottom: '0.7rem',
  transition: 'opacity 200ms',
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { tr } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <footer style={{ background: '#050505', borderTop: '1px solid rgba(255,255,255,0.06)', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @media (max-width: 768px) {
          .footer-signup-band { padding: 2rem 1.25rem !important; }
          .footer-signup { flex-direction: column !important; align-items: flex-start !important; gap: 1.25rem !important; }
          .footer-signup form { min-width: unset !important; width: 100% !important; flex: unset !important; }
          .footer-main { grid-template-columns: 1fr !important; gap: 2rem !important; padding: 2rem 1.25rem !important; }
          .footer-brand { margin-bottom: 0.5rem !important; }
          .footer-bottom { flex-direction: column !important; gap: 0.25rem !important; padding: 1rem 1.25rem !important; text-align: center !important; }
        }
      `}</style>

      {/* Email signup */}
      <div className="footer-signup-band" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '3rem 2rem' }}>
        <div className="footer-signup" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: 'white', letterSpacing: '-0.01em', textTransform: 'uppercase', lineHeight: 1.1 }}>
              {tr.footerTagline}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'white', opacity: 0.4, marginTop: '0.4rem', letterSpacing: '0.02em' }}>
              {tr.footerTaglineSub}
            </p>
          </div>
          {submitted ? (
            <div style={{ padding: '0.9rem 1.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
              {tr.footerEmailSuccess}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0', minWidth: '300px', flex: '0 1 380px' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={tr.footerEmailPlaceholder}
                required
                style={{ flex: 1, padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)', borderRight: 'none', borderRadius: '8px 0 0 8px', color: 'white', fontSize: '0.75rem', outline: 'none', fontFamily: "'Inter', sans-serif" }}
              />
              <button
                type="submit"
                style={{ padding: '0.8rem 1.2rem', background: 'white', color: '#0a0a0a', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="footer-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3.5rem 2rem 2.5rem', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '3rem' }}>

        {/* Brand + socials */}
        <div className="footer-brand">
          <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.5rem', color: 'white', letterSpacing: '0.02em', marginBottom: '0.75rem' }}>PIETRI</p>
          <p style={{ fontSize: '0.72rem', color: 'white', opacity: 0.35, lineHeight: 1.7, maxWidth: '220px', marginBottom: '1.75rem' }}>
            {tr.footerBrandDesc}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 200ms' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.12)'; el.style.color = 'white'; el.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.06)'; el.style.color = 'rgba(255,255,255,0.6)'; el.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Shop */}
        <div>
          <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'white', opacity: 0.35, marginBottom: '1.1rem' }}>{tr.footerShopTitle}</p>
          {tr.footerShopLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              style={linkStyle}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.55')}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Info */}
        <div>
          <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'white', opacity: 0.35, marginBottom: '1.1rem' }}>{tr.footerInfoTitle}</p>
          {tr.footerInfoLinks.map(l => (
            <a
              key={l.label}
              href={l.href}
              style={linkStyle}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.55')}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem 2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ fontSize: '0.65rem', color: 'white', opacity: 0.22 }}>{tr.footerCopyright}</p>
        <p style={{ fontSize: '0.65rem', color: 'white', opacity: 0.18 }}>{tr.footerMade}</p>
      </div>
    </footer>
  );
}

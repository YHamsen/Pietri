'use client';

import { useState } from 'react';
import { ArrowLeft, Send, MapPin, Mail } from 'lucide-react';

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.85rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: 'white',
  fontSize: '0.82rem',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border 200ms',
};

// SVG icons pour les réseaux sociaux (lucide-react ne les a plus)
function IconInstagram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

function IconX() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
    </svg>
  );
}

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/pietri.io', icon: <IconInstagram /> },
  { label: 'Facebook',  href: 'https://facebook.com/pietri.io',  icon: <IconFacebook /> },
  { label: 'X / Twitter', href: 'https://x.com/pietri_io',      icon: <IconX /> },
  { label: 'TikTok',    href: 'https://tiktok.com/@pietri.io',  icon: <IconTikTok /> },
];

const SUJETS = [
  'Suivi de commande',
  'Question produit / taille',
  'Livraison & délais',
  'Retour & remboursement',
  'Problème de paiement',
  'Partenariat / collaboration',
  'Autre',
];

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const canSend = form.nom && form.email && form.sujet && form.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setStatus('sending');
    await new Promise(r => setTimeout(r, 1200));
    setStatus('sent');
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', position: 'relative' }}>
      <div style={{ backgroundImage: GRAIN_SVG, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* style global pour corriger les options du select */}
      <style>{`
        .pietri-select option { background: #1c1c1c; color: white; padding: 6px; }
        .pietri-select:focus { border-color: rgba(255,255,255,0.35) !important; }
        .pietri-input:focus { border-color: rgba(255,255,255,0.35) !important; }
        .pietri-textarea:focus { border-color: rgba(255,255,255,0.35) !important; }
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 2rem !important; padding: 2rem 1.25rem !important; }
          .contact-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Nav */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: '#0a0a0aee', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.7 }}>
            <ArrowLeft size={14} /> Retour
          </a>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', opacity: 0.9 }}>PIETRI</span>
        <a href="/panier" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'white', opacity: 0.5, textDecoration: 'none' }}>Panier</a>
      </div>

      <div className="contact-grid" style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '5rem', alignItems: 'start' }}>

        {/* Left */}
        <div>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', opacity: 0.35, marginBottom: '0.6rem' }}>Contactez-nous</p>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1, marginBottom: '1.5rem' }}>
            ON EST<br />LÀ POUR<br />VOUS.
          </h1>
          <p style={{ fontSize: '0.82rem', opacity: 0.5, lineHeight: 1.8, marginBottom: '3rem', maxWidth: '280px' }}>
            Une question sur une commande, une taille, un drop à venir ? Écris-nous, on répond sous 24h.
          </p>

          {/* Infos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail size={15} style={{ opacity: 0.6 }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.4, marginBottom: '0.2rem' }}>Email</p>
                <a href="mailto:contact@pietri.io" style={{ fontSize: '0.82rem', color: 'white', textDecoration: 'none', opacity: 0.8 }}>contact@pietri.io</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin size={15} style={{ opacity: 0.6 }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.4, marginBottom: '0.2rem' }}>Basé à</p>
                <p style={{ fontSize: '0.82rem', opacity: 0.8 }}>Abidjan, Côte d'Ivoire</p>
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.35, marginBottom: '0.9rem' }}>Nos réseaux</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {SOCIALS.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: 'white', textDecoration: 'none', fontSize: '0.72rem', fontWeight: 600, opacity: 0.75, transition: 'all 200ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
              >
                {s.icon}
                {s.label}
              </a>
            ))}
          </div>

          {/* Délai */}
          <div style={{ marginTop: '2rem', padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '10px' }}>
            <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginBottom: '0.2rem' }}>Réponse sous 24h</p>
            <p style={{ fontSize: '0.68rem', opacity: 0.6, lineHeight: 1.5 }}>Du lundi au samedi, 9h–19h (GMT)</p>
          </div>
        </div>

        {/* Right — formulaire */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2.5rem' }}>
          {status === 'sent' ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Send size={22} style={{ color: '#10b981' }} />
              </div>
              <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Message envoyé !</h2>
              <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '2rem', lineHeight: 1.7 }}>On te répondra dans les prochaines 24h. Garde un œil sur ta boîte mail.</p>
              <button onClick={() => setStatus('idle')} style={{ padding: '0.75rem 2rem', background: 'white', color: '#0a0a0a', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer' }}>
                Nouveau message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.3rem', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>ENVOYER UN MESSAGE</h2>

              <div className="contact-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Nom *</label>
                  <input className="pietri-input" type="text" placeholder="Votre nom" value={form.nom} onChange={set('nom')} style={inputStyle} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Email *</label>
                  <input className="pietri-input" type="email" placeholder="votre@email.com" value={form.email} onChange={set('email')} style={inputStyle} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Sujet *</label>
                <select
                  className="pietri-select"
                  value={form.sujet}
                  onChange={set('sujet')}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                  required
                >
                  <option value="" disabled style={{ background: '#1c1c1c', color: 'rgba(255,255,255,0.4)' }}>Choisir un sujet…</option>
                  {SUJETS.map(s => (
                    <option key={s} value={s} style={{ background: '#1c1c1c', color: 'white' }}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Message *</label>
                <textarea
                  className="pietri-textarea"
                  placeholder="Décris ta demande en détail…"
                  value={form.message}
                  onChange={set('message')}
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.7 }}
                  required
                />
              </div>

              {status === 'error' && (
                <p style={{ fontSize: '0.7rem', color: '#ff6b6b' }}>Une erreur s'est produite. Réessaie ou écris-nous directement à contact@pietri.io</p>
              )}

              <button
                type="submit"
                disabled={!canSend || status === 'sending'}
                style={{ padding: '1rem', background: canSend ? 'white' : 'rgba(255,255,255,0.08)', color: canSend ? '#0a0a0a' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', cursor: canSend ? 'pointer' : 'not-allowed', transition: 'all 250ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
              >
                <Send size={15} />
                {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message'}
              </button>

              <p style={{ fontSize: '0.6rem', opacity: 0.25, textAlign: 'center' }}>
                Tes données ne sont pas partagées avec des tiers.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

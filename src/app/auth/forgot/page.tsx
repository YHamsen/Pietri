'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.07'/%3E%3C/svg%3E")`;

const inp = (focus: boolean): React.CSSProperties => ({
  width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
  background: 'rgba(255,255,255,0.04)',
  border: `1.5px solid ${focus ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.09)'}`,
  borderRadius: 11, color: 'white',
  fontSize: '0.88rem', fontFamily: 'system-ui,-apple-system,sans-serif',
  outline: 'none', boxSizing: 'border-box' as const,
  transition: 'border-color 200ms',
});

export default function ForgotPage() {
  const [email, setEmail]   = useState('');
  const [focus, setFocus]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [sent, setSent]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('Entre ton adresse email'); return; }
    setLoading(true); setError('');

    const { error: err } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback/exchange`,
    });

    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  return (
    <div style={{
      background: '#050505', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui,-apple-system,sans-serif', color: 'white', padding: '1.5rem',
    }}>
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, pointerEvents: 'none' }}/>
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '50vh', background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <a href="/auth/login" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.12em', marginBottom: '2rem', transition: 'color 200ms',
        }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'white')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)')}>
          <ArrowLeft size={12} strokeWidth={2.5}/> Retour
        </a>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.2rem' }}>
            Mot de passe oublié
          </p>
          <p style={{ fontSize: '0.72rem', opacity: 0.4, lineHeight: 1.6 }}>
            Saisis ton email — on t'envoie un lien pour réinitialiser ton mot de passe.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="sent"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 16, padding: '1.75rem', textAlign: 'center',
              }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <Check size={20} style={{ color: '#22c55e' }}/>
              </div>
              <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                Email envoyé
              </p>
              <p style={{ fontSize: '0.72rem', opacity: 0.45, lineHeight: 1.65, marginBottom: '1.25rem' }}>
                Lien envoyé à <strong style={{ color: 'white', opacity: 1 }}>{email}</strong>.
                Vérifie aussi tes spams.
              </p>
              <a href="/auth/login" style={{
                display: 'inline-block', padding: '0.65rem 1.5rem',
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, color: 'white', fontSize: '0.68rem',
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none',
              }}>
                Retour à la connexion
              </a>
            </motion.div>
          ) : (
            <motion.form key="form"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

              <div>
                <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}/>
                  <input
                    type="email" required placeholder="ton@email.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
                    style={inp(focus)}
                  />
                </div>
              </div>

              {error && <p style={{ fontSize: '0.7rem', color: '#f87171', lineHeight: 1.5 }}>{error}</p>}

              <button type="submit" disabled={loading} style={{
                padding: '0.95rem',
                background: loading ? 'rgba(255,255,255,0.06)' : 'white',
                color: loading ? 'rgba(255,255,255,0.3)' : '#050505',
                border: 'none', borderRadius: 12,
                fontFamily: "'Anton',sans-serif", fontWeight: 700,
                fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.14em',
                cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.15rem',
                transition: 'all 200ms',
              }}>
                {loading ? '…' : 'Envoyer le lien'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

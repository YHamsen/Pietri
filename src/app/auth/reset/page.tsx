'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Check } from 'lucide-react';
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

export default function ResetPage() {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [pwdFocus, setPwdFocus]   = useState(false);
  const [confFocus, setConfFocus] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);
  const [ready, setReady]         = useState(false);

  // Supabase redirects here with PASSWORD_RECOVERY event in the hash.
  // onAuthStateChange picks it up and sets the session; we then allow the form.
  useEffect(() => {
    const { data: { subscription } } = sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
      if (event === 'SIGNED_IN') setReady(true); // already signed in from exchange page
    });
    // Also check if session already exists
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true); setError('');

    const { error: err } = await sb.auth.updateUser({ password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
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
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.2rem' }}>
            Nouveau mot de passe
          </p>
          <p style={{ fontSize: '0.72rem', opacity: 0.4 }}>
            Choisis un nouveau mot de passe pour ton compte PIETRI.
          </p>
        </div>

        {done ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
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
              Mot de passe mis à jour
            </p>
            <p style={{ fontSize: '0.72rem', opacity: 0.45, lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Tu peux maintenant te connecter avec ton nouveau mot de passe.
            </p>
            <a href="/espace-client" style={{
              display: 'inline-block', padding: '0.65rem 1.5rem',
              background: 'white', color: '#050505',
              border: 'none', borderRadius: 10,
              fontSize: '0.68rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none',
            }}>
              Mon espace
            </a>
          </motion.div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', opacity: 0.4, fontSize: '0.78rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'white',
              animation: 'spin 0.7s linear infinite', margin: '0 auto 1rem',
            }}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Vérification en cours…
          </div>
        ) : (
          <motion.form initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            onSubmit={handleReset}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

            <div>
              <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>
                Nouveau mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}/>
                <input
                  type={showPwd ? 'text' : 'password'} required placeholder="Min. 8 caractères"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPwdFocus(true)} onBlur={() => setPwdFocus(false)}
                  style={{ ...inp(pwdFocus), paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>
                Confirmer le mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}/>
                <input
                  type={showConf ? 'text' : 'password'} required placeholder="Répète ton mot de passe"
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  onFocus={() => setConfFocus(true)} onBlur={() => setConfFocus(false)}
                  style={{ ...inp(confFocus), paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowConf(p => !p)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  {showConf ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
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
              {loading ? '…' : 'Enregistrer'}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}

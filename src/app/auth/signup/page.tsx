'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.07'/%3E%3C/svg%3E")`;

const inp = (focus: boolean, error = false): React.CSSProperties => ({
  width: '100%', padding: '0.85rem 1rem 0.85rem 2.75rem',
  background: 'rgba(255,255,255,0.04)',
  border: `1.5px solid ${error ? 'rgba(248,113,113,0.4)' : focus ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.09)'}`,
  borderRadius: 11, color: 'white',
  fontSize: '0.88rem', fontFamily: 'system-ui,-apple-system,sans-serif',
  outline: 'none', boxSizing: 'border-box' as const,
  transition: 'border-color 200ms',
});

export default function SignupPage() {
  const [prenom, setPrenom]     = useState('');
  const [nom, setNom]           = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);

  const [prenomFocus, setPrenomFocus] = useState(false);
  const [nomFocus,    setNomFocus]    = useState(false);
  const [emailFocus,  setEmailFocus]  = useState(false);
  const [pwdFocus,    setPwdFocus]    = useState(false);

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/espace-client';
    });
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères'); return; }
    setLoading(true); setError('');
    const { error: err } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom, full_name: `${prenom} ${nom}`.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback/exchange`,
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setDone(true);
  }

  async function handleGoogle() {
    setLoading(true); setError('');
    const { error: err } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback/exchange` },
    });
    if (err) {
      setError('Connexion Google non configurée. Utilise email + mot de passe.');
      setLoading(false);
    }
  }

  return (
    <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui,-apple-system,sans-serif', color: 'white', padding: '1.5rem' }}>
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, pointerEvents: 'none' }}/>
      <div style={{ position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '50vh', background: 'radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2rem', transition: 'color 200ms' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'white')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)')}>
          <ArrowLeft size={12} strokeWidth={2.5}/> Retour
        </a>

        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.2rem' }}>Créer un compte</p>
          <p style={{ fontSize: '0.72rem', opacity: 0.4 }}>Rejoins la communauté PIETRI</p>
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 16, padding: '1.75rem', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Check size={20} style={{ color: '#22c55e' }}/>
              </div>
              <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Vérifie ta messagerie</p>
              <p style={{ fontSize: '0.72rem', opacity: 0.45, lineHeight: 1.65, marginBottom: '1.25rem' }}>
                Lien de confirmation envoyé à{' '}
                <strong style={{ color: 'white', opacity: 1 }}>{email}</strong>
              </p>
              <a href="/auth/login"
                style={{ display: 'inline-block', padding: '0.65rem 1.5rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', textDecoration: 'none' }}>
                Se connecter
              </a>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                {/* Prénom + Nom row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Prénom</label>
                    <div style={{ position: 'relative' }}>
                      <User size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}/>
                      <input type="text" required placeholder="Jean" value={prenom}
                        onChange={e => setPrenom(e.target.value)}
                        onFocus={() => setPrenomFocus(true)} onBlur={() => setPrenomFocus(false)}
                        style={inp(prenomFocus)}/>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Nom</label>
                    <div style={{ position: 'relative' }}>
                      <User size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}/>
                      <input type="text" required placeholder="Koné" value={nom}
                        onChange={e => setNom(e.target.value)}
                        onFocus={() => setNomFocus(true)} onBlur={() => setNomFocus(false)}
                        style={inp(nomFocus)}/>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}/>
                    <input type="email" required placeholder="ton@email.com" value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)}
                      style={inp(emailFocus)}/>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, pointerEvents: 'none' }}/>
                    <input type={showPwd ? 'text' : 'password'} required placeholder="Min. 8 caractères" value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setPwdFocus(true)} onBlur={() => setPwdFocus(false)}
                      style={{ ...inp(pwdFocus), paddingRight: '2.75rem' }}/>
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                      {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.6rem', opacity: 0.3, marginTop: '0.35rem', marginLeft: '0.1rem' }}>Minimum 8 caractères</p>
                </div>

                {error && <p style={{ fontSize: '0.7rem', color: '#f87171', lineHeight: 1.5 }}>{error}</p>}

                <button type="submit" disabled={loading}
                  style={{ padding: '0.95rem', background: loading ? 'rgba(255,255,255,0.06)' : 'white', color: loading ? 'rgba(255,255,255,0.3)' : '#050505', border: 'none', borderRadius: 12, fontFamily: "'Anton',sans-serif", fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.15rem', transition: 'all 200ms' }}>
                  {loading ? '…' : 'Créer mon compte'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }}/>
                <span style={{ fontSize: '0.58rem', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.12em' }}>ou</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }}/>
              </div>

              <button type="button" onClick={handleGoogle}
                style={{ width: '100%', padding: '0.85rem', background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.09)', borderRadius: 12, color: 'white', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 200ms' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.72rem', opacity: 0.4, marginTop: '1.5rem' }}>
                Déjà un compte ?{' '}
                <a href="/auth/login" style={{ color: 'white', opacity: 1, fontWeight: 700, textDecoration: 'none' }}>Se connecter</a>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

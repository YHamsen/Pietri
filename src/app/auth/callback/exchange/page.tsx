'use client';

// ─────────────────────────────────────────────────────────────────────────────
// /auth/callback/exchange — Client-side PKCE code exchange
//
// Why client-side?  Supabase JS v2 uses PKCE by default.
// The code_verifier is stored in browser localStorage.
// A server Route Handler can't read localStorage → exchangeCodeForSession fails silently.
// Running this exchange in the browser gives the Supabase client access to the verifier.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CallbackExchange() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function exchange() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code  = params.get('code');
        const next  = params.get('next') || '/espace-client';
        const error = params.get('error');
        const errorDesc = params.get('error_description');

        // Google / OAuth error returned
        if (error) {
          setStatus('error');
          setMsg(errorDesc || error);
          return;
        }

        if (code) {
          // PKCE flow: exchange the code (browser has the verifier in localStorage)
          const { error: exchErr } = await sb.auth.exchangeCodeForSession(code);
          if (exchErr) {
            setStatus('error');
            setMsg(exchErr.message);
            return;
          }
        } else {
          // Implicit flow fallback: session is in the URL hash — Supabase auto-detects it
          const { data, error: sessErr } = await sb.auth.getSession();
          if (sessErr || !data.session) {
            // Try once more after a tiny delay (hash parsing race)
            await new Promise(r => setTimeout(r, 300));
            const { data: d2, error: e2 } = await sb.auth.getSession();
            if (e2 || !d2.session) {
              setStatus('error');
              setMsg(e2?.message || 'Session introuvable après connexion Google.');
              return;
            }
          }
        }

        setStatus('ok');
        // Small delay so the spinner is visible, then redirect
        await new Promise(r => setTimeout(r, 400));
        window.location.href = next;
      } catch (e: unknown) {
        setStatus('error');
        setMsg(e instanceof Error ? e.message : 'Erreur inconnue');
      }
    }

    exchange();
  }, []);

  return (
    <div style={{
      minHeight: '100vh', background: '#050505',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui,-apple-system,sans-serif', color: 'white',
      gap: '1.25rem', padding: '2rem',
    }}>
      {status === 'loading' && (
        <>
          {/* Spinner */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '2.5px solid rgba(255,255,255,0.08)',
            borderTopColor: 'white',
            animation: 'spin 0.7s linear infinite',
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontSize: '0.78rem', opacity: 0.4, letterSpacing: '0.08em' }}>
            Connexion en cours…
          </p>
        </>
      )}

      {status === 'ok' && (
        <>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(52,211,153,0.12)',
            border: '1.5px solid rgba(52,211,153,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.06em' }}>
            Connecté — redirection…
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            background: 'rgba(248,113,113,0.1)',
            border: '1.5px solid rgba(248,113,113,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#f87171', maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
            {msg || 'Erreur de connexion Google. Réessaie.'}
          </p>
          <a href="/auth/login" style={{
            padding: '0.65rem 1.5rem',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: 'white',
            fontSize: '0.68rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            textDecoration: 'none',
          }}>
            ← Retour
          </a>
        </>
      )}
    </div>
  );
}

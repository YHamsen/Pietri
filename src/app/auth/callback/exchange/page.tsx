'use client';

// ─────────────────────────────────────────────────────────────────────────────
// /auth/callback/exchange — universal auth callback handler
//
// Handles:
//   • PKCE flow  (Google OAuth / magic-link)  → ?code=… in query string
//   • Implicit flow (email confirmation)       → #access_token=… in hash
//   • Password-recovery flow                   → #type=recovery in hash
//
// Uses onAuthStateChange instead of a one-shot getSession() to eliminate
// the race condition between Supabase's URL-hash parsing and component mount.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CallbackExchange() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [msg, setMsg]       = useState('');

  useEffect(() => {
    let settled = false;

    function succeed() {
      if (settled) return;
      settled = true;
      setStatus('ok');
      const next = new URLSearchParams(window.location.search).get('next') || '/espace-client';
      setTimeout(() => { window.location.href = next; }, 500);
    }

    function fail(message: string) {
      if (settled) return;
      settled = true;
      setStatus('error');
      setMsg(message);
    }

    // ── 1. Listen for Supabase auth events (fires for both PKCE + implicit) ──
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        succeed();
      }
      if (event === 'PASSWORD_RECOVERY') {
        // Password-reset email clicked → go to reset page
        settled = true;
        window.location.href = '/auth/reset';
      }
    });

    // ── 2. Handle query-string params (errors + PKCE code) ───────────────────
    async function handleParams() {
      const params = new URLSearchParams(window.location.search);
      const error    = params.get('error');
      const errorDesc = params.get('error_description');
      const code     = params.get('code');

      // OAuth / link error returned
      if (error) {
        fail(errorDesc || error);
        return;
      }

      // PKCE: exchange authorization code for session
      if (code) {
        const { error: exchErr } = await sb.auth.exchangeCodeForSession(code);
        if (exchErr) {
          fail(exchErr.message);
          return;
        }
        // onAuthStateChange SIGNED_IN will fire → succeed() called there
        return;
      }

      // Implicit flow (access_token in hash) — Supabase client auto-detects it;
      // onAuthStateChange SIGNED_IN will fire automatically. Nothing to do here.
    }

    handleParams();

    // ── 3. Safety timeout (10 s) ─────────────────────────────────────────────
    const timeout = setTimeout(() => {
      fail('Délai dépassé. Réessaie.');
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#f87171', maxWidth: 320, textAlign: 'center', lineHeight: 1.6 }}>
            {msg || 'Erreur de connexion. Réessaie.'}
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

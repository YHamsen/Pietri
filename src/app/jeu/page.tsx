'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

const PAST_WINNERS = [
  { week: 20, entries: [{ handle: '@oumar.style', pts: '+320 pts' }, { handle: '@koffi_abj', pts: '+280 pts' }, { handle: '@marie.iv', pts: '+190 pts' }] },
  { week: 19, entries: [{ handle: '@awa.ndiaye', pts: '+310 pts' }, { handle: '@jean.lc', pts: '+245 pts' }, { handle: '@diallo_fw', pts: '+200 pts' }] },
  { week: 18, entries: [{ handle: '@pietri.fan', pts: '+295 pts' }, { handle: '@aminata.ci', pts: '+260 pts' }, { handle: '@style.abj', pts: '+175 pts' }] },
];

function getNextSunday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(23, 59, 0, 0);
  return next;
}

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function calc() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function JeuPage() {
  const [instagram, setInstagram] = useState('');
  const [committed, setCommitted] = useState(false);
  const [userHandle, setUserHandle] = useState('');
  const [counter, setCounter] = useState(47);
  const [mounted, setMounted] = useState(false);

  const target = getNextSunday();
  const timeLeft = useCountdown(target);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('pietri_challenge_v1');
      if (saved) {
        const data = JSON.parse(saved);
        setCommitted(true);
        setUserHandle(data.handle || '');
      }
      const savedCounter = localStorage.getItem('pietri_challenge_counter');
      if (savedCounter) {
        setCounter(parseInt(savedCounter, 10));
      }
    } catch {}
  }, []);

  function handleCommit(e: React.FormEvent) {
    e.preventDefault();
    if (!instagram.trim()) return;
    const handle = instagram.startsWith('@') ? instagram.trim() : '@' + instagram.trim();
    const newCount = counter + 1;
    try {
      localStorage.setItem('pietri_challenge_v1', JSON.stringify({ handle, week: 21 }));
      localStorage.setItem('pietri_challenge_counter', String(newCount));
    } catch {}
    setUserHandle(handle);
    setCommitted(true);
    setCounter(newCount);
  }

  const progressPct = Math.round((counter / 65) * 100);
  const totalPts = counter * 50;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', position: 'relative' }}>
      {/* Grain texture */}
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', background: '#0a0a0af0', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Retour</Link>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', opacity: 0.9 }}>PIETRI</span>
        <Link href="/panier" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Panier</Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem 6rem' }}>

        {/* Hero */}
        <div style={{ padding: '4rem 0 2.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.28em', opacity: 0.35, marginBottom: '1rem' }}>Semaine 21 · Jeu actif</p>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2.8rem, 9vw, 5.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.95, marginBottom: '1.25rem' }}>
            PIETRI DROP<br />CHALLENGE
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.55, maxWidth: '480px', margin: '0 auto 2.5rem' }}>
            Mets la mise — ou regarde les autres gagner
          </p>

          {/* Countdown */}
          {mounted && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'JJ', val: pad(timeLeft.days) },
                { label: 'HH', val: pad(timeLeft.hours) },
                { label: 'MM', val: pad(timeLeft.minutes) },
                { label: 'SS', val: pad(timeLeft.seconds) },
              ].map(({ label, val }, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2rem, 7vw, 3.5rem)', letterSpacing: '-0.03em', lineHeight: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '12px', padding: '0.8rem 1.2rem', minWidth: '72px' }}>
                    {val}
                  </div>
                  <div style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', opacity: 0.3, marginTop: '0.4rem', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
          <p style={{ fontSize: '0.65rem', opacity: 0.3, marginTop: '0.9rem', letterSpacing: '0.1em' }}>Fin du défi · Dimanche 23:59</p>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '2rem' }} />

        {/* Challenge card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem 1.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.4 }}>Défi semaine 21</span>
          </div>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(1.3rem, 4vw, 1.9rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '0.9rem' }}>
            Partage une photo en portant du PIETRI cette semaine
          </h2>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.7, opacity: 0.55 }}>
            Prouve-le : tag <strong style={{ color: 'white', opacity: 1 }}>@pietri.io</strong> sur Instagram avec le hashtag <strong style={{ color: 'white', opacity: 1 }}>#PietriDropChallenge</strong>. L'admin valide chaque lundi matin.
          </p>
        </div>

        {/* Pool card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '0.3rem' }}>💰 Pot commun</p>
              <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2rem, 6vw, 2.8rem)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {mounted ? totalPts.toLocaleString('fr-FR') : '2 350'} pts
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '0.3rem' }}>👥 Challengers</p>
              <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2rem, 6vw, 2.8rem)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {mounted ? counter : 47}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.62rem', opacity: 0.4, letterSpacing: '0.08em' }}>Progression semaine</span>
              <span style={{ fontSize: '0.62rem', opacity: 0.4, letterSpacing: '0.08em' }}>{mounted ? progressPct : 73}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${mounted ? Math.min(progressPct, 100) : 73}%`, background: 'white', borderRadius: '999px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </div>

        {/* Commitment form */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem' }}>
          {!committed ? (
            <>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.35, marginBottom: '0.75rem' }}>Rejoindre le défi</p>
              <h3 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '1.25rem' }}>Miser 50 PIETRI POINTS</h3>
              <form onSubmit={handleCommit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Ton @Instagram"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  disabled={!instagram.trim()}
                  style={{
                    background: instagram.trim() ? 'white' : 'rgba(255,255,255,0.12)',
                    color: instagram.trim() ? '#0a0a0a' : 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.9rem 1.5rem',
                    fontFamily: "'Anton', sans-serif",
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    cursor: instagram.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    width: '100%',
                  }}
                >
                  Miser 50 PIETRI POINTS →
                </button>
              </form>
              <p style={{ fontSize: '0.62rem', opacity: 0.3, marginTop: '0.75rem', lineHeight: 1.6 }}>
                En participant, tu acceptes les règles du défi. Les points sont déduits de ton solde immédiatement.
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
              <h3 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>Tu es dans le game !</h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.55, marginBottom: '0.5rem' }}>
                Inscrit en tant que <strong style={{ color: 'white', opacity: 1 }}>{userHandle}</strong>
              </p>
              <p style={{ fontSize: '0.75rem', opacity: 0.4, lineHeight: 1.6 }}>
                Publie ta photo sur Instagram avec <strong style={{ opacity: 1 }}>@pietri.io</strong> et <strong style={{ opacity: 1 }}>#PietriDropChallenge</strong> avant dimanche 23:59.
              </p>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p style={{ fontSize: '0.7rem', opacity: 0.35, marginBottom: '0.25rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ta mise</p>
                <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.5rem' }}>50 pts risqués</p>
              </div>
            </div>
          )}
        </div>

        {/* Rules */}
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.3, marginBottom: '1rem' }}>Les règles du jeu</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {[
              {
                num: '01',
                title: 'Tu mises 50 pts',
                desc: 'Si tu publies une photo cette semaine : tu récupères tes 50 pts + ta part du pot commun.',
                positive: true,
              },
              {
                num: '02',
                title: 'Pas vu = perdant',
                desc: "Si on ne te voit pas sur Instagram avec le tag : tu perds tes 50 pts. Ils vont aux gagnants.",
                positive: false,
              },
              {
                num: '03',
                title: 'Validation lundi',
                desc: "L'admin valide chaque lundi matin. Résultats envoyés par email avant midi.",
                positive: null,
              },
            ].map((rule, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${rule.positive === true ? 'rgba(255,255,255,0.12)' : rule.positive === false ? 'rgba(255,80,80,0.15)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '2rem', opacity: 0.12, lineHeight: 1, marginBottom: '0.5rem' }}>{rule.num}</p>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{rule.title}</p>
                <p style={{ fontSize: '0.75rem', lineHeight: 1.65, opacity: 0.5 }}>{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Past winners */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.75rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.3, marginBottom: '1.25rem' }}>🏆 Hall of Fame</p>
          {PAST_WINNERS.map((week) => (
            <div key={week.week} style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.25, marginBottom: '0.5rem' }}>Semaine {week.week}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {week.entries.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '8px',
                      padding: '0.4rem 0.75rem',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{entry.handle}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5, fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em' }}>{entry.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA bottom */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.45, lineHeight: 1.65 }}>
            Pas encore de points PIETRI ?{' '}
            <Link href="/espace-client" style={{ color: 'white', opacity: 1, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
              Crée un compte dans l'espace client
            </Link>{' '}
            pour commencer à en gagner.
          </p>
        </div>
      </div>
    </div>
  );
}

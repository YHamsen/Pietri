'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getCart, cartCount } from '@/lib/cart';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurrencySwitcher from '@/components/CurrencySwitcher';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const N = 5;

const ITEMS = [
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#111111',
    label: 'FLORAL HOODIE',
    desc: 'Hoodie oversize noir broderie pavot. Édition limitée.',
    price: 89,
    slug: 'floral-hoodie',
    sizeFactor: 1,
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#0E1219',
    label: 'KOALA TEE',
    desc: 'T-shirt oversize logo Koala. Coton premium 320g.',
    price: 49,
    slug: 'koala-tee',
    sizeFactor: 1,
  },
  {
    src: '/char-hoodie.png',
    bg: '#130E11',
    label: 'FLORAL TEE',
    desc: 'T-shirt oversize imprimé coquelicot. Washed vintage.',
    price: 59,
    slug: 'floral-tee',
    sizeFactor: 0.75,
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#0E1310',
    label: 'SIGNATURE',
    desc: 'Pièce signature collection automne. Drop exclusif.',
    price: 79,
    slug: 'signature',
    sizeFactor: 1,
  },
  {
    src: '/char-robe.png',
    bg: '#12100E',
    label: 'ROBE FLORALE',
    desc: 'Robe oversize imprimé floral. Coupe asymétrique.',
    price: 69,
    slug: 'robe-florale',
    sizeFactor: 0.75,
  },
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

type Direction = 'next' | 'prev';

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // null = loading
  const { tr } = useLanguage();
  const { format } = useCurrency();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const update = () => setCartItems(cartCount(getCart()));
    update();
    window.addEventListener('pietri_cart_updated', update);
    return () => window.removeEventListener('pietri_cart_updated', update);
  }, []);

  useEffect(() => {
    ITEMS.forEach((item) => {
      const img = new window.Image();
      img.src = item.src;
    });
  }, []);

  // Auth state
  useEffect(() => {
    // If OAuth redirected user here with access_token in hash → forward to account page
    const hasAuthHash = typeof window !== 'undefined' && window.location.hash.includes('access_token');
    const hasAuthCode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('code');

    sb.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      // Implicit-flow fallback: hash contains token but callback page was bypassed
      if (data.session && hasAuthHash) {
        window.location.replace('/');
      }
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      // Fresh login event on homepage → redirect to account dashboard
      if (event === 'SIGNED_IN' && session) {
        window.location.replace('/');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const navigate = useCallback(
    (dir: Direction) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActiveIndex((prev) =>
        dir === 'next' ? (prev + 1) % N : (prev + N - 1) % N
      );
      setTimeout(() => setIsAnimating(false), 650);
    },
    [isAnimating]
  );

  // positions relative to center
  const center = activeIndex;
  const right  = (activeIndex + 1) % N;
  const left   = (activeIndex + N - 1) % N;
  // remaining two are hidden behind
  const back1  = (activeIndex + 2) % N;
  const back2  = (activeIndex + N - 2) % N;

  const getRole = (idx: number) => {
    if (idx === center) return 'center';
    if (idx === left)   return 'left';
    if (idx === right)  return 'right';
    if (idx === back1)  return 'back1';
    return 'back2';
  };

  const getRoleStyle = (role: string, sizeFactor = 1): React.CSSProperties => {
    const transition =
      'transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms cubic-bezier(0.4,0,0.2,1), opacity 650ms cubic-bezier(0.4,0,0.2,1), left 650ms cubic-bezier(0.4,0,0.2,1)';
    const willChange = 'transform, filter, opacity';

    if (role === 'center') {
      const centerScale = (isMobile ? 1.25 : 1.68) * sizeFactor;
      return {
        position: 'absolute',
        aspectRatio: '0.6 / 1',
        left: '50%',
        bottom: isMobile ? '22%' : 0,
        height: isMobile ? '60%' : '92%',
        transform: `translateX(-50%) scale(${centerScale})`,
        filter: 'blur(0px)',
        opacity: 1,
        zIndex: 20,
        transition,
        willChange,
      };
    }
    if (role === 'left') {
      return {
        position: 'absolute',
        aspectRatio: '0.6 / 1',
        left: isMobile ? '20%' : '30%',
        bottom: isMobile ? '32%' : '12%',
        height: isMobile ? '16%' : '28%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
        transition,
        willChange,
      };
    }
    if (role === 'right') {
      return {
        position: 'absolute',
        aspectRatio: '0.6 / 1',
        left: isMobile ? '80%' : '70%',
        bottom: isMobile ? '32%' : '12%',
        height: isMobile ? '16%' : '28%',
        transform: 'translateX(-50%) scale(1)',
        filter: 'blur(2px)',
        opacity: 0.85,
        zIndex: 10,
        transition,
        willChange,
      };
    }
    // back1 and back2 — hidden, centred behind
    return {
      position: 'absolute',
      aspectRatio: '0.6 / 1',
      left: '50%',
      bottom: isMobile ? '32%' : '12%',
      height: isMobile ? '10%' : '18%',
      transform: 'translateX(-50%) scale(1)',
      filter: 'blur(6px)',
      opacity: 0,
      zIndex: 5,
      transition,
      willChange,
    };
  };

  const active = ITEMS[activeIndex];
  const activeTranslation = tr.products[active.slug as keyof typeof tr.products] ?? { label: active.label, desc: active.desc };

  return (
    <div
      style={{
        backgroundColor: active.bg,
        transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

        {/* Grain overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 50,
            backgroundImage: GRAIN_SVG,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
            opacity: 0.4,
          }}
        />

        {/* Giant ghost text */}
        <div
          style={{
            position: 'absolute',
            insetInline: 0,
            top: '18%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(90px, 28vw, 380px)',
              fontWeight: 900,
              color: 'white',
              opacity: 0.06,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
            }}
          >
            PIETRI
          </span>
        </div>

        {/* Nav bar — une seule ligne flex */}
        <style>{`@media (max-width: 640px) { .hero-desktop-links { display: none !important; } }`}</style>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '1.25rem 1rem' : '1.5rem 2rem',
          fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>
          {/* Brand */}
          <span style={{ color: 'white', opacity: 0.9, letterSpacing: '0.18em', fontWeight: 700 }}>PIETRI</span>

          {/* Desktop links uniquement */}
          <span className="hero-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <a href="#drops" style={{ color: 'white', textDecoration: 'none', opacity: 0.7, transition: 'opacity 200ms' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}>{tr.shop}</a>
            <a href="#drops" style={{ color: 'white', textDecoration: 'none', opacity: 0.7, transition: 'opacity 200ms' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}>{tr.drops}</a>
            <a href="/contact" style={{ color: 'white', textDecoration: 'none', opacity: 0.7, transition: 'opacity 200ms' }} onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}>{tr.contact}</a>
          </span>

          {/* Droite : langue + devise + Auth + Panier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.4rem' : '0.6rem' }}>
            <LanguageSwitcher dark />
            <CurrencySwitcher dark />

            {/* Auth — adaptatif selon état connexion */}
            {isMobile ? (
              /* Mobile : icône user avec indicateur point vert si connecté */
              <a
                href={isLoggedIn ? '/espace-client' : '/auth/login'}
                aria-label={isLoggedIn ? 'Mon compte' : 'Se connecter'}
                style={{ color: 'white', opacity: 0.7, display: 'flex', alignItems: 'center', position: 'relative' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {isLoggedIn && (
                  <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: '#22c55e', border: '1.5px solid #0a0a0a' }}/>
                )}
              </a>
            ) : isLoggedIn ? (
              /* Desktop connecté : Mon compte */
              <a
                href="/espace-client"
                style={{ color: 'white', textDecoration: 'none', opacity: 0.7, transition: 'opacity 200ms', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.7')}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}/>
                {tr.myAccount}
              </a>
            ) : (
              /* Desktop non connecté : Se connecter + S'inscrire */
              <>
                <a
                  href="/auth/login"
                  style={{ color: 'white', textDecoration: 'none', opacity: 0.6, transition: 'opacity 200ms', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.6')}
                >
                  Se connecter
                </a>
                <a
                  href="/auth/signup"
                  style={{
                    color: '#0a0a0a', textDecoration: 'none',
                    background: 'white',
                    borderRadius: '999px',
                    padding: '0.3rem 0.85rem',
                    fontSize: '0.65rem', fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    transition: 'opacity 200ms',
                    lineHeight: 1,
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
                >
                  S'inscrire
                </a>
              </>
            )}

            <a href="/panier" style={{ color: 'white', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '999px', padding: isMobile ? '0.28rem 0.7rem' : '0.3rem 0.9rem', lineHeight: 1, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem' }}>
              {tr.cart}
              {cartItems > 0 && (
                <span style={{ background: 'white', color: '#0a0a0a', borderRadius: '999px', fontSize: '0.55rem', fontWeight: 800, padding: '0.1rem 0.4rem', minWidth: '16px', textAlign: 'center', lineHeight: 1.4 }}>
                  {cartItems}
                </span>
              )}
            </a>
          </div>
        </div>

        {/* Carousel items — touch swipe */}
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 3 }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 45) navigate(dx < 0 ? 'next' : 'prev');
            touchStartX.current = null;
          }}
        >
          {ITEMS.map((item, idx) => {
            const role = getRole(idx);
            return (
              <div key={idx} style={getRoleStyle(role, item.sizeFactor)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.label}
                  draggable={false}
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (!t.dataset.fallback) {
                      t.dataset.fallback = '1';
                      t.src = 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png';
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Bottom-left: label + desc + nav buttons */}
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '1.5rem' : '5rem',
            left: isMobile ? '1rem' : '6rem',
            zIndex: 60,
            maxWidth: 340,
          }}
        >
          <div
            style={{
              display: 'inline-block',
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              color: 'white',
              opacity: 0.5,
              marginBottom: '0.4rem',
            }}
          >
            {format(active.price)}
          </div>

          <p
            style={{
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              fontSize: isMobile ? '1rem' : '1.4rem',
              color: 'white',
              opacity: 0.95,
              margin: '0 0 0.5rem 0',
              transition: 'opacity 400ms ease',
            }}
          >
            {activeTranslation.label}
          </p>

          {!isMobile && (
            <p
              style={{
                fontSize: '0.8rem',
                color: 'white',
                opacity: 0.6,
                lineHeight: 1.6,
                margin: '0 0 1.25rem 0',
              }}
            >
              {activeTranslation.desc}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: isMobile ? '0.75rem' : 0 }}>
            <button
              onClick={() => navigate('prev')}
              style={{
                width: isMobile ? '3rem' : '4rem',
                height: isMobile ? '3rem' : '4rem',
                borderRadius: '50%',
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.5)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 150ms, background-color 150ms',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
              aria-label="Précédent"
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>

            <button
              onClick={() => navigate('next')}
              style={{
                width: isMobile ? '3rem' : '4rem',
                height: isMobile ? '3rem' : '4rem',
                borderRadius: '50%',
                background: 'transparent',
                border: '2px solid rgba(255,255,255,0.5)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 150ms, background-color 150ms',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
              aria-label="Suivant"
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {/* Bottom-right: SHOP NOW → product page */}
        <a
          href={`/produits/${active.slug}`}
          style={{
            position: 'absolute',
            bottom: isMobile ? '1.5rem' : '5rem',
            right: isMobile ? '1rem' : '2.5rem',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: "'Anton', sans-serif",
            fontSize: `clamp(20px, 4vw, 56px)`,
            fontWeight: 400,
            color: 'white',
            opacity: 0.95,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'opacity 200ms',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '1')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = '0.95')}
        >
          {tr.shopNow}
          <ArrowRight size={isMobile ? 20 : 32} strokeWidth={2.25} />
        </a>

        {/* Dots indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: isMobile ? '1.5rem' : '5.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            display: 'flex',
            gap: '0.4rem',
          }}
        >
          {ITEMS.map((_, idx) => (
            <div
              key={idx}
              style={{
                width: idx === activeIndex ? '1.5rem' : '0.4rem',
                height: '0.4rem',
                borderRadius: '999px',
                backgroundColor: 'white',
                opacity: idx === activeIndex ? 0.9 : 0.3,
                transition: 'width 400ms cubic-bezier(0.4,0,0.2,1), opacity 400ms ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

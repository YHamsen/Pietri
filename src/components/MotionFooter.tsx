'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com/pietri.io', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
    </svg>
  )},
  { label: 'TikTok', href: 'https://tiktok.com/@pietri.io', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.72a8.18 8.18 0 004.78 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/>
    </svg>
  )},
  { label: 'X', href: 'https://x.com/pietri_io', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )},
  { label: 'Facebook', href: 'https://facebook.com/pietri.io', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
    </svg>
  )},
];

const LINKS_COL1 = [
  { label: 'Collection', href: '/produits' },
  { label: 'Floral Hoodie', href: '/produits/floral-hoodie' },
  { label: 'Koala Tee', href: '/produits/koala-tee' },
  { label: 'Signature', href: '/produits/signature' },
  { label: 'Robe Florale', href: '/produits/robe-florale' },
];

const LINKS_COL2 = [
  { label: 'À propos', href: '/a-propos' },
  { label: 'Livraison & Retours', href: '/livraison-retours' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Mentions légales', href: '/mentions-legales' },
];

export default function MotionFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantRef   = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !wrapperRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(giantRef.current,
        { y: '8vh', opacity: 0 },
        { y: '0vh', opacity: 1, ease: 'power1.out',
          scrollTrigger: { trigger: wrapperRef.current, start: 'top 80%', end: 'bottom bottom', scrub: 1 } }
      );
      gsap.fromTo([headingRef.current, linksRef.current],
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: wrapperRef.current, start: 'top 50%', end: 'bottom bottom', scrub: 1 } }
      );
    }, wrapperRef);
    return () => ctx.revert();
  }, []);

  return (
    <>
      <style>{`
        @keyframes pietri-breathe {
          0% { transform: translate(-50%,-50%) scale(1); opacity: .5; }
          100% { transform: translate(-50%,-50%) scale(1.12); opacity: .85; }
        }
        @keyframes pietri-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes pietri-pulse {
          0%,100% { opacity:.4; }
          50%      { opacity:1; }
        }
        .pietri-footer-link {
          display:block; font-size:.78rem; color:rgba(255,255,255,.5);
          text-decoration:none; margin-bottom:.65rem;
          transition:color 200ms, opacity 200ms;
        }
        .pietri-footer-link:hover { color:white; }
        .pietri-social-btn {
          width:38px; height:38px; border-radius:10px;
          background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
          display:flex; align-items:center; justify-content:center;
          color:rgba(255,255,255,.55); text-decoration:none;
          transition:all 200ms; flex-shrink:0;
        }
        .pietri-social-btn:hover { background:rgba(255,255,255,.14); color:white; border-color:rgba(255,255,255,.25); }
        .pietri-glass-pill {
          background:linear-gradient(145deg,rgba(255,255,255,.04) 0%,rgba(255,255,255,.01) 100%);
          border:1px solid rgba(255,255,255,.08);
          backdrop-filter:blur(16px);
          transition:all .4s cubic-bezier(.16,1,.3,1);
        }
        .pietri-glass-pill:hover {
          background:linear-gradient(145deg,rgba(255,255,255,.09) 0%,rgba(255,255,255,.03) 100%);
          border-color:rgba(255,255,255,.18);
        }
        .pietri-back-top:hover svg { transform:translateY(-3px); }
        .pietri-back-top svg { transition:transform .3s ease; }
        @media (max-width:768px) {
          .pietri-footer-grid { grid-template-columns:1fr !important; gap:2rem !important; padding:2rem 1.25rem !important; }
          .pietri-footer-bottom { flex-direction:column !important; gap:.5rem !important; padding:1.25rem !important; text-align:center !important; }
          .pietri-footer-giant { font-size:38vw !important; }
          .pietri-footer-cta-row { flex-direction:column !important; align-items:center !important; }
        }
      `}</style>

      {/* Curtain reveal wrapper */}
      <div ref={wrapperRef} style={{ position:'relative', width:'100%', minHeight:'100vh', clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)' }}>
        <footer style={{ position:'sticky', bottom:0, left:0, width:'100%', minHeight:'100vh', background:'#030303', color:'white', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:"'Inter',sans-serif" }}>

          {/* Aurora glow */}
          <div style={{ position:'absolute', left:'50%', top:'50%', width:'70vw', height:'55vh', borderRadius:'50%', background:'radial-gradient(circle,rgba(167,139,250,.10) 0%,rgba(96,165,250,.07) 40%,transparent 70%)', filter:'blur(60px)', animation:'pietri-breathe 9s ease-in-out infinite alternate', pointerEvents:'none', zIndex:0 }}/>

          {/* Grid bg */}
          <div style={{ position:'absolute', inset:0, backgroundSize:'56px 56px', backgroundImage:'linear-gradient(to right,rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.025) 1px,transparent 1px)', maskImage:'linear-gradient(to bottom,transparent,black 25%,black 75%,transparent)', WebkitMaskImage:'linear-gradient(to bottom,transparent,black 25%,black 75%,transparent)', pointerEvents:'none', zIndex:0 }}/>

          {/* Diagonal marquee */}
          <div style={{ position:'absolute', top:'3rem', left:0, width:'100%', overflow:'hidden', borderTop:'1px solid rgba(255,255,255,.06)', borderBottom:'1px solid rgba(255,255,255,.06)', background:'rgba(0,0,0,.4)', backdropFilter:'blur(8px)', padding:'.9rem 0', transform:'rotate(-1.5deg) scaleX(1.05)', zIndex:10, pointerEvents:'none' }}>
            <div style={{ display:'flex', width:'max-content', animation:'pietri-marquee 38s linear infinite', fontSize:'.65rem', fontWeight:700, letterSpacing:'.28em', color:'rgba(255,255,255,.3)', textTransform:'uppercase' }}>
              {[0,1].map(i=>(
                <span key={i} style={{ display:'flex', alignItems:'center', gap:'3rem', paddingRight:'3rem' }}>
                  <span>Streetwear Africain Premium</span><span style={{color:'rgba(255,255,255,.15)'}}>✦</span>
                  <span>Drops Limités</span><span style={{color:'rgba(255,255,255,.15)'}}>✦</span>
                  <span>Abidjan · Paris · Londres</span><span style={{color:'rgba(255,255,255,.15)'}}>✦</span>
                  <span>Broderie Artisanale</span><span style={{color:'rgba(255,255,255,.15)'}}>✦</span>
                  <span>Éditions Exclusives</span><span style={{color:'rgba(255,255,255,.15)'}}>✦</span>
                </span>
              ))}
            </div>
          </div>

          {/* Giant background text */}
          <div ref={giantRef} className="pietri-footer-giant" style={{ position:'absolute', bottom:'-3vh', left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', fontSize:'22vw', fontFamily:"'Anton',sans-serif", fontWeight:900, letterSpacing:'-.03em', color:'transparent', WebkitTextStroke:'1px rgba(255,255,255,.04)', background:'linear-gradient(180deg,rgba(255,255,255,.07) 0%,transparent 60%)', WebkitBackgroundClip:'text', backgroundClip:'text', pointerEvents:'none', userSelect:'none', zIndex:0 }}>
            PIETRI
          </div>

          {/* Main content */}
          <div style={{ position:'relative', zIndex:10, flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'8rem 2rem 3rem' }}>

            <h2 ref={headingRef} style={{ fontFamily:"'Anton',sans-serif", fontSize:'clamp(3rem,8vw,7rem)', fontWeight:900, letterSpacing:'-.02em', textAlign:'center', marginBottom:'3rem', background:'linear-gradient(180deg,white 0%,rgba(255,255,255,.4) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', filter:'drop-shadow(0 0 25px rgba(255,255,255,.1))' }}>
              Ready to drop?
            </h2>

            <div ref={linksRef} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'1.25rem', width:'100%', maxWidth:'600px' }}>
              {/* CTA buttons */}
              <div className="pietri-footer-cta-row" style={{ display:'flex', gap:'1rem', flexWrap:'wrap', justifyContent:'center' }}>
                <a href="/produits" className="pietri-glass-pill" style={{ padding:'.9rem 2.2rem', borderRadius:'999px', color:'white', fontWeight:700, fontSize:'.8rem', letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none', display:'flex', alignItems:'center', gap:'.6rem' }}>
                  <span>Voir la collection</span>
                  <span style={{ fontSize:'1rem' }}>→</span>
                </a>
                <a href="/espace-client" className="pietri-glass-pill" style={{ padding:'.9rem 2.2rem', borderRadius:'999px', color:'rgba(255,255,255,.6)', fontWeight:600, fontSize:'.78rem', letterSpacing:'.08em', textTransform:'uppercase', textDecoration:'none' }}>
                  Mon compte
                </a>
              </div>

              {/* Socials */}
              <div style={{ display:'flex', gap:'.6rem', marginTop:'.5rem' }}>
                {SOCIALS.map(s=>(
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="pietri-social-btn" aria-label={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link grid */}
          <div className="pietri-footer-grid" style={{ position:'relative', zIndex:10, display:'grid', gridTemplateColumns:'1.3fr 1fr 1fr', gap:'3rem', maxWidth:'1100px', margin:'0 auto', padding:'2rem 2rem 0', width:'100%' }}>
            {/* Brand */}
            <div>
              <p style={{ fontFamily:"'Anton',sans-serif", fontSize:'1.3rem', letterSpacing:'.02em', marginBottom:'.6rem' }}>PIETRI</p>
              <p style={{ fontSize:'.7rem', color:'rgba(255,255,255,.32)', lineHeight:1.75, maxWidth:'200px', marginBottom:'1.5rem' }}>
                Streetwear africain premium. Drops limités, broderies artisanales, culture diaspora.
              </p>
            </div>
            {/* Shop */}
            <div>
              <p style={{ fontSize:'.55rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.22em', color:'rgba(255,255,255,.28)', marginBottom:'1rem' }}>Collection</p>
              {LINKS_COL1.map(l=><a key={l.label} href={l.href} className="pietri-footer-link">{l.label}</a>)}
            </div>
            {/* Info */}
            <div>
              <p style={{ fontSize:'.55rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.22em', color:'rgba(255,255,255,.28)', marginBottom:'1rem' }}>Infos</p>
              {LINKS_COL2.map(l=><a key={l.label} href={l.href} className="pietri-footer-link">{l.label}</a>)}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pietri-footer-bottom" style={{ position:'relative', zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center', maxWidth:'1100px', margin:'0 auto', padding:'1.5rem 2rem 2.5rem', width:'100%', borderTop:'1px solid rgba(255,255,255,.05)', marginTop:'2rem', flexWrap:'wrap', gap:'.75rem' }}>
            <p style={{ fontSize:'.6rem', color:'rgba(255,255,255,.2)', letterSpacing:'.08em' }}>© {new Date().getFullYear()} PIETRI — Tous droits réservés</p>
            <div className="pietri-glass-pill" style={{ padding:'.45rem 1rem', borderRadius:'999px', display:'flex', alignItems:'center', gap:'.4rem' }}>
              <span style={{ fontSize:'.6rem', fontWeight:700, color:'rgba(255,255,255,.3)', textTransform:'uppercase', letterSpacing:'.1em' }}>Crafted with</span>
              <span style={{ fontSize:'.85rem', color:'#f87171', animation:'pietri-pulse 2s ease-in-out infinite' }}>❤</span>
              <span style={{ fontSize:'.6rem', fontWeight:900, color:'rgba(255,255,255,.6)', letterSpacing:'.04em' }}>en Côte d'Ivoire & France</span>
            </div>
            <button
              onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
              className="pietri-back-top pietri-glass-pill"
              style={{ width:'42px', height:'42px', borderRadius:'999px', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(255,255,255,.45)', cursor:'pointer', background:'none', border:'1px solid rgba(255,255,255,.08)' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
              </svg>
            </button>
          </div>

        </footer>
      </div>
    </>
  );
}

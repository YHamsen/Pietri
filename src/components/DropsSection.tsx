'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ShatterButton } from '@/components/ui/shatter-button';

const PRODUCTS = [
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png', price: 89, tag: 'LIMITED',    slug: 'floral-hoodie', bg: '#161616' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png', price: 49, tag: 'BESTSELLER', slug: 'koala-tee',    bg: '#131618' },
  { src: '/char-hoodie.png',                                                                                                  price: 59, tag: 'NEW',        slug: 'floral-tee',   bg: '#161314' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png', price: 79, tag: 'DROP',       slug: 'signature',    bg: '#131615' },
  { src: '/char-robe.png',                                                                                                   price: 69, tag: 'NEW',        slug: 'robe-florale', bg: '#161310' },
];

export default function DropsSection() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { tr } = useLanguage();
  const { format } = useCurrency();

  return (
    <section
      id="drops"
      style={{
        background: '#0a0a0a',
        padding: '6rem 2rem',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '3rem',
          maxWidth: '1200px',
          margin: '0 auto 3rem',
        }}
      >
        <div>
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'white',
              opacity: 0.4,
              marginBottom: '0.5rem',
            }}
          >
            {tr.dropsLabel}
          </p>
          <h2
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 400,
              color: 'white',
              lineHeight: 1,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
            }}
          >
            {tr.dropsTitle}
          </h2>
        </div>
        <a
          href="#"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            color: 'white',
            opacity: 0.5,
            textDecoration: 'none',
            transition: 'opacity 200ms',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.5')}
        >
          {tr.dropsViewAll} <ArrowRight size={14} strokeWidth={2} />
        </a>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {PRODUCTS.map((p, i) => {
          const prod = tr.products[p.slug as keyof typeof tr.products] ?? { label: p.slug.toUpperCase(), desc: '' };
          const tagLabel = tr.dropsTags[p.tag] ?? p.tag;
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: p.bg,
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                transform: hovered === i ? 'translateY(-6px)' : 'translateY(0)',
                transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Image area */}
              <div
                style={{
                  position: 'relative',
                  height: '320px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={prod.label}
                  draggable={false}
                  style={{
                    height: '90%',
                    width: 'auto',
                    objectFit: 'contain',
                    objectPosition: 'bottom center',
                    transform: hovered === i ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 400ms cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    fontSize: '0.55rem',
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'white',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '999px',
                    padding: '0.25rem 0.6rem',
                  }}
                >
                  {tagLabel}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: '1.25rem 1.25rem 1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'white', opacity: 0.95 }}>
                    {prod.label}
                  </p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', opacity: 0.9 }}>
                    {format(p.price)}
                  </p>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'white', opacity: 0.45, lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {prod.desc}
                </p>
                <ShatterButton
                  href={`/produits/${p.slug}`}
                  shatterColor="#ffffff"
                  shardCount={18}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                  className="w-full justify-center rounded-lg py-3 text-[0.65rem] tracking-[0.16em]"
                >
                  {tr.dropsViewProduct}
                </ShatterButton>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

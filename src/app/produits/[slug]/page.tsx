'use client';

import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, X, Upload, Camera } from 'lucide-react';
import { ShatterButton } from '@/components/ui/shatter-button';
import CinematicSwitch from '@/components/ui/cinematic-glow-toggle';
import { useParams } from 'next/navigation';
import { addToCart, getCart, cartCount } from '@/lib/cart';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/lib/wishlist';
import { useCurrency } from '@/contexts/CurrencyContext';

const CATALOGUE: Record<string, {
  label: string;
  desc: string;
  price: number;
  src: string;
  bg: string;
  details: string[];
  sizes: string[];
  negotiable?: boolean; // 🤝 Négociation activée sur certains produits
}> = {
  'floral-hoodie': {
    label: 'FLORAL HOODIE',
    desc: 'Hoodie oversize noir broderie pavot. Édition limitée.',
    price: 89,
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#111111',
    details: ['Coton premium 380g', 'Broderie pavot exclusive', 'Coupe oversize', 'Édition limitée 100 pièces'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    negotiable: true,
  },
  'koala-tee': {
    label: 'KOALA TEE',
    desc: 'T-shirt oversize logo Koala. Coton premium 320g.',
    price: 49,
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#0E1219',
    details: ['Coton premium 320g', 'Sérigraphie Koala', 'Coupe oversize', 'Lavage vintage'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  'floral-tee': {
    label: 'FLORAL TEE',
    desc: 'T-shirt oversize imprimé coquelicot. Washed vintage.',
    price: 59,
    src: '/char-hoodie.png',
    bg: '#130E11',
    details: ['Coton lavé 300g', 'Imprimé coquelicot all-over', 'Coupe oversize', 'Effet washed vintage'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  'signature': {
    label: 'SIGNATURE',
    desc: 'Pièce signature collection automne. Drop exclusif.',
    price: 79,
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#0E1310',
    details: ['Matière technique 340g', 'Patch signature brodé', 'Coupe oversize', 'Drop exclusif automne'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    negotiable: true,
  },
  'robe-florale': {
    label: 'ROBE FLORALE',
    desc: 'Robe oversize imprimé floral. Coupe asymétrique.',
    price: 69,
    src: '/char-robe.png',
    bg: '#12100E',
    details: ['Viscose premium 180g', 'Imprimé floral exclusif', 'Coupe asymétrique', 'Édition limitée'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
};

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = CATALOGUE[slug];
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);
  // Négociation
  const [negoOpen, setNegoOpen] = useState(false);
  const [negoEmail, setNegoEmail] = useState('');
  const [negoName, setNegoName] = useState('');
  const [negoOffer, setNegoOffer] = useState('');
  const [negoLoading, setNegoLoading] = useState(false);
  const [negoResult, setNegoResult] = useState<{decision:string;message:string;counter_price_euros?:number;attempts_left?:number}|null>(null);
  const [negoId, setNegoId] = useState<string|null>(null);
  const [tryonOpen, setTryonOpen] = useState(false);
  const [tryonPhoto, setTryonPhoto] = useState<string | null>(null);
  const [tryonLoading, setTryonLoading] = useState(false);
  const [tryonResult, setTryonResult] = useState<string | null>(null);
  const [tryonError, setTryonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { format, currency, toEur } = useCurrency();
  // Minimum offer = 55% of product price in selected currency
  const minOfferEur = product ? product.price * 0.55 : 0;
  const minOfferDisplay = product ? format(minOfferEur) : '';
  const suggestLow  = product ? format(product.price * 0.72) : '';
  const suggestHigh = product ? format(product.price * 0.88) : '';
  // Currency symbols for input display
  const currencySymbol = currency === 'XOF' ? 'FCFA' : currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
  const currencyPrefix = currency !== 'XOF';
  // Deposit gate state
  const [hasDeposit, setHasDeposit] = useState<boolean | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => {
    const update = () => setCartItems(cartCount(getCart()));
    update();
    window.addEventListener('pietri_cart_updated', update);
    return () => window.removeEventListener('pietri_cart_updated', update);
  }, []);

  useEffect(() => {
    setInWishlist(isInWishlist(slug));
  }, [slug]);

  const submitNego = async (isCounter = false) => {
    if (!negoEmail.includes('@') || !negoOffer || parseFloat(negoOffer) <= 0) return;
    // Convert from selected currency to EUR
    const offerInEur = toEur(parseFloat(negoOffer));
    if (offerInEur < minOfferEur) {
      setNegoResult({ decision: 'error', message: `Offre trop basse. Minimum accepté : ${minOfferDisplay}` });
      return;
    }
    setNegoLoading(true);
    try {
      const body: Record<string, unknown> = {
        action: 'offer',
        product_slug: slug,
        offered_price_euros: offerInEur,
        user_email: negoEmail.trim(),
        user_name: negoName.trim() || undefined,
      };
      if (isCounter && negoId) body.negotiation_id = negoId;

      const res = await fetch('/api/negotiations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setNegoResult(data);
        if (data.negotiation?.id) setNegoId(data.negotiation.id);
      } else {
        setNegoResult({ decision: 'error', message: data.error || 'Erreur inattendue' });
      }
    } catch (e) {
      setNegoResult({ decision: 'error', message: String(e) });
    }
    setNegoLoading(false);
  };

  const handleWishlist = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
    if (inWishlist) {
      removeFromWishlist(slug);
      setInWishlist(false);
    } else {
      addToWishlist({ slug, label: product.label, price: product.price, priceStr: `€${product.price}`, src: product.src });
      setInWishlist(true);
    }
  };

  if (!product) {
    return (
      <div style={{ background: '#0a0a0a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ opacity: 0.5, marginBottom: '1rem' }}>Produit introuvable</p>
          <a href="/" style={{ color: 'white', textDecoration: 'underline' }}>← Retour</a>
        </div>
      </div>
    );
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setTryonPhoto(reader.result as string); setTryonResult(null); setTryonError(null); };
    reader.readAsDataURL(file);
  }

  async function launchTryon() {
    if (!tryonPhoto || !product) return;
    setTryonLoading(true); setTryonResult(null); setTryonError(null);
    try {
      const res = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_image: tryonPhoto,
          garment_image: product.src,
          category: slug === 'robe-florale' ? 'one-pieces' : slug.includes('hoodie') || slug.includes('signature') ? 'tops' : 'tops',
        }),
      });
      const data = await res.json();
      if (data.output) setTryonResult(data.output);
      else setTryonError(data.error || 'Génération échouée. Réessaie.');
    } catch {
      setTryonError('Erreur réseau. Réessaie.');
    } finally {
      setTryonLoading(false);
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize || !product) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(12);
    addToCart({
      slug,
      label: product.label,
      price: product.price,
      priceStr: `€${product.price}`,
      src: product.src,
      taille: selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div
      style={{
        background: product.bg,
        minHeight: '100vh',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; gap: 0 !important; padding: 0 !important; min-height: unset !important; }
          .product-image-col { height: 70vh !important; padding-top: 4rem !important; background: linear-gradient(to bottom, transparent 60%, #0a0a0a 100%); }
          .product-image-col img { height: 90% !important; width: auto !important; max-width: 85% !important; }
          .product-info-col { padding: 0 1.5rem 5rem !important; margin-top: -2rem !important; }
          .product-nav { padding: 1rem 1.25rem !important; }
          .add-btn { max-width: 100% !important; }
        }
      `}</style>

      {/* Grain */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: GRAIN_SVG, backgroundSize: '200px 200px', opacity: 0.35 }} />

      {/* Nav */}
      <div
        className="product-nav"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2rem',
          background: `linear-gradient(to bottom, ${product.bg}ee, transparent)`,
        }}
      >
        <CinematicSwitch asBackButton />
          <span
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: '1rem',
              color: 'white',
              letterSpacing: '0.08em',
              opacity: 0.9,
            }}
          >
            PIETRI
          </span>
        <a
          href="/panier"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'white',
            textDecoration: 'none',
            fontSize: '0.7rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            opacity: 0.7,
          }}
        >
          <ShoppingBag size={16} /> Panier
          {cartItems > 0 && (
            <span style={{ background: 'white', color: '#0a0a0a', borderRadius: '999px', fontSize: '0.55rem', fontWeight: 800, padding: '0.15rem 0.45rem', minWidth: '16px', textAlign: 'center', lineHeight: 1.4 }}>
              {cartItems}
            </span>
          )}
        </a>
      </div>

      {/* Content */}
      <div
        className="product-grid"
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '100vh',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 2rem',
          gap: '4rem',
          alignItems: 'center',
        }}
      >
        {/* Character image */}
        <div
          className="product-image-col"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            height: '100vh',
            paddingTop: '6rem',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.src}
            alt={product.label}
            style={{
              height: '85%',
              width: 'auto',
              objectFit: 'contain',
              objectPosition: 'bottom center',
              filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.5))',
            }}
          />
        </div>

        {/* Product info */}
        <div className="product-info-col" style={{ paddingTop: '2rem' }}>
          <p
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'white',
              opacity: 0.4,
              marginBottom: '0.75rem',
            }}
          >
            Collection 2026
          </p>

          <h1
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 400,
              color: 'white',
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              marginBottom: '1rem',
            }}
          >
            {product.label}
          </h1>

          <p
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: '2rem',
              color: 'white',
              opacity: 0.9,
              marginBottom: '1.5rem',
              letterSpacing: '0.02em',
            }}
          >
            {format(product.price)}
          </p>

          <p
            style={{
              fontSize: '0.85rem',
              color: 'white',
              opacity: 0.6,
              lineHeight: 1.7,
              marginBottom: '2rem',
              maxWidth: '380px',
            }}
          >
            {product.desc}
          </p>

          {/* Details */}
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2.5rem' }}>
            {product.details.map(d => (
              <li
                key={d}
                style={{
                  fontSize: '0.75rem',
                  color: 'white',
                  opacity: 0.5,
                  padding: '0.4rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'white', opacity: 0.4, flexShrink: 0 }} />
                {d}
              </li>
            ))}
          </ul>

          {/* Sizes */}
          <p
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'white',
              opacity: 0.4,
              marginBottom: '0.75rem',
            }}
          >
            Taille
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {product.sizes.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '8px',
                  background: selectedSize === s ? 'white' : 'transparent',
                  color: selectedSize === s ? '#0a0a0a' : 'white',
                  border: selectedSize === s ? '2px solid white' : '1.5px solid rgba(255,255,255,0.25)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  letterSpacing: '0.04em',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* AI Try-On */}
          <button
            onClick={() => { setTryonOpen(true); setTryonResult(null); setTryonPhoto(null); setTryonError(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.35)',
              borderRadius: '10px', padding: '0.65rem 1.1rem',
              color: '#a78bfa', fontSize: '0.68rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              marginBottom: '1.25rem', transition: 'all 200ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(167,139,250,0.18)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(167,139,250,0.1)'; }}
          >
            <Camera size={15} /> Essayer virtuellement — AI Try-On
          </button>

          {/* Add to cart + favoris */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', maxWidth: '400px' }}>
          <button
            className="add-btn"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            style={{
              flex: 1,
              padding: '1.1rem',
              background: selectedSize ? 'white' : 'rgba(255,255,255,0.08)',
              color: selectedSize ? '#0a0a0a' : 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              cursor: selectedSize ? 'pointer' : 'not-allowed',
              transition: 'all 250ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
            }}
          >
            <ShoppingBag size={16} />
            {added ? '✓ Ajouté au panier' : !selectedSize ? 'Choisir une taille' : 'Ajouter au panier'}
          </button>

          {/* Bouton favoris */}
          <button
            onClick={handleWishlist}
            style={{
              width: '3.2rem', height: '3.2rem', borderRadius: '12px', flexShrink: 0,
              background: inWishlist ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${inWishlist ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.18)'}`,
              color: inWishlist ? '#ef4444' : 'rgba(255,255,255,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 200ms ease',
            }}
          >
            <Heart size={18} fill={inWishlist ? '#ef4444' : 'none'} strokeWidth={2} />
          </button>
          </div>

          {/* Bouton négociation */}
          {product.negotiable && (
            <button
              onClick={() => { setNegoOpen(true); setNegoResult(null); setNegoOffer(''); }}
              style={{ marginTop: '0.65rem', width: '100%', padding: '0.75rem', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 12, color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'all 200ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}
            >
              🤝 Faire une offre
            </button>
          )}

          {/* Voir panier */}
          {added && (
            <a
              href="/panier"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.7rem', color: 'white', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}
            >
              <ShoppingBag size={13} /> Voir mon panier →
            </a>
          )}

          {/* Toast flottant */}
          {added && (
            <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 999, background: 'rgba(255,255,255,0.95)', color: '#0a0a0a', padding: '0.9rem 1.6rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', pointerEvents: 'none', backdropFilter: 'blur(12px)' }}>
              <ShoppingBag size={15} />
              Ajouté ! Panier ({cartItems})
            </div>
          )}

          {/* Back to drops */}
          <div style={{ marginTop: '1.5rem' }}>
            <ShatterButton
              href="/#drops"
              shatterColor="rgba(255,255,255,0.7)"
              shardCount={14}
              onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10); }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              Voir tous les drops
            </ShatterButton>
          </div>
        </div>
      </div>

      {/* ── Négociation Modal ── */}
      {negoOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px 24px 0 0', padding: '2rem 1.75rem 2.5rem', width: '100%', maxWidth: 520, position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
            <button onClick={() => { setNegoOpen(false); setNegoResult(null); setHasDeposit(null); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: 32, height: 32, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={14} />
            </button>

            <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, margin: '0 auto 1.75rem' }} />

            {/* ── Gate : dépôt requis ── */}
            {hasDeposit === null && (
              <div>
                <p style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.6rem' }}>Accès Négociation</p>
                <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.55rem', textTransform: 'uppercase', color: 'white', marginBottom: '0.5rem', lineHeight: 1.1 }}>Dépôt requis 🔒</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                  Pour accéder aux négociations, tu dois d'abord déposer un minimum de <strong style={{ color: 'white' }}>{format(3)}</strong> sur ton compte PIETRI.<br/>
                  Ce montant reste sur ton compte — il est déduit uniquement si une offre est acceptée.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', fontFamily: "'Anton', sans-serif" }}>{format(3)}</p>
                      <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem' }}>Dépôt minimum</p>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#facc15', fontFamily: "'Anton', sans-serif" }}>3</p>
                      <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem' }}>Rounds max</p>
                    </div>
                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', fontFamily: "'Anton', sans-serif" }}>55%</p>
                      <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem' }}>Offre min</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <a href="/espace-client" style={{ display: 'block', padding: '0.95rem', background: 'white', color: '#0a0a0a', borderRadius: 12, fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
                    Déposer des fonds →
                  </a>
                  <button onClick={() => setHasDeposit(true)} style={{ padding: '0.75rem', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12, color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em' }}>
                    J'ai déjà déposé — continuer
                  </button>
                </div>
              </div>
            )}

            {/* ── Formulaire offre ── */}
            {hasDeposit === true && (
              <>
                <p style={{ fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>Négociation · {product.label}</p>
                <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.55rem', textTransform: 'uppercase', color: 'white', marginBottom: '0.35rem', lineHeight: 1.1 }}>Fais ton prix 🤝</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Prix affiché : <strong style={{ color: 'white' }}>{format(product.price)}</strong> · Négocie comme au marché. Max 3 rounds.
                </p>

                {!negoResult ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '0.35rem' }}>Ton email</label>
                      <input value={negoEmail} onChange={e => setNegoEmail(e.target.value)} type="email" placeholder="ton@email.com" style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' as const }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '0.35rem' }}>Prénom (optionnel)</label>
                      <input value={negoName} onChange={e => setNegoName(e.target.value)} placeholder="Jean" style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' as const }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '0.35rem' }}>Ton offre ({currencySymbol})</label>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, overflow: 'hidden' }}>
                        {currencyPrefix && <span style={{ padding: '0 0.75rem 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{currencySymbol}</span>}
                        <input value={negoOffer} onChange={e => setNegoOffer(e.target.value)} type="number" min="1" placeholder={String(Math.round(product.price * 0.8 * (currency === 'XOF' ? 655.957 : currency === 'GBP' ? 0.84 : currency === 'USD' ? 1.07 : 1)))} style={{ flex: 1, padding: '0.85rem 0.75rem', background: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', fontWeight: 700, outline: 'none' }} />
                        {!currencyPrefix && <span style={{ padding: '0 1rem 0 0.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{currencySymbol}</span>}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                        <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>Suggestion : {suggestLow}–{suggestHigh}</p>
                        <p style={{ fontSize: '0.6rem', color: 'rgba(255,100,100,0.5)' }}>Min : {minOfferDisplay}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => submitNego(false)}
                      disabled={negoLoading || !negoEmail.includes('@') || !negoOffer}
                      style={{ marginTop: '0.5rem', padding: '0.95rem', background: (!negoLoading && negoEmail.includes('@') && negoOffer) ? 'white' : 'rgba(255,255,255,0.15)', color: '#0a0a0a', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 200ms' }}
                    >
                      {negoLoading ? 'Envoi…' : `Envoyer mon offre →`}
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem', lineHeight: 1 }}>
                      {negoResult.decision === 'accept' ? '🎉' : negoResult.decision === 'counter' ? '🤝' : negoResult.decision === 'reject' ? '😔' : '⚠️'}
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', lineHeight: 1.6, marginBottom: '1rem' }}>{negoResult.message}</p>

                    {negoResult.decision === 'counter' && negoResult.counter_price_euros && (
                      <div style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.25rem' }}>
                        <p style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(96,165,250,0.6)', marginBottom: '0.4rem', fontWeight: 700 }}>Notre contre-offre</p>
                        <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '2.2rem', color: '#60a5fa', marginBottom: '0.3rem' }}>{format(negoResult.counter_price_euros)}</p>
                        <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)' }}>{negoResult.attempts_left} round{(negoResult.attempts_left ?? 0) > 1 ? 's' : ''} restant{(negoResult.attempts_left ?? 0) > 1 ? 's' : ''}</p>
                      </div>
                    )}

                    {negoResult.decision === 'counter' && negoResult.counter_price_euros && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
                        {/* ACCEPT COUNTER BUTTON */}
                        {negoId && (
                          <button
                            onClick={async () => {
                              setNegoLoading(true);
                              try {
                                const res = await fetch('/api/negotiations', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ action: 'accept_counter', negotiation_id: negoId, user_email: negoEmail.trim() }),
                                });
                                const data = await res.json();
                                if (data.success) setNegoResult({ decision: 'accept', message: data.message });
                                else setNegoResult({ decision: 'error', message: data.error || 'Erreur' });
                              } catch (e) { setNegoResult({ decision: 'error', message: String(e) }); }
                              setNegoLoading(false);
                            }}
                            disabled={negoLoading}
                            style={{ width: '100%', padding: '0.9rem', background: '#60a5fa', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 200ms' }}
                          >
                            {negoLoading ? '…' : `✓ Accepter ${format(negoResult.counter_price_euros)}`}
                          </button>
                        )}
                        {/* Re-offer */}
                        {(negoResult.attempts_left ?? 0) > 0 && (
                          <div>
                            <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' }}>Ou fais une nouvelle offre :</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <input value={negoOffer} onChange={e => setNegoOffer(e.target.value)} type="number"
                                placeholder={String(Math.round(negoResult.counter_price_euros * (currency === 'XOF' ? 655.957 : currency === 'GBP' ? 0.84 : currency === 'USD' ? 1.07 : 1)))}
                                style={{ flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: '0.9rem', outline: 'none' }} />
                              <button onClick={() => { setNegoResult(null); submitNego(true); }} disabled={negoLoading}
                                style={{ padding: '0.75rem 1.1rem', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: 10, fontWeight: 800, fontSize: '0.72rem', cursor: 'pointer' }}>
                                {negoLoading ? '…' : 'Proposer'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {negoResult.decision === 'accept' && (
                      <a href="/panier" style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.9rem 2rem', background: 'white', color: '#0a0a0a', borderRadius: 999, fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
                        Commander maintenant →
                      </a>
                    )}

                    <button onClick={() => { setNegoOpen(false); setNegoResult(null); setHasDeposit(null); }} style={{ display: 'block', margin: '1rem auto 0', background: 'none', border: 'none', color: 'rgba(255,255,255,0.2)', fontSize: '0.68rem', cursor: 'pointer' }}>
                      Fermer
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── AI Try-On Modal ── */}
      {tryonOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: '#111', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 20, padding: '2rem', maxWidth: 480, width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setTryonOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={18} color="#a78bfa" />
              </div>
              <div>
                <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '1.1rem', textTransform: 'uppercase', color: 'white' }}>AI Try-On</p>
                <p style={{ fontSize: '0.6rem', opacity: 0.4, marginTop: '0.1rem' }}>Upload ta photo — l'IA te génère avec {product.label}</p>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" capture="user" onChange={handlePhotoUpload} style={{ display: 'none' }} />

            {!tryonPhoto ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%', padding: '2.5rem', border: '2px dashed rgba(167,139,250,0.3)', borderRadius: 14, background: 'rgba(167,139,250,0.04)', color: '#a78bfa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 200ms' }}
              >
                <Upload size={28} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Choisir une photo</span>
                <span style={{ fontSize: '0.62rem', opacity: 0.45 }}>JPG, PNG — photo de face recommandée</span>
              </button>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: tryonResult ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.35, marginBottom: '0.5rem' }}>Ta photo</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={tryonPhoto} alt="Ta photo" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 280 }} />
                  </div>
                  {tryonResult && (
                    <div>
                      <p style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.35, marginBottom: '0.5rem' }}>Résultat</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tryonResult} alt="Try-On PIETRI" style={{ width: '100%', borderRadius: 10, objectFit: 'cover', maxHeight: 280 }} />
                    </div>
                  )}
                </div>

                {tryonError && <p style={{ fontSize: '0.7rem', color: '#f87171', marginBottom: '0.75rem', padding: '0.6rem 0.85rem', background: 'rgba(248,113,113,0.1)', borderRadius: 8 }}>{tryonError}</p>}

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={launchTryon}
                    disabled={tryonLoading}
                    style={{ flex: 1, padding: '0.9rem', background: tryonLoading ? 'rgba(167,139,250,0.2)' : 'rgba(167,139,250,0.85)', color: 'white', border: 'none', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: tryonLoading ? 'not-allowed' : 'pointer' }}
                  >
                    {tryonLoading ? '⏳ Génération en cours (~20s)…' : tryonResult ? '🔄 Régénérer' : '✨ Générer'}
                  </button>
                  <button onClick={() => { setTryonPhoto(null); setTryonResult(null); }} style={{ padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.65rem' }}>
                    Changer
                  </button>
                </div>

                {tryonResult && (
                  <p style={{ fontSize: '0.62rem', opacity: 0.35, textAlign: 'center', marginTop: '0.75rem' }}>
                    Partage ton résultat sur Instagram → tague @pietri_officiel 🔥
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

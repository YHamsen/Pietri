'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, MapPin, ShoppingBag, Globe, Phone } from 'lucide-react';
import { getCart, removeFromCart, updateQty, cartTotal, cartCount, CartItem, saveCart } from '@/lib/cart';
import { saveOrder } from '@/lib/orders';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';

// Frais de livraison en EUR (base) — convertis à l'affichage
const DELIVERY_EUR = { abidjan: 2000 / 655.957, ci_autre: 3500 / 655.957, international: 15 } as const;
// Frais de livraison en XOF (pour API MoMo)
const DELIVERY_XOF = { abidjan: 2000, ci_autre: 3500 } as const;

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

const ABIDJAN_BOUNDS = { latMin: 5.20, latMax: 5.55, lngMin: -4.15, lngMax: -3.85 };

type DeliveryZone = 'abidjan' | 'ci_autre' | 'international' | null;

function isInAbidjan(lat: number, lng: number) {
  return lat >= ABIDJAN_BOUNDS.latMin && lat <= ABIDJAN_BOUNDS.latMax
    && lng >= ABIDJAN_BOUNDS.lngMin && lng <= ABIDJAN_BOUNDS.lngMax;
}

function normalizeMomoPhone(raw: string): string {
  let n = raw.replace(/[\s\-\(\)\.]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  if (n.startsWith('00')) n = n.slice(2);
  // Local CI format: 05xxxxxxxx / 04xxxxxxxx → prepend 225
  if (/^0\d{9}$/.test(n)) n = '225' + n.slice(1);
  return n;
}


async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
      { headers: { 'User-Agent': 'PIETRI-shop/1.0' } }
    );
    const data = await res.json();
    const a = data.address || {};
    const street = [a.house_number, a.road || a.pedestrian || a.footway].filter(Boolean).join(' ');
    const parts = [
      street || a.neighbourhood || a.hamlet,
      a.suburb || a.quarter,
      a.city_district || a.municipality,
      a.city || a.town || a.village,
    ].filter(Boolean);
    return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  color: 'white',
  fontSize: '0.8rem',
  fontFamily: "'Inter', sans-serif",
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  opacity: 0.4,
  marginBottom: '0.4rem',
  display: 'block',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span style={labelStyle}>{label}</span>
      {children}
    </div>
  );
}

export default function PanierPage() {
  const { tr } = useLanguage();
  const { format, currency } = useCurrency();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [delivery, setDelivery] = useState<DeliveryZone>(null);

  // Abidjan GPS
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'ok' | 'outside' | 'denied'>('idle');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsAddress, setGpsAddress] = useState('');
  const [addrAbidjan, setAddrAbidjan] = useState('');
  const [telAbidjan, setTelAbidjan] = useState('');

  // CI autre ville
  const [villeCI, setVilleCI] = useState('');
  const [addrCI, setAddrCI] = useState('');
  const [telCI, setTelCI] = useState('');

  // International
  const [intlPrenom, setIntlPrenom] = useState('');
  const [intlNom, setIntlNom] = useState('');
  const [intlAdresse, setIntlAdresse] = useState('');
  const [intlVille, setIntlVille] = useState('');
  const [intlCP, setIntlCP] = useState('');
  const [intlPays, setIntlPays] = useState('');
  const [intlTel, setIntlTel] = useState('');

  // Paiement
  const [momoPhone, setMomoPhone] = useState('');
  const [paying, setPaying] = useState(false);
  const [payStatus, setPayStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [payError, setPayError] = useState('');

  useEffect(() => {
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener('pietri_cart_updated', handler);
    return () => window.removeEventListener('pietri_cart_updated', handler);
  }, []);

  const detectGPS = () => {
    setGpsLoading(true);
    setGpsStatus('idle');
    setGpsAddress('');
    if (!navigator.geolocation) {
      setGpsStatus('denied');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGpsCoords({ lat, lng });
        const addr = await reverseGeocode(lat, lng);
        setGpsAddress(addr);
        const inAbidjan = isInAbidjan(lat, lng);
        setGpsStatus(inAbidjan ? 'ok' : 'outside');
        if (inAbidjan && !addrAbidjan) setAddrAbidjan(addr);
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setGpsStatus('denied');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const total = cartTotal(cart); // always in EUR
  const deliveryEur = delivery ? DELIVERY_EUR[delivery] : 0;
  const grandTotalEur = total + deliveryEur;

  // MoMo reçoit toujours le montant dans la devise locale correcte
  const momoAmount = delivery === 'international'
    ? Math.round(grandTotalEur * 100) / 100  // EUR
    : Math.round(total * 655.957) + (delivery === 'abidjan' ? DELIVERY_XOF.abidjan : DELIVERY_XOF.ci_autre); // XOF exact

  const buildAddress = () => {
    if (delivery === 'abidjan') return addrAbidjan || 'Abidjan (GPS confirmé)';
    if (delivery === 'ci_autre') return `${villeCI}${addrCI ? ', ' + addrCI : ''}, Côte d'Ivoire`;
    if (delivery === 'international') return `${intlAdresse}, ${intlCP} ${intlVille}, ${intlPays}`;
    return '';
  };

  const buildContactPhone = () => {
    if (delivery === 'abidjan') return telAbidjan;
    if (delivery === 'ci_autre') return telCI;
    if (delivery === 'international') return intlTel;
    return '';
  };

  const canPay = (() => {
    if (!delivery || !momoPhone) return false;
    if (delivery === 'abidjan') return !!telAbidjan && !!addrAbidjan;
    if (delivery === 'ci_autre') return !!telCI && !!villeCI && !!addrCI;
    if (delivery === 'international') return !!intlPrenom && !!intlNom && !!intlAdresse && !!intlVille && !!intlPays && !!intlTel;
    return false;
  })();

  const handlePay = async () => {
    if (!canPay || !delivery) return;
    const snapshot = [...cart];
    const normalizedPhone = normalizeMomoPhone(momoPhone);
    setPaying(true);
    setPayError('');
    try {
      const res = await fetch('/api/paiement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: normalizedPhone,
          amount: momoAmount,
          currency: delivery === 'international' ? 'EUR' : 'XOF',
          produit: snapshot.map(c => `${c.label} (${c.taille})`).join(', '),
          taille: snapshot.map(c => c.taille).join(', '),
          adresse: buildAddress(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        saveOrder({
          id: data.referenceId,
          createdAt: new Date().toISOString(),
          items: snapshot,
          total,
          delivery: delivery === 'abidjan' ? 'abidjan' : 'international',
          address: buildAddress(),
          phone: buildContactPhone(),
          momoRef: data.referenceId,
          status: 'en_attente',
        });
        // Persist in Supabase (best-effort, localStorage stays as fallback)
        const profile = (() => { try { return JSON.parse(localStorage.getItem('pietri_profile') || '{}'); } catch { return {}; } })();
        fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            referenceId: data.referenceId,
            items: snapshot,
            total,
            delivery: delivery === 'abidjan' ? 'abidjan' : 'international',
            address: buildAddress(),
            phone: buildContactPhone(),
            profile,
          }),
        }).catch(() => {}); // Non-blocking
        saveCart([]);
        setPayStatus('sent');
      } else {
        setPayError(data.detail || data.error || 'Paiement refusé. Vérifie ton numéro MoMo.');
        setPayStatus('error');
      }
    } catch {
      setPayError('Erreur réseau. Réessaie.');
      setPayStatus('error');
    }
    setPaying(false);
  };

  if (cart.length === 0 && payStatus !== 'sent') {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", color: 'white' }}>
        <div style={{ backgroundImage: GRAIN_SVG, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />
        <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
        <p style={{ opacity: 0.5, marginBottom: '0.5rem', fontSize: '0.85rem' }}>{tr.cartEmpty}</p>
        <a href="/#drops" style={{ color: 'white', fontSize: '0.75rem', opacity: 0.4, textDecoration: 'underline' }}>{tr.cartSeeDrops}</a>
      </div>
    );
  }

  const zone3style = (z: DeliveryZone): React.CSSProperties => ({
    padding: '1.1rem 1.25rem',
    borderRadius: '10px',
    border: `1.5px solid ${delivery === z ? 'white' : 'rgba(255,255,255,0.12)'}`,
    background: delivery === z ? 'rgba(255,255,255,0.06)' : 'transparent',
    cursor: 'pointer',
    transition: 'all 200ms',
  });

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', position: 'relative' }}>
      <style>{`
        @media (max-width: 768px) {
          .panier-grid { grid-template-columns: 1fr !important; gap: 2rem !important; padding: 1.5rem 1.25rem !important; }
          .panier-recap { position: static !important; }
          .panier-title { font-size: 1.6rem !important; margin-bottom: 1.25rem !important; }
          .panier-nav { padding: 1rem 1.25rem !important; }
        }
      `}</style>
      <div style={{ backgroundImage: GRAIN_SVG, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <div className="panier-nav" style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', background: '#0a0a0aee', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.7 }}>
            <ArrowLeft size={14} /> {tr.cartBack}
          </a>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', opacity: 0.9 }}>PIETRI</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{tr.cartItems(cartCount(cart))}</span>
      </div>

      <div className="panier-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '4rem', position: 'relative', zIndex: 1 }}>

        {/* Left column */}
        <div>
          <h1 className="panier-title" style={{ fontFamily: "'Anton', sans-serif", fontSize: '2rem', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '-0.01em' }}>{tr.cartTitle}</h1>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {cart.map(item => (
              <div key={`${item.slug}-${item.taille}`} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '80px', height: '80px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.label} style={{ height: '90%', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{item.label}</p>
                  <p style={{ fontSize: '0.7rem', opacity: 0.45, marginBottom: '0.75rem' }}>{tr.cartSize} : {item.taille}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button onClick={() => updateQty(item.slug, item.taille, item.qty - 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
                    <span style={{ fontSize: '0.85rem', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.slug, item.taille, item.qty + 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
                    <button onClick={() => removeFromCart(item.slug, item.taille)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.priceStr}</p>
                  {item.qty > 1 && <p style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: '0.25rem' }}>×{item.qty}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Livraison */}
          <div style={{ marginTop: '2.5rem' }}>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.2rem', textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>{tr.cartDelivery}</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              {/* ── Option 1 : Abidjan GPS ── */}
              <div style={zone3style('abidjan')} onClick={() => setDelivery('abidjan')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MapPin size={18} style={{ color: delivery === 'abidjan' ? 'white' : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tr.cartZoneAbidjan}</p>
                      <p style={{ fontSize: '0.68rem', opacity: 0.5, marginTop: '0.15rem' }}>{tr.cartZoneAbidjanSub}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{format(DELIVERY_EUR.abidjan)}</span>
                </div>

                {delivery === 'abidjan' && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                    {/* GPS button */}
                    <button
                      onClick={detectGPS}
                      disabled={gpsLoading}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: gpsStatus === 'ok' ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.08)', border: `1px solid ${gpsStatus === 'ok' ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.15)'}`, borderRadius: '8px', color: gpsStatus === 'ok' ? '#10b981' : 'white', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.6rem 1rem', cursor: gpsLoading ? 'wait' : 'pointer', transition: 'all 200ms' }}
                    >
                      <MapPin size={13} />
                      {gpsLoading ? tr.cartGpsLoading
                        : gpsStatus === 'ok' ? `✓ ${gpsAddress || tr.cartGpsOk}`
                        : tr.cartGpsConfirm}
                    </button>
                    {gpsStatus === 'outside' && (
                      <p style={{ fontSize: '0.68rem', color: '#f59e0b', lineHeight: 1.5 }}>
                        {tr.cartGpsOutside(gpsAddress || `${gpsCoords?.lat.toFixed(4)}, ${gpsCoords?.lng.toFixed(4)}`)}
                      </p>
                    )}
                    {gpsStatus === 'denied' && (
                      <p style={{ fontSize: '0.68rem', color: '#ff6b6b' }}>{tr.cartGpsDenied}</p>
                    )}
                    <Field label={tr.cartFieldAddr}>
                      <input type="text" placeholder="Rue, quartier, commune, point de repère…" value={addrAbidjan} onChange={e => setAddrAbidjan(e.target.value)} style={inputStyle} />
                    </Field>
                    <Field label={tr.cartFieldTel}>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input type="tel" placeholder="+225 07 00 00 00 00" value={telAbidjan} onChange={e => setTelAbidjan(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.2rem' }} />
                      </div>
                    </Field>
                  </div>
                )}
              </div>

              {/* ── Option 2 : CI hors Abidjan ── */}
              <div style={zone3style('ci_autre')} onClick={() => setDelivery('ci_autre')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MapPin size={18} style={{ color: delivery === 'ci_autre' ? 'white' : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tr.cartZoneCI}</p>
                      <p style={{ fontSize: '0.68rem', opacity: 0.5, marginTop: '0.15rem' }}>{tr.cartZoneCISub}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{format(DELIVERY_EUR.ci_autre)}</span>
                </div>

                {delivery === 'ci_autre' && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                    <Field label={tr.cartFieldCity}>
                      <input type="text" placeholder="Ex : Bouaké" value={villeCI} onChange={e => setVilleCI(e.target.value)} style={inputStyle} />
                    </Field>
                    <Field label={tr.cartFieldAddrFull}>
                      <input type="text" placeholder="Quartier, rue, point de repère…" value={addrCI} onChange={e => setAddrCI(e.target.value)} style={inputStyle} />
                    </Field>
                    <Field label={tr.cartFieldTel}>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input type="tel" placeholder="+225 07 00 00 00 00" value={telCI} onChange={e => setTelCI(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.2rem' }} />
                      </div>
                    </Field>
                  </div>
                )}
              </div>

              {/* ── Option 3 : International ── */}
              <div style={zone3style('international')} onClick={() => setDelivery('international')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Globe size={18} style={{ color: delivery === 'international' ? 'white' : 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tr.cartZoneIntl}</p>
                      <p style={{ fontSize: '0.68rem', opacity: 0.5, marginTop: '0.15rem' }}>{tr.cartZoneIntlSub}</p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{format(DELIVERY_EUR.international)}</span>
                </div>

                {delivery === 'international' && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <Field label={tr.cartFieldFirst}>
                        <input type="text" placeholder="Jean" value={intlPrenom} onChange={e => setIntlPrenom(e.target.value)} style={inputStyle} />
                      </Field>
                      <Field label={tr.cartFieldLast}>
                        <input type="text" placeholder="Dupont" value={intlNom} onChange={e => setIntlNom(e.target.value)} style={inputStyle} />
                      </Field>
                    </div>
                    <Field label={tr.cartFieldAddr}>
                      <input type="text" placeholder="12 rue des Fleurs" value={intlAdresse} onChange={e => setIntlAdresse(e.target.value)} style={inputStyle} />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <Field label={tr.cartFieldZip}>
                        <input type="text" placeholder="75001" value={intlCP} onChange={e => setIntlCP(e.target.value)} style={inputStyle} />
                      </Field>
                      <Field label={tr.cartFieldCity}>
                        <input type="text" placeholder="Paris" value={intlVille} onChange={e => setIntlVille(e.target.value)} style={inputStyle} />
                      </Field>
                    </div>
                    <Field label={tr.cartFieldCountry}>
                      <input type="text" placeholder="France" value={intlPays} onChange={e => setIntlPays(e.target.value)} style={inputStyle} />
                    </Field>
                    <Field label={tr.cartZoneIntlTel}>
                      <div style={{ position: 'relative' }}>
                        <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input type="tel" placeholder="+33 6 00 00 00 00" value={intlTel} onChange={e => setIntlTel(e.target.value)} style={{ ...inputStyle, paddingLeft: '2.2rem' }} />
                      </div>
                    </Field>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right: summary + payment */}
        <div className="panier-recap" style={{ position: 'sticky', top: '6rem', alignSelf: 'start' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.75rem' }}>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>{tr.cartSummary}</h2>

            {cart.map(item => (
              <div key={`${item.slug}-${item.taille}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.6rem', opacity: 0.7 }}>
                <span>{item.label} ×{item.qty} ({item.taille})</span>
                <span>{format(item.price * item.qty)}</span>
              </div>
            ))}

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '1rem 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.5rem', opacity: 0.6 }}>
              <span>{tr.cartDeliveryLine}</span>
              <span>{delivery ? format(deliveryEur) : '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginTop: '0.75rem' }}>
              <span>{tr.cartTotal}</span>
              <span>{delivery ? format(grandTotalEur) : format(total)}</span>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '1.5rem 0' }} />

            {/* MoMo phone */}
            <Field label={tr.cartMomoLabel}>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input
                  type="tel"
                  placeholder="+225 05 00 00 00 00"
                  value={momoPhone}
                  onChange={e => { setMomoPhone(e.target.value); setPayStatus('idle'); }}
                  style={{ ...inputStyle, paddingLeft: '2.2rem', marginBottom: '1rem' }}
                />
              </div>
            </Field>

            {!canPay && delivery && (
              <p style={{ fontSize: '0.65rem', opacity: 0.4, marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {tr.cartFillFields}
              </p>
            )}

            {payStatus === 'sent' ? (
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>{tr.cartPaySent}</p>
                <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.75rem' }}>{tr.cartPaySentSub}</p>
                <a href="/espace-client" style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981', textDecoration: 'none' }}>
                  {tr.cartTrackOrder}
                </a>
              </div>
            ) : (
              <button
                onClick={handlePay}
                disabled={!canPay || paying}
                style={{ width: '100%', padding: '1rem', background: canPay ? 'white' : 'rgba(255,255,255,0.08)', color: canPay ? '#0a0a0a' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.16em', cursor: canPay ? 'pointer' : 'not-allowed', transition: 'all 250ms' }}
              >
                {paying ? tr.cartPaying : tr.cartPayBtn}
              </button>
            )}

            {payStatus === 'error' && (
              <p style={{ fontSize: '0.68rem', color: '#ff6b6b', marginTop: '0.75rem', textAlign: 'center' }}>{payError || tr.cartPayError}</p>
            )}

            <p style={{ fontSize: '0.6rem', opacity: 0.25, textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
              {tr.cartSecure}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

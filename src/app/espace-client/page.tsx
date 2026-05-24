'use client';

import { useState, useEffect, useRef } from 'react';
// Keep only the icons that have NO custom SVG replacement
// Lucide icons still in use (minimal set)
import { CheckCircle, X } from 'lucide-react';
import { CopyCode } from '@/components/ui/copy-code-button';
import { useCurrency } from '@/contexts/CurrencyContext';

// ─── Custom thin-stroke SVG icons (matches platform style) ───────────────────
const IcoHome    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>;
const IcoPkg     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IcoLive    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M7.76 7.76a6 6 0 0 0 0 8.49"/></svg>;
const IcoUser    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoPromo   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>;
const IcoHeart   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const IcoReturn  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.91"/></svg>;
const IcoShare   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcoShirt   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>;
const IcoNego    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IcoWallet  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IcoBike    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-1"/><path d="M8 17.5 L11 6 L15 6 L18.5 17.5"/><path d="M8 17.5 L5.5 11 L9 11"/><path d="M12 17.5 H15"/></svg>;
const IcoMail    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoPhone   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.93-.93a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const IcoSend    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IcoShop    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IcoStar    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IcoMenu    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoClose   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoChevron = ({ open }: { open: boolean }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}><polyline points="6 9 12 15 18 9"/></svg>;
const IcoLeft    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const IcoPlus    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoTrash   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IcoEdit    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>;
const IcoAlert   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoDeposit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
import { getOrders, Order, STATUS_LABELS, STATUS_COLORS, OrderStatus } from '@/lib/orders';
import { getProfile, saveProfile, Profile } from '@/lib/profile';
import { AVAILABLE_CODES, getUsedPromos, validatePromo, markPromoUsed } from '@/lib/promos';
import { getWishlist, removeFromWishlist, WishlistItem } from '@/lib/wishlist';
import { getReturns, saveReturn, RETURN_REASONS, RETURN_STATUS_LABELS, RETURN_STATUS_COLORS } from '@/lib/returns';

// ─── Constants ───────────────────────────────────────────────────────────────

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

const STEP_INDEX: Record<OrderStatus, number> = { en_attente: 0, confirme: 1, expedie: 2, livre: 3, annule: -1 };

const DeliveryStageIcon = ({ index, done }: { index: number; done: boolean }) => {
  const icons = [
    <svg key={0} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
    <svg key={1} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    <svg key={2} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    <svg key={3} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6H11l-2 8h12l-2-8h-4z"/><path d="M3 9h4"/></svg>,
    <svg key={4} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  ];
  return <span style={{ color: done ? 'white' : 'rgba(255,255,255,0.3)' }}>{icons[index]}</span>;
};

const DELIVERY_STAGES = [
  { label: 'Commande reçue' },
  { label: 'En préparation' },
  { label: 'Colis prêt' },
  { label: 'Livreur en route' },
  { label: 'Livré' },
];

type Section = 'dashboard' | 'commandes' | 'suivi' | 'profil' | 'adresses' | 'promos' | 'favoris' | 'retours' | 'parrainage' | 'garderobe' | 'negociations' | 'wallet';

// ─── Referral Section ────────────────────────────────────────────────────────
function ReferralSection() {
  const [code] = useState(() => 'PIETRI-' + (typeof window !== 'undefined' ? (sessionStorage.getItem('_pietri_sid') || crypto.randomUUID()).slice(0,6).toUpperCase() : 'XXXXXX'));
  const link = `https://pietri.io/?ref=${code}`;
  const CardInner = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', ...style }}>{children}</div>
  );
  return (
    <div>
      <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>Programme de parrainage</h2>
      <CardInner style={{ marginBottom: '1rem', borderColor: 'rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.03)' }}>
        <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#34d399', marginBottom: '1rem' }}>Comment ça marche</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[['1','Partage ton lien','Envoie ton lien unique à tes amis'],['2','Ils commandent','Ils passent leur 1ère commande PIETRI'],['3','Tu gagnes','10% de réduction sur ta prochaine commande']].map(([step,label,desc])=>(
            <div key={step} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.6rem', fontFamily: "'Anton',sans-serif", fontSize: '0.9rem', color: '#34d399' }}>{step}</div>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.3rem' }}>{label}</p>
              <p style={{ fontSize: '0.6rem', opacity: 0.45, lineHeight: 1.5 }}>{desc}</p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.35, marginBottom: '0.6rem' }}>Ton code</p>
        <div style={{ marginBottom: '0.75rem' }}>
          <CopyCode code={code} label="Copier" accentColor="#34d399" />
        </div>
        <p style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.35, marginBottom: '0.6rem' }}>Ton lien</p>
        <div style={{ marginBottom: '1rem' }}>
          <CopyCode code={link} label="Copier" accentColor="#34d399" />
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a href={`https://wa.me/?text=${encodeURIComponent('Découvre PIETRI — Streetwear africain premium 🔥 ' + link)}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'rgba(37,211,102,0.12)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 8, color: '#25d366', textDecoration: 'none', fontSize: '0.65rem', fontWeight: 700 }}>
            <IcoSend /> WhatsApp
          </a>
          <a href={`https://www.instagram.com/`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: 'rgba(225,48,108,0.12)', border: '1px solid rgba(225,48,108,0.25)', borderRadius: 8, color: '#e1306c', textDecoration: 'none', fontSize: '0.65rem', fontWeight: 700 }}>
            <IcoSend /> Instagram
          </a>
        </div>
      </CardInner>
      <CardInner>
        <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.35, marginBottom: '1rem' }}>Tes filleuls</p>
        <p style={{ fontSize: '0.78rem', opacity: 0.3, textAlign: 'center', padding: '2rem 0' }}>Aucun filleul pour l'instant — partage ton lien pour commencer !</p>
      </CardInner>
    </div>
  );
}

// ─── Garde-Robe Virtuelle ────────────────────────────────────────────────────
function GardeRobeSection() {
  const [wardrobe, setWardrobe] = useState<import('@/lib/wishlist').WishlistItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [showOutfit, setShowOutfit] = useState(false);

  useEffect(() => {
    setWardrobe(typeof window !== 'undefined' ? ((): import('@/lib/wishlist').WishlistItem[] => {
      try { return JSON.parse(localStorage.getItem('pietri_wishlist') || '[]'); } catch { return []; }
    })() : []);
  }, []);

  const toggle = (slug: string) =>
    setSelected(s => s.includes(slug) ? s.filter(x => x !== slug) : [...s, slug]);

  const suggestions = [
    { label: 'Style urbain', items: ['hoodie', 'jogger', 'sneakers'], color: '#3b82f6' },
    { label: 'Tenue de soirée', items: ['chemise', 'pantalon', 'veste'], color: '#8b5cf6' },
    { label: 'Look casual', items: ['t-shirt', 'jean', 'baskets'], color: '#10b981' },
  ];

  const InnerCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', ...style }}>{children}</div>
  );

  return (
    <div>
      <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '0.5rem' }}>
        Garde-Robe Virtuelle
      </h2>
      <p style={{ fontSize: '0.72rem', opacity: 0.4, marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Tes pièces sauvegardées en un seul endroit. Sélectionne des articles pour créer des tenues.
      </p>

      {/* Wardrobe grid */}
      <InnerCard style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <span style={{ color: '#a78bfa' }}><IcoShirt /></span>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a78bfa' }}>Mes pièces ({wardrobe.length})</p>
        </div>

        {wardrobe.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <span style={{ opacity: 0.15, display: 'flex', justifyContent: 'center', marginBottom: '1rem', transform: 'scale(2)' }}><IcoShirt /></span>
            <p style={{ fontSize: '0.8rem', opacity: 0.35, marginBottom: '0.75rem' }}>Ta garde-robe est vide</p>
            <p style={{ fontSize: '0.68rem', opacity: 0.25, lineHeight: 1.6 }}>Ajoute des articles à tes favoris depuis la boutique pour les voir apparaître ici.</p>
            <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.25rem', padding: '0.6rem 1.25rem', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '8px', color: '#a78bfa', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 700 }}>
              <IcoShop /> Explorer la boutique
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
            {wardrobe.map(item => {
              const active = selected.includes(item.slug);
              return (
                <button key={item.slug} onClick={() => toggle(item.slug)}
                  style={{ background: active ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${active ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'all 150ms', position: 'relative' }}>
                  {active && (
                    <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                      <CheckCircle size={11} color="white" />
                    </div>
                  )}
                  <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                    {item.src && <img src={item.src} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <p style={{ fontSize: '0.58rem', fontWeight: 600, lineHeight: 1.3, textAlign: 'left', color: 'white', marginBottom: '0.2rem' }}>{item.label}</p>
                    <p style={{ fontSize: '0.56rem', color: '#a78bfa', fontWeight: 700 }}>{item.priceStr}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </InnerCard>

      {/* Outfit builder */}
      {selected.length >= 2 && (
        <InnerCard style={{ marginBottom: '1.25rem', borderColor: 'rgba(167,139,250,0.2)', background: 'rgba(167,139,250,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ color: '#a78bfa' }}>✦</span>
              <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#a78bfa' }}>Tenue créée ({selected.length} pièces)</p>
            </div>
            <button onClick={() => setShowOutfit(s => !s)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: showOutfit ? 'rgba(167,139,250,0.25)' : 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: '8px', color: '#a78bfa', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
              {showOutfit ? <X size={12} /> : <span style={{ fontSize: '0.7rem' }}>↗</span>}
              {showOutfit ? 'Fermer' : 'Voir la tenue'}
            </button>
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: showOutfit ? '1.25rem' : 0 }}>
            {wardrobe.filter(w => selected.includes(w.slug)).map(item => (
              <div key={item.slug} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.7rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '999px' }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 600 }}>{item.label}</p>
                <button onClick={() => toggle(item.slug)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>

          {/* Outfit collage */}
          {showOutfit && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(selected.length, 3)}, 1fr)`, gap: '0.75rem', marginBottom: '1rem' }}>
                {wardrobe.filter(w => selected.includes(w.slug)).map(item => (
                  <div key={item.slug} style={{ borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>
                    <div style={{ aspectRatio: '3/4', overflow: 'hidden' }}>
                      {item.src
                        ? <img src={item.src} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ opacity: 0.2, transform: 'scale(2)', display: 'flex' }}><IcoShirt /></span></div>
                      }
                    </div>
                    <div style={{ padding: '0.6rem 0.75rem' }}>
                      <p style={{ fontSize: '0.62rem', fontWeight: 700, marginBottom: '0.2rem' }}>{item.label}</p>
                      <p style={{ fontSize: '0.58rem', color: '#a78bfa', fontWeight: 700 }}>{item.priceStr}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <a href={`/produits/${wardrobe.find(w => selected.includes(w.slug))?.slug}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', borderRadius: '8px', color: '#a78bfa', textDecoration: 'none', fontSize: '0.65rem', fontWeight: 700 }}>
                  <IcoShop /> Commander la tenue
                </a>
                <button onClick={() => { setSelected([]); setShowOutfit(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </InnerCard>
      )}

      {/* Style suggestions */}
      <InnerCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <span style={{ opacity: 0.5 }}>✦</span>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0.4 }}>Suggestions de style</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {suggestions.map(sug => (
            <div key={sug.label} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${sug.color}18`, border: `1px solid ${sug.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: sug.color }}><IcoShirt /></span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>{sug.label}</p>
                <p style={{ fontSize: '0.6rem', opacity: 0.4, lineHeight: 1.4 }}>{sug.items.join(' · ')}</p>
              </div>
              <a href="/" style={{ fontSize: '0.6rem', fontWeight: 700, color: sug.color, textDecoration: 'none', opacity: 0.8, whiteSpace: 'nowrap' }}>Explorer →</a>
            </div>
          ))}
        </div>
      </InnerCard>
    </div>
  );
}

// ─── Card wrapper ────────────────────────────────────────────────────────────
const Card = ({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) => (
  <div onClick={onClick} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', ...style }}>
    {children}
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>{children}</h2>
);

const chip = (color: string, label: string) => (
  <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color, padding: '0.25rem 0.65rem', borderRadius: '999px', background: `${color}18`, border: `1px solid ${color}44` }}>{label}</span>
);

// ─── Delivery Tracker ────────────────────────────────────────────────────────
function DeliveryTracker({ order }: { order: Order }) {
  const [deliveryStep, setDeliveryStep] = useState(2);
  const [eta, setEta] = useState(18);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Simulate live delivery progression
    timerRef.current = setInterval(() => {
      setDeliveryStep(s => {
        if (s >= 4) { if (timerRef.current) clearInterval(timerRef.current); return 4; }
        return s;
      });
      setEta(e => Math.max(0, e - 1));
      setProgress(p => Math.min(100, p + 2.2));
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const color = '#f59e0b';
  const isAbidjan = order.delivery === 'abidjan';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Driver card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🛵</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Kouamé Brice</p>
            <p style={{ fontSize: '0.68rem', opacity: 0.5 }}>Livreur PIETRI · Note ★ 4.9</p>
          </div>
          <a href="tel:+2250700000000" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '999px', color: '#10b981', textDecoration: 'none', fontSize: '0.7rem', fontWeight: 700 }}>
            <IcoPhone /> Appeler
          </a>
        </div>

        {/* ETA */}
        {deliveryStep < 4 && (
          <div style={{ marginTop: '1rem', padding: '0.9rem 1rem', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '0.75rem', color }}>Arrivée estimée</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color, fontFamily: "'Anton', sans-serif" }}>{eta} min</p>
          </div>
        )}
        {deliveryStep >= 4 && (
          <div style={{ marginTop: '1rem', padding: '0.9rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700 }}>✓ Livré avec succès !</p>
          </div>
        )}
      </Card>

      {/* Route visualization */}
      <Card style={{ padding: '1.25rem', overflow: 'hidden', position: 'relative' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '1rem' }}>Itinéraire en direct</p>
        <div style={{ position: 'relative', height: '120px' }}>
          <svg viewBox="0 0 400 80" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Route path */}
            <path d="M 30 60 C 100 60, 120 20, 200 20 C 280 20, 300 50, 370 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" strokeLinecap="round" />
            <path d="M 30 60 C 100 60, 120 20, 200 20 C 280 20, 300 50, 370 40" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray="400" strokeDashoffset={400 - (progress / 100) * 400} style={{ transition: 'stroke-dashoffset 2s ease' }} />
            {/* Boutique */}
            <circle cx="30" cy="60" r="8" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <text x="30" y="64" textAnchor="middle" fontSize="8" fill="white">🏪</text>
            {/* Destination */}
            <circle cx="370" cy="40" r="8" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1.5" />
            <text x="370" y="44" textAnchor="middle" fontSize="8">📍</text>
            {/* Animated rider */}
            <animateMotion dur="20s" repeatCount="indefinite">
              <mpath xlinkHref="#route" />
            </animateMotion>
            <defs>
              <path id="route" d="M 30 60 C 100 60, 120 20, 200 20 C 280 20, 300 50, 370 40" />
            </defs>
            <g style={{ filter: 'drop-shadow(0 2px 4px rgba(245,158,11,0.5))' }}>
              <circle cx={30 + (progress / 100) * 340} cy={progress < 30 ? 60 : progress < 70 ? 20 + (60 - 20) * Math.sin((progress - 30) / 40 * Math.PI) : 20 + (40 - 20) * ((progress - 70) / 30)} r="6" fill={color} style={{ transition: 'cx 2s ease, cy 2s ease' }} />
              <text x={30 + (progress / 100) * 340} y={progress < 30 ? 64 : progress < 70 ? 24 + (60 - 20) * Math.sin((progress - 30) / 40 * Math.PI) : 24 + (40 - 20) * ((progress - 70) / 30)} textAnchor="middle" fontSize="10" style={{ transition: 'x 2s ease, y 2s ease' }}>🛵</text>
            </g>
          </svg>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.65rem', opacity: 0.4 }}>PIETRI Boutique</p>
          <p style={{ fontSize: '0.65rem', opacity: 0.4 }}>{isAbidjan ? order.address : 'Destination'}</p>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: color, borderRadius: '999px', width: `${progress}%`, transition: 'width 2s ease' }} />
        </div>
      </Card>

      {/* Delivery stages */}
      <Card>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '1.25rem' }}>Étapes de livraison</p>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: '13px', top: '14px', bottom: '14px', width: '2px', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {DELIVERY_STAGES.map((stage, i) => {
              const done = i <= deliveryStep;
              const active = i === deliveryStep;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? (active ? color : '#10b981') : 'rgba(255,255,255,0.06)', border: active ? `2px solid ${color}` : done ? '2px solid #10b981' : '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: active ? `0 0 12px ${color}66` : 'none', transition: 'all 500ms', zIndex: 1 }}>
                    <DeliveryStageIcon index={i} done={done} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: done ? 700 : 400, opacity: done ? 1 : 0.35, transition: 'all 400ms' }}>{stage.label}</p>
                    {active && <p style={{ fontSize: '0.65rem', color, marginTop: '0.1rem' }}>En cours…</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Order Card ──────────────────────────────────────────────────────────────
function OrderCard({ order, onTrack }: { order: Order; onTrack: () => void }) {
  const [open, setOpen] = useState(false);
  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const color = STATUS_COLORS[order.status];
  const isActive = order.status === 'expedie';

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '14px', overflow: 'hidden', transition: 'border 200ms' }}>
      <button onClick={() => setOpen(v => !v)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', color: 'white', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <span style={{ opacity: 0.5, flexShrink: 0, display: 'flex' }}><IcoPkg /></span>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Commande du {date}</p>
            <p style={{ fontSize: '0.65rem', opacity: 0.4 }}>Réf. {order.id.slice(0, 8).toUpperCase()} · {order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {chip(color, STATUS_LABELS[order.status])}
          {isActive && (
            <button onClick={e => { e.stopPropagation(); onTrack(); }} style={{ padding: '0.35rem 0.8rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)', borderRadius: '999px', color: '#f59e0b', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <IcoBike /> Suivre
            </button>
          )}
          <svg style={{ width: '14px', height: '14px', opacity: 0.4, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 250ms', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Progress */}
          {order.status !== 'annule' && (
            <div style={{ paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: 0 }}>
              {[{ label: 'Reçue' }, { label: 'Confirmée' }, { label: 'Expédiée' }, { label: 'Livrée' }].map((s, i) => {
                const current = STEP_INDEX[order.status];
                const done = i <= current;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 3 ? 1 : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: done ? color : 'rgba(255,255,255,0.08)', border: done ? 'none' : '1.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {done && <CheckCircle size={12} color="white" />}
                      </div>
                      <span style={{ fontSize: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: done ? 0.8 : 0.25, whiteSpace: 'nowrap' }}>{s.label}</span>
                    </div>
                    {i < 3 && <div style={{ flex: 1, height: '2px', background: i < current ? color : 'rgba(255,255,255,0.08)', margin: '0 4px', marginBottom: '16px', transition: 'background 400ms' }} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Items */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {order.items.map(item => (
              <div key={`${item.slug}-${item.taille}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ width: '40px', height: '40px', flexShrink: 0, background: 'rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.label} style={{ height: '90%', width: 'auto', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase' }}>{item.label}</p>
                  <p style={{ fontSize: '0.62rem', opacity: 0.4 }}>Taille {item.taille} · ×{item.qty}</p>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{item.priceStr}</span>
              </div>
            ))}
          </div>

          {/* Delivery info */}
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ padding: '0.7rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.4, marginBottom: '0.25rem' }}>Livraison</p>
              <p style={{ fontSize: '0.72rem' }}>{order.delivery === 'abidjan' ? 'Abidjan, CI' : 'International'}</p>
            </div>
            <div style={{ padding: '0.7rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.4, marginBottom: '0.25rem' }}>Total</p>
              <p style={{ fontSize: '0.72rem', fontWeight: 700 }}>€{order.total.toFixed(0)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Négociations Section ────────────────────────────────────────────────────
function NegociationsSection({ email }: { email?: string }) {
  const [negos, setNegos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputEmail, setInputEmail] = useState(email || '');
  const [searched, setSearched] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState<string | null>(null);
  const { format } = useCurrency();

  const STATUS_CLR: Record<string, string> = { pending: '#facc15', accepted: '#34d399', rejected: '#f87171', countered: '#60a5fa', completed: '#34d399', expired: 'rgba(255,255,255,.3)' };
  const STATUS_ICON: Record<string, string> = { pending: '⏳', accepted: '✅', rejected: '❌', countered: '💬', completed: '✅', expired: '⌛', cancelled: '🚫' };
  const STATUS_LBL: Record<string, string> = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée', countered: 'Contre-offre', completed: 'Complétée', expired: 'Expirée', cancelled: 'Annulée' };

  const load = async (mail: string) => {
    if (!mail.includes('@')) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/negotiations?email=${encodeURIComponent(mail)}`);
      const d = await r.json();
      setNegos(d.negotiations || []);
      setSearched(true);
    } catch {}
    setLoading(false);
  };

  const acceptCounter = async (n: any) => {
    if (!n.id) return;
    setAcceptLoading(n.id);
    try {
      const r = await fetch('/api/negotiations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept_counter', negotiation_id: n.id, user_email: (email || inputEmail).trim() }),
      });
      const d = await r.json();
      if (d.success) {
        setNegos(prev => prev.map(x => x.id === n.id ? { ...x, status: 'accepted', final_price: n.counter_price } : x));
      }
    } catch {}
    setAcceptLoading(null);
  };

  useEffect(() => { if (email && email.includes('@')) load(email); }, [email]);

  const fmt = (cents: number) => format(cents / 100);

  const Box = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem', ...style }}>{children}</div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        {/* Custom handshake icon */}
        <div style={{ width: 36, height: 36, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.5"/>
            <path d="M9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v0z"/>
            <path d="M8 11h8M8 15h5"/>
          </svg>
        </div>
        <div>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>Mes négociations</h2>
        </div>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Tes offres sur les produits PIETRI — négocie comme au marché. Les prix s'affichent dans ta devise sélectionnée.</p>

      {!email && (
        <Box style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.6rem' }}>Rechercher par email</p>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <input value={inputEmail} onChange={e => setInputEmail(e.target.value)} placeholder="ton@email.com" type="email"
              style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: '0.8rem', outline: 'none' }} />
            <button onClick={() => load(inputEmail)} disabled={loading}
              style={{ padding: '0 1.25rem', background: 'white', color: '#0a0a0a', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {loading ? '…' : 'Voir'}
            </button>
          </div>
        </Box>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1.5rem 0', color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
          Chargement…
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {searched && !loading && negos.length === 0 && (
        <Box style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2.5"/><path d="M9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v0z"/><path d="M8 11h8M8 15h5"/></svg>
          </div>
          <p style={{ opacity: 0.4, fontSize: '0.85rem', marginBottom: '1.25rem' }}>Aucune négociation pour l'instant.</p>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.75rem 1.5rem', background: 'white', color: '#0a0a0a', borderRadius: 999, fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Voir les produits →
          </a>
        </Box>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {negos.map(n => {
          const clr = STATUS_CLR[n.status] || '#888';
          return (
            <Box key={n.id} style={{ border: `1px solid ${clr}22`, transition: 'border 200ms' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{n.product_name}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.22rem 0.7rem', borderRadius: 999, background: clr + '18', border: `1px solid ${clr}40` }}>
                    <span style={{ fontSize: '0.7rem' }}>{STATUS_ICON[n.status] || '•'}</span>
                    <span style={{ fontSize: '0.58rem', fontWeight: 700, color: clr, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{STATUS_LBL[n.status] || n.status}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '0.52rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.25rem' }}>Prix catalogue</p>
                  <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.2rem', color: 'white' }}>{fmt(n.original_price || 0)}</p>
                </div>
              </div>

              {/* Price grid */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n.counter_price ? (n.final_price ? 3 : 2) : 1}, 1fr)`, gap: '0.6rem', marginBottom: '0.75rem' }}>
                <div style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                  <p style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(250,204,21,0.6)', marginBottom: '0.25rem' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Ton offre
                  </p>
                  <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.35rem', color: '#facc15', marginBottom: '0.15rem' }}>{fmt(n.offered_price || 0)}</p>
                  <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)' }}>{(((n.offered_price || 0) / (n.original_price || 1)) * 100).toFixed(0)}% du prix</p>
                </div>
                {n.counter_price && (
                  <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <p style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(96,165,250,0.6)', marginBottom: '0.25rem' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Contre-offre
                    </p>
                    <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.35rem', color: '#60a5fa', marginBottom: '0.15rem' }}>{fmt(n.counter_price || 0)}</p>
                    <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)' }}>Round {n.attempts}/{n.max_attempts}</p>
                  </div>
                )}
                {n.final_price && (
                  <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                    <p style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(52,211,153,0.6)', marginBottom: '0.25rem' }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4, verticalAlign: 'middle' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
                      Prix final
                    </p>
                    <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.35rem', color: '#34d399', marginBottom: '0.15rem' }}>{fmt(n.final_price || 0)}</p>
                    <p style={{ fontSize: '0.55rem', color: 'rgba(52,211,153,0.4)' }}>Économie : {fmt((n.original_price || 0) - (n.final_price || 0))}</p>
                  </div>
                )}
              </div>

              {/* Counter-offer actions */}
              {n.status === 'countered' && n.counter_price && (
                <div style={{ padding: '1rem', background: 'rgba(96,165,250,0.05)', borderRadius: 12, border: '1px solid rgba(96,165,250,0.15)' }}>
                  <p style={{ fontSize: '0.68rem', color: '#60a5fa', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Contre-offre reçue · {n.attempts < n.max_attempts ? `${n.max_attempts - n.attempts} round${n.max_attempts - n.attempts > 1 ? 's' : ''} restant` : 'dernière offre'}
                  </p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                    PIETRI te propose <strong style={{ color: 'white' }}>{fmt(n.counter_price)}</strong>.{n.attempts < n.max_attempts ? ' Tu peux accepter directement ou re-négocier.' : ' C\'est notre meilleure offre.'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => acceptCounter(n)}
                      disabled={acceptLoading === n.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#34d399', color: '#0a0a0a', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: '0.68rem', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 150ms' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                      {acceptLoading === n.id ? '…' : `Accepter ${fmt(n.counter_price)}`}
                    </button>
                    {n.attempts < n.max_attempts && (
                      <a href={`/produits/${n.product_slug}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.1rem', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 8, fontWeight: 700, fontSize: '0.68rem', color: '#60a5fa', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Re-négocier →
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Accepted CTA */}
              {n.status === 'accepted' && (
                <div style={{ padding: '1rem', background: 'rgba(52,211,153,0.05)', borderRadius: 12, border: '1px solid rgba(52,211,153,0.2)' }}>
                  <p style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Offre acceptée — finalise ta commande !
                  </p>
                  <a href={`/produits/${n.product_slug}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#34d399', color: '#0a0a0a', borderRadius: 8, fontWeight: 800, fontSize: '0.68rem', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Commander au prix négocié →
                  </a>
                </div>
              )}

              <p style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.18)', marginTop: '0.85rem' }}>
                {new Date(n.created_at).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
                {n.expires_at && n.status === 'pending' ? ` · expire le ${new Date(n.expires_at).toLocaleDateString('fr-FR')}` : ''}
              </p>
            </Box>
          );
        })}
      </div>
    </div>
  );
}

// ─── Wallet Section ──────────────────────────────────────────────────────────
function WalletSection({ email, onBalanceChange }: { email?: string; onBalanceChange?: (c: number) => void }) {
  const { format: fmtC, currency } = useCurrency();
  const [balance, setBalance] = useState(0); // cents
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'momo' | 'card'>('momo');
  const [phone, setPhone] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = async (mail: string) => {
    if (!mail?.includes('@')) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/wallet?email=${encodeURIComponent(mail)}`);
      const d = await r.json();
      setBalance(d.balance_cents ?? 0);
      setTxs(d.transactions ?? []);
      onBalanceChange?.(d.balance_cents ?? 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (email) load(email); }, [email]);

  const handleDeposit = async () => {
    if (!email?.includes('@') || !amount || parseFloat(amount) <= 0) return;
    // Convert amount back to EUR
    const RATES: Record<string, number> = { EUR: 1, XOF: 655.957, GBP: 0.84, USD: 1.07 };
    const amountEur = parseFloat(amount) / (RATES[currency] ?? 1);
    if (amountEur < 3) {
      setMsg({ ok: false, text: `Minimum : ${fmtC(3)} (~1 968 FCFA / £2.50 / $3.20)` });
      return;
    }
    setDepositing(true); setMsg(null);
    try {
      const r = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deposit', email, amount_euros: amountEur, method, phone }),
      });
      const d = await r.json();
      if (d.success) {
        setMsg({ ok: true, text: d.message });
        setBalance(d.balance_cents);
        onBalanceChange?.(d.balance_cents);
        await load(email!);
        setAmount(''); setPhone('');
      } else {
        setMsg({ ok: false, text: d.error || 'Erreur lors du dépôt' });
      }
    } catch (e) { setMsg({ ok: false, text: String(e) }); }
    setDepositing(false);
  };

  const fmt = (cents: number) => fmtC(cents / 100);
  const RATES: Record<string, number> = { EUR: 1, XOF: 655.957, GBP: 0.84, USD: 1.07 };
  const minDepositDisplay = fmtC(3);
  const currSymbol = currency === 'XOF' ? 'FCFA' : currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';

  const Box = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', ...style }}>{children}</div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IcoWallet />
        </div>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.6rem', textTransform: 'uppercase', letterSpacing: '-0.01em', margin: 0 }}>Mon portefeuille</h2>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
        Dépose des fonds pour accéder aux négociations. Minimum {minDepositDisplay}. Ton solde est déduit uniquement si une offre est acceptée.
      </p>

      {/* Balance hero */}
      <Box style={{ marginBottom: '1rem', background: balance > 0 ? 'rgba(52,211,153,0.04)' : 'rgba(255,255,255,0.03)', borderColor: balance > 0 ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)' }}>
        <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: balance > 0 ? 'rgba(52,211,153,0.6)' : 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>Solde disponible</p>
        {loading ? (
          <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '2.5rem', color: 'rgba(255,255,255,0.2)' }}>…</p>
        ) : (
          <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '2.5rem', color: balance > 0 ? '#34d399' : 'white', marginBottom: '0.25rem', lineHeight: 1 }}>{fmt(balance)}</p>
        )}
        {balance > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', padding: '0.3rem 0.7rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 999 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Négociations débloquées</span>
          </div>
        )}
        {balance === 0 && (
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem' }}>Aucun fonds — dépose pour commencer à négocier.</p>
        )}
      </Box>

      {/* Deposit form */}
      <Box style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <IcoDeposit /> Déposer des fonds
        </p>

        {/* Amount */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '0.4rem' }}>
            Montant ({currSymbol})
          </label>
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.5rem' }}>
            {[3, 5, 10, 20].map(eur => (
              <button key={eur} onClick={() => setAmount(String(Math.round(eur * (RATES[currency] ?? 1))))}
                style={{ flex: 1, padding: '0.6rem 0.4rem', background: parseFloat(amount) === Math.round(eur * (RATES[currency] ?? 1)) ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${parseFloat(amount) === Math.round(eur * (RATES[currency] ?? 1)) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, color: 'white', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>
                {fmtC(eur)}
              </button>
            ))}
          </div>
          <input
            value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1"
            placeholder={String(Math.round(3 * (RATES[currency] ?? 1)))}
            style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: '0.95rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'Inter', sans-serif" }}
          />
          <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.35rem' }}>Minimum : {minDepositDisplay}</p>
        </div>

        {/* Payment method */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '0.4rem' }}>Mode de paiement</label>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {[
              { id: 'momo', label: 'Mobile Money', emoji: '📱' },
              { id: 'card', label: 'Carte bancaire', emoji: '💳' },
            ].map(m => (
              <button key={m.id} onClick={() => setMethod(m.id as 'momo' | 'card')}
                style={{ flex: 1, padding: '0.85rem 0.75rem', background: method === m.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${method === m.id ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, color: 'white', cursor: 'pointer', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{m.emoji}</p>
                <p style={{ fontSize: '0.65rem', fontWeight: method === m.id ? 700 : 400 }}>{m.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Phone for MoMo */}
        {method === 'momo' && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '0.4rem' }}>Numéro Mobile Money</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+225 XX XX XX XX XX"
              style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: "'Inter', sans-serif" }} />
          </div>
        )}

        {msg && (
          <div style={{ padding: '0.85rem 1rem', background: msg.ok ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${msg.ok ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`, borderRadius: 10, fontSize: '0.78rem', color: msg.ok ? '#34d399' : '#f87171', marginBottom: '1rem', fontWeight: 600 }}>
            {msg.text}
          </div>
        )}

        <button onClick={handleDeposit} disabled={depositing || !amount || parseFloat(amount) <= 0}
          style={{ width: '100%', padding: '0.95rem', background: (!depositing && amount && parseFloat(amount) > 0) ? 'white' : 'rgba(255,255,255,0.15)', color: '#0a0a0a', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 200ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <IcoDeposit />
          {depositing ? 'Traitement en cours…' : `Déposer ${amount ? fmtC(parseFloat(amount) / (RATES[currency] ?? 1)) : ''}`}
        </button>
      </Box>

      {/* Transaction history */}
      {txs.length > 0 && (
        <Box>
          <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem' }}>Historique des transactions</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {txs.map((tx, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: i < txs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 32, height: 32, background: tx.type === 'deposit' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${tx.type === 'deposit' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tx.type === 'deposit' ? '#34d399' : '#f87171', flexShrink: 0 }}>
                    {tx.type === 'deposit' ? <IcoDeposit /> : <IcoNego />}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.15rem' }}>
                      {tx.type === 'deposit' ? 'Dépôt' : tx.type === 'refund' ? 'Remboursement' : 'Négociation'}
                    </p>
                    <p style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(tx.created_at).toLocaleDateString('fr-FR', { dateStyle: 'medium' })} · {tx.method}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', color: tx.amount_cents > 0 ? '#34d399' : '#f87171' }}>
                    {tx.amount_cents > 0 ? '+' : ''}{fmt(Math.abs(tx.amount_cents))}
                  </p>
                  <p style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)' }}>Solde : {fmt(tx.balance_after)}</p>
                </div>
              </div>
            ))}
          </div>
        </Box>
      )}

      {txs.length === 0 && !loading && (
        <Box style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>Aucune transaction pour l'instant.</p>
        </Box>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function EspaceClientPage() {
  const [section, setSection] = useState<Section>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfileState] = useState<Profile>({ prenom: '', nom: '', email: '', phone: '', whatsapp: '', notifSMS: true, notifEmail: true });
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [returnForm, setReturnForm] = useState({ orderId: '', reason: '', description: '' });
  const [returnMsg, setReturnMsg] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0); // in cents
  const { format: fmtCurrency } = useCurrency();

  useEffect(() => {
    setOrders(getOrders());
    const p = getProfile();
    setProfileState(p);
    setWishlist(getWishlist());
    // Load wallet balance
    if (p.email && p.email.includes('@')) {
      fetch(`/api/wallet?email=${encodeURIComponent(p.email)}`)
        .then(r => r.json())
        .then(d => setWalletBalance(d.balance_cents ?? 0))
        .catch(() => null);
    }
    const handler = () => setWishlist(getWishlist());
    window.addEventListener('pietri_wishlist_updated', handler);
    return () => window.removeEventListener('pietri_wishlist_updated', handler);
  }, []);

  const activeOrder = orders.find(o => o.status === 'expedie');
  const usedPromos = getUsedPromos();

  const NAV: { id: Section; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard',    label: 'Vue d\'ensemble',   icon: <IcoHome /> },
    { id: 'wallet',       label: 'Mon portefeuille',  icon: <IcoWallet /> },
    { id: 'commandes',    label: 'Mes commandes',     icon: <IcoPkg />,   badge: orders.length },
    { id: 'suivi',        label: 'Suivi en direct',   icon: <IcoLive />,  badge: activeOrder ? 1 : 0 },
    { id: 'negociations', label: 'Mes négociations',  icon: <IcoNego /> },
    { id: 'profil',       label: 'Mon profil',        icon: <IcoUser /> },
    { id: 'promos',       label: 'Codes promo',       icon: <IcoPromo /> },
    { id: 'favoris',      label: 'Mes favoris',       icon: <IcoHeart />, badge: wishlist.length },
    { id: 'retours',      label: 'Retours & SAV',     icon: <IcoReturn /> },
    { id: 'parrainage',   label: 'Parrainage',        icon: <IcoShare /> },
    { id: 'garderobe',    label: 'Garde-Robe',        icon: <IcoShirt /> },
  ];

  const handleSaveProfile = () => {
    saveProfile(profile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handlePromo = () => {
    const total = orders.reduce((s, o) => s + o.total, 0);
    const result = validatePromo(promoInput, total);
    if (result.valid && result.promo) {
      setPromoMsg({ ok: true, text: `✓ ${result.promo.label} — appliqué à votre prochaine commande.` });
      markPromoUsed(promoInput, 'next');
    } else {
      setPromoMsg({ ok: false, text: result.error || 'Code invalide.' });
    }
  };

  const handleReturn = () => {
    if (!returnForm.orderId || !returnForm.reason) return;
    const order = orders.find(o => o.id === returnForm.orderId);
    if (!order) return;
    saveReturn({ orderId: order.id, orderRef: order.id.slice(0, 8).toUpperCase(), items: order.items.map(i => i.label).join(', '), reason: returnForm.reason, description: returnForm.description });
    setReturnMsg('Demande envoyée. Nous vous répondrons sous 48h.');
    setReturnForm({ orderId: '', reason: '', description: '' });
  };

  const inp: React.CSSProperties = { width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '0.8rem', fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box' };

  // ── render sections ────────────────────────────────────────────────────────
  const renderDashboard = () => (
    <div>
      <SectionTitle>Vue d'ensemble</SectionTitle>

      {/* Wallet balance hero card */}
      <div
        onClick={() => setSection('wallet')}
        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.5rem', marginBottom: '1rem', cursor: 'pointer', transition: 'border-color 200ms', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <IcoWallet />
          </div>
          <div>
            <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.35)', marginBottom: '0.3rem' }}>Mon portefeuille</p>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.6rem', color: walletBalance > 0 ? '#34d399' : 'white', lineHeight: 1 }}>
              {fmtCurrency(walletBalance / 100)}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {walletBalance === 0 && (
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 999, padding: '0.25rem 0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Déposer →
            </span>
          )}
          {walletBalance > 0 && (
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 999, padding: '0.25rem 0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Négociation activée ✓
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Commandes', value: orders.length,        icon: <IcoPkg />,    color: '#3b82f6', id: 'commandes' as Section },
          { label: 'Favoris',   value: wishlist.length,      icon: <IcoHeart />,  color: '#ec4899', id: 'favoris' as Section },
          { label: 'Retours',   value: getReturns().length,  icon: <IcoReturn />, color: '#f59e0b', id: 'retours' as Section },
        ].map(s => (
          <Card key={s.label} style={{ cursor: 'pointer' }} onClick={() => setSection(s.id)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: s.color }}>{s.icon}</span>
              <span style={{ fontSize: '1.6rem', fontFamily: "'Anton', sans-serif", color: s.color }}>{s.value}</span>
            </div>
            <p style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.45 }}>{s.label}</p>
          </Card>
        ))}
      </div>

      {activeOrder && (
        <Card style={{ marginBottom: '1.5rem', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b', animation: 'ping 1.5s infinite' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f59e0b' }}>Livraison en cours</span>
            </div>
            <button onClick={() => setSection('suivi')} style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Suivre →</button>
          </div>
          <p style={{ fontSize: '0.78rem', opacity: 0.7 }}>Réf. {activeOrder.id.slice(0, 8).toUpperCase()} · {activeOrder.items.length} article{activeOrder.items.length > 1 ? 's' : ''}</p>
        </Card>
      )}

      {orders.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.45 }}>Dernière commande</p>
            <button onClick={() => setSection('commandes')} style={{ fontSize: '0.68rem', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>Tout voir →</button>
          </div>
          <OrderCard order={orders[0]} onTrack={() => { setTrackingOrder(orders[0]); setSection('suivi'); }} />
        </div>
      )}

      <Card>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '1rem' }}>Codes promo disponibles</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {AVAILABLE_CODES.slice(0, 3).map(p => (
            <span key={p.code} style={{ padding: '0.3rem 0.75rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, color: '#818cf8', letterSpacing: '0.08em' }}>{p.code}</span>
          ))}
          <button onClick={() => setSection('promos')} style={{ padding: '0.3rem 0.75rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Voir tout →</button>
        </div>
      </Card>
    </div>
  );

  const renderCommandes = () => (
    <div>
      <SectionTitle>Mes commandes</SectionTitle>
      {orders.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ opacity: 0.15, transform: 'scale(2.5)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}><IcoPkg /></span>
          <p style={{ opacity: 0.4, marginBottom: '1.5rem', fontSize: '0.85rem' }}>Aucune commande pour l'instant</p>
          <a href="/#drops" style={{ padding: '0.75rem 2rem', background: 'white', color: '#0a0a0a', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Découvrir les drops</a>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(o => <OrderCard key={o.id} order={o} onTrack={() => { setTrackingOrder(o); setSection('suivi'); }} />)}
        </div>
      )}
    </div>
  );

  const renderSuivi = () => {
    const target = trackingOrder || activeOrder || orders.find(o => o.status === 'expedie' || o.status === 'confirme');
    return (
      <div>
        <SectionTitle>Suivi en direct</SectionTitle>
        {!target ? (
          <Card style={{ textAlign: 'center', padding: '3rem' }}>
            <span style={{ opacity: 0.15, transform: 'scale(2.5)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}><IcoBike /></span>
            <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>Aucune livraison en cours actuellement.</p>
          </Card>
        ) : (
          <DeliveryTracker order={target} />
        )}
      </div>
    );
  };

  const renderProfil = () => (
    <div>
      <SectionTitle>Mon profil</SectionTitle>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {([['Prénom', 'prenom', 'Jean'], ['Nom', 'nom', 'Koné'], ['Email', 'email', 'votre@email.com'], ['Téléphone', 'phone', '+225 05 00 00 00 00'], ['WhatsApp', 'whatsapp', '+225 05 00 00 00 00']] as [string, keyof Profile, string][]).map(([label, key, ph]) => (
            <div key={key} style={key === 'email' || key === 'whatsapp' ? { gridColumn: '1 / -1' } : {}}>
              <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>{label}</label>
              <input type="text" placeholder={ph} value={profile[key] as string} onChange={e => setProfileState(p => ({ ...p, [key]: e.target.value }))} style={inp} />
            </div>
          ))}
        </div>

        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.4, marginBottom: '0.75rem' }}>Notifications</p>
          {([['notifSMS', 'SMS de livraison'], ['notifEmail', 'Emails promotionnels']] as [keyof Profile, string][]).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>{label}</span>
              <div onClick={() => setProfileState(p => ({ ...p, [key]: !p[key] }))} style={{ width: '40px', height: '22px', borderRadius: '999px', background: profile[key] ? '#10b981' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 200ms', cursor: 'pointer', flexShrink: 0 }}>
                <div style={{ position: 'absolute', width: '18px', height: '18px', borderRadius: '50%', background: 'white', top: '2px', left: profile[key] ? '20px' : '2px', transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
              </div>
            </label>
          ))}
        </div>

        <button onClick={handleSaveProfile} style={{ padding: '0.85rem 2rem', background: profileSaved ? '#10b981' : 'white', color: profileSaved ? 'white' : '#0a0a0a', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', transition: 'all 300ms' }}>
          {profileSaved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </Card>
    </div>
  );

  const renderPromos = () => (
    <div>
      <SectionTitle>Codes promo</SectionTitle>

      {/* Input */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '0.75rem' }}>Appliquer un code</p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="text" placeholder="Ex: PIETRI10" value={promoInput} onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoMsg(null); }} style={{ ...inp, flex: 1, letterSpacing: '0.1em', fontWeight: 700 }} />
          <button onClick={handlePromo} style={{ padding: '0.75rem 1.25rem', background: 'white', color: '#0a0a0a', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>Valider</button>
        </div>
        {promoMsg && <p style={{ fontSize: '0.72rem', marginTop: '0.6rem', color: promoMsg.ok ? '#10b981' : '#ff6b6b' }}>{promoMsg.text}</p>}
      </Card>

      {/* Available codes */}
      <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '0.9rem' }}>Codes disponibles</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {AVAILABLE_CODES.map(p => {
          const used = usedPromos.some(u => u.code.toUpperCase() === p.code);
          return (
            <Card key={p.code} style={{ opacity: used ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem' }}>
              <div>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.05em', color: used ? 'rgba(255,255,255,0.4)' : '#818cf8', marginRight: '0.75rem' }}>{p.code}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>{p.label}</span>
              </div>
              {used ? (
                <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700 }}>Utilisé ✓</span>
              ) : (
                <button onClick={() => { setPromoInput(p.code); setPromoMsg(null); }} style={{ padding: '0.3rem 0.75rem', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '6px', color: '#818cf8', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>Utiliser</button>
              )}
            </Card>
          );
        })}
      </div>

      {/* Used history */}
      {usedPromos.length > 0 && (
        <>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '0.75rem' }}>Historique utilisé</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {usedPromos.map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', opacity: 0.5 }}>{u.code}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.35 }}>{new Date(u.usedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderFavoris = () => (
    <div>
      <SectionTitle>Mes favoris</SectionTitle>
      {wishlist.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ opacity: 0.15, transform: 'scale(2.5)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}><IcoHeart /></span>
          <p style={{ opacity: 0.4, marginBottom: '1.5rem', fontSize: '0.85rem' }}>Aucun favori pour l'instant</p>
          <a href="/#drops" style={{ padding: '0.75rem 2rem', background: 'white', color: '#0a0a0a', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Explorer les drops</a>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {wishlist.map(item => (
            <Card key={item.slug} style={{ position: 'relative', overflow: 'hidden' }}>
              <button onClick={() => removeFromWishlist(item.slug)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                <X size={13} />
              </button>
              <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt={item.label} style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
              </div>
              <p style={{ fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>{item.label}</p>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.priceStr}</p>
              <a href={`/produits/${item.slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', background: 'white', color: '#0a0a0a', borderRadius: '8px', fontWeight: 700, fontSize: '0.65rem', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                <IcoShop /> Voir le produit
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderRetours = () => {
    const myReturns = getReturns();
    return (
      <div>
        <SectionTitle>Retours & SAV</SectionTitle>

        {/* Form */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5, marginBottom: '1.25rem' }}>Nouvelle demande de retour</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Commande concernée *</label>
              <select value={returnForm.orderId} onChange={e => setReturnForm(f => ({ ...f, orderId: e.target.value }))} style={{ ...inp, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                <option value="" style={{ background: '#1c1c1c' }}>Choisir une commande…</option>
                {orders.filter(o => o.status !== 'annule').map(o => (
                  <option key={o.id} value={o.id} style={{ background: '#1c1c1c' }}>Réf. {o.id.slice(0, 8).toUpperCase()} — {o.items.map(i => i.label).join(', ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Motif *</label>
              <select value={returnForm.reason} onChange={e => setReturnForm(f => ({ ...f, reason: e.target.value }))} style={{ ...inp, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='2'%3E%3Cpath d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}>
                <option value="" style={{ background: '#1c1c1c' }}>Choisir un motif…</option>
                {RETURN_REASONS.map(r => <option key={r} value={r} style={{ background: '#1c1c1c' }}>{r}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.4rem' }}>Description (optionnel)</label>
              <textarea value={returnForm.description} onChange={e => setReturnForm(f => ({ ...f, description: e.target.value }))} placeholder="Décris le problème en détail…" rows={3} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
            </div>
            {returnMsg && <p style={{ fontSize: '0.72rem', color: '#10b981' }}>✓ {returnMsg}</p>}
            <button onClick={handleReturn} disabled={!returnForm.orderId || !returnForm.reason} style={{ padding: '0.85rem', background: returnForm.orderId && returnForm.reason ? 'white' : 'rgba(255,255,255,0.08)', color: returnForm.orderId && returnForm.reason ? '#0a0a0a' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', cursor: returnForm.orderId && returnForm.reason ? 'pointer' : 'not-allowed', transition: 'all 250ms' }}>
              Envoyer la demande
            </button>
          </div>
        </Card>

        {/* History */}
        {myReturns.length > 0 && (
          <>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '0.9rem' }}>Historique des retours</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myReturns.map(r => (
                <Card key={r.id} style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.75rem', marginBottom: '0.2rem' }}>Réf. {r.orderRef}</p>
                    <p style={{ fontSize: '0.65rem', opacity: 0.5 }}>{r.reason}</p>
                  </div>
                  {chip(RETURN_STATUS_COLORS[r.status], RETURN_STATUS_LABELS[r.status])}
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderAdresses = () => {
    const ADDR_KEY = 'pietri_addresses';
    type Addr = { id: string; label: string; prenom: string; nom: string; ligne1: string; ligne2: string; ville: string; pays: string; code: string; tel: string; defaut: boolean };
    const [addrs, setAddrs] = useState<Addr[]>(() => {
      if (typeof window === 'undefined') return [];
      try { return JSON.parse(localStorage.getItem(ADDR_KEY) || '[]'); } catch { return []; }
    });
    const [showForm, setShowForm] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState<Omit<Addr,'id'|'defaut'>>({ label: 'Domicile', prenom: '', nom: '', ligne1: '', ligne2: '', ville: '', pays: 'France', code: '', tel: '' });
    const persist = (next: Addr[]) => { setAddrs(next); localStorage.setItem(ADDR_KEY, JSON.stringify(next)); };
    const addAddr = () => {
      const next = [...addrs, { ...form, id: crypto.randomUUID(), defaut: addrs.length === 0 }];
      persist(next); setShowForm(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
      setForm({ label: 'Domicile', prenom: '', nom: '', ligne1: '', ligne2: '', ville: '', pays: 'France', code: '', tel: '' });
    };
    const del = (id: string) => persist(addrs.filter(a => a.id !== id));
    const setDefaut = (id: string) => persist(addrs.map(a => ({ ...a, defaut: a.id === id })));
    return (
      <div>
        <SectionTitle>Mes adresses</SectionTitle>
        {saved && <p style={{ fontSize: '0.72rem', color: '#10b981', marginBottom: '1rem' }}>✓ Adresse sauvegardée</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {addrs.length === 0 && !showForm && (
            <Card style={{ textAlign: 'center', padding: '3rem' }}>
              <span style={{ opacity: 0.15, transform: 'scale(2.5)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>📍</span>
              <p style={{ opacity: 0.4, fontSize: '0.85rem', marginBottom: '1.5rem' }}>Aucune adresse enregistrée</p>
            </Card>
          )}
          {addrs.map(a => (
            <Card key={a.id} style={{ padding: '1rem 1.25rem', borderColor: a.defaut ? 'rgba(52,211,153,0.3)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.8rem' }}>{a.label}</p>
                    {a.defaut && <span style={{ fontSize: '0.5rem', fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 999, padding: '0.1rem 0.45rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Par défaut</span>}
                  </div>
                  <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{a.prenom} {a.nom}</p>
                  <p style={{ fontSize: '0.72rem', opacity: 0.5 }}>{a.ligne1}{a.ligne2 ? `, ${a.ligne2}` : ''}</p>
                  <p style={{ fontSize: '0.72rem', opacity: 0.5 }}>{a.code} {a.ville}, {a.pays}</p>
                  {a.tel && <p style={{ fontSize: '0.68rem', opacity: 0.4, marginTop: '0.25rem' }}>{a.tel}</p>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
                  {!a.defaut && <button onClick={() => setDefaut(a.id)} style={{ padding: '0.3rem 0.7rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'rgba(255,255,255,0.6)', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer' }}>Défaut</button>}
                  <button onClick={() => del(a.id)} style={{ padding: '0.3rem 0.7rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, color: '#f87171', fontSize: '0.6rem', fontWeight: 700, cursor: 'pointer' }}>Supprimer</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {showForm ? (
          <Card>
            <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginBottom: '1rem' }}>Nouvelle adresse</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {([['Label', 'label', 'Ex: Domicile'], ['Prénom', 'prenom', 'Jean'], ['Nom', 'nom', 'Koné'], ['Ligne 1', 'ligne1', '12 rue des Arts'], ['Ligne 2', 'ligne2', 'Apt 4 (optionnel)'], ['Ville', 'ville', 'Paris'], ['Code postal', 'code', '75001'], ['Pays', 'pays', 'France'], ['Téléphone', 'tel', '+33 6 00 00 00 00']] as [string, keyof typeof form, string][]).map(([label, key, ph]) => (
                <div key={key} style={key === 'ligne1' || key === 'tel' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, display: 'block', marginBottom: '0.35rem' }}>{label}</label>
                  <input type="text" placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={addAddr} disabled={!form.prenom || !form.ligne1 || !form.ville} style={{ flex: 1, padding: '0.85rem', background: form.prenom && form.ligne1 && form.ville ? 'white' : 'rgba(255,255,255,0.08)', color: form.prenom && form.ligne1 && form.ville ? '#0a0a0a' : 'rgba(255,255,255,0.3)', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer' }}>Sauvegarder</button>
              <button onClick={() => setShowForm(false)} style={{ padding: '0.85rem 1.25rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>Annuler</button>
            </div>
          </Card>
        ) : (
          <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.5rem', background: 'white', color: '#0a0a0a', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer' }}>
            <IcoPlus /> Ajouter une adresse
          </button>
        )}
      </div>
    );
  };

  const sections: Record<Section, () => React.ReactNode> = {
    dashboard: renderDashboard,
    commandes: renderCommandes,
    suivi: renderSuivi,
    profil: renderProfil,
    adresses: renderAdresses,
    promos: renderPromos,
    favoris: renderFavoris,
    retours: renderRetours,
    parrainage: () => <ReferralSection />,
    garderobe:  () => <GardeRobeSection />,
    negociations: () => <NegociationsSection email={profile.email} />,
    wallet: () => <WalletSection email={profile.email} onBalanceChange={setWalletBalance} />,
  };

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', position: 'relative' }}>
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />
      <style>{`
        @keyframes ping { 75%,100%{transform:scale(2);opacity:0} }
        @keyframes sheetUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .ec-sidebar { display: block; }
        .ec-grid { display: grid; grid-template-columns: 240px 1fr; gap: 2.5rem; max-width: 1100px; margin: 0 auto; padding: 2rem; position: relative; z-index: 1; }
        .ec-content { min-width: 0; }
        .ec-fab { display: none; }
        @media (max-width: 768px) {
          .ec-sidebar { display: none !important; }
          .ec-grid { grid-template-columns: 1fr !important; padding: 1.25rem 1rem 6rem !important; gap: 0 !important; }
          .ec-fab { display: flex !important; }
        }
      `}</style>

      {/* Top nav */}
      <div className="ec-topnav" style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#0a0a0af0', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'white', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.65, whiteSpace: 'nowrap' }}>
            <IcoLeft /> Retour
          </a>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', opacity: 0.9 }}>PIETRI</span>
        <a href="/panier" style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', opacity: 0.55, textDecoration: 'none', whiteSpace: 'nowrap' }}>Panier</a>
      </div>

      <div className="ec-grid">
        {/* Sidebar — desktop uniquement */}
        <div className="ec-sidebar" style={{ position: 'sticky', top: '5.5rem', alignSelf: 'start' }}>
          <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
            <p style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', opacity: 0.3, marginBottom: '0.3rem' }}>Espace client</p>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              {profile.prenom || 'MON COMPTE'}
            </p>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {NAV.map(item => {
              const active = section === item.id;
              return (
                <button key={item.id} onClick={() => setSection(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '10px', background: active ? 'rgba(255,255,255,0.08)' : 'transparent', border: active ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent', color: active ? 'white' : 'rgba(255,255,255,0.55)', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms', fontFamily: "'Inter', sans-serif" }}
                >
                  <span style={{ opacity: active ? 1 : 0.65, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: active ? 700 : 400, flex: 1 }}>{item.label}</span>
                  {!!item.badge && item.badge > 0 && (
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, background: item.id === 'suivi' ? '#f59e0b' : 'rgba(255,255,255,0.15)', color: item.id === 'suivi' ? '#0a0a0a' : 'white', padding: '0.1rem 0.45rem', borderRadius: '999px', minWidth: '18px', textAlign: 'center' }}>{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu */}
        <div className="ec-content">
          {sections[section]?.()}
        </div>
      </div>

      {/* FAB mobile — bouton flottant (caché quand sheet ouverte) */}
      <div className="ec-fab" style={{ position: 'fixed', bottom: '1.5rem', left: 0, right: 0, zIndex: 200, justifyContent: 'center', pointerEvents: 'none', opacity: sidebarOpen ? 0 : 1, transition: 'opacity 150ms', visibility: sidebarOpen ? 'hidden' : 'visible' }}>
        <button
          onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8); setSidebarOpen(!sidebarOpen); }}
          style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.8rem 1.5rem', background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '999px', color: 'white', cursor: 'pointer', backdropFilter: 'blur(20px)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', fontFamily: "'Inter', sans-serif" }}
        >
          {NAV.find(n => n.id === section)?.icon ?? <IcoMenu />}
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {NAV.find(n => n.id === section)?.label || 'Menu'}
          </span>
          <IcoChevron open={sidebarOpen} />
        </button>
      </div>

      {/* Bottom sheet overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={() => setSidebarOpen(false)}>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#141414', borderRadius: '20px 20px 0 0', padding: '1.25rem 1.25rem 2rem', border: '1px solid rgba(255,255,255,0.1)', animation: 'sheetUp 220ms cubic-bezier(0.4,0,0.2,1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '36px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 1.25rem' }} />
            <p style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.3, marginBottom: '1rem', textAlign: 'center' }}>Espace client</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {NAV.map(item => {
                const active = section === item.id;
                return (
                  <button key={item.id}
                    onClick={() => { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(8); setSection(item.id); setSidebarOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.85rem 1rem', background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '12px', color: active ? 'white' : 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
                  >
                    <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: active ? 700 : 400, flex: 1, textAlign: 'left' }}>{item.label}</span>
                    {!!item.badge && item.badge > 0 && (
                      <span style={{ fontSize: '0.58rem', fontWeight: 800, background: item.id === 'suivi' ? '#f59e0b' : 'rgba(255,255,255,0.15)', color: item.id === 'suivi' ? '#0a0a0a' : 'white', padding: '0.1rem 0.45rem', borderRadius: '999px' }}>{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

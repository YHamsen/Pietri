'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wifi, User, LogOut, QrCode, Package, Mail, Clock, Check, ChevronRight, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.06'/%3E%3C/svg%3E")`;

function GlobeLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="12" cy="12" r="9.5"/>
      <ellipse cx="12" cy="12" rx="4" ry="9.5" strokeOpacity="0.5"/>
      <path d="M2.5 12h19" strokeOpacity="0.5"/>
      <path d="M4 7.5c2.2-.8 5.2-1.3 8-1.3s5.8.5 8 1.3M4 16.5c2.2.8 5.2 1.3 8 1.3s5.8-.5 8-1.3" strokeOpacity="0.4" strokeWidth="1"/>
      <circle cx="12" cy="2.5" r="1.3" fill="currentColor" stroke="none"/>
      <path d="M9.2 4.5C9.9 3.5 10.9 3 12 3s2.1.5 2.8 1.5" strokeWidth="1.3"/>
    </svg>
  );
}

interface EsimOrder {
  id: string;
  destination: string;
  data_amount: string;
  validity_days: number;
  status: 'active' | 'expired' | 'pending';
  qr_code?: string;
  iccid?: string;
  purchased_at: string;
  price: number;
}

export default function ConnectAccountPage() {
  const [user, setUser]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders]   = useState<EsimOrder[]>([]);
  const [activeQr, setActiveQr] = useState<EsimOrder | null>(null);
  const [tab, setTab]         = useState<'esims' | 'profil' | 'negociations'>('esims');
  const [negotiations, setNegotiations] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await sb.auth.getUser();
      setUser(u);
      if (u) {
        // Load negotiations
        fetch(`/api/negotiations?email=${encodeURIComponent(u.email || '')}`)
          .then(r => r.json())
          .then(d => setNegotiations(d.negotiations || []))
          .catch(() => {});

        // Load eSIM orders from Supabase
        const { data } = await sb.from('orders')
          .select('*')
          .eq('customer_email', u.email)
          .order('created_at', { ascending: false });

        if (data) {
          const mapped: EsimOrder[] = data.map((o: any) => ({
            id: o.id,
            destination: o.product_name?.replace('PIETRI CONNECT — eSIM ', '') || 'Destination',
            data_amount: o.product_name?.match(/\d+ GB/)?.[0] || o.delivery_type || '—',
            validity_days: 30,
            status: o.payment_status === 'paid' ? 'active' : o.status === 'pending' ? 'pending' : 'expired',
            purchased_at: o.created_at,
            price: o.total_amount,
          }));
          setOrders(mapped);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  async function signOut() {
    await sb.auth.signOut();
    window.location.href = '/connect';
  }

  if (loading) {
    return (
      <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'white' }}/>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', color: 'white', padding: '2rem', textAlign: 'center' }}>
        <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', maxWidth: 380 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <GlobeLogo size={26}/>
          </div>
          <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>Mon espace Connect</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.45, lineHeight: 1.7, marginBottom: '2rem' }}>Connecte-toi pour accéder à tes eSIMs, voir tes QR codes et gérer tes forfaits.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <a href="/connect/auth" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem', background: 'white', color: '#050505', textDecoration: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Se connecter
            </a>
            <a href="/connect/auth?mode=signup" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem', background: 'transparent', color: 'white', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Créer un compte
            </a>
            <a href="/connect" style={{ fontSize: '0.68rem', opacity: 0.35, textDecoration: 'none', color: 'white', marginTop: '0.5rem' }}>
              ← Retour aux forfaits
            </a>
          </div>
        </div>
      </div>
    );
  }

  const activeCount  = orders.filter(o => o.status === 'active').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: 'white', fontFamily: 'system-ui,-apple-system,sans-serif', position: 'relative' }}>
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}/>
      <div style={{ position: 'fixed', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vh', background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}/>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5,5,5,0.88)', backdropFilter: 'blur(28px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/connect" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', textDecoration: 'none', opacity: 0.5, fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', transition: 'opacity 200ms' }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')} onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}>
          <ArrowLeft size={12} strokeWidth={2.5}/> Forfaits
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GlobeLogo size={14}/>
          </div>
          <span style={{ fontFamily: "'Anton',sans-serif", fontSize: '0.88rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            PIETRI <span style={{ opacity: 0.45 }}>CONNECT</span>
          </span>
        </div>
        <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '0.35rem 0.85rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 200ms' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
          <LogOut size={11} strokeWidth={2}/> Déconnexion
        </button>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 780, margin: '0 auto', padding: '2.5rem 1.5rem 6rem' }}>

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={22} strokeWidth={1.5} style={{ opacity: 0.8 }}/>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Mon compte'}
            </p>
            <p style={{ fontSize: '0.72rem', opacity: 0.4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={11}/> {user.email}
            </p>
          </div>
          {/* mini stats */}
          <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '1.4rem', lineHeight: 1 }}>{activeCount}</p>
              <p style={{ fontSize: '0.52rem', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.2rem' }}>Active{activeCount > 1 ? 's' : ''}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '1.4rem', lineHeight: 1 }}>{orders.length}</p>
              <p style={{ fontSize: '0.52rem', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: '0.2rem' }}>Total</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '0.3rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          {([['esims', 'Mes eSIMs', Package], ['negociations', 'Négociations', Clock], ['profil', 'Profil', User]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id as any)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding: '0.65rem', background: tab === id ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', borderRadius: 9, color: tab === id ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 200ms' }}>
              <Icon size={13} strokeWidth={2}/> {label}
            </button>
          ))}
        </div>

        {/* eSIMs tab */}
        {tab === 'esims' && (
          <div>
            {orders.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '4rem 1rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <QrCode size={22} strokeWidth={1.5} style={{ opacity: 0.4 }}/>
                </div>
                <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Aucune eSIM</p>
                <p style={{ fontSize: '0.76rem', opacity: 0.4, lineHeight: 1.65, marginBottom: '1.75rem' }}>Tu n'as pas encore acheté de forfait eSIM. Explore les destinations disponibles.</p>
                <a href="/connect" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 2rem', background: 'white', color: '#050505', textDecoration: 'none', borderRadius: 999, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  <GlobeLogo size={15}/> Voir les forfaits <ChevronRight size={13}/>
                </a>
              </motion.div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.map((order, i) => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* status dot */}
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: order.status === 'active' ? 'rgba(34,197,94,0.1)' : order.status === 'pending' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${order.status === 'active' ? 'rgba(34,197,94,0.25)' : order.status === 'pending' ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {order.status === 'active' ? <Check size={16} style={{ color: '#22c55e' }}/> : order.status === 'pending' ? <Clock size={16} style={{ color: '#fbbf24' }}/> : <X size={16} style={{ opacity: 0.4 }}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>{order.destination}</p>
                      <p style={{ fontSize: '0.62rem', opacity: 0.4 }}>
                        {order.status === 'active' ? '● Actif' : order.status === 'pending' ? '◐ En attente' : '○ Expiré'} · {new Date(order.purchased_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {order.qr_code && (
                      <button onClick={() => setActiveQr(order)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'white', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                        <QrCode size={12}/> QR
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Buy more CTA */}
            {orders.length > 0 && (
              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <a href="/connect" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 999, color: 'white', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  + Acheter un nouveau forfait
                </a>
              </div>
            )}
          </div>
        )}

        {/* Négociations tab */}
        {tab === 'negociations' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginBottom: '0.5rem' }}>
              Mes négociations ({negotiations.length})
            </p>
            {negotiations.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤝</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>Aucune négociation en cours.</p>
                <a href="/#drops" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Voir les produits négociables →</a>
              </div>
            ) : negotiations.map((n: any) => {
              const STATUS: Record<string, { label: string; color: string; emoji: string }> = {
                pending:   { label: 'En attente', color: '#facc15', emoji: '⏳' },
                accepted:  { label: 'Acceptée 🎉', color: '#34d399', emoji: '✅' },
                rejected:  { label: 'Refusée', color: '#f87171', emoji: '❌' },
                countered: { label: 'Contre-offre reçue', color: '#60a5fa', emoji: '🔄' },
                completed: { label: 'Terminée', color: '#34d399', emoji: '✅' },
                expired:   { label: 'Expirée', color: 'rgba(255,255,255,0.3)', emoji: '⌛' },
              };
              const s = STATUS[n.status] || { label: n.status, color: '#888', emoji: '❓' };
              return (
                <div key={n.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${n.status === 'countered' ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 14, padding: '1.1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{n.product_name}</p>
                      <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.15rem' }}>{n.attempts}/{n.max_attempts} tentatives · {new Date(n.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 999, background: s.color + '22', color: s.color }}>{s.emoji} {s.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.5rem 0.75rem', flex: 1, minWidth: 80, textAlign: 'center' }}>
                      <p style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prix</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{((n.original_price || 0) / 100).toFixed(0)}€</p>
                    </div>
                    <div style={{ background: 'rgba(250,204,21,0.08)', borderRadius: 8, padding: '0.5rem 0.75rem', flex: 1, minWidth: 80, textAlign: 'center' }}>
                      <p style={{ fontSize: '0.52rem', color: 'rgba(250,204,21,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ton offre</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#facc15' }}>{((n.offered_price || 0) / 100).toFixed(0)}€</p>
                    </div>
                    {n.counter_price && (
                      <div style={{ background: 'rgba(96,165,250,0.08)', borderRadius: 8, padding: '0.5rem 0.75rem', flex: 1, minWidth: 80, textAlign: 'center' }}>
                        <p style={{ fontSize: '0.52rem', color: 'rgba(96,165,250,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Contre-offre</p>
                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa' }}>{((n.counter_price || 0) / 100).toFixed(0)}€</p>
                      </div>
                    )}
                  </div>
                  {n.status === 'countered' && (
                    <a href={`/produits/${n.product_slug}`} style={{ display: 'block', marginTop: '0.75rem', padding: '0.65rem', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 10, color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700, textAlign: 'center', textDecoration: 'none', letterSpacing: '0.08em' }}>
                      Répondre à la contre-offre →
                    </a>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Profile tab */}
        {tab === 'profil' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
              {[
                { label: 'Email', value: user.email },
                { label: 'ID compte', value: user.id?.slice(0, 16) + '…' },
                { label: 'Membre depuis', value: new Date(user.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) },
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                  <p style={{ fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{row.label}</p>
                  <p style={{ fontSize: '0.78rem', fontWeight: 600 }}>{row.value}</p>
                </div>
              ))}
            </div>

            <button onClick={signOut} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.85rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, color: '#f87171', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
              <LogOut size={13}/> Se déconnecter
            </button>
          </motion.div>
        )}
      </div>

      {/* QR modal */}
      <AnimatePresence>
        {activeQr && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveQr(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', textAlign: 'center', maxWidth: 300, width: '100%' }}>
              <p style={{ fontFamily: "'Anton',sans-serif", fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem', opacity: 0.7 }}>{activeQr.destination}</p>
              <div style={{ background: 'white', borderRadius: 12, padding: '1rem', display: 'inline-block', marginBottom: '1rem' }}>
                <img src={activeQr.qr_code} alt="QR" style={{ width: 180, height: 180 }}/>
              </div>
              <p style={{ fontSize: '0.64rem', opacity: 0.4, lineHeight: 1.6, marginBottom: '1.25rem' }}>Scanne ce code dans Réglages → Données cellulaires → Ajouter un forfait</p>
              <button onClick={() => setActiveQr(null)} style={{ padding: '0.75rem 1.75rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: 'white', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
                Fermer
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

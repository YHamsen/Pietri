'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, QrCode, ArrowLeft, ArrowRight, Search, User, LogIn, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

/* ══════════════════════════════════════════════════════════════
   LOGO — globe custom SVG
══════════════════════════════════════════════════════════════ */
function GlobeLogo({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.3"/>
      <ellipse cx="12" cy="12" rx="4" ry="9.5" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.5"/>
      <path d="M2.5 12h19" stroke="currentColor" strokeWidth="1.1" strokeOpacity="0.5"/>
      <path d="M4 7.5c2.2-.8 5.2-1.3 8-1.3s5.8.5 8 1.3M4 16.5c2.2.8 5.2 1.3 8 1.3s5.8-.5 8-1.3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4"/>
      <circle cx="12" cy="2.5" r="1.3" fill="currentColor"/>
      <path d="M9.2 4.5C9.9 3.5 10.9 3 12 3s2.1.5 2.8 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M7 6.2C8.2 3.8 10 2.2 12 2.2s3.8 1.6 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.6"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   COUNTRY DATA — 200+ destinations Airalo
══════════════════════════════════════════════════════════════ */
type Region = 'africa' | 'europe' | 'americas' | 'asia' | 'mideast';
interface Country { code: string; name: string; region: Region; popular?: boolean; }

const COUNTRIES: Country[] = [
  // ── AFRIQUE ──────────────────────────────────────────────
  { code:'CI', name:"Côte d'Ivoire",    region:'africa', popular:true  },
  { code:'GH', name:'Ghana',             region:'africa', popular:true  },
  { code:'SN', name:'Sénégal',           region:'africa', popular:true  },
  { code:'NG', name:'Nigeria',           region:'africa', popular:true  },
  { code:'CM', name:'Cameroun',          region:'africa', popular:true  },
  { code:'KE', name:'Kenya',             region:'africa', popular:true  },
  { code:'ZA', name:'Afrique du Sud',    region:'africa', popular:true  },
  { code:'MA', name:'Maroc',             region:'africa', popular:true  },
  { code:'TZ', name:'Tanzanie',          region:'africa'                },
  { code:'ET', name:'Éthiopie',          region:'africa'                },
  { code:'UG', name:'Ouganda',           region:'africa'                },
  { code:'RW', name:'Rwanda',            region:'africa'                },
  { code:'DZ', name:'Algérie',           region:'africa'                },
  { code:'TN', name:'Tunisie',           region:'africa'                },
  { code:'EG', name:'Égypte',            region:'africa'                },
  { code:'MU', name:'Maurice',           region:'africa'                },
  { code:'BW', name:'Botswana',          region:'africa'                },
  { code:'NA', name:'Namibie',           region:'africa'                },
  { code:'ZM', name:'Zambie',            region:'africa'                },
  { code:'ZW', name:'Zimbabwe',          region:'africa'                },
  { code:'GA', name:'Gabon',             region:'africa'                },
  { code:'CD', name:'Congo (RDC)',        region:'africa'                },
  { code:'CG', name:'Congo (Brazzaville)',region:'africa'               },
  { code:'BJ', name:'Bénin',             region:'africa'                },
  { code:'TG', name:'Togo',              region:'africa'                },
  { code:'ML', name:'Mali',              region:'africa'                },
  { code:'BF', name:'Burkina Faso',      region:'africa'                },
  { code:'NE', name:'Niger',             region:'africa'                },
  { code:'MZ', name:'Mozambique',        region:'africa'                },
  { code:'AO', name:'Angola',            region:'africa'                },
  // ── EUROPE ───────────────────────────────────────────────
  { code:'FR', name:'France',            region:'europe', popular:true  },
  { code:'GB', name:'Royaume-Uni',        region:'europe', popular:true  },
  { code:'DE', name:'Allemagne',          region:'europe', popular:true  },
  { code:'IT', name:'Italie',             region:'europe', popular:true  },
  { code:'ES', name:'Espagne',            region:'europe', popular:true  },
  { code:'PT', name:'Portugal',           region:'europe'                },
  { code:'NL', name:'Pays-Bas',           region:'europe'                },
  { code:'BE', name:'Belgique',           region:'europe', popular:true  },
  { code:'CH', name:'Suisse',             region:'europe'                },
  { code:'AT', name:'Autriche',           region:'europe'                },
  { code:'SE', name:'Suède',              region:'europe'                },
  { code:'NO', name:'Norvège',            region:'europe'                },
  { code:'DK', name:'Danemark',           region:'europe'                },
  { code:'FI', name:'Finlande',           region:'europe'                },
  { code:'IE', name:'Irlande',            region:'europe'                },
  { code:'PL', name:'Pologne',            region:'europe'                },
  { code:'CZ', name:'Rép. Tchèque',       region:'europe'                },
  { code:'HU', name:'Hongrie',            region:'europe'                },
  { code:'RO', name:'Roumanie',           region:'europe'                },
  { code:'GR', name:'Grèce',              region:'europe'                },
  { code:'HR', name:'Croatie',            region:'europe'                },
  { code:'TR', name:'Turquie',            region:'europe', popular:true  },
  { code:'UA', name:'Ukraine',            region:'europe'                },
  { code:'SK', name:'Slovaquie',          region:'europe'                },
  { code:'BG', name:'Bulgarie',           region:'europe'                },
  { code:'RS', name:'Serbie',             region:'europe'                },
  { code:'SI', name:'Slovénie',           region:'europe'                },
  { code:'LT', name:'Lituanie',           region:'europe'                },
  { code:'LV', name:'Lettonie',           region:'europe'                },
  { code:'EE', name:'Estonie',            region:'europe'                },
  { code:'AL', name:'Albanie',            region:'europe'                },
  { code:'MK', name:'Macédoine du Nord',  region:'europe'                },
  { code:'ME', name:'Monténégro',         region:'europe'                },
  { code:'BA', name:'Bosnie',             region:'europe'                },
  { code:'GE', name:'Géorgie',            region:'europe'                },
  { code:'AM', name:'Arménie',            region:'europe'                },
  { code:'AZ', name:'Azerbaïdjan',        region:'europe'                },
  { code:'MD', name:'Moldavie',           region:'europe'                },
  { code:'IS', name:'Islande',            region:'europe'                },
  { code:'MT', name:'Malte',              region:'europe'                },
  { code:'CY', name:'Chypre',             region:'europe'                },
  { code:'LU', name:'Luxembourg',         region:'europe'                },
  // ── AMÉRIQUES ────────────────────────────────────────────
  { code:'US', name:'États-Unis',         region:'americas', popular:true },
  { code:'CA', name:'Canada',             region:'americas', popular:true },
  { code:'MX', name:'Mexique',            region:'americas', popular:true },
  { code:'BR', name:'Brésil',             region:'americas'               },
  { code:'AR', name:'Argentine',          region:'americas'               },
  { code:'CO', name:'Colombie',           region:'americas'               },
  { code:'PE', name:'Pérou',              region:'americas'               },
  { code:'CL', name:'Chili',              region:'americas'               },
  { code:'EC', name:'Équateur',           region:'americas'               },
  { code:'UY', name:'Uruguay',            region:'americas'               },
  { code:'PA', name:'Panama',             region:'americas'               },
  { code:'CR', name:'Costa Rica',         region:'americas'               },
  { code:'DO', name:'Rép. Dominicaine',   region:'americas'               },
  { code:'JM', name:'Jamaïque',           region:'americas'               },
  { code:'TT', name:'Trinidad & Tobago',  region:'americas'               },
  { code:'GT', name:'Guatemala',          region:'americas'               },
  { code:'HN', name:'Honduras',           region:'americas'               },
  { code:'SV', name:'Salvador',           region:'americas'               },
  { code:'NI', name:'Nicaragua',          region:'americas'               },
  { code:'PY', name:'Paraguay',           region:'americas'               },
  { code:'BO', name:'Bolivie',            region:'americas'               },
  { code:'VE', name:'Venezuela',          region:'americas'               },
  // ── ASIE & PACIFIQUE ─────────────────────────────────────
  { code:'JP', name:'Japon',              region:'asia', popular:true },
  { code:'KR', name:'Corée du Sud',       region:'asia', popular:true },
  { code:'SG', name:'Singapour',          region:'asia', popular:true },
  { code:'TH', name:'Thaïlande',          region:'asia', popular:true },
  { code:'VN', name:'Vietnam',            region:'asia'               },
  { code:'ID', name:'Indonésie',          region:'asia'               },
  { code:'IN', name:'Inde',               region:'asia'               },
  { code:'HK', name:'Hong Kong',          region:'asia'               },
  { code:'TW', name:'Taïwan',             region:'asia'               },
  { code:'PH', name:'Philippines',        region:'asia'               },
  { code:'MY', name:'Malaisie',           region:'asia'               },
  { code:'AU', name:'Australie',          region:'asia', popular:true },
  { code:'NZ', name:'Nouvelle-Zélande',   region:'asia'               },
  { code:'MM', name:'Myanmar',            region:'asia'               },
  { code:'KH', name:'Cambodge',           region:'asia'               },
  { code:'LK', name:'Sri Lanka',          region:'asia'               },
  { code:'NP', name:'Népal',              region:'asia'               },
  { code:'BD', name:'Bangladesh',         region:'asia'               },
  { code:'PK', name:'Pakistan',           region:'asia'               },
  { code:'MN', name:'Mongolie',           region:'asia'               },
  { code:'LA', name:'Laos',               region:'asia'               },
  { code:'KZ', name:'Kazakhstan',         region:'asia'               },
  { code:'UZ', name:'Ouzbékistan',        region:'asia'               },
  { code:'KG', name:'Kirghizistan',       region:'asia'               },
  { code:'PG', name:'Papouasie N-G',      region:'asia'               },
  { code:'FJ', name:'Fidji',              region:'asia'               },
  // ── MOYEN-ORIENT ─────────────────────────────────────────
  { code:'AE', name:'Émirats Arabes',     region:'mideast', popular:true },
  { code:'SA', name:'Arabie Saoudite',    region:'mideast', popular:true },
  { code:'QA', name:'Qatar',              region:'mideast'               },
  { code:'KW', name:'Koweït',             region:'mideast'               },
  { code:'BH', name:'Bahreïn',            region:'mideast'               },
  { code:'OM', name:'Oman',               region:'mideast'               },
  { code:'IL', name:'Israël',             region:'mideast'               },
  { code:'JO', name:'Jordanie',           region:'mideast'               },
  { code:'LB', name:'Liban',              region:'mideast'               },
  { code:'IQ', name:'Irak',               region:'mideast'               },
];

const REGION_LABELS: Record<Region | 'all', string> = {
  all:     'Tout',
  africa:  'Afrique',
  europe:  'Europe',
  americas:'Amériques',
  asia:    'Asie & Pacifique',
  mideast: 'Moyen-Orient',
};
const REGIONS = ['all', 'africa', 'europe', 'americas', 'asia', 'mideast'] as const;

/* ══════════════════════════════════════════════════════════════
   AIRALO TYPES
══════════════════════════════════════════════════════════════ */
interface AiraloPackage {
  id: number;
  slug: string;
  type: string;
  price: number;
  amount: number;
  day: number;
  is_unlimited: boolean;
  title: string;
  data: string;
  is_popular: boolean;
  package_id: string;
  operators: {
    countries: { country_code: string; name: string; image?: { url: string } }[];
    networks: { name: string; types: string[] }[];
    plan_type: string;
  }[];
}

interface Pkg {
  id: string;
  package_id: string;
  data: string;
  days: number;
  price_eur: number;
  network: string;
  is_popular: boolean;
  is_unlimited: boolean;
}

function toDisplayPkg(raw: AiraloPackage): Pkg {
  const network = raw.operators?.[0]?.networks?.[0]?.types?.join('/') || '4G/5G';
  return {
    id: String(raw.id),
    package_id: raw.package_id,
    data: raw.is_unlimited ? 'Illimité' : (raw.data || `${Math.round(raw.amount / 1024)} GB`),
    days: raw.day,
    price_eur: raw.price,
    network,
    is_popular: raw.is_popular,
    is_unlimited: raw.is_unlimited,
  };
}

/* ── grain ── */
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.055'/%3E%3C/svg%3E")`;

/* ══════════════════════════════════════════════════════════════
   PURCHASE MODAL
══════════════════════════════════════════════════════════════ */
function PurchaseModal({
  pkg, country, onClose,
}: { pkg: Pkg; country: Country; onClose: () => void }) {
  const { format } = useCurrency();
  const [step, setStep] = useState<'confirm'|'phone'|'processing'|'success'|'error'>('confirm');
  const [phone, setPhone]   = useState('');
  const [error, setError]   = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  const norm = (r: string) => {
    let n = r.replace(/[\s\-().]/g,'');
    if (n.startsWith('+'))  n = n.slice(1);
    if (n.startsWith('00')) n = n.slice(2);
    if (/^0\d{9}$/.test(n)) n = '225' + n.slice(1);
    return n;
  };

  async function pay() {
    if (!phone) { setError('Numéro requis'); return; }
    setStep('processing'); setError('');
    try {
      const momo = await fetch('/api/paiement', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone: norm(phone), amount: Math.round(pkg.price_eur * 655.957), currency:'XOF',
          produit:`PIETRI CONNECT — eSIM ${country.name} ${pkg.data}`, taille:`${pkg.days} jours`, adresse:'eSIM' }),
      });
      const md = await momo.json();
      if (!md.success) { setError(md.detail || md.error || 'Paiement refusé'); setStep('error'); return; }
      const order = await fetch('/api/esim/order', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ package_id: pkg.package_id, quantity:1, description:`PIETRI CONNECT — ${country.name} ${pkg.data}` }),
      });
      const od = await order.json();
      if (od.success) setOrderData(od.order);
      setStep('success');
    } catch(e) { setError(String(e)); setStep('error'); }
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.9)', backdropFilter:'blur(20px)'}}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{y:48,opacity:0}} animate={{y:0,opacity:1}} exit={{y:48,opacity:0}}
        transition={{type:'spring',damping:28,stiffness:300}}
        style={{background:'#111',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,width:'100%',maxWidth:420,overflow:'hidden'}}>
        {/* header */}
        <div style={{padding:'1.1rem 1.4rem',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.7rem'}}>
            <img src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`} alt="" style={{width:32,height:22,borderRadius:4,objectFit:'cover',flexShrink:0}}/>
            <div>
              <p style={{fontFamily:"'Anton',sans-serif",fontSize:'0.9rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>{country.name}</p>
              <p style={{fontSize:'0.6rem',opacity:0.35,letterSpacing:'0.1em',textTransform:'uppercase'}}>{pkg.data} · {pkg.days} JOURS · {pkg.network}</p>
            </div>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'50%',width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white'}}>
            <X size={13}/>
          </button>
        </div>

        <div style={{padding:'1.4rem'}}>
          {step==='confirm' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'1rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12,marginBottom:'1.1rem'}}>
                <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
                  {[['Data',pkg.data],['Validité',`${pkg.days} jours`],['Réseau',pkg.network],['Type','eSIM (QR code)']].map(([k,v])=>(
                    <div key={k} style={{display:'flex',gap:'0.6rem',fontSize:'0.76rem'}}>
                      <span style={{opacity:0.35,minWidth:60}}>{k}</span>
                      <span style={{fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.7rem'}}>{format(pkg.price_eur)}</p>
                  <p style={{fontSize:'0.55rem',opacity:0.3,textTransform:'uppercase',letterSpacing:'0.1em'}}>paiement unique</p>
                </div>
              </div>
              {['Compatible iPhone XS+ et Android récent','Activation par QR code en 2 minutes','Sans carte SIM physique'].map(f=>(
                <div key={f} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.7rem',opacity:0.5,marginBottom:'0.35rem'}}>
                  <Check size={11} style={{color:'#22c55e',flexShrink:0}}/> {f}
                </div>
              ))}
              <button onClick={()=>setStep('phone')} style={{width:'100%',marginTop:'1.25rem',padding:'0.9rem',background:'white',color:'#0a0a0a',border:'none',borderRadius:10,fontWeight:700,fontSize:'0.76rem',textTransform:'uppercase',letterSpacing:'0.14em',cursor:'pointer'}}>
                Continuer →
              </button>
            </div>
          )}
          {step==='phone' && (
            <div>
              <p style={{fontSize:'0.74rem',opacity:0.45,marginBottom:'1.1rem',lineHeight:1.6}}>
                Numéro MTN MoMo pour payer <strong style={{color:'white',opacity:1}}>{format(pkg.price_eur)}</strong>
              </p>
              <input type="tel" placeholder="+225 07 00 00 00 00" value={phone} onChange={e=>{setPhone(e.target.value);setError('');}}
                style={{width:'100%',padding:'0.85rem 1rem',background:'rgba(255,255,255,0.05)',border:`1.5px solid ${error?'rgba(248,113,113,0.4)':'rgba(255,255,255,0.1)'}`,borderRadius:10,color:'white',fontSize:'0.88rem',fontFamily:'system-ui',outline:'none',boxSizing:'border-box',marginBottom:error?'0.5rem':'0.9rem'}}/>
              {error && <p style={{fontSize:'0.68rem',color:'#f87171',marginBottom:'0.75rem'}}>{error}</p>}
              <div style={{display:'flex',gap:'0.5rem'}}>
                <button onClick={()=>setStep('confirm')} style={{flex:1,padding:'0.8rem',background:'transparent',border:'1.5px solid rgba(255,255,255,0.12)',borderRadius:10,color:'rgba(255,255,255,0.5)',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>Retour</button>
                <button onClick={pay} disabled={!phone} style={{flex:2,padding:'0.8rem',background:phone?'white':'rgba(255,255,255,0.06)',color:phone?'#0a0a0a':'rgba(255,255,255,0.3)',border:'none',borderRadius:10,fontWeight:700,fontSize:'0.76rem',textTransform:'uppercase',letterSpacing:'0.1em',cursor:phone?'pointer':'not-allowed'}}>
                  Payer {format(pkg.price_eur)}
                </button>
              </div>
            </div>
          )}
          {step==='processing' && (
            <div style={{textAlign:'center',padding:'2.5rem 0'}}>
              <motion.div animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}}
                style={{width:40,height:40,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.1)',borderTopColor:'white',margin:'0 auto 1.1rem'}}/>
              <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1rem',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.4rem'}}>Traitement…</p>
              <p style={{fontSize:'0.68rem',opacity:0.35}}>Confirme sur ton téléphone MoMo</p>
            </div>
          )}
          {step==='success' && (
            <div style={{textAlign:'center'}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(34,197,94,0.1)',border:'1.5px solid rgba(34,197,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.9rem'}}>
                <Check size={20} style={{color:'#22c55e'}}/>
              </div>
              <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.1rem',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.4rem'}}>eSIM Activée !</p>
              <p style={{fontSize:'0.68rem',opacity:0.4,lineHeight:1.7,marginBottom:'1.25rem'}}>
                {orderData?'Scanne le QR code pour activer.':'Paiement confirmé — QR code envoyé par email.'}
              </p>
              {orderData?.sims?.[0]?.qrcode && (
                <div style={{background:'white',borderRadius:10,padding:'0.85rem',display:'inline-block',marginBottom:'1rem'}}>
                  <img src={orderData.sims[0].qrcode} alt="QR" style={{width:150,height:150}}/>
                </div>
              )}
              <button onClick={onClose} style={{width:'100%',padding:'0.8rem',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'white',fontWeight:700,fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.1em',cursor:'pointer'}}>Fermer</button>
            </div>
          )}
          {step==='error' && (
            <div style={{textAlign:'center'}}>
              <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(248,113,113,0.08)',border:'1.5px solid rgba(248,113,113,0.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.9rem'}}>
                <X size={20} style={{color:'#f87171'}}/>
              </div>
              <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1rem',textTransform:'uppercase',marginBottom:'0.4rem'}}>Échec</p>
              <p style={{fontSize:'0.68rem',color:'#f87171',marginBottom:'1.25rem',lineHeight:1.6}}>{error}</p>
              <div style={{display:'flex',gap:'0.5rem'}}>
                <button onClick={()=>{setStep('phone');setError('');}} style={{flex:1,padding:'0.8rem',background:'white',color:'#0a0a0a',border:'none',borderRadius:10,fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>Réessayer</button>
                <button onClick={onClose} style={{flex:1,padding:'0.8rem',background:'transparent',border:'1.5px solid rgba(255,255,255,0.12)',borderRadius:10,color:'rgba(255,255,255,0.5)',fontWeight:700,fontSize:'0.72rem',cursor:'pointer'}}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ESIM COMPATIBILITY DATA
══════════════════════════════════════════════════════════════ */
interface DeviceEntry { brand: string; model: string; esim: boolean; dual?: boolean; note?: string; }

const DEVICES: DeviceEntry[] = [
  // ── Apple ──
  { brand:'Apple', model:'iPhone 16 / 16 Plus / 16 Pro / 16 Pro Max', esim:true, dual:true },
  { brand:'Apple', model:'iPhone 15 / 15 Plus / 15 Pro / 15 Pro Max', esim:true, dual:true },
  { brand:'Apple', model:'iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max', esim:true, dual:true },
  { brand:'Apple', model:'iPhone 13 / 13 Mini / 13 Pro / 13 Pro Max', esim:true },
  { brand:'Apple', model:'iPhone 12 / 12 Mini / 12 Pro / 12 Pro Max', esim:true },
  { brand:'Apple', model:'iPhone SE (2020 / 2022 / 2024)', esim:true },
  { brand:'Apple', model:'iPhone 11 / 11 Pro / 11 Pro Max', esim:true },
  { brand:'Apple', model:'iPhone XS / XS Max / XR', esim:true },
  { brand:'Apple', model:'iPhone X et versions antérieures', esim:false },
  { brand:'Apple', model:'iPad Pro (3ᵉ gén. et +)', esim:true },
  { brand:'Apple', model:'iPad Air (3ᵉ gén. et +)', esim:true },
  { brand:'Apple', model:'iPad Mini (5ᵉ gén. et +)', esim:true },
  { brand:'Apple', model:'Apple Watch Series 3 et +', esim:true, note:'eSIM appel uniquement' },
  // ── Samsung ──
  { brand:'Samsung', model:'Galaxy S24 / S24+ / S24 Ultra', esim:true, dual:true },
  { brand:'Samsung', model:'Galaxy S23 / S23+ / S23 Ultra / S23 FE', esim:true, dual:true },
  { brand:'Samsung', model:'Galaxy S22 / S22+ / S22 Ultra', esim:true },
  { brand:'Samsung', model:'Galaxy S21 / S21+ / S21 Ultra / S21 FE', esim:true },
  { brand:'Samsung', model:'Galaxy S20 / S20+ / S20 Ultra / S20 FE', esim:true },
  { brand:'Samsung', model:'Galaxy Z Fold 5 / 6', esim:true, dual:true },
  { brand:'Samsung', model:'Galaxy Z Fold 3 / 4', esim:true },
  { brand:'Samsung', model:'Galaxy Z Flip 5 / 6', esim:true, dual:true },
  { brand:'Samsung', model:'Galaxy Z Flip 3 / 4', esim:true },
  { brand:'Samsung', model:'Galaxy A55 / A54 5G', esim:true },
  { brand:'Samsung', model:'Galaxy Note 20 / Note 20 Ultra', esim:true },
  { brand:'Samsung', model:'Galaxy Note 10 / 10+', esim:true },
  // ── Google ──
  { brand:'Google', model:'Pixel 9 / 9 Pro / 9 Pro XL / 9 Pro Fold', esim:true, dual:true },
  { brand:'Google', model:'Pixel 8 / 8 Pro / 8a', esim:true, dual:true },
  { brand:'Google', model:'Pixel 7 / 7 Pro / 7a', esim:true },
  { brand:'Google', model:'Pixel 6 / 6 Pro / 6a', esim:true },
  { brand:'Google', model:'Pixel 5 / 5a', esim:true },
  { brand:'Google', model:'Pixel 4 / 4 XL / 4a / 4a 5G', esim:true },
  { brand:'Google', model:'Pixel 3 / 3 XL / 3a / 3a XL', esim:true },
  // ── Motorola ──
  { brand:'Motorola', model:'Razr 40 / 40 Ultra / 50 / 50 Ultra', esim:true, dual:true },
  { brand:'Motorola', model:'Edge 40 Neo / Edge 50 Pro', esim:true },
  { brand:'Motorola', model:'Moto G84 / G54', esim:true },
  // ── Xiaomi ──
  { brand:'Xiaomi', model:'Xiaomi 14 / 14 Ultra', esim:true, note:'Disponible selon la région' },
  { brand:'Xiaomi', model:'Xiaomi 13 / 13 Pro', esim:true, note:'Disponible selon la région' },
  { brand:'Xiaomi', model:'Xiaomi 12 Pro', esim:true, note:'Disponible selon la région' },
  // ── OnePlus ──
  { brand:'OnePlus', model:'OnePlus 12 / 11 / 10 Pro', esim:false, note:'Pas de support eSIM sur les versions globales' },
  { brand:'OnePlus', model:'OnePlus Open', esim:true },
  // ── Oppo ──
  { brand:'Oppo', model:'Find X7 Ultra / X6 Pro', esim:true },
  { brand:'Oppo', model:'Reno 11 Pro', esim:true },
  // ── Huawei ──
  { brand:'Huawei', model:'P40 Pro / P50 Pro', esim:true, note:'eSIM présente mais sans Google Services' },
  { brand:'Huawei', model:'Mate 40 Pro / Mate X2', esim:true, note:'eSIM présente mais sans Google Services' },
  // ── Sony ──
  { brand:'Sony', model:'Xperia 1 V / 5 V / 10 V', esim:false },
  // ── Others ──
  { brand:'Microsoft', model:'Surface Duo 2', esim:true },
  { brand:'Nothing', model:'Phone (2a) Plus / Phone (2)', esim:true },
];

/* ══════════════════════════════════════════════════════════════
   COMPATIBILITY MODAL
══════════════════════════════════════════════════════════════ */
function CompatibilityModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{ setTimeout(()=>inputRef.current?.focus(), 100); },[]);

  const brands = useMemo(()=>Array.from(new Set(DEVICES.map(d=>d.brand))).sort(),[]);

  const results = useMemo(()=>{
    let list = DEVICES;
    if (selectedBrand) list = list.filter(d=>d.brand===selectedBrand);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(d=>
        d.model.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q)
      );
    }
    return list;
  },[query, selectedBrand]);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,0.92)',backdropFilter:'blur(24px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}
      onClick={e=>e.target===e.currentTarget && onClose()}>
      <motion.div initial={{y:32,opacity:0,scale:0.97}} animate={{y:0,opacity:1,scale:1}} exit={{y:32,opacity:0}}
        transition={{type:'spring',damping:28,stiffness:320}}
        style={{width:'100%',maxWidth:560,background:'#0e0e0e',border:'1px solid rgba(255,255,255,0.09)',borderRadius:22,overflow:'hidden',display:'flex',flexDirection:'column',maxHeight:'90vh'}}>

        {/* Header */}
        <div style={{padding:'1.4rem 1.5rem 1.1rem',borderBottom:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <p style={{fontSize:'0.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.2em',opacity:0.35,marginBottom:'0.3rem'}}>PIETRI CONNECT</p>
            <h2 style={{fontFamily:"'Anton',sans-serif",fontSize:'1.3rem',textTransform:'uppercase',letterSpacing:'0.02em',lineHeight:1}}>
              Compatibilité eSIM
            </h2>
            <p style={{fontSize:'0.7rem',opacity:0.4,marginTop:'0.35rem',lineHeight:1.5}}>Vérifie si ton téléphone supporte l'eSIM</p>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'50%',width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',flexShrink:0,marginTop:'0.2rem'}}>
            <X size={14}/>
          </button>
        </div>

        {/* Search */}
        <div style={{padding:'1rem 1.5rem 0.75rem',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
          <div style={{position:'relative',marginBottom:'0.85rem'}}>
            <Search size={14} style={{position:'absolute',left:'0.9rem',top:'50%',transform:'translateY(-50%)',opacity:0.3,pointerEvents:'none'}}/>
            <input ref={inputRef} type="text" placeholder="Ex: iPhone 14, Galaxy S23, Pixel 7…" value={query}
              onChange={e=>setQuery(e.target.value)}
              style={{width:'100%',padding:'0.75rem 0.9rem 0.75rem 2.5rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'white',fontSize:'0.84rem',fontFamily:'system-ui',outline:'none',boxSizing:'border-box'}}/>
            {query && <button onClick={()=>setQuery('')} style={{position:'absolute',right:'0.75rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.08)',border:'none',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white'}}>
              <X size={9}/>
            </button>}
          </div>
          {/* Brand pills */}
          <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
            <button onClick={()=>setSelectedBrand(null)}
              style={{padding:'0.3rem 0.75rem',borderRadius:999,border:'none',background:selectedBrand===null?'white':'rgba(255,255,255,0.07)',color:selectedBrand===null?'#0a0a0a':'rgba(255,255,255,0.5)',fontSize:'0.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',cursor:'pointer',transition:'all 150ms'}}>
              Tous
            </button>
            {brands.map(b=>(
              <button key={b} onClick={()=>setSelectedBrand(b===selectedBrand?null:b)}
                style={{padding:'0.3rem 0.75rem',borderRadius:999,border:'none',background:selectedBrand===b?'white':'rgba(255,255,255,0.07)',color:selectedBrand===b?'#0a0a0a':'rgba(255,255,255,0.5)',fontSize:'0.62rem',fontWeight:700,cursor:'pointer',transition:'all 150ms'}}>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div style={{flex:1,overflowY:'auto',padding:'0.75rem 1rem'}}>
          {results.length === 0 && (
            <div style={{textAlign:'center',padding:'3rem 1rem',opacity:0.35}}>
              <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1rem',textTransform:'uppercase',marginBottom:'0.4rem'}}>Aucun résultat</p>
              <p style={{fontSize:'0.72rem'}}>Essaie un autre modèle ou marque</p>
            </div>
          )}
          {results.map((d,i)=>(
            <div key={i} style={{
              display:'flex',alignItems:'flex-start',justifyContent:'space-between',
              padding:'0.85rem 1rem',
              marginBottom:'0.4rem',
              background:'rgba(255,255,255,0.025)',
              border:`1px solid ${d.esim ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)'}`,
              borderRadius:12,
            }}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.2rem',flexWrap:'wrap'}}>
                  <span style={{fontSize:'0.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',opacity:0.35}}>{d.brand}</span>
                  {d.dual && (
                    <span style={{fontSize:'0.5rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',background:'rgba(99,102,241,0.15)',color:'rgba(165,180,252,0.9)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:999,padding:'0.1rem 0.45rem'}}>Dual eSIM</span>
                  )}
                </div>
                <p style={{fontSize:'0.8rem',fontWeight:600,lineHeight:1.35,marginBottom: d.note ? '0.3rem' : 0}}>{d.model}</p>
                {d.note && <p style={{fontSize:'0.62rem',opacity:0.35,lineHeight:1.45,marginTop:'0.2rem'}}>{d.note}</p>}
              </div>
              <div style={{
                flexShrink:0,
                marginLeft:'1rem',
                display:'flex',alignItems:'center',gap:'0.35rem',
                padding:'0.35rem 0.7rem',
                borderRadius:999,
                background: d.esim ? 'rgba(34,197,94,0.1)' : 'rgba(248,113,113,0.08)',
                border: d.esim ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(248,113,113,0.15)',
              }}>
                {d.esim
                  ? <><Check size={10} style={{color:'#22c55e'}}/><span style={{fontSize:'0.58rem',fontWeight:700,color:'#4ade80',textTransform:'uppercase',letterSpacing:'0.1em'}}>Compatible</span></>
                  : <><X size={10} style={{color:'#f87171'}}/><span style={{fontSize:'0.58rem',fontWeight:700,color:'#f87171',textTransform:'uppercase',letterSpacing:'0.1em'}}>Non compatible</span></>
                }
              </div>
            </div>
          ))}
          {/* Info banner */}
          <div style={{marginTop:'0.75rem',padding:'1rem',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:12}}>
            <p style={{fontSize:'0.65rem',opacity:0.35,lineHeight:1.65}}>
              💡 <strong style={{opacity:0.7}}>Ton modèle n'est pas listé ?</strong> Vérifie dans les paramètres de ton téléphone si tu vois une option "Carte SIM numérique" ou "eSIM". Si oui, ton appareil est compatible.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DEMO PACKAGES (affiché quand l'API Airalo n'est pas encore active)
══════════════════════════════════════════════════════════════ */
const DEMO_PACKAGES: Pkg[] = [
  { id:'d1', package_id:'demo-1', data:'1 GB',    days:7,  price_eur:4.50,  network:'4G',   is_popular:false, is_unlimited:false },
  { id:'d2', package_id:'demo-2', data:'3 GB',    days:15, price_eur:9.00,  network:'4G',   is_popular:true,  is_unlimited:false },
  { id:'d3', package_id:'demo-3', data:'5 GB',    days:30, price_eur:14.50, network:'4G/5G',is_popular:false, is_unlimited:false },
  { id:'d4', package_id:'demo-4', data:'10 GB',   days:30, price_eur:24.00, network:'4G/5G',is_popular:false, is_unlimited:false },
  { id:'d5', package_id:'demo-5', data:'20 GB',   days:30, price_eur:39.00, network:'5G',   is_popular:false, is_unlimited:false },
  { id:'d6', package_id:'demo-6', data:'Illimité',days:7,  price_eur:18.00, network:'4G',   is_popular:false, is_unlimited:true  },
];

/* ══════════════════════════════════════════════════════════════
   PACKAGE DRAWER — slide in from right
══════════════════════════════════════════════════════════════ */
function PackageDrawer({
  country, onClose, onBuy,
}: { country: Country; onClose: () => void; onBuy: (p: Pkg) => void }) {
  const { format } = useCurrency();
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [hovered,  setHovered]  = useState<string|null>(null);
  const [fallback, setFallback] = useState<false|'regional'|'global'>(false);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(''); setFallback(false);
      try {
        const res  = await fetch(`/api/esim/packages?destination=${country.code}&limit=20`);
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Erreur');
        const pkgs = (json.packages as AiraloPackage[]).map(toDisplayPkg);
        if (json.fallback) setFallback(json.fallback);
        if (pkgs.length === 0) {
          // Show curated demo packages while Airalo account is being set up
          setPackages(DEMO_PACKAGES);
          setFallback('demo' as any);
        } else {
          setPackages(pkgs);
        }
      } catch(e:any) {
        setPackages(DEMO_PACKAGES);
        setFallback('demo' as any);
      } finally { setLoading(false); }
    }
    load();
  }, [country.code]);

  return (
    <>
      {/* overlay */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        onClick={onClose}
        style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',zIndex:140}}/>

      {/* drawer */}
      <motion.div
        initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}}
        transition={{type:'spring',damping:32,stiffness:300}}
        style={{
          position:'fixed', top:0, right:0, bottom:0,
          width:'min(480px, 100vw)',
          background:'#0d0d0d',
          borderLeft:'1px solid rgba(255,255,255,0.07)',
          zIndex:150,
          display:'flex', flexDirection:'column',
          overflow:'hidden',
        }}>

        {/* drawer header */}
        <div style={{
          padding:'1.5rem',
          borderBottom:'1px solid rgba(255,255,255,0.07)',
          display:'flex', alignItems:'center', gap:'1rem',
          background:'rgba(255,255,255,0.02)',
          flexShrink:0,
        }}>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'50%',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',flexShrink:0}}>
            <X size={15}/>
          </button>
          <div style={{display:'flex',alignItems:'center',gap:'0.85rem',flex:1}}>
            <div style={{width:44,height:30,borderRadius:7,overflow:'hidden',border:'1px solid rgba(255,255,255,0.12)',flexShrink:0,boxShadow:'0 4px 16px rgba(0,0,0,0.4)'}}>
              <img src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
            <div>
              <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.05rem',textTransform:'uppercase',letterSpacing:'0.04em'}}>{country.name}</p>
              <p style={{fontSize:'0.6rem',opacity:0.35,letterSpacing:'0.1em',textTransform:'uppercase'}}>
                {(fallback as string)==='demo' ? 'Aperçu des forfaits' : fallback === 'regional' ? '⚡ Forfaits régionaux' : fallback === 'global' ? '🌍 Forfaits mondiaux' : 'Forfaits eSIM disponibles'}
              </p>
            </div>
          </div>
        </div>

        {/* packages list */}
        <div style={{flex:1,overflowY:'auto',padding:'1.25rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
          {loading && Array.from({length:4}).map((_,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'1.1rem',height:90,animation:'pulse 1.5s ease-in-out infinite'}}/>
          ))}

          {fallback && !loading && (
            <div style={{
              background: (fallback as string)==='demo' ? 'rgba(251,191,36,0.05)' : fallback==='global' ? 'rgba(251,191,36,0.06)' : 'rgba(99,102,241,0.07)',
              border:`1px solid ${(fallback as string)==='demo'?'rgba(251,191,36,0.2)':fallback==='global'?'rgba(251,191,36,0.15)':'rgba(99,102,241,0.18)'}`,
              borderRadius:12, padding:'0.8rem 1rem', marginBottom:'0.5rem', display:'flex', alignItems:'flex-start', gap:'0.7rem'
            }}>
              <span style={{fontSize:'1rem',flexShrink:0}}>{(fallback as string)==='demo'?'⚠️':fallback==='global'?'🌍':'⚡'}</span>
              <p style={{fontSize:'0.68rem',lineHeight:1.6,opacity:0.75}}>
                {(fallback as string)==='demo'
                  ? 'Aperçu des forfaits disponibles — les prix réels seront affichés une fois la connexion Airalo activée.'
                  : fallback==='regional'
                    ? `Pas de forfait local spécifique à ${country.name} — voici les forfaits régionaux qui couvrent ce pays.`
                    : `Forfaits mondiaux disponibles pour ${country.name} — connexion dans 150+ pays incluse.`}
              </p>
            </div>
          )}

          {error && !loading && (
            <div style={{textAlign:'center',padding:'3rem 1rem',opacity:0.4}}>
              <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1rem',textTransform:'uppercase',marginBottom:'0.5rem'}}>Non disponible</p>
              <p style={{fontSize:'0.74rem',lineHeight:1.6}}>Aucun forfait eSIM pour cette destination pour le moment.</p>
            </div>
          )}

          {!loading && !error && packages.map(pkg => (
            <motion.div
              key={pkg.id}
              onMouseEnter={()=>setHovered(pkg.id)}
              onMouseLeave={()=>setHovered(null)}
              onClick={()=>onBuy(pkg)}
              initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
              style={{
                background: hovered===pkg.id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                border: pkg.is_popular ? '1.5px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.08)',
                borderRadius:14,
                padding:'1.1rem 1.25rem',
                cursor:'pointer',
                transition:'all 300ms cubic-bezier(0.32,0.72,0,1)',
                position:'relative',
                overflow:'hidden',
              }}>
              {pkg.is_popular && (
                <div style={{position:'absolute',top:0,right:0,background:'white',color:'#0a0a0a',fontSize:'0.5rem',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.18em',padding:'0.18rem 0.65rem',borderBottomLeftRadius:8}}>
                  POPULAIRE
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                {/* specs */}
                <div style={{display:'flex',gap:'1.25rem',alignItems:'center'}}>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.35rem',lineHeight:1,letterSpacing:'-0.01em'}}>{pkg.data}</p>
                    <p style={{fontSize:'0.52rem',opacity:0.35,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:'0.15rem'}}>données</p>
                  </div>
                  <div style={{width:1,height:28,background:'rgba(255,255,255,0.1)'}}/>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.2rem',lineHeight:1}}>{pkg.days}j</p>
                    <p style={{fontSize:'0.52rem',opacity:0.35,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:'0.15rem'}}>validité</p>
                  </div>
                  <div style={{width:1,height:28,background:'rgba(255,255,255,0.1)'}}/>
                  <div>
                    <p style={{fontSize:'0.68rem',fontWeight:600,opacity:0.7}}>{pkg.network}</p>
                    <p style={{fontSize:'0.52rem',opacity:0.35,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:'0.15rem'}}>réseau</p>
                  </div>
                </div>
                {/* price + buy */}
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'0.5rem'}}>
                  <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.3rem',lineHeight:1}}>{format(pkg.price_eur)}</p>
                  <button
                    onClick={e=>{e.stopPropagation();onBuy(pkg);}}
                    style={{
                      padding:'0.45rem 1rem',
                      background: hovered===pkg.id ? 'white' : 'transparent',
                      color: hovered===pkg.id ? '#0a0a0a' : 'white',
                      border:'1.5px solid rgba(255,255,255,0.3)',
                      borderRadius:8,
                      fontSize:'0.6rem',
                      fontWeight:700,
                      textTransform:'uppercase',
                      letterSpacing:'0.12em',
                      cursor:'pointer',
                      transition:'all 250ms cubic-bezier(0.32,0.72,0,1)',
                    }}>
                    Acheter
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* drawer footer info */}
        <div style={{padding:'1rem 1.5rem',borderTop:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
          <div style={{display:'flex',gap:'1.25rem',justifyContent:'center'}}>
            {[['✓ Activation immédiate'],['✓ Compatible iPhone XS+ & Android'],['✓ Sans engagement']].map(([t])=>(
              <p key={t} style={{fontSize:'0.6rem',opacity:0.35,textTransform:'uppercase',letterSpacing:'0.08em'}}>{t}</p>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   COUNTRY CARD
══════════════════════════════════════════════════════════════ */
function CountryCard({ country, onClick }: { country: Country; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHovered(true)}
      onMouseLeave={()=>setHovered(false)}
      onClick={onClick}
      style={{
        position:'relative',
        borderRadius:14,
        overflow:'hidden',
        cursor:'pointer',
        aspectRatio:'4/3',
        background:'#1a1a1a',
        border: hovered ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(255,255,255,0.07)',
        transition:'all 300ms cubic-bezier(0.32,0.72,0,1)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}>
      {/* flag bg */}
      <img
        src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
        alt=""
        style={{
          position:'absolute', inset:0,
          width:'100%', height:'100%',
          objectFit:'cover',
          opacity: hovered ? 0.45 : 0.3,
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          transition:'all 400ms cubic-bezier(0.32,0.72,0,1)',
        }}
      />
      {/* gradient overlay */}
      <div style={{position:'absolute',inset:0,background:'linear-gradient(180deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.85) 100%)'}}/>
      {/* content */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'0.85rem'}}>
        <p style={{
          fontFamily:"'Anton',sans-serif",
          fontSize:'0.82rem',
          textTransform:'uppercase',
          letterSpacing:'0.04em',
          lineHeight:1.1,
          color:'white',
          opacity: hovered ? 1 : 0.9,
        }}>{country.name}</p>
        <p style={{
          fontSize:'0.55rem',
          opacity: hovered ? 0.7 : 0.35,
          textTransform:'uppercase',
          letterSpacing:'0.12em',
          marginTop:'0.25rem',
          transition:'opacity 200ms',
          display:'flex',
          alignItems:'center',
          gap:'0.2rem',
        }}>
          Voir les forfaits {hovered && <ChevronRight size={9}/>}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function ConnectPage() {
  const [region,          setRegion]          = useState<typeof REGIONS[number]>('all');
  const [search,          setSearch]          = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country|null>(null);
  const [purchasePkg,     setPurchasePkg]     = useState<Pkg|null>(null);
  const [isMobile,        setIsMobile]        = useState(false);
  const [searchFocused,   setSearchFocused]   = useState(false);
  const [showCompat,      setShowCompat]      = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const browseRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const check = ()=>setIsMobile(window.innerWidth<640);
    check();
    window.addEventListener('resize',check);
    return ()=>window.removeEventListener('resize',check);
  },[]);

  // Close autocomplete on outside click
  useEffect(()=>{
    function handleClick(e: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return ()=>document.removeEventListener('mousedown', handleClick);
  },[]);

  const filtered = useMemo(()=>{
    let c = COUNTRIES;
    if (region !== 'all') c = c.filter(x=>x.region===region);
    if (search.trim()) {
      const q = search.toLowerCase();
      c = c.filter(x=>x.name.toLowerCase().includes(q));
    }
    return c;
  },[region,search]);

  // Autocomplete suggestions — shown in hero dropdown, max 6
  const suggestions = useMemo(()=>{
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return COUNTRIES.filter(x=>x.name.toLowerCase().includes(q)).slice(0,6);
  },[search]);

  const showSuggestions = searchFocused && suggestions.length > 0;

  const popular = useMemo(()=>COUNTRIES.filter(c=>c.popular).slice(0,8),[]);

  const handleBuy = useCallback((pkg: Pkg)=>{
    setPurchasePkg(pkg);
  },[]);

  return (
    <div style={{background:'#050505',minHeight:'100vh',color:'white',fontFamily:'system-ui,-apple-system,sans-serif',position:'relative',overflowX:'hidden'}}>

      {/* Grain — fixed, pointer-events none */}
      <div style={{backgroundImage:GRAIN,backgroundSize:'200px 200px',position:'fixed',inset:0,pointerEvents:'none',zIndex:1}}/>

      {/* Ambient orb — hero area only */}
      <div style={{position:'fixed',top:'-10%',left:'50%',transform:'translateX(-50%)',width:'70vw',height:'50vh',background:'radial-gradient(ellipse, rgba(99,102,241,0.09) 0%, rgba(139,92,246,0.05) 40%, transparent 70%)',pointerEvents:'none',zIndex:0}}/>

      {/* ── FLOATING NAV ─────────────────────────────────── */}
      <div style={{
        position:'sticky',top:0,zIndex:100,
        display:'flex',justifyContent:'center',
        padding: isMobile ? '0.6rem 0.75rem' : '0.85rem 1.5rem',
        pointerEvents:'none',
      }}>
        <nav style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          width:'100%',
          maxWidth:1100,
          padding: isMobile ? '0.7rem 1rem' : '0.8rem 1.25rem',
          background:'rgba(5,5,5,0.85)',
          backdropFilter:'blur(32px)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:999,
          pointerEvents:'all',
          boxShadow:'0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {/* left */}
          <a href="/" style={{display:'flex',alignItems:'center',gap:'0.45rem',color:'white',textDecoration:'none',opacity:0.55,fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',transition:'opacity 200ms'}}
            onMouseEnter={e=>(e.currentTarget.style.opacity='1')} onMouseLeave={e=>(e.currentTarget.style.opacity='0.55')}>
            <ArrowLeft size={12} strokeWidth={2.5}/> PIETRI
          </a>

          {/* center — logo */}
          <div style={{display:'flex',alignItems:'center',gap:'0.55rem',position:'absolute',left:'50%',transform:'translateX(-50%)'}}>
            <div style={{
              width:30,height:30,borderRadius:8,
              background:'rgba(255,255,255,0.07)',
              border:'1px solid rgba(255,255,255,0.12)',
              display:'flex',alignItems:'center',justifyContent:'center',
            }}>
              <GlobeLogo size={17}/>
            </div>
            {!isMobile && (
              <div>
                <span style={{fontFamily:"'Anton',sans-serif",fontSize:'0.92rem',letterSpacing:'0.1em',textTransform:'uppercase'}}>
                  PIETRI <span style={{opacity:0.45}}>CONNECT</span>
                </span>
              </div>
            )}
          </div>

          {/* right — auth */}
          <div style={{display:'flex',alignItems:'center',gap:isMobile?'0.4rem':'0.65rem'}}>
            {!isMobile && (
              <a href="/connect/auth" style={{display:'flex',alignItems:'center',gap:'0.3rem',color:'white',textDecoration:'none',opacity:0.5,fontSize:'0.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',transition:'opacity 200ms'}}
                onMouseEnter={e=>((e.currentTarget as HTMLElement).style.opacity='1')} onMouseLeave={e=>((e.currentTarget as HTMLElement).style.opacity='0.5')}>
                <LogIn size={12} strokeWidth={2}/> Connexion
              </a>
            )}
            <a href="/connect/compte" style={{display:'flex',alignItems:'center',gap:'0.3rem',padding:isMobile?'0.4rem':'0.38rem 0.85rem',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.14)',borderRadius:999,color:'white',textDecoration:'none',fontSize:'0.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',transition:'all 200ms'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.14)';}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)';}}>
              <User size={12} strokeWidth={2}/>{!isMobile && ' Mon compte'}
            </a>
          </div>
        </nav>
      </div>

      <div style={{position:'relative',zIndex:2}}>

        {/* ── HERO ────────────────────────────────────────── */}
        <section style={{textAlign:'center',padding: isMobile ? '3rem 1.5rem 4rem' : '5rem 2rem 6rem',minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.8,ease:[0.32,0.72,0,1]}}>

            {/* eyebrow */}
            <div style={{display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:999,padding:'0.3rem 0.9rem',fontSize:'0.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.18em',color:'rgba(255,255,255,0.6)',marginBottom:'1.75rem'}}>
              <GlobeLogo size={12}/> eSIM · {COUNTRIES.length}+ destinations
            </div>

            {/* headline */}
            <h1 style={{
              fontFamily:"'Anton',sans-serif",
              fontSize: isMobile ? '3rem' : 'clamp(3.5rem,9vw,7rem)',
              textTransform:'uppercase',
              letterSpacing:'-0.02em',
              lineHeight:0.9,
              marginBottom:'1.5rem',
              background:'linear-gradient(180deg,rgba(255,255,255,1) 60%,rgba(255,255,255,0.4) 100%)',
              WebkitBackgroundClip:'text',
              WebkitTextFillColor:'transparent',
            }}>
              L'eSIM qui<br/>voyage avec toi
            </h1>

            <p style={{fontSize:isMobile?'0.88rem':'1rem',opacity:0.45,maxWidth:460,margin:'0 auto 3rem',lineHeight:1.8,fontWeight:400}}>
              Connexion premium dans 200+ pays. Activation en 2 minutes,<br/>
              sans carte SIM, sans roaming surprise.
            </p>

            {/* search box */}
            <div ref={searchBoxRef} style={{
              position:'relative',
              maxWidth:480,
              margin:'0 auto 2rem',
            }}>
              <div style={{
                background: searchFocused ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: searchFocused ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: showSuggestions ? '14px 14px 0 0' : 14,
                padding:'0.2rem',
                boxShadow:'0 0 0 1px rgba(255,255,255,0.04) inset',
                transition:'border-color 200ms, border-radius 100ms',
              }}>
                <div style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem 1rem'}}>
                  <Search size={16} style={{opacity: searchFocused ? 0.6 : 0.35, flexShrink:0, transition:'opacity 200ms'}}/>
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Recherche ta destination…"
                    value={search}
                    onChange={e=>setSearch(e.target.value)}
                    onFocus={()=>setSearchFocused(true)}
                    onKeyDown={e=>{
                      if (e.key==='Escape') { setSearchFocused(false); searchRef.current?.blur(); }
                      if (e.key==='Enter' && suggestions.length===1) {
                        setSelectedCountry(suggestions[0]);
                        setSearch(''); setSearchFocused(false);
                      }
                    }}
                    style={{flex:1,background:'transparent',border:'none',outline:'none',color:'white',fontSize:'0.9rem',fontFamily:'system-ui',letterSpacing:'0.01em'}}
                  />
                  {search && (
                    <button onClick={()=>{setSearch('');setSearchFocused(false);}} style={{background:'rgba(255,255,255,0.08)',border:'none',borderRadius:'50%',width:22,height:22,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'white',flexShrink:0}}>
                      <X size={11}/>
                    </button>
                  )}
                </div>
              </div>

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{opacity:0, y:-4}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-4}}
                    transition={{duration:0.15, ease:'easeOut'}}
                    style={{
                      position:'absolute', top:'100%', left:0, right:0,
                      background:'#111',
                      border:'1px solid rgba(255,255,255,0.14)',
                      borderTop:'1px solid rgba(255,255,255,0.06)',
                      borderRadius:'0 0 14px 14px',
                      overflow:'hidden',
                      zIndex:50,
                      boxShadow:'0 16px 40px rgba(0,0,0,0.6)',
                    }}>
                    {suggestions.map((c, i)=>(
                      <button
                        key={c.code}
                        onMouseDown={e=>{
                          e.preventDefault(); // prevent blur before click
                          setSelectedCountry(c);
                          setSearch('');
                          setSearchFocused(false);
                        }}
                        style={{
                          width:'100%',
                          display:'flex',
                          alignItems:'center',
                          gap:'0.85rem',
                          padding:'0.75rem 1.2rem',
                          background:'transparent',
                          border:'none',
                          borderTop: i>0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                          color:'white',
                          cursor:'pointer',
                          textAlign:'left',
                          transition:'background 150ms',
                        }}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.07)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='transparent')}
                      >
                        <img src={`https://flagcdn.com/${c.code.toLowerCase()}.svg`} alt="" style={{width:24,height:16,objectFit:'cover',borderRadius:3,flexShrink:0,border:'1px solid rgba(255,255,255,0.1)'}}/>
                        <span style={{fontSize:'0.85rem',fontWeight:600,letterSpacing:'0.01em'}}>{c.name}</span>
                        <span style={{marginLeft:'auto',fontSize:'0.58rem',opacity:0.3,textTransform:'uppercase',letterSpacing:'0.14em'}}>{REGION_LABELS[c.region]}</span>
                        <ChevronRight size={12} style={{opacity:0.3, flexShrink:0}}/>
                      </button>
                    ))}
                    {/* "See all results" row if more than 6 */}
                    {COUNTRIES.filter(x=>x.name.toLowerCase().includes(search.toLowerCase())).length > 6 && (
                      <button
                        onMouseDown={e=>{
                          e.preventDefault();
                          setSearchFocused(false);
                          browseRef.current?.scrollIntoView({behavior:'smooth',block:'start'});
                        }}
                        style={{width:'100%',padding:'0.6rem 1.2rem',background:'rgba(255,255,255,0.03)',border:'none',borderTop:'1px solid rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.35)',fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',cursor:'pointer',textAlign:'center',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.4rem'}}
                        onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')}
                        onMouseLeave={e=>(e.currentTarget.style.background='rgba(255,255,255,0.03)')}>
                        Voir tous les résultats <ArrowRight size={11}/>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* popular quick-picks */}
            <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem',justifyContent:'center',maxWidth:560,margin:'0 auto'}}>
              {['CI','FR','US','AE','JP','GB','SN','MA'].map(code=>{
                const c = COUNTRIES.find(x=>x.code===code);
                if (!c) return null;
                return (
                  <button key={code} onClick={()=>setSelectedCountry(c)}
                    style={{display:'flex',alignItems:'center',gap:'0.45rem',padding:'0.38rem 0.85rem',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:999,fontSize:'0.68rem',fontWeight:600,color:'rgba(255,255,255,0.65)',cursor:'pointer',transition:'all 200ms cubic-bezier(0.32,0.72,0,1)',letterSpacing:'0.04em'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.1)';(e.currentTarget as HTMLElement).style.color='white';}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)';(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.65)';}}>
                    <img src={`https://flagcdn.com/${code.toLowerCase()}.svg`} alt="" style={{width:16,height:11,objectFit:'cover',borderRadius:2}}/>
                    {c.name}
                  </button>
                );
              })}
            </div>

            {/* eSIM compatibility check CTA */}
            <div style={{marginTop:'1.75rem'}}>
              <button onClick={()=>setShowCompat(true)}
                style={{display:'inline-flex',alignItems:'center',gap:'0.55rem',padding:'0.55rem 1.25rem',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:999,color:'rgba(255,255,255,0.55)',fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',cursor:'pointer',transition:'all 200ms cubic-bezier(0.32,0.72,0,1)'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.07)';(e.currentTarget as HTMLElement).style.color='white';(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.2)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.03)';(e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.55)';(e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)';}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="5" y="2" width="14" height="20" rx="3"/><path d="M12 18h.01"/>
                </svg>
                Mon téléphone est-il compatible eSIM ?
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── STATS ───────────────────────────────────────── */}
        <section style={{maxWidth:1100,margin:'0 auto',padding:'0 2rem 5rem'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'rgba(255,255,255,0.05)',borderRadius:16,overflow:'hidden',border:'1px solid rgba(255,255,255,0.06)'}}>
            {[
              {v:COUNTRIES.length+'+', l:'Destinations'},
              {v:'2 min',              l:'Activation'},
              {v:'4G/5G',             l:'Réseau premium'},
            ].map((s,i)=>(
              <div key={i} style={{padding:'1.5rem 1rem',background:'#0d0d0d',textAlign:'center',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.35rem'}}>
                <p style={{fontFamily:"'Anton',sans-serif",fontSize:isMobile?'1.6rem':'2rem',letterSpacing:'-0.01em',lineHeight:1}}>{s.v}</p>
                <p style={{fontSize:'0.58rem',opacity:0.35,textTransform:'uppercase',letterSpacing:'0.18em'}}>{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── POPULAR ─────────────────────────────────────── */}
        <section style={{maxWidth:1400,margin:'0 auto',padding:'0 2rem 5rem'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:'1.75rem'}}>
            <div>
              <p style={{fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',opacity:0.35,marginBottom:'0.4rem'}}>Destinations populaires</p>
              <h2 style={{fontFamily:"'Anton',sans-serif",fontSize:isMobile?'1.6rem':'clamp(1.75rem,3.5vw,2.25rem)',textTransform:'uppercase',letterSpacing:'-0.01em',lineHeight:1}}>
                Les plus demandées
              </h2>
            </div>
            <button onClick={()=>browseRef.current?.scrollIntoView({behavior:'smooth'})} style={{display:'flex',alignItems:'center',gap:'0.4rem',fontSize:'0.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',color:'white',opacity:0.45,background:'none',border:'none',cursor:'pointer',transition:'opacity 200ms'}}
              onMouseEnter={e=>((e.currentTarget as HTMLElement).style.opacity='1')} onMouseLeave={e=>((e.currentTarget as HTMLElement).style.opacity='0.45')}>
              Tout voir <ArrowRight size={13} strokeWidth={2}/>
            </button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?'140px':'180px'},1fr))`,gap:'0.75rem'}}>
            {popular.map((c,i)=>(
              <motion.div key={c.code} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.05,duration:0.5,ease:[0.32,0.72,0,1]}}>
                <CountryCard country={c} onClick={()=>setSelectedCountry(c)}/>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ALL DESTINATIONS BROWSER ─────────────────────── */}
        <section ref={browseRef} style={{maxWidth:1400,margin:'0 auto',padding:'0 2rem 6rem'}}>
          <div style={{marginBottom:'2rem'}}>
            <p style={{fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',opacity:0.35,marginBottom:'0.4rem'}}>Catalogue complet</p>
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem'}}>
              <h2 style={{fontFamily:"'Anton',sans-serif",fontSize:isMobile?'1.6rem':'clamp(1.75rem,3.5vw,2.25rem)',textTransform:'uppercase',letterSpacing:'-0.01em',lineHeight:1}}>
                {filtered.length} destination{filtered.length>1?'s':''}
              </h2>
              {/* region tabs */}
              <div style={{display:'flex',gap:'0.35rem',flexWrap:'wrap'}}>
                {REGIONS.map(r=>(
                  <button key={r} onClick={()=>setRegion(r)}
                    style={{
                      padding:'0.38rem 0.8rem',
                      background: region===r ? 'white' : 'rgba(255,255,255,0.05)',
                      color: region===r ? '#050505' : 'rgba(255,255,255,0.5)',
                      border: region===r ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius:999,
                      fontSize:'0.6rem',
                      fontWeight:700,
                      textTransform:'uppercase',
                      letterSpacing:'0.1em',
                      cursor:'pointer',
                      transition:'all 200ms cubic-bezier(0.32,0.72,0,1)',
                    }}>
                    {REGION_LABELS[r]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* grid */}
          <div style={{display:'grid',gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?'130px':'160px'},1fr))`,gap:'0.65rem'}}>
            <AnimatePresence mode="popLayout">
              {filtered.map((c,i)=>(
                <motion.div key={c.code}
                  layout
                  initial={{opacity:0,scale:0.94}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.94}}
                  transition={{delay:Math.min(i,15)*0.025,duration:0.35,ease:[0.32,0.72,0,1]}}>
                  <CountryCard country={c} onClick={()=>setSelectedCountry(c)}/>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length===0 && (
              <div style={{gridColumn:'1/-1',textAlign:'center',padding:'4rem 0',opacity:0.3}}>
                <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.2rem',textTransform:'uppercase',marginBottom:'0.5rem'}}>Aucun résultat</p>
                <p style={{fontSize:'0.76rem'}}>Essaie un autre nom ou filtre</p>
              </div>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────── */}
        <section style={{maxWidth:1100,margin:'0 auto',padding:'0 2rem 6rem'}}>
          <div style={{
            background:'rgba(255,255,255,0.02)',
            border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:20,
            overflow:'hidden',
          }}>
            <div style={{padding:'2rem 2rem 0',borderBottom:'1px solid rgba(255,255,255,0.06)',paddingBottom:'1.5rem'}}>
              <p style={{fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',opacity:0.35,marginBottom:'0.35rem'}}>Comment ça marche</p>
              <h2 style={{fontFamily:"'Anton',sans-serif",fontSize:isMobile?'1.5rem':'clamp(1.5rem,3vw,2rem)',textTransform:'uppercase',letterSpacing:'-0.01em'}}>
                Connecté en 3 étapes
              </h2>
            </div>
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)'}}>
              {[
                {n:'01', title:'Choisis ta destination', desc:'Navigue parmi 200+ pays et sélectionne ton forfait data.', icon:(
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9.5"/><path d="M12 2.5c-3.5 3-5 6-5 9.5s1.5 6.5 5 9.5M12 2.5c3.5 3 5 6 5 9.5s-1.5 6.5-5 9.5M2.5 12h19"/>
                  </svg>
                )},
                {n:'02', title:'Paie en 1 clic', desc:'MTN MoMo, Orange Money ou carte bancaire. Rapide et sécurisé.', icon:(
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/>
                  </svg>
                )},
                {n:'03', title:'Active ton eSIM', desc:'Scanne le QR code. Connexion immédiate, aucune SIM physique.', icon:(
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                    <path d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M14 21h2"/>
                  </svg>
                )},
              ].map((s,i)=>(
                <div key={s.n} style={{padding:'1.75rem 2rem',borderLeft: i>0&&!isMobile ? '1px solid rgba(255,255,255,0.06)' : 'none', borderTop: i>0&&isMobile ? '1px solid rgba(255,255,255,0.06)' : 'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1rem'}}>
                    <span style={{fontFamily:"'Anton',sans-serif",fontSize:'0.65rem',opacity:0.2,letterSpacing:'0.12em'}}>{s.n}</span>
                    <div style={{width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',opacity:0.7}}>
                      {s.icon}
                    </div>
                  </div>
                  <p style={{fontWeight:700,fontSize:'0.82rem',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'0.4rem'}}>{s.title}</p>
                  <p style={{fontSize:'0.72rem',opacity:0.4,lineHeight:1.65}}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ───────────────────────────────────── */}
        <section style={{maxWidth:1100,margin:'0 auto',padding:'0 2rem 8rem'}}>
          <div style={{
            position:'relative',
            background:'#0d0d0d',
            border:'1px solid rgba(255,255,255,0.07)',
            borderRadius:20,
            padding: isMobile ? '3rem 1.5rem' : '4rem',
            textAlign:'center',
            overflow:'hidden',
          }}>
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'60%',height:'200%',background:'radial-gradient(ellipse,rgba(99,102,241,0.06) 0%,transparent 65%)',pointerEvents:'none'}}/>
            <div style={{position:'relative'}}>
              <div style={{width:52,height:52,borderRadius:14,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.75rem',boxShadow:'0 1px 0 rgba(255,255,255,0.06) inset'}}>
                <GlobeLogo size={24}/>
              </div>
              <h2 style={{fontFamily:"'Anton',sans-serif",fontSize:isMobile?'2rem':'clamp(2rem,5vw,3.5rem)',textTransform:'uppercase',letterSpacing:'-0.01em',lineHeight:0.95,marginBottom:'1rem',background:'linear-gradient(180deg,rgba(255,255,255,1) 50%,rgba(255,255,255,0.45) 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                Prêt à partir<br/>sans roaming ?
              </h2>
              <p style={{opacity:0.4,fontSize:'0.88rem',lineHeight:1.75,maxWidth:400,margin:'0 auto 2.25rem'}}>
                Abidjan → Paris → Dubaï → Tokyo.<br/>PIETRI CONNECT t'accompagne partout.
              </p>
              <button
                onClick={()=>searchRef.current?.focus()}
                style={{display:'inline-flex',alignItems:'center',gap:'0.6rem',padding:'0.95rem 2.25rem',background:'white',color:'#050505',border:'none',borderRadius:999,fontWeight:700,fontSize:'0.78rem',textTransform:'uppercase',letterSpacing:'0.14em',cursor:'pointer',transition:'opacity 200ms cubic-bezier(0.32,0.72,0,1)',boxShadow:'0 8px 32px rgba(255,255,255,0.08)'}}
                onMouseEnter={e=>((e.currentTarget as HTMLElement).style.opacity='0.85')}
                onMouseLeave={e=>((e.currentTarget as HTMLElement).style.opacity='1')}>
                Choisir ma destination
                <div style={{width:24,height:24,borderRadius:'50%',background:'rgba(5,5,5,0.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <ArrowRight size={13} strokeWidth={2.5}/>
                </div>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── PACKAGE DRAWER ───────────────────────────────── */}
      <AnimatePresence>
        {selectedCountry && !purchasePkg && (
          <PackageDrawer
            country={selectedCountry}
            onClose={()=>setSelectedCountry(null)}
            onBuy={pkg=>{ setPurchasePkg(pkg); }}
          />
        )}
      </AnimatePresence>

      {/* ── PURCHASE MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {purchasePkg && selectedCountry && (
          <PurchaseModal
            pkg={purchasePkg}
            country={selectedCountry}
            onClose={()=>{ setPurchasePkg(null); setSelectedCountry(null); }}
          />
        )}
      </AnimatePresence>

      {/* ── COMPATIBILITY MODAL ──────────────────────────── */}
      <AnimatePresence>
        {showCompat && (
          <CompatibilityModal onClose={()=>setShowCompat(false)}/>
        )}
      </AnimatePresence>

      {/* pulse animation for skeletons */}
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
      `}</style>
    </div>
  );
}

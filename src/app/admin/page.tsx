'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MiniChart } from '@/components/ui/mini-chart';

/* ── SVG ICONS (line style, currentColor) ──────────────────── */
const IcoHome   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
const IcoBox    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IcoShirt  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></svg>;
const IcoPen    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const IcoShare  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const IcoImage  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>;
const IcoSearch = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoSpark  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z"/></svg>;
const IcoSliders= () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="6" x2="8" y2="3"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="10" y1="12" x2="10" y2="9"/><line x1="4" y1="18" x2="20" y2="18"/><line x1="16" y1="18" x2="16" y2="15"/></svg>;
const IcoGlobe  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
const IcoChart  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
const IcoCpu    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
const IcoDb     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>;
const IcoZap    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>;
const IcoCard   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const IcoPalette= () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>;
const IcoUsers  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
const IcoMail   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IcoPhone  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
// ⚠️  Set NEXT_PUBLIC_ADMIN_SECRET in your .env.local — never hardcode here
const ADMIN_PWD = process.env.NEXT_PUBLIC_ADMIN_SECRET ?? '';
const ADMIN_HDR = { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_PWD };

/* ── CATALOGUE ─────────────────────────────────────────────── */
const PRODUCTS = [
  { slug: 'floral-hoodie', name: 'FLORAL HOODIE', price: 89, img: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png' },
  { slug: 'koala-tee',     name: 'KOALA TEE',     price: 49, img: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png' },
  { slug: 'floral-tee',    name: 'FLORAL TEE',    price: 59, img: '/char-hoodie.png' },
  { slug: 'signature',     name: 'SIGNATURE',     price: 79, img: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png' },
  { slug: 'robe-florale',  name: 'ROBE FLORALE',  price: 69, img: '/char-robe.png' },
];
const BLOG_TOPICS = [
  { slug: 'streetwear-culture-africaine', label: 'Streetwear & culture africaine' },
  { slug: 'guide-tailles-hoodie-oversize', label: 'Guide tailles hoodie' },
  { slug: 'drops-limites-pietri',         label: 'Éditions limitées PIETRI' },
  { slug: 'mode-abidjan-paris',           label: 'Abidjan-Paris : le pont mode' },
  { slug: 'broderie-artisanale-streetwear', label: 'Broderie artisanale' },
];

/* ── COULEURS / STATUS ─────────────────────────────────────── */
const STATUS_COLOR: Record<string,string> = { pending:'#facc15', confirmed:'#60a5fa', shipped:'#a78bfa', delivered:'#34d399', cancelled:'#f87171', paid:'#34d399', failed:'#f87171' };
const STATUS_LBL: Record<string,string>   = { pending:'En attente', confirmed:'Confirmée', shipped:'Expédiée', delivered:'Livrée', cancelled:'Annulée', paid:'Payé', failed:'Échoué' };

/* ── SVG LOGOS RÉSEAUX SOCIAUX ─────────────────────────────── */
function IgLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <defs><linearGradient id="ig" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/><stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs>
      <rect width="24" height="24" rx="6" fill="url(#ig)"/>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
    </svg>
  );
}
function FbLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#1877f2"/>
      <path d="M16 4h-2.5C11.6 4 10 5.6 10 7.8V10H7v3h3v8h3.5v-8H16l.5-3h-3V8c0-.8.4-1 1-1H16V4z" fill="white"/>
    </svg>
  );
}
function TtLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#010101"/>
      <path d="M19 7.5c-1.3-.1-2.4-1-2.8-2.2h-2.1v9.7c0 1.1-.9 2-2.1 2s-2.1-.9-2.1-2 .9-2 2.1-2c.2 0 .4 0 .6.1V10.8c-.2 0-.4-.1-.6-.1-2.5 0-4.5 2-4.5 4.5S9.5 19.7 12 19.7s4.5-2 4.5-4.5V10c.9.5 2 .8 3 .9V8.3c-.2 0-.4-.5-.5-.8z" fill="white"/>
    </svg>
  );
}
function XLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#000"/>
      <path d="M17.8 4h-2.7L12 8.6 8.9 4H3.8l5.5 7.9-5.5 8h2.7L9.8 15l3.4 5H18l-5.6-8.1L17.8 4z" fill="white"/>
    </svg>
  );
}
const PLATFORM_LOGO: Record<string, React.ReactNode> = {
  instagram: <IgLogo/>, facebook: <FbLogo/>, tiktok: <TtLogo/>, x: <XLogo/>
};
const PLATFORM_NAME: Record<string,string> = { instagram:'Instagram', facebook:'Facebook', tiktok:'TikTok', x:'X (Twitter)' };
const PLATFORM_COLOR: Record<string,string> = { instagram:'#e1306c', facebook:'#1877f2', tiktok:'#ffffff', x:'#ffffff' };

/* ── HELPERS UI ────────────────────────────────────────────── */
type Section = 'dashboard'|'analytics'|'commandes'|'produits'|'blog'|'social'|'medias'|'seo'|'agent'|'email_agent'|'sql_chat'|'membres'|'newsletter'|'sms'|'ceo'|'negotiations'|'parametres';
const NAV: {id:Section; label:string; icon:React.ReactNode}[] = [
  {id:'dashboard',  label:'Accueil',         icon:<IcoHome/>},
  {id:'analytics',  label:'Analytics',       icon:<IcoChart/>},
  {id:'commandes',  label:'Commandes',        icon:<IcoBox/>},
  {id:'membres',    label:'Membres',          icon:<IcoUsers/>},
  {id:'newsletter', label:'Newsletter',       icon:<IcoMail/>},
  {id:'sms',        label:'SMS',              icon:<IcoPhone/>},
  {id:'produits',   label:'Produits',         icon:<IcoShirt/>},
  {id:'blog',       label:'Blog',             icon:<IcoPen/>},
  {id:'social',     label:'Réseaux Sociaux',  icon:<IcoShare/>},
  {id:'medias',     label:'Médias',           icon:<IcoImage/>},
  {id:'seo',        label:'SEO',              icon:<IcoSearch/>},
  {id:'ceo',        label:'CEO Agent',        icon:<IcoCpu/>},
  {id:'negotiations',label:'Négociations',    icon:<IcoCard/>},
  {id:'agent',      label:'Agent IA',         icon:<IcoSpark/>},
  {id:'email_agent',label:'Email Agent',      icon:<IcoZap/>},
  {id:'sql_chat',   label:'SQL Chat',         icon:<IcoDb/>},
  {id:'parametres', label:'Paramètres',       icon:<IcoSliders/>},
];

function Badge({label,color}:{label:string;color:string}) {
  return <span style={{fontSize:'0.58rem',fontWeight:700,padding:'0.18rem 0.55rem',borderRadius:999,background:color+'22',color,border:`1px solid ${color}44`,textTransform:'uppercase',letterSpacing:'0.07em'}}>{label}</span>;
}
function Btn({onClick,loading,children,variant='primary',small}:{onClick:()=>void;loading?:boolean;children:React.ReactNode;variant?:'primary'|'ghost'|'danger';small?:boolean}) {
  const bg = variant==='primary'?'white':variant==='danger'?'#f87171':'rgba(255,255,255,0.08)';
  const col = variant==='primary'?'black':variant==='danger'?'white':'rgba(255,255,255,0.8)';
  return <button onClick={onClick} disabled={!!loading} style={{background:loading?'rgba(255,255,255,0.08)':bg,color:col,border:'none',borderRadius:999,padding:small?'0.32rem 0.85rem':'0.5rem 1.2rem',fontSize:small?'0.62rem':'0.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',cursor:loading?'not-allowed':'pointer',opacity:loading?.5:1,whiteSpace:'nowrap'}}>{loading?'…':children}</button>;
}
function CopyBtn({text}:{text:string}) {
  const [ok,setOk]=useState(false);
  return <Btn onClick={()=>{navigator.clipboard.writeText(text).then(()=>{setOk(true);setTimeout(()=>setOk(false),2000);});}} small variant="ghost">{ok?'✓ Copié !':'📋 Copier'}</Btn>;
}
function Card({children,style}:{children:React.ReactNode;style?:React.CSSProperties}) {
  return <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'1.25rem 1.5rem',...style}}>{children}</div>;
}
function SectionTitle({children}:{children:React.ReactNode}) {
  return <h2 style={{fontFamily:"'Anton',sans-serif",fontSize:'clamp(1.2rem,4vw,1.75rem)',textTransform:'uppercase',letterSpacing:'0.02em',marginBottom:'1.5rem'}}>{children}</h2>;
}
function StatCard({label,value,sub}:{label:string;value:string|number;sub?:string}) {
  return <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'1.25rem 1.5rem'}}><p style={{fontSize:'0.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.18em',opacity:.4,marginBottom:'.4rem'}}>{label}</p><p style={{fontFamily:"'Anton',sans-serif",fontSize:'2rem'}}>{value}</p>{sub&&<p style={{fontSize:'0.62rem',opacity:.35,marginTop:'.2rem'}}>{sub}</p>}</div>;
}

/* ── DASHBOARD ─────────────────────────────────────────────── */
function Dashboard({onNav}:{onNav:(s:Section)=>void}) {
  const [stats,setStats]=useState({orders:0,revenue:0,blog:0,social:0,members:0,subscribers:0});
  const [orders,setOrders]=useState<any[]>([]);
  const [blog,setBlog]=useState<any[]>([]);
  useEffect(()=>{
    async function load() {
      const [{count:oCount},{data:oData},{count:bCount},{data:bData},{count:sCount},{count:membersCount},{count:subCount}]=await Promise.all([
        sb.from('orders').select('*',{count:'exact',head:true}),
        sb.from('orders').select('id,customer_name,product_name,total_amount,status,created_at').order('created_at',{ascending:false}).limit(5),
        sb.from('blog_posts').select('*',{count:'exact',head:true}).eq('published',true),
        sb.from('blog_posts').select('slug,title,created_at').eq('published',true).order('created_at',{ascending:false}).limit(3),
        sb.from('social_queue').select('*',{count:'exact',head:true}).eq('status','pending'),
        sb.from('profiles').select('*',{count:'exact',head:true}),
        sb.from('newsletter_subscribers').select('*',{count:'exact',head:true}).eq('status','active'),
      ]);
      const {data:rev}=await sb.from('orders').select('total_amount').eq('payment_status','paid');
      const total=(rev||[]).reduce((s:number,r:any)=>s+(r.total_amount||0),0);
      setStats({orders:oCount||0,revenue:total,blog:bCount||0,social:sCount||0,members:membersCount||0,subscribers:subCount||0});
      setOrders(oData||[]); setBlog(bData||[]);
    }
    load();
  },[]);
  return (
    <div>
      <SectionTitle>Vue d'ensemble</SectionTitle>
      <div className="stat-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'2rem'}}>
        <StatCard label="Commandes" value={stats.orders}/>
        <StatCard label="Chiffre d'affaires" value={`${stats.revenue.toFixed(0)} €`} sub="paiements confirmés"/>
        <StatCard label="Membres" value={stats.members} sub="comptes créés"/>
        <StatCard label="Newsletter" value={stats.subscribers} sub="abonnés actifs"/>
        <StatCard label="Articles blog" value={stats.blog} sub="publiés"/>
        <StatCard label="Posts en attente" value={stats.social} sub="à publier"/>
      </div>
      <Card style={{marginBottom:'1.25rem'}}>
        <p style={{fontSize:'0.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'1rem'}}>Dernières commandes</p>
        {orders.length===0?<p style={{opacity:.3,fontSize:'.8rem',textAlign:'center',padding:'1rem 0'}}>Aucune commande pour l'instant</p>:
          orders.map(o=>(
            <div key={o.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.5rem',marginBottom:'.75rem'}}>
              <div><p style={{fontSize:'.82rem',fontWeight:600}}>{o.customer_name||'Anonyme'}</p><p style={{fontSize:'.65rem',opacity:.4}}>{o.product_name}</p></div>
              <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}><span style={{fontSize:'.8rem',fontWeight:700}}>{o.total_amount} €</span><Badge label={STATUS_LBL[o.status]||o.status} color={STATUS_COLOR[o.status]||'#888'}/></div>
            </div>
          ))
        }
        {orders.length>0&&<button onClick={()=>onNav('commandes')} style={{fontSize:'.65rem',opacity:.4,background:'none',border:'none',color:'white',cursor:'pointer',padding:0,marginTop:'.5rem'}}>Voir toutes →</button>}
      </Card>
      <Card>
        <p style={{fontSize:'0.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'1rem'}}>Derniers articles</p>
        {blog.length===0?<p style={{opacity:.3,fontSize:'.8rem',textAlign:'center',padding:'1rem 0'}}>Aucun article — génère-en dans Blog</p>:
          blog.map(p=>(
            <div key={p.slug} style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'.5rem',marginBottom:'.6rem'}}>
              <p style={{fontSize:'.82rem',fontWeight:600,flex:1}}>{p.title}</p>
              <a href={`/blog/${p.slug}`} target="_blank" style={{fontSize:'.65rem',color:'rgba(255,255,255,.4)',textDecoration:'none',whiteSpace:'nowrap'}}>Voir →</a>
            </div>
          ))
        }
        {blog.length>0&&<button onClick={()=>onNav('blog')} style={{fontSize:'.65rem',opacity:.4,background:'none',border:'none',color:'white',cursor:'pointer',padding:0,marginTop:'.5rem'}}>Gérer le blog →</button>}
      </Card>
    </div>
  );
}

/* ── COMMANDES ─────────────────────────────────────────────── */
function Commandes() {
  const [orders,setOrders]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{sb.from('orders').select('*').order('created_at',{ascending:false}).then(({data})=>{setOrders(data||[]);setLoading(false);});},[]);
  async function upd(id:string,field:string,val:string){
    await sb.from('orders').update({[field]:val,updated_at:new Date().toISOString()}).eq('id',id);
    setOrders(p=>p.map(o=>o.id===id?{...o,[field]:val}:o));
  }
  if(loading) return <p style={{opacity:.4}}>Chargement…</p>;
  return (
    <div>
      <SectionTitle>Commandes ({orders.length})</SectionTitle>
      {orders.length===0?<Card><p style={{opacity:.3,textAlign:'center',padding:'3rem',fontSize:'.85rem'}}>Aucune commande. Elles apparaîtront ici dès que les clients achèteront.</p></Card>:
        <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
          {orders.map(o=>(
            <Card key={o.id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'.75rem',marginBottom:'.75rem'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.2rem'}}>
                    <p style={{fontWeight:700,fontSize:'.9rem'}}>{o.customer_name||'Anonyme'}</p>
                    <Badge label={STATUS_LBL[o.status]||o.status} color={STATUS_COLOR[o.status]||'#888'}/>
                  </div>
                  <p style={{fontSize:'.75rem',opacity:.5}}>{o.product_name}{o.size?` · Taille ${o.size}`:''} · Qté {o.quantity||1}</p>
                  {o.customer_email&&<p style={{fontSize:'.62rem',opacity:.3,marginTop:'.2rem'}}>✉️ {o.customer_email}{o.customer_phone?` · 📞 ${o.customer_phone}`:''}</p>}
                  {o.shipping_address&&<p style={{fontSize:'.62rem',opacity:.3}}>📍 {o.shipping_address}</p>}
                </div>
                <div style={{textAlign:'right'}}><p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.1rem'}}>{o.total_amount} €</p><Badge label={STATUS_LBL[o.payment_status]||o.payment_status} color={STATUS_COLOR[o.payment_status]||'#888'}/></div>
              </div>
              <p style={{fontSize:'.55rem',opacity:.3,marginBottom:'.5rem',textTransform:'uppercase',letterSpacing:'.1em'}}>Changer le statut :</p>
              <div style={{display:'flex',gap:'.35rem',flexWrap:'wrap'}}>
                {['pending','confirmed','shipped','delivered','cancelled'].map(s=>(
                  <button key={s} onClick={()=>upd(o.id,'status',s)} style={{fontSize:'.58rem',fontWeight:700,padding:'.18rem .55rem',borderRadius:999,background:o.status===s?STATUS_COLOR[s]+'33':'rgba(255,255,255,0.05)',color:o.status===s?STATUS_COLOR[s]:'rgba(255,255,255,.4)',border:`1px solid ${o.status===s?STATUS_COLOR[s]+'55':'transparent'}`,cursor:'pointer',textTransform:'uppercase',letterSpacing:'.07em'}}>{STATUS_LBL[s]}</button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

/* ── PRODUITS ──────────────────────────────────────────────── */
function Produits() {
  return (
    <div>
      <SectionTitle>Catalogue ({PRODUCTS.length} produits)</SectionTitle>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))',gap:'1rem'}}>
        {PRODUCTS.map(p=>(
          <a key={p.slug} href={`/produits/${p.slug}`} target="_blank" style={{textDecoration:'none',color:'white'}}>
            <Card style={{padding:0,overflow:'hidden',transition:'transform 200ms'}} >
              <div style={{width:'100%',aspectRatio:'3/4',background:'#0d0d0d',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src={p.img} alt={p.name} style={{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center bottom'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
              </div>
              <div style={{padding:'.85rem 1rem'}}>
                <p style={{fontSize:'.7rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:'.2rem'}}>{p.name}</p>
                <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1rem'}}>{p.price} €</p>
                <p style={{fontSize:'.58rem',opacity:.3,marginTop:'.2rem'}}>Voir la page →</p>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ── BLOG ──────────────────────────────────────────────────── */
function Blog() {
  const [articles,setArticles]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [gen,setGen]=useState<string|null>(null);
  const [result,setResult]=useState<any>(null);
  const load=useCallback(async()=>{const{data}=await sb.from('blog_posts').select('slug,title,excerpt,keywords,created_at').order('created_at',{ascending:false});setArticles(data||[]);setLoading(false);},[]);
  useEffect(()=>{load();},[load]);
  async function generate(slug:string){
    setGen(slug);setResult(null);
    const r=await fetch('/api/ai/blog',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({topic_slug:slug})});
    const d=await r.json();
    setResult(d.post?{ok:true,...d.post}:{ok:false,error:d.error||'Erreur'});
    setGen(null);load();
  }
  async function del(slug:string){
    if(!confirm(`Supprimer "${slug}" ?`)) return;
    await sb.from('blog_posts').delete().eq('slug',slug);
    setArticles(p=>p.filter(a=>a.slug!==slug));
  }
  return (
    <div>
      <SectionTitle>Blog ({articles.length} articles)</SectionTitle>
      <Card style={{marginBottom:'1.5rem'}}>
        <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.5rem'}}>✨ Générer un article avec l'IA</p>
        <p style={{fontSize:'.72rem',opacity:.4,marginBottom:'.85rem',lineHeight:1.5}}>Clique sur un sujet → l'IA rédige un article complet (600-800 mots, SEO optimisé) et le publie automatiquement sur le blog.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>
          {BLOG_TOPICS.map(t=><Btn key={t.slug} loading={gen===t.slug} onClick={()=>generate(t.slug)} small variant="ghost">{t.label}</Btn>)}
        </div>
        {result?.ok&&(
          <div style={{marginTop:'1rem',padding:'1rem',background:'rgba(52,211,153,.06)',border:'1px solid rgba(52,211,153,.2)',borderRadius:12}}>
            <p style={{fontSize:'.58rem',fontWeight:700,color:'#34d399',textTransform:'uppercase',letterSpacing:'.15em',marginBottom:'.5rem'}}>✓ Article publié</p>
            <p style={{fontWeight:700,fontSize:'.88rem',marginBottom:'.25rem'}}>{result.title}</p>
            <p style={{fontSize:'.72rem',opacity:.5,marginBottom:'.75rem'}}>{result.excerpt}</p>
            <a href={`/blog/${result.slug}`} target="_blank" style={{fontSize:'.7rem',color:'#34d399',textDecoration:'none'}}>Voir l'article en ligne →</a>
          </div>
        )}
        {result&&!result.ok&&<p style={{marginTop:'.75rem',fontSize:'.72rem',color:'#f87171'}}>Erreur : {result.error}</p>}
      </Card>
      {loading?<p style={{opacity:.4}}>Chargement…</p>:articles.length===0?
        <Card><p style={{opacity:.3,textAlign:'center',padding:'2rem',fontSize:'.85rem'}}>Aucun article — génère-en un ci-dessus.</p></Card>:
        <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
          {articles.map(a=>(
            <Card key={a.slug}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem'}}>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700,fontSize:'.88rem',marginBottom:'.2rem'}}>{a.title}</p>
                  <p style={{fontSize:'.72rem',opacity:.45,lineHeight:1.5,marginBottom:'.5rem'}}>{a.excerpt}</p>
                  <div style={{display:'flex',gap:'.3rem',flexWrap:'wrap'}}>
                    {(a.keywords||[]).slice(0,3).map((k:string)=><span key={k} style={{fontSize:'.52rem',padding:'.15rem .45rem',borderRadius:999,background:'rgba(255,255,255,.06)',opacity:.7}}>{k}</span>)}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'.35rem',alignItems:'flex-end',flexShrink:0}}>
                  <a href={`/blog/${a.slug}`} target="_blank" style={{fontSize:'.65rem',color:'rgba(255,255,255,.45)',textDecoration:'none'}}>Voir →</a>
                  <button onClick={()=>del(a.slug)} style={{fontSize:'.58rem',color:'#f87171',background:'none',border:'none',cursor:'pointer',padding:0,opacity:.6}}>Supprimer</button>
                  <p style={{fontSize:'.58rem',opacity:.25}}>{new Date(a.created_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

/* ── SOCIAL ────────────────────────────────────────────────── */
function Social() {
  const [queue,setQueue]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [gen,setGen]=useState<string|null>(null);
  const [posts,setPosts]=useState<any>(null);
  const [genSlug,setGenSlug]=useState<string>('');
  const [imgLoading,setImgLoading]=useState<Record<string,boolean>>({});
  const [imgResult,setImgResult]=useState<Record<string,string>>({});
  const [filter,setFilter]=useState<'pending'|'posted'|'all'>('pending');
  const [market,setMarket]=useState<'all'|'ci'|'fr'>('all');

  const load=useCallback(async()=>{const{data}=await sb.from('social_queue').select('*').order('created_at',{ascending:false}).limit(200);setQueue(data||[]);setLoading(false);},[]);
  useEffect(()=>{load();},[load]);

  async function generate(slug:string){
    setGen(slug);setGenSlug(slug);setPosts(null);setImgResult({});
    const r=await fetch('/api/ai/social',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({slug})});
    const d=await r.json();
    setPosts(d.posts?{ok:true,...d.posts}:{ok:false,error:d.error||'Erreur'});
    setGen(null);load();
  }
  async function genImage(platform:string,productSlug:string){
    const pname=PRODUCTS.find(p=>p.slug===productSlug)?.name||productSlug;
    const prompt=`Professional streetwear fashion photography for ${pname} by PIETRI, an African-French streetwear brand. Urban Paris/Abidjan aesthetic, dark moody background, high-end editorial style. ${platform==='instagram'?'Square format, bold lifestyle shot':'Cinematic composition'}. No text, no logos.`;
    setImgLoading(p=>({...p,[platform]:true}));
    const r=await fetch('/api/ai/image',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({prompt})});
    const d=await r.json();
    if(d.url) setImgResult(p=>({...p,[platform]:d.url}));
    else setImgResult(p=>({...p,[platform]:'error:'+d.error}));
    setImgLoading(p=>({...p,[platform]:false}));
  }
  async function markPosted(id:string){
    await sb.from('social_queue').update({status:'posted',posted_at:new Date().toISOString()}).eq('id',id);
    setQueue(p=>p.map(q=>q.id===id?{...q,status:'posted'}:q));
  }

  const filtered=queue.filter(p=>(filter==='all'||p.status===filter)&&(market==='all'||p.market===market));
  const platforms=['instagram','facebook','tiktok','x'] as const;

  return (
    <div>
      <SectionTitle>Réseaux Sociaux</SectionTitle>

      {/* GÉNÉRATION TEXTE */}
      <Card style={{marginBottom:'1.25rem'}}>
        <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.5rem'}}>✨ Étape 1 — Générer les textes (Claude AI)</p>
        <p style={{fontSize:'.72rem',opacity:.4,marginBottom:'.85rem',lineHeight:1.5}}>Choisir un produit → 4 posts rédigés pour Instagram, Facebook, TikTok et X.</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>
          {PRODUCTS.map(p=><Btn key={p.slug} loading={gen===p.slug} onClick={()=>generate(p.slug)} small variant="ghost">{p.name}</Btn>)}
        </div>
        {posts&&!posts.ok&&<p style={{marginTop:'.75rem',fontSize:'.72rem',color:'#f87171'}}>Erreur : {posts.error}</p>}
        {posts?.ok&&(
          <div style={{marginTop:'1.25rem'}}>
            <p style={{fontSize:'.58rem',fontWeight:700,color:'#34d399',textTransform:'uppercase',letterSpacing:'.15em',marginBottom:'1rem'}}>✓ 4 posts générés pour {genSlug}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {platforms.map(pl=>(
                <div key={pl} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'1rem'}}>
                  {/* Header */}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                      {PLATFORM_LOGO[pl]}
                      <span style={{fontSize:'.75rem',fontWeight:700,color:PLATFORM_COLOR[pl]}}>{PLATFORM_NAME[pl]}</span>
                    </div>
                    <CopyBtn text={posts[pl]}/>
                  </div>
                  {/* Post text */}
                  <p style={{fontSize:'.75rem',lineHeight:1.65,opacity:.75,whiteSpace:'pre-wrap',marginBottom:'1rem'}}>{posts[pl]}</p>
                  {/* Image generation */}
                  <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'.75rem'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.5rem'}}>
                      <p style={{fontSize:'.6rem',opacity:.4,textTransform:'uppercase',letterSpacing:'.1em'}}>🎨 Étape 2 — Image DALL-E 3</p>
                      <Btn loading={imgLoading[pl]} onClick={()=>genImage(pl,genSlug)} small>Générer image</Btn>
                    </div>
                    {imgResult[pl]&&!imgResult[pl].startsWith('error:')&&(
                      <div style={{marginTop:'.75rem'}}>
                        <img src={imgResult[pl]} alt="Generated" style={{width:'100%',maxHeight:'280px',objectFit:'cover',borderRadius:10,marginBottom:'.5rem'}}/>
                        <a href={imgResult[pl]} download target="_blank" style={{fontSize:'.65rem',color:'#60a5fa',textDecoration:'none'}}>⬇ Télécharger l'image →</a>
                      </div>
                    )}
                    {imgResult[pl]?.startsWith('error:')&&<p style={{marginTop:'.5rem',fontSize:'.7rem',color:'#f87171'}}>{imgResult[pl].replace('error:','')}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* FILE D'ATTENTE */}
      <p style={{fontSize:'.65rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.75rem'}}>File d'attente</p>
      <div style={{display:'flex',gap:'.4rem',marginBottom:'.6rem',flexWrap:'wrap'}}>
        {(['pending','posted','all'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{fontSize:'.62rem',fontWeight:700,padding:'.3rem .8rem',borderRadius:999,background:filter===f?'white':'rgba(255,255,255,0.06)',color:filter===f?'black':'rgba(255,255,255,.5)',border:'none',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.08em'}}>
            {f==='pending'?'À publier':f==='posted'?'Publiés':'Tous'}
          </button>
        ))}
      </div>
      <div style={{display:'flex',gap:'.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        {([['all','🌍 Tous marchés'],['ci','🇨🇮 Côte d\'Ivoire'],['fr','🇫🇷 France']] as const).map(([m,lbl])=>(
          <button key={m} onClick={()=>setMarket(m)} style={{fontSize:'.62rem',fontWeight:700,padding:'.3rem .8rem',borderRadius:999,background:market===m?'rgba(250,204,21,0.15)':'rgba(255,255,255,0.04)',color:market===m?'#facc15':'rgba(255,255,255,.4)',border:market===m?'1px solid rgba(250,204,21,0.4)':'1px solid rgba(255,255,255,0.06)',cursor:'pointer',letterSpacing:'.06em'}}>
            {lbl}
          </button>
        ))}
      </div>
      {loading?<p style={{opacity:.4}}>Chargement…</p>:filtered.length===0?
        <Card><p style={{opacity:.3,textAlign:'center',padding:'2rem',fontSize:'.82rem'}}>Aucun post ici.</p></Card>:
        <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
          {filtered.map(post=>(
            <Card key={post.id} style={{borderColor:post.status==='pending'?'rgba(250,204,21,0.15)':'rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'.75rem',flexWrap:'wrap',gap:'.5rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                  {PLATFORM_LOGO[post.platform as keyof typeof PLATFORM_LOGO]}
                  <span style={{fontSize:'.75rem',fontWeight:700}}>{PLATFORM_NAME[post.platform]||post.platform}</span>
                  <span style={{fontSize:'.6rem',opacity:.3}}>· {post.product_slug}</span>
                  {post.market&&<span style={{fontSize:'.58rem',fontWeight:700,padding:'.12rem .45rem',borderRadius:999,background:post.market==='ci'?'rgba(250,204,21,0.12)':'rgba(96,165,250,0.12)',color:post.market==='ci'?'#facc15':'#60a5fa',border:`1px solid ${post.market==='ci'?'rgba(250,204,21,0.3)':'rgba(96,165,250,0.3)'}`}}>{post.market==='ci'?'🇨🇮 CI':'🇫🇷 FR'}</span>}
                </div>
                <Badge label={post.status==='pending'?'À publier':post.status==='posted'?'Publié':post.status} color={post.status==='pending'?'#facc15':'#34d399'}/>
              </div>
              <p style={{fontSize:'.78rem',lineHeight:1.65,opacity:.72,whiteSpace:'pre-wrap',marginBottom:'.75rem'}}>{post.content}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.5rem'}}>
                <p style={{fontSize:'.58rem',opacity:.25}}>{post.status==='posted'&&post.posted_at?`Publié le ${new Date(post.posted_at).toLocaleDateString('fr-FR')}`:`Prévu le ${new Date(post.scheduled_at).toLocaleDateString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}`}</p>
                <div style={{display:'flex',gap:'.4rem'}}>
                  <CopyBtn text={post.content}/>
                  {post.status==='pending'&&<Btn onClick={()=>markPosted(post.id)} small variant="ghost">✓ Publié</Btn>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

/* ── SEO ───────────────────────────────────────────────────── */
function SEO() {
  const [data,setData]=useState<Record<string,any>>({});
  const [gen,setGen]=useState<string|null>(null);
  useEffect(()=>{sb.from('seo_pages').select('*').then(({data:d})=>{const m:Record<string,any>={};(d||[]).forEach((r:any)=>{m[r.page_path]=r;});setData(m);});},[]);
  async function generate(slug:string){
    setGen(slug);
    const r=await fetch('/api/ai/seo',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({slug})});
    const d=await r.json();
    if(d.seo) setData(p=>({...p,[`/produits/${slug}`]:{page_path:`/produits/${slug}`,...d.seo}}));
    setGen(null);
  }
  return (
    <div>
      <SectionTitle>SEO — Référencement</SectionTitle>
      <Card style={{marginBottom:'1.5rem',background:'rgba(96,165,250,0.05)',borderColor:'rgba(96,165,250,0.15)'}}>
        <p style={{fontSize:'.75rem',lineHeight:1.7,opacity:.7}}>
          ✅ <strong style={{color:'white',opacity:1}}>Le SEO est automatique.</strong> Une fois généré, il s'applique directement sur la page produit — Google lira le bon titre et la bonne description sans que tu aies besoin de faire quoi que ce soit.<br/>
          Génère-le une fois par produit, et il reste en place indéfiniment.
        </p>
      </Card>
      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {PRODUCTS.map(p=>{
          const s=data[`/produits/${p.slug}`];
          return (
            <Card key={p.slug}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:s?'1rem':0}}>
                <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                  <img src={p.img} alt={p.name} style={{width:40,height:40,objectFit:'cover',borderRadius:8}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
                  <p style={{fontWeight:700,fontSize:'.88rem'}}>{p.name}</p>
                </div>
                <Btn loading={gen===p.slug} onClick={()=>generate(p.slug)} small>{s?'Régénérer':'✨ Générer'}</Btn>
              </div>
              {s?(
                <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
                  <div><p style={{fontSize:'.52rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.15em',opacity:.3,marginBottom:'.15rem'}}>Titre Google (affiché dans les résultats)</p><p style={{fontSize:'.8rem',color:'#60a5fa'}}>{s.meta_title}</p></div>
                  <div><p style={{fontSize:'.52rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.15em',opacity:.3,marginBottom:'.15rem'}}>Description Google</p><p style={{fontSize:'.75rem',opacity:.65,lineHeight:1.5}}>{s.meta_description}</p></div>
                  <div><p style={{fontSize:'.52rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.15em',opacity:.3,marginBottom:'.35rem'}}>Mots-clés</p><div style={{display:'flex',gap:'.3rem',flexWrap:'wrap'}}>{(s.keywords||[]).map((k:string)=><span key={k} style={{fontSize:'.58rem',padding:'.18rem .5rem',borderRadius:999,background:'rgba(96,165,250,.1)',color:'#93c5fd',border:'1px solid rgba(96,165,250,.2)'}}>{k}</span>)}</div></div>
                </div>
              ):<p style={{fontSize:'.72rem',opacity:.3,marginTop:'.5rem'}}>Pas encore généré — clique sur Générer</p>}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ── MÉDIAS ────────────────────────────────────────────────── */
function Medias() {
  const [items,setItems]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState<string>('all');
  useEffect(()=>{sb.from('media_library').select('*').order('created_at',{ascending:false}).limit(100).then(({data})=>{setItems(data||[]);setLoading(false);});},[]);
  const filtered=filter==='all'?items:items.filter(i=>i.product_slug===filter||i.platform===filter);
  return (
    <div>
      <SectionTitle>Médias générés</SectionTitle>
      <p style={{fontSize:'.75rem',opacity:.5,marginBottom:'1.25rem',lineHeight:1.6}}>Toutes les images et vidéos générées par l'IA pour tes réseaux sociaux. Clique pour télécharger.</p>
      <div style={{display:'flex',gap:'.4rem',flexWrap:'wrap',marginBottom:'1.25rem'}}>
        <button onClick={()=>setFilter('all')} style={{fontSize:'.62rem',fontWeight:700,padding:'.3rem .8rem',borderRadius:999,background:filter==='all'?'white':'rgba(255,255,255,.06)',color:filter==='all'?'black':'rgba(255,255,255,.5)',border:'none',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.08em'}}>Tous</button>
        {PRODUCTS.map(p=><button key={p.slug} onClick={()=>setFilter(p.slug)} style={{fontSize:'.62rem',fontWeight:700,padding:'.3rem .8rem',borderRadius:999,background:filter===p.slug?'white':'rgba(255,255,255,.06)',color:filter===p.slug?'black':'rgba(255,255,255,.5)',border:'none',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.08em'}}>{p.name}</button>)}
      </div>
      {loading?<p style={{opacity:.4}}>Chargement…</p>:filtered.length===0?(
        <Card><p style={{opacity:.3,textAlign:'center',padding:'3rem',fontSize:'.85rem'}}>Aucun média. Lance l'Agent IA pour générer des images automatiquement.</p></Card>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'1rem'}}>
          {filtered.map(m=>(
            <a key={m.id} href={m.url} target="_blank" download style={{textDecoration:'none',color:'white'}}>
              <Card style={{padding:0,overflow:'hidden'}}>
                {m.type==='image'&&<img src={m.url} alt="" style={{width:'100%',aspectRatio:'1',objectFit:'cover'}} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>}
                {m.type==='video'&&<video src={m.url} style={{width:'100%',aspectRatio:'1',objectFit:'cover'}} muted playsInline onMouseEnter={e=>(e.target as HTMLVideoElement).play()} onMouseLeave={e=>(e.target as HTMLVideoElement).pause()}/>}
                <div style={{padding:'.65rem .85rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'.4rem',marginBottom:'.2rem'}}>
                    {m.platform&&PLATFORM_LOGO[m.platform as keyof typeof PLATFORM_LOGO]}
                    <span style={{fontSize:'.6rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',opacity:.6}}>{m.type}</span>
                  </div>
                  <p style={{fontSize:'.58rem',opacity:.3}}>{m.product_slug}</p>
                  <p style={{fontSize:'.6rem',opacity:.5,marginTop:'.2rem'}}>⬇ Télécharger</p>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── AGENT IA ──────────────────────────────────────────────── */
type AgentStepStatus = 'idle'|'running'|'done'|'error';

function StepRow({n,label,status,children}:{n:number;label:string;status:AgentStepStatus;children?:React.ReactNode}) {
  const col = status==='done'?'#34d399':status==='running'?'#facc15':status==='error'?'#f87171':'rgba(255,255,255,0.2)';
  return (
    <div style={{borderRadius:14,border:`1px solid ${status==='done'?'rgba(52,211,153,.2)':status==='running'?'rgba(250,204,21,.2)':'rgba(255,255,255,.06)'}`,background:status==='done'?'rgba(52,211,153,.04)':status==='running'?'rgba(250,204,21,.03)':'rgba(255,255,255,.02)',padding:'1rem 1.25rem',marginBottom:'.75rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'.75rem',marginBottom:children?'.85rem':0}}>
        <div style={{width:26,height:26,borderRadius:999,border:`1.5px solid ${col}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          {status==='done'?<span style={{fontSize:'.7rem',color:'#34d399',fontWeight:700}}>✓</span>:status==='running'?<span style={{fontSize:'.6rem',color:'#facc15'}}>●</span>:status==='error'?<span style={{fontSize:'.7rem',color:'#f87171'}}>✗</span>:<span style={{fontSize:'.7rem',color:'rgba(255,255,255,.3)',fontWeight:700}}>{n}</span>}
        </div>
        <span style={{fontSize:'.78rem',fontWeight:700,color:status==='idle'?'rgba(255,255,255,.35)':'white'}}>{label}</span>
        {status==='running'&&<span style={{fontSize:'.6rem',color:'#facc15',opacity:.7,marginLeft:'auto'}}>en cours…</span>}
      </div>
      {children}
    </div>
  );
}

function Agent() {
  const [product,setProduct]=useState('');
  const [market,setMarket]=useState<'both'|'ci'|'fr'>('both');
  const [running,setRunning]=useState(false);
  const [steps,setSteps]=useState<Record<string,AgentStepStatus>>({context:'idle',image:'idle',posts:'idle'});
  const [ctx,setCtx]=useState<any>(null);
  const [imageUrl,setImageUrl]=useState<string|null>(null);
  const [posts,setPosts]=useState<any>(null);
  const [error,setError]=useState<string|null>(null);
  // Global modes
  const [globalMode,setGlobalMode]=useState<string|null>(null);
  const [globalLogs,setGlobalLogs]=useState<any[]>([]);
  const [globalDone,setGlobalDone]=useState(false);
  // Sub-agents
  const [influencers,setInfluencers]=useState<any>(null);
  const [influencerMarket,setInfluencerMarket]=useState<'both'|'ci'|'fr'>('both');
  const [scQuestion,setScQuestion]=useState('');
  const [scResponse,setScResponse]=useState<string|null>(null);
  const [scChannel,setScChannel]=useState<'chat'|'whatsapp'|'email'>('chat');
  const [storyProduct,setStoryProduct]=useState('');
  const [story,setStory]=useState<any>(null);
  const [videoProduct,setVideoProduct]=useState('');
  const [videoResult,setVideoResult]=useState<any>(null);
  const [activeSubAgent,setActiveSubAgent]=useState<'influencer'|'service_client'|'collection_story'|'video'|'notify'|null>(null);
  // Notifications push
  const [notifyProduct,setNotifyProduct]=useState('');
  const [notifyTitle,setNotifyTitle]=useState('');
  const [notifyMsg,setNotifyMsg]=useState('');
  const [notifyResult,setNotifyResult]=useState<string|null>(null);

  function resetCampaign(){setSteps({context:'idle',image:'idle',posts:'idle'});setCtx(null);setImageUrl(null);setPosts(null);setError(null);}

  async function launchNotify(){
    if(running) return;
    setRunning(true);setNotifyResult(null);setActiveSubAgent('notify');
    const body: any={mode:'notify',target:'all'};
    if(notifyProduct){body.auto_slug=notifyProduct;}
    else{body.title=notifyTitle;body.message=notifyMsg;}
    await streamAgent(body,(d)=>{
      if(d.type==='step_done'&&d.step==='notify') setNotifyResult(`Envoyé — ${d.title}`);
      else if(d.type==='done'||d.type==='error'){setRunning(false);if(d.error)setError(d.error);}
    });
    setRunning(false);
  }

  async function launchInfluencerHunt(){
    if(running) return;
    setRunning(true);setInfluencers(null);setActiveSubAgent('influencer');
    await streamAgent({mode:'influencer_hunt',market:influencerMarket},(d)=>{
      if(d.type==='step_done'&&d.step==='influencer_hunt') setInfluencers(d.data);
      else if(d.type==='done'||d.type==='error'){setRunning(false);if(d.error)setError(d.error);}
    });
    setRunning(false);
  }

  async function launchServiceClient(){
    if(running||!scQuestion) return;
    setRunning(true);setScResponse(null);setActiveSubAgent('service_client');
    await streamAgent({mode:'service_client',question:scQuestion,channel:scChannel},(d)=>{
      if(d.type==='step_done'&&d.step==='service_client') setScResponse(d.response);
      else if(d.type==='done'||d.type==='error'){setRunning(false);if(d.error)setError(d.error);}
    });
    setRunning(false);
  }

  async function launchCollectionStory(){
    if(running||!storyProduct) return;
    setRunning(true);setStory(null);setActiveSubAgent('collection_story');
    await streamAgent({mode:'collection_story',slug:storyProduct},(d)=>{
      if(d.type==='step_done'&&d.step==='collection_story') setStory(d.data);
      else if(d.type==='done'||d.type==='error'){setRunning(false);if(d.error)setError(d.error);}
    });
    setRunning(false);
  }

  async function launchVideo(){
    if(running||!videoProduct) return;
    const prod=PRODUCTS.find(p=>p.slug===videoProduct);
    if(!prod) return;
    setRunning(true);setVideoResult(null);setActiveSubAgent('video');
    try {
      const res=await fetch('/api/ai/video',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({
        prompt:`Fashion editorial video for PIETRI ${prod.name} — ${prod.img ? 'premium streetwear' : 'African-French luxury streetwear'}. Cinematic, moody, no text.`,
        image_url:prod.img||undefined,
        duration:5,
        aspect_ratio:'9:16',
      })});
      const data=await res.json();
      setVideoResult(data);
    } catch(e){setError(String(e));}
    setRunning(false);
  }

  async function streamAgent(body:object, onEvent:(d:any)=>void) {
    const res=await fetch('/api/ai/agent',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify(body)});
    if(!res.body) return;
    const reader=res.body.getReader();
    const dec=new TextDecoder();
    let buf='';
    while(true){
      const{done,value}=await reader.read();
      if(done) break;
      buf+=dec.decode(value,{stream:true});
      const parts=buf.split('\n\n');
      buf=parts.pop()||'';
      for(const part of parts){
        const line=part.replace(/^data: /,'').trim();
        if(!line) continue;
        try{onEvent(JSON.parse(line));}catch{}
      }
    }
  }

  async function launchCampaign(){
    if(!product||running) return;
    setRunning(true);resetCampaign();
    await streamAgent({mode:'campaign',slug:product,market},(d)=>{
      if(d.type==='step_start') setSteps(p=>({...p,[d.step]:'running'}));
      else if(d.type==='step_done'){
        setSteps(p=>({...p,[d.step]:'done'}));
        if(d.step==='context') setCtx(d.data);
        if(d.step==='image') setImageUrl(d.url||null);
        if(d.step==='posts') setPosts(d.data);
      }
      else if(d.type==='step_error'){setSteps(p=>({...p,[d.step]:'error'}));setError(d.error);}
      else if(d.type==='done'||d.type==='error'){setRunning(false);if(d.error)setError(d.error);}
    });
    setRunning(false);
  }

  async function launchGlobal(m:string){
    setGlobalMode(m);setGlobalLogs([]);setGlobalDone(false);setRunning(true);
    await streamAgent({mode:m},(d)=>{
      if(d.type==='done'){setGlobalDone(true);setRunning(false);}
      else if(d.type==='error'){setGlobalLogs(p=>[...p,{status:'error',msg:d.error}]);setRunning(false);}
      else setGlobalLogs(p=>[...p,d]);
    });
    setRunning(false);
  }

  const platforms=['instagram','facebook','tiktok','x'] as const;

  return (
    <div>
      <SectionTitle>Agent IA</SectionTitle>

      {/* ── DIGITAL BRAND MANAGER HUB ── */}
      <div style={{background:'linear-gradient(135deg,rgba(167,139,250,.08) 0%,rgba(96,165,250,.06) 100%)',border:'1px solid rgba(167,139,250,.2)',borderRadius:20,padding:'1.5rem',marginBottom:'1.5rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1rem'}}>
          <div style={{width:44,height:44,borderRadius:12,background:'linear-gradient(135deg,#a78bfa,#60a5fa)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <IcoSpark/>
          </div>
          <div>
            <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.1rem',textTransform:'uppercase',letterSpacing:'0.02em',color:'white'}}>Digital Brand Manager IA</p>
            <p style={{fontSize:'.65rem',opacity:.45,marginTop:'.1rem'}}>Agent central — orchestre tous les sous-agents automatiquement</p>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'.75rem'}}>
          {[
            {icon:'🎨',label:'AI Try-On',desc:'Essayer une pièce sur sa photo',color:'#a78bfa',status:'live',action:null},
            {icon:'👗',label:'Garde-Robe',desc:'Suggestions de style personnalisées',color:'#60a5fa',status:'live',action:null},
            {icon:'🔔',label:'Push Notifs',desc:'Envoie des notifs push à l\'app mobile',color:'#fbbf24',status:'live',action:()=>document.getElementById('agent-notify')?.scrollIntoView({behavior:'smooth'})},
            {icon:'🔍',label:'Influencer Hunter',desc:'Micro-influenceurs CI/diaspora',color:'#34d399',status:'live',action:()=>document.getElementById('agent-influencer')?.scrollIntoView({behavior:'smooth'})},
            {icon:'💬',label:'Service Client',desc:'Répond aux questions clients 24/7',color:'#facc15',status:'live',action:()=>document.getElementById('agent-sc')?.scrollIntoView({behavior:'smooth'})},
            {icon:'📖',label:'Collection Story',desc:'Fiche culturelle par pièce',color:'#fb923c',status:'live',action:()=>document.getElementById('agent-story')?.scrollIntoView({behavior:'smooth'})},
          ].map(agent=>(
            <div key={agent.label} onClick={agent.action||undefined} style={{background:'rgba(255,255,255,.03)',border:`1px solid ${agent.color}33`,borderRadius:12,padding:'.85rem',position:'relative',overflow:'hidden',cursor:agent.action?'pointer':'default',transition:'background 150ms'}}
              onMouseEnter={e=>agent.action&&((e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.06)')}
              onMouseLeave={e=>agent.action&&((e.currentTarget as HTMLElement).style.background='rgba(255,255,255,.03)')}>
              <div style={{position:'absolute',top:'.5rem',right:'.5rem'}}>
                <span style={{fontSize:'.48rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:agent.color,background:agent.color+'22',border:`1px solid ${agent.color}44`,borderRadius:999,padding:'.12rem .4rem'}}>ACTIF</span>
              </div>
              <span style={{fontSize:'1.4rem',display:'block',marginBottom:'.4rem'}}>{agent.icon}</span>
              <p style={{fontSize:'.72rem',fontWeight:700,color:'white',marginBottom:'.2rem'}}>{agent.label}</p>
              <p style={{fontSize:'.6rem',opacity:.35,lineHeight:1.4}}>{agent.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CAMPAGNE PRODUIT ── */}
      <Card style={{marginBottom:'1.5rem',borderColor:'rgba(167,139,250,0.2)',background:'rgba(167,139,250,0.04)'}}>
        <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#a78bfa',marginBottom:'.5rem'}}>Campagne produit</p>
        <p style={{fontSize:'.72rem',opacity:.5,lineHeight:1.6,marginBottom:'1rem'}}>L'agent choisit le ton, génère <strong style={{color:'white',opacity:1}}>1 image</strong> créative et rédige <strong style={{color:'white',opacity:1}}>4 posts</strong> adaptés à chaque réseau social.</p>

        {/* Product selector */}
        <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem',marginBottom:'.75rem'}}>
          {PRODUCTS.map(p=>(
            <button key={p.slug} onClick={()=>setProduct(p.slug)} disabled={running}
              style={{fontSize:'.65rem',fontWeight:700,padding:'.35rem .85rem',borderRadius:999,border:`1px solid ${product===p.slug?'rgba(167,139,250,.6)':'rgba(255,255,255,.08)'}`,background:product===p.slug?'rgba(167,139,250,.15)':'rgba(255,255,255,.03)',color:product===p.slug?'#a78bfa':'rgba(255,255,255,.45)',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.06em'}}>
              {p.name}
            </button>
          ))}
        </div>

        {/* Market */}
        <div style={{display:'flex',gap:'.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
          {([['both','🌍 CI + France'],['ci','🇨🇮 Côte d\'Ivoire'],['fr','🇫🇷 France']] as const).map(([m,lbl])=>(
            <button key={m} onClick={()=>setMarket(m)} disabled={running}
              style={{fontSize:'.62rem',fontWeight:600,padding:'.28rem .75rem',borderRadius:999,border:`1px solid ${market===m?'rgba(167,139,250,.4)':'rgba(255,255,255,.06)'}`,background:market===m?'rgba(167,139,250,.12)':'transparent',color:market===m?'#a78bfa':'rgba(255,255,255,.35)',cursor:'pointer'}}>
              {lbl}
            </button>
          ))}
        </div>

        <button onClick={launchCampaign} disabled={!product||running}
          style={{background:!product||running?'rgba(255,255,255,.08)':'#a78bfa',color:!product||running?'rgba(255,255,255,.3)':'white',border:'none',borderRadius:999,padding:'.65rem 1.75rem',fontWeight:700,fontSize:'.78rem',cursor:!product||running?'not-allowed':'pointer',textTransform:'uppercase',letterSpacing:'.1em',transition:'background 200ms'}}>
          {running&&steps.context!=='idle'?'⏳ En cours…':product?`Lancer la campagne ${PRODUCTS.find(p=>p.slug===product)?.name}`:'← Choisir un produit'}
        </button>
      </Card>

      {/* ── ÉTAPES ── */}
      {steps.context!=='idle'&&(
        <>
          <StepRow n={1} label="Stratégie éditoriale" status={steps.context}>
            {ctx&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem',fontSize:'.7rem'}}>
                <div style={{background:'rgba(255,255,255,.04)',borderRadius:8,padding:'.6rem .75rem'}}>
                  <p style={{fontSize:'.55rem',opacity:.4,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'.25rem'}}>Ton</p>
                  <p style={{lineHeight:1.5,opacity:.8}}>{ctx.tone}</p>
                </div>
                <div style={{background:'rgba(255,255,255,.04)',borderRadius:8,padding:'.6rem .75rem'}}>
                  <p style={{fontSize:'.55rem',opacity:.4,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'.25rem'}}>Meilleur moment</p>
                  <p style={{opacity:.8}}>🇨🇮 {ctx.best_time_ci}</p>
                  <p style={{opacity:.8}}>🇫🇷 {ctx.best_time_fr}</p>
                </div>
                <div style={{gridColumn:'1/-1',background:'rgba(255,255,255,.04)',borderRadius:8,padding:'.6rem .75rem'}}>
                  <p style={{fontSize:'.55rem',opacity:.4,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'.3rem'}}>Hashtags</p>
                  <p style={{opacity:.6,fontSize:'.68rem',lineHeight:1.6}}>{[...(ctx.hashtags_ci||[]),...(ctx.hashtags_fr||[])].join(' ')}</p>
                </div>
              </div>
            )}
          </StepRow>

          <StepRow n={2} label="Image DALL-E 3" status={steps.image}>
            {steps.image==='running'&&<p style={{fontSize:'.7rem',opacity:.4}}>Génération en cours… (15-30 sec)</p>}
            {imageUrl&&(
              <div>
                <img src={imageUrl} alt="Generated" style={{width:'100%',maxHeight:320,objectFit:'cover',borderRadius:10,marginBottom:'.65rem'}}/>
                <div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
                  <a href={imageUrl} download target="_blank" style={{fontSize:'.65rem',fontWeight:700,color:'#a78bfa',textDecoration:'none',background:'rgba(167,139,250,.1)',border:'1px solid rgba(167,139,250,.25)',borderRadius:999,padding:'.3rem .85rem'}}>⬇ Télécharger</a>
                  <span style={{fontSize:'.6rem',opacity:.3,alignSelf:'center'}}>Cette image sera jointe aux posts</span>
                </div>
              </div>
            )}
            {steps.image==='error'&&<p style={{fontSize:'.7rem',color:'#f87171'}}>{error}</p>}
          </StepRow>

          <StepRow n={3} label="4 posts adaptés" status={steps.posts}>
            {posts&&(
              <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                {platforms.map(pl=>(
                  <div key={pl} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:'.85rem 1rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.6rem'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'.45rem'}}>
                        {PLATFORM_LOGO[pl]}
                        <span style={{fontSize:'.72rem',fontWeight:700,color:PLATFORM_COLOR[pl]}}>{PLATFORM_NAME[pl]}</span>
                      </div>
                      <CopyBtn text={posts[pl]||''}/>
                    </div>
                    <p style={{fontSize:'.73rem',lineHeight:1.7,opacity:.75,whiteSpace:'pre-wrap'}}>{posts[pl]}</p>
                  </div>
                ))}
              </div>
            )}
          </StepRow>

          <StepRow n={4} label="Vidéo fal.ai" status="idle">
            <div style={{display:'flex',gap:'.5rem',alignItems:'center',flexWrap:'wrap'}}>
              <p style={{fontSize:'.7rem',opacity:.5,lineHeight:1.5,flex:1}}>Génère 1 vidéo cinématique à poster sur TikTok, Reels et Facebook. Requiert <code style={{fontSize:'.65rem',background:'rgba(255,255,255,.06)',borderRadius:4,padding:'.1rem .35rem'}}>FAL_KEY</code> dans les env vars Netlify, ou utilise le storyboard DALL-E.</p>
              {imageUrl&&<button onClick={launchVideo} disabled={running} style={{padding:'.4rem .85rem',background:'rgba(251,146,60,.15)',border:'1px solid rgba(251,146,60,.3)',borderRadius:999,color:'#fb923c',fontSize:'.65rem',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap'}}>{running&&activeSubAgent==='video'?'⏳ …':'🎬 Générer vidéo'}</button>}
            </div>
            {videoResult&&(
              <div style={{marginTop:'.75rem'}}>
                {videoResult.video_url&&<video src={videoResult.video_url} controls style={{width:'100%',maxHeight:300,borderRadius:8}}/>}
                {videoResult.frames&&<div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'.4rem',marginTop:'.5rem'}}>{videoResult.frames.map((f:string,i:number)=><img key={i} src={f} alt={`Frame ${i+1}`} style={{width:'100%',borderRadius:6,objectFit:'cover',aspectRatio:'9/16'}}/>)}</div>}
                {videoResult.note&&<p style={{fontSize:'.62rem',opacity:.4,marginTop:'.5rem',lineHeight:1.5}}>{videoResult.note}</p>}
                {videoResult.error&&<p style={{fontSize:'.7rem',color:'#f87171'}}>{videoResult.error}</p>}
              </div>
            )}
          </StepRow>
        </>
      )}

      {error&&steps.context==='idle'&&<Card style={{borderColor:'rgba(248,113,113,.2)',background:'rgba(248,113,113,.05)',marginBottom:'1rem'}}><p style={{fontSize:'.75rem',color:'#f87171'}}>{error}</p></Card>}

      {/* ── NOTIFICATIONS PUSH ── */}
      <div id="agent-notify">
        <Card style={{marginBottom:'1.5rem',borderColor:'rgba(251,191,36,0.2)',background:'rgba(251,191,36,0.04)'}}>
          <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#fbbf24',marginBottom:'.5rem'}}>🔔 Notifications Push</p>
          <p style={{fontSize:'.72rem',opacity:.5,lineHeight:1.6,marginBottom:'1rem'}}>Envoie une notification à tous tes abonnés app. Choisis un produit pour que Claude génère le message automatiquement.</p>
          <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
            <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem'}}>
              <button onClick={()=>setNotifyProduct('')} style={{fontSize:'.62rem',fontWeight:700,padding:'.3rem .8rem',borderRadius:999,border:`1px solid ${notifyProduct===''?'rgba(251,191,36,.5)':'rgba(255,255,255,.08)'}`,background:notifyProduct===''?'rgba(251,191,36,.12)':'transparent',color:notifyProduct===''?'#fbbf24':'rgba(255,255,255,.35)',cursor:'pointer'}}>✍️ Manuel</button>
              {PRODUCTS.map(p=>(
                <button key={p.slug} onClick={()=>{setNotifyProduct(p.slug);setNotifyTitle('');setNotifyMsg('');}}
                  style={{fontSize:'.62rem',fontWeight:700,padding:'.3rem .8rem',borderRadius:999,border:`1px solid ${notifyProduct===p.slug?'rgba(251,191,36,.5)':'rgba(255,255,255,.08)'}`,background:notifyProduct===p.slug?'rgba(251,191,36,.12)':'transparent',color:notifyProduct===p.slug?'#fbbf24':'rgba(255,255,255,.35)',cursor:'pointer',textTransform:'uppercase'}}>
                  {p.name}
                </button>
              ))}
            </div>
            {notifyProduct===''&&(
              <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                <input value={notifyTitle} onChange={e=>setNotifyTitle(e.target.value)} placeholder="Titre (ex: 🔥 Nouveau drop PIETRI)" style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,padding:'.6rem .9rem',color:'white',fontSize:'.75rem',outline:'none'}}/>
                <textarea value={notifyMsg} onChange={e=>setNotifyMsg(e.target.value)} placeholder="Message (ex: Le Floral Hoodie est de retour. 100 pièces seulement.)" rows={2} style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,padding:'.6rem .9rem',color:'white',fontSize:'.75rem',outline:'none',resize:'none'}}/>
              </div>
            )}
            {notifyProduct&&<p style={{fontSize:'.65rem',color:'#fbbf24',opacity:.7}}>✨ Claude va générer automatiquement le titre et le message pour {PRODUCTS.find(p=>p.slug===notifyProduct)?.name}</p>}
            <div style={{display:'flex',gap:'.5rem',alignItems:'center',flexWrap:'wrap'}}>
              <Btn onClick={launchNotify} loading={running&&activeSubAgent==='notify'} variant="primary">
                {notifyProduct?'✨ Générer & Envoyer':'📲 Envoyer à tous'}
              </Btn>
              {notifyResult&&<span style={{fontSize:'.65rem',color:'#34d399',fontWeight:700}}>✓ {notifyResult}</span>}
            </div>
          </div>
        </Card>
      </div>

      {/* ── INFLUENCER HUNTER ── */}
      <div id="agent-influencer">
        <Card style={{marginBottom:'1.5rem',borderColor:'rgba(52,211,153,0.2)',background:'rgba(52,211,153,0.04)'}}>
          <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#34d399',marginBottom:'.5rem'}}>🔍 Influencer Hunter</p>
          <p style={{fontSize:'.72rem',opacity:.5,lineHeight:1.6,marginBottom:'1rem'}}>Identifie 10 micro-influenceurs parfaits pour PIETRI sur TikTok, Instagram et Snapchat.</p>
          <div style={{display:'flex',gap:'.4rem',marginBottom:'1rem',flexWrap:'wrap'}}>
            {([['both','🌍 CI + France'],['ci','🇨🇮 Côte d\'Ivoire'],['fr','🇫🇷 France / Diaspora']] as const).map(([m,lbl])=>(
              <button key={m} onClick={()=>setInfluencerMarket(m)} disabled={running} style={{fontSize:'.62rem',fontWeight:600,padding:'.28rem .75rem',borderRadius:999,border:`1px solid ${influencerMarket===m?'rgba(52,211,153,.4)':'rgba(255,255,255,.06)'}`,background:influencerMarket===m?'rgba(52,211,153,.12)':'transparent',color:influencerMarket===m?'#34d399':'rgba(255,255,255,.35)',cursor:'pointer'}}>{lbl}</button>
            ))}
          </div>
          <Btn onClick={launchInfluencerHunt} loading={running&&activeSubAgent==='influencer'}>🔍 Lancer la recherche</Btn>
          {influencers&&(
            <div style={{marginTop:'1rem'}}>
              <p style={{fontSize:'.6rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.15em',opacity:.4,marginBottom:'1rem'}}>{influencers.influenceurs?.length||0} influenceurs identifiés</p>
              <div style={{display:'flex',flexDirection:'column',gap:'.75rem',marginBottom:'1rem'}}>
                {influencers.influenceurs?.map((inf:any,i:number)=>(
                  <div key={i} style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:'1rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'.5rem',flexWrap:'wrap',marginBottom:'.5rem'}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:'.82rem',color:'#34d399'}}>{inf.pseudo}</p>
                        <p style={{fontSize:'.65rem',opacity:.5}}>{inf.plateforme} · {inf.followers} · {inf.engagement_rate} engagement · {inf.ville}</p>
                      </div>
                      <div style={{display:'flex',gap:'.3rem',flexWrap:'wrap'}}>
                        <span style={{fontSize:'.52rem',padding:'.1rem .4rem',borderRadius:999,background:'rgba(52,211,153,.1)',border:'1px solid rgba(52,211,153,.2)',color:'#34d399'}}>{inf.type_collab}</span>
                        <span style={{fontSize:'.52rem',padding:'.1rem .4rem',borderRadius:999,background:'rgba(255,255,255,.05)',color:'rgba(255,255,255,.5)'}}>{inf.budget_estime}</span>
                      </div>
                    </div>
                    <p style={{fontSize:'.72rem',opacity:.7,lineHeight:1.5,marginBottom:'.5rem'}}>{inf.pourquoi_pietri}</p>
                    <div style={{background:'rgba(52,211,153,.05)',border:'1px solid rgba(52,211,153,.15)',borderRadius:8,padding:'.6rem .75rem'}}>
                      <p style={{fontSize:'.58rem',opacity:.4,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'.2rem'}}>Message d'approche</p>
                      <p style={{fontSize:'.7rem',opacity:.75,lineHeight:1.6,fontStyle:'italic'}}>"{inf.accroche_dm}"</p>
                    </div>
                  </div>
                ))}
              </div>
              {influencers.strategie_globale&&<Card style={{borderColor:'rgba(52,211,153,.15)'}}><p style={{fontSize:'.58rem',opacity:.4,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:'.4rem'}}>Stratégie globale</p><p style={{fontSize:'.75rem',lineHeight:1.6}}>{influencers.strategie_globale}</p></Card>}
            </div>
          )}
        </Card>
      </div>

      {/* ── SERVICE CLIENT 24/7 ── */}
      <div id="agent-sc">
        <Card style={{marginBottom:'1.5rem',borderColor:'rgba(250,204,21,0.2)',background:'rgba(250,204,21,0.03)'}}>
          <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#facc15',marginBottom:'.5rem'}}>💬 Service Client 24/7</p>
          <p style={{fontSize:'.72rem',opacity:.5,lineHeight:1.6,marginBottom:'1rem'}}>Simule une réponse client automatique — teste avant de déployer sur WhatsApp ou DMs.</p>
          <div style={{display:'flex',gap:'.4rem',marginBottom:'.75rem',flexWrap:'wrap'}}>
            {(['chat','whatsapp','email'] as const).map(ch=>(
              <button key={ch} onClick={()=>setScChannel(ch)} style={{fontSize:'.62rem',fontWeight:600,padding:'.28rem .75rem',borderRadius:999,border:`1px solid ${scChannel===ch?'rgba(250,204,21,.4)':'rgba(255,255,255,.06)'}`,background:scChannel===ch?'rgba(250,204,21,.1)':'transparent',color:scChannel===ch?'#facc15':'rgba(255,255,255,.35)',cursor:'pointer',textTransform:'capitalize'}}>{ch}</button>
            ))}
          </div>
          <textarea value={scQuestion} onChange={e=>setScQuestion(e.target.value)} placeholder="Ex: Ma commande est arrivée endommagée, que faire ? / C'est quoi les délais de livraison à Abidjan ?" rows={3} style={{width:'100%',padding:'.75rem 1rem',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:10,color:'white',fontSize:'.78rem',fontFamily:"'Inter',sans-serif",outline:'none',resize:'vertical',boxSizing:'border-box',lineHeight:1.6,marginBottom:'.75rem'}}/>
          <Btn onClick={launchServiceClient} loading={running&&activeSubAgent==='service_client'}>💬 Générer la réponse</Btn>
          {scResponse&&(
            <div style={{marginTop:'1rem',background:'rgba(250,204,21,.05)',border:'1px solid rgba(250,204,21,.2)',borderRadius:12,padding:'1rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.5rem'}}>
                <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.1em',color:'#facc15'}}>Réponse générée</p>
                <CopyBtn text={scResponse}/>
              </div>
              <p style={{fontSize:'.78rem',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{scResponse}</p>
            </div>
          )}
        </Card>
      </div>

      {/* ── COLLECTION STORY ── */}
      <div id="agent-story">
        <Card style={{marginBottom:'1.5rem',borderColor:'rgba(251,146,60,0.2)',background:'rgba(251,146,60,0.03)'}}>
          <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#fb923c',marginBottom:'.5rem'}}>📖 Collection Story</p>
          <p style={{fontSize:'.72rem',opacity:.5,lineHeight:1.6,marginBottom:'1rem'}}>Génère une fiche culturelle riche pour chaque pièce — histoire, héritage africain, styling, playlist.</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem',marginBottom:'1rem'}}>
            {PRODUCTS.map(p=>(
              <button key={p.slug} onClick={()=>setStoryProduct(p.slug)} disabled={running} style={{fontSize:'.65rem',fontWeight:700,padding:'.35rem .85rem',borderRadius:999,border:`1px solid ${storyProduct===p.slug?'rgba(251,146,60,.6)':'rgba(255,255,255,.08)'}`,background:storyProduct===p.slug?'rgba(251,146,60,.15)':'rgba(255,255,255,.03)',color:storyProduct===p.slug?'#fb923c':'rgba(255,255,255,.45)',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.06em'}}>{p.name}</button>
            ))}
          </div>
          <Btn onClick={launchCollectionStory} loading={running&&activeSubAgent==='collection_story'}>{storyProduct?`Générer l'histoire — ${PRODUCTS.find(p=>p.slug===storyProduct)?.name}`:'← Choisir un produit'}</Btn>
          {story&&(
            <div style={{marginTop:'1rem',display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{background:'rgba(251,146,60,.06)',border:'1px solid rgba(251,146,60,.2)',borderRadius:12,padding:'1.25rem'}}>
                <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.3rem',textTransform:'uppercase',letterSpacing:'.02em',marginBottom:'.25rem'}}>{story.titre_editorial}</p>
                <p style={{fontSize:'.78rem',opacity:.5,fontStyle:'italic',marginBottom:'1rem'}}>{story.sous_titre}</p>
                <p style={{fontSize:'.78rem',lineHeight:1.8,opacity:.8}}>{story.histoire}</p>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                {[['Héritage culturel',story.heritage_culturel],['Matières & savoir-faire',story.materiaux_savoir_faire],['Connexion contemporaine',story.connexion_contemporaine]].map(([t,v])=>v&&(
                  <Card key={t as string} style={{padding:'.85rem 1rem'}}>
                    <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',opacity:.4,marginBottom:'.4rem'}}>{t as string}</p>
                    <p style={{fontSize:'.75rem',lineHeight:1.6}}>{v as string}</p>
                  </Card>
                ))}
              </div>
              {story.quote_brand&&<div style={{textAlign:'center',padding:'1.25rem',background:'rgba(251,146,60,.04)',border:'1px solid rgba(251,146,60,.15)',borderRadius:12}}><p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.1rem',letterSpacing:'.02em',color:'#fb923c'}}>"{story.quote_brand}"</p></div>}
              {story.styling_notes?.length>0&&<Card><p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',opacity:.4,marginBottom:'.75rem'}}>Styling Notes</p>{story.styling_notes.map((n:string,i:number)=><p key={i} style={{fontSize:'.75rem',lineHeight:1.6,opacity:.75,marginBottom:'.35rem'}}>— {n}</p>)}</Card>}
              {story.playlist?.length>0&&<Card><p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.12em',opacity:.4,marginBottom:'.75rem'}}>Playlist</p>{story.playlist.map((t:string,i:number)=><p key={i} style={{fontSize:'.72rem',opacity:.7,marginBottom:'.25rem'}}>🎵 {t}</p>)}</Card>}
              {story.hashtags_editorial?.length>0&&<p style={{fontSize:'.72rem',opacity:.4,lineHeight:1.8}}>{story.hashtags_editorial.join(' ')}</p>}
            </div>
          )}
        </Card>
      </div>

      {/* ── OUTILS GLOBAUX ── */}
      <div style={{marginTop:'2rem',paddingTop:'1.5rem',borderTop:'1px solid rgba(255,255,255,.06)'}}>
        <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.3,marginBottom:'1rem'}}>Outils globaux (tout le site)</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem',marginBottom:'1rem'}}>
          {[
            {m:'editorial',lbl:'Ligne éditoriale'},
            {m:'intel',lbl:'Veille concurrentielle'},
            {m:'blog',lbl:'Articles blog (5)'},
            {m:'seo',lbl:'SEO produits (5)'},
          ].map(({m,lbl})=>(
            <Btn key={m} loading={running&&globalMode===m} onClick={()=>launchGlobal(m)} small variant="ghost">{lbl}</Btn>
          ))}
        </div>
        {globalLogs.length>0&&(
          <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:12,padding:'1rem',maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:'.3rem'}}>
            {globalLogs.filter(l=>l.type==='item'||l.type==='step_done').slice(-20).map((l,i)=>(
              <div key={i} style={{fontSize:'.67rem',display:'flex',gap:'.4rem',opacity:.7}}>
                <span style={{color:l.status==='done'||l.type==='step_done'?'#34d399':l.status==='error'?'#f87171':'#facc15'}}>{l.status==='done'||l.type==='step_done'?'✓':l.status==='error'?'✗':'⏳'}</span>
                <span>{l.title||l.slug||l.step||l.label||''}</span>
              </div>
            ))}
            {running&&<div style={{fontSize:'.67rem',opacity:.3}}>En cours…</div>}
            {globalDone&&<div style={{fontSize:'.67rem',color:'#34d399',fontWeight:600}}>Terminé ✓</div>}
          </div>
        )}
      </div>

      {/* ── CONNEXION RÉSEAUX SOCIAUX ── */}
      <Card style={{marginTop:'1.5rem',background:'rgba(96,165,250,0.04)',borderColor:'rgba(96,165,250,0.15)'}}>
        <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#60a5fa',marginBottom:'.85rem'}}>Connexion automatique des réseaux sociaux</p>
        <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
          {[
            {pl:<IgLogo/>,name:'Instagram + Facebook',desc:'Meta Business Suite → Paramètres → Accès API → Créer une app → Token de page longue durée. API officielle Meta Graph.',status:'Connecter',color:'#e1306c'},
            {pl:<TtLogo/>,name:'TikTok',desc:'TikTok for Developers → Créer une app → Demander la permission "Video Upload". Validation manuelle par TikTok requise.',status:'Connecter',color:'#ffffff'},
            {pl:<XLogo/>,name:'X / Twitter',desc:'developer.twitter.com → Créer un projet → API v2. Le plan Basic (100$/mois) permet les posts automatiques.',status:'Connecter',color:'#ffffff'},
          ].map(({pl,name,desc,status,color})=>(
            <div key={name} style={{display:'flex',gap:'.85rem',alignItems:'flex-start'}}>
              <span style={{flexShrink:0,marginTop:'.1rem'}}>{pl}</span>
              <div style={{flex:1}}>
                <p style={{fontSize:'.75rem',fontWeight:700,marginBottom:'.2rem'}}>{name}</p>
                <p style={{fontSize:'.65rem',opacity:.45,lineHeight:1.55}}>{desc}</p>
              </div>
            </div>
          ))}
          <div style={{borderTop:'1px solid rgba(255,255,255,.06)',paddingTop:'.85rem'}}>
            <p style={{fontSize:'.65rem',opacity:.45,lineHeight:1.65}}>
              <strong style={{color:'white',opacity:.7}}>Recommandation :</strong> utilise <strong style={{color:'#60a5fa',opacity:1}}>Buffer</strong> (6$/mois) — une seule API connecte Instagram, Facebook, TikTok et X. On peut l'intégrer directement dans PIETRI pour que l'agent poste automatiquement dès qu'un post est marqué "prêt".
            </p>
          </div>
        </div>
      </Card>

      {/* History */}
      <div style={{marginTop:'1.5rem'}}>
        <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.25,marginBottom:'.75rem'}}>Historique</p>
        <AgentHistory/>
      </div>
    </div>
  );
}
function AgentHistory() {
  const [runs,setRuns]=useState<any[]>([]);
  useEffect(()=>{sb.from('agent_runs').select('id,status,summary,started_at,finished_at').order('started_at',{ascending:false}).limit(10).then(({data})=>setRuns(data||[]));},[]);
  if(!runs.length) return <p style={{fontSize:'.72rem',opacity:.25}}>Aucun run pour l'instant.</p>;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
      {runs.map(r=>(
        <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.6rem .85rem',background:'rgba(255,255,255,.03)',borderRadius:10,flexWrap:'wrap',gap:'.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
            <span style={{fontSize:'.75rem'}}>{r.status==='done'?'✅':r.status==='running'?'⏳':'❌'}</span>
            <span style={{fontSize:'.72rem',opacity:.6}}>{new Date(r.started_at).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
          </div>
          {r.summary&&<div style={{display:'flex',gap:'.5rem',flexWrap:'wrap'}}>
            {Object.entries(r.summary).filter(([,v])=>typeof v==='number').map(([k,v])=><span key={k} style={{fontSize:'.6rem',opacity:.5,background:'rgba(255,255,255,.05)',padding:'.12rem .45rem',borderRadius:999}}>{k} {v as number}</span>)}
          </div>}
        </div>
      ))}
    </div>
  );
}

/* ── ANALYTICS ─────────────────────────────────────────────── */
const countryFlag=(code:string)=>{
  if(!code||code.length!==2)return'🌍';
  try{return Array.from(code.toUpperCase()).map(c=>String.fromCodePoint(c.charCodeAt(0)+127397)).join('');}catch{return'🌍';}
};
const countryName:Record<string,string>={CI:'Côte d\'Ivoire',FR:'France',GB:'Royaume-Uni',US:'États-Unis',DE:'Allemagne',BE:'Belgique',CA:'Canada',SN:'Sénégal',CM:'Cameroun',MA:'Maroc',DZ:'Algérie',TN:'Tunisie',NG:'Nigeria',GH:'Ghana',IT:'Italie',ES:'Espagne',CH:'Suisse',NL:'Pays-Bas',PT:'Portugal',LU:'Luxembourg'};
const DEV_COLOR:Record<string,string>={mobile:'#a78bfa',tablet:'#60a5fa',desktop:'#34d399'};
const DEV_LABEL:Record<string,string>={mobile:'Mobile',tablet:'Tablette',desktop:'Ordinateur'};
function DevIcon({type}:{type:string}){
  if(type==='mobile') return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
  if(type==='tablet') return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function BrowserIcon({name}:{name:string}){
  const n=name.toLowerCase();
  if(n.includes('chrome')) return <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4285F4"/><circle cx="12" cy="12" r="4" fill="white"/><path d="M12 8h8.5M8.5 14 4.5 7M15.5 14 12 20" stroke="white" strokeWidth="1.5"/></svg>;
  if(n.includes('safari')) return <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#0a84ff"/><circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1"/><line x1="12" y1="5" x2="12" y2="7" stroke="white" strokeWidth="1.5"/><line x1="12" y1="17" x2="12" y2="19" stroke="white" strokeWidth="1.5"/><line x1="5" y1="12" x2="7" y2="12" stroke="white" strokeWidth="1.5"/><line x1="17" y1="12" x2="19" y2="12" stroke="white" strokeWidth="1.5"/><polygon points="12,8 14.5,14.5 12,13 9.5,14.5" fill="white"/></svg>;
  if(n.includes('firefox')) return <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FF6611"/><path d="M12 4c4 0 7 2.5 8 6-1-2-3-3-5-3-3 0-5 2-5 5s2 5 5 5c2 0 4-1 5-3-1 3.5-4 6-8 6A8 8 0 014 12a8 8 0 018-8z" fill="#FFA500"/></svg>;
  if(n.includes('edge')) return <svg width="14" height="14" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#0078D4"/><path d="M6 14c0-4 3-7 7-7 2 0 4 1 5 2-1-1-2-1-3-1-3 0-5 2-5 5 0 2 1 4 3 5H6c0 0-0-2 0-4z" fill="white"/><path d="M12 18c3 0 6-2 6-5 0 2-2 4-5 4-1 0-2 0-3-1 1 1 2 2 2 2z" fill="rgba(255,255,255,.6)"/></svg>;
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
}

function MiniBar({pct,color,h=6}:{pct:number;color:string;h?:number}){
  return <div style={{flex:1,height:h,background:'rgba(255,255,255,.07)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${Math.min(pct,100)}%`,background:color,borderRadius:3,transition:'width 700ms ease'}}/></div>;
}
function PageIcon({page}:{page:string}){
  if(page==='/')return<IcoHome/>;
  if(page.startsWith('/produits'))return<IcoShirt/>;
  if(page.startsWith('/blog'))return<IcoPen/>;
  if(page==='/panier')return<IcoCard/>;
  if(page==='/contact')return<IcoGlobe/>;
  if(page==='/espace-client')return<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
  return<IcoGlobe/>;
}
function PageLabel({page}:{page:string}){
  const name=page==='/'?'Accueil':page.startsWith('/produits/')?page.replace('/produits/',''):page.startsWith('/blog/')?page.replace('/blog/',''):page.replace('/','');
  return<span style={{display:'flex',alignItems:'center',gap:'.3rem',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',opacity:.75}}><PageIcon page={page}/><span style={{textOverflow:'ellipsis',overflow:'hidden',whiteSpace:'nowrap'}}>{name||page}</span></span>;
}

function Analytics(){
  const [period,setPeriod]=useState<'today'|'week'|'month'>('week');
  const [events,setEvents]=useState<any[]>([]);
  const [realtime,setRealtime]=useState(0);
  const [loading,setLoading]=useState(true);
  const [insights,setInsights]=useState<any>(null);
  const [insightsLoading,setInsightsLoading]=useState(false);

  const loadEvents=useCallback(async(p:'today'|'week'|'month')=>{
    setLoading(true);
    const now=new Date();
    let from:string;
    if(p==='today'){const d=new Date(now);d.setHours(0,0,0,0);from=d.toISOString();}
    else if(p==='week'){from=new Date(now.getTime()-7*86400000).toISOString();}
    else{from=new Date(now.getTime()-30*86400000).toISOString();}
    const{data}=await sb.from('analytics_events').select('*').gte('created_at',from).order('created_at',{ascending:true}).limit(5000);
    setEvents(data||[]);setLoading(false);
  },[]);

  const loadRealtime=useCallback(async()=>{
    const from=new Date(Date.now()-90000).toISOString();
    const{count}=await sb.from('visitor_heartbeats').select('*',{count:'exact',head:true}).gte('last_seen',from);
    setRealtime(count||0);
  },[]);

  async function getInsights(){
    setInsightsLoading(true);setInsights(null);
    const r=await fetch('/api/analytics/insights',{method:'POST',headers:ADMIN_HDR});
    const d=await r.json();
    setInsights(d);setInsightsLoading(false);
  }

  useEffect(()=>{loadEvents(period);loadRealtime();},[period,loadEvents,loadRealtime]);
  useEffect(()=>{const t=setInterval(loadRealtime,20000);return()=>clearInterval(t);},[loadRealtime]);

  const total=events.length;
  const sessions=new Set(events.map(e=>e.session_id||e.id)).size;
  const ppp=sessions>0?(total/sessions).toFixed(1):'—';

  // Avg time on site per session (from min→max event timestamp)
  const sessionTimes:Record<string,{first:number;last:number}>={};
  events.forEach(e=>{const t=new Date(e.created_at).getTime();const sid=e.session_id||e.id;if(!sessionTimes[sid])sessionTimes[sid]={first:t,last:t};else{sessionTimes[sid].first=Math.min(sessionTimes[sid].first,t);sessionTimes[sid].last=Math.max(sessionTimes[sid].last,t);}});
  const durations=Object.values(sessionTimes).map(s=>s.last-s.first).filter(d=>d>10000);
  const avgTimeSec=durations.length>0?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length/1000):0;
  const avgTimeStr=avgTimeSec>=60?`${Math.floor(avgTimeSec/60)}m${String(avgTimeSec%60).padStart(2,'0')}s`:avgTimeSec>0?`${avgTimeSec}s`:'—';

  function topN(key:string,n=12){const m:Record<string,number>={};events.forEach(e=>{const v=e[key]||'Inconnu';m[v]=(m[v]||0)+1;});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,n);}
  const byCountry=topN('country',15);
  const byDevice=topN('device',3);
  const byPage=topN('page',10);
  const byRef=topN('referrer',8);
  const byBrowser=topN('browser',6);
  const maxCountry=byCountry[0]?.[1]||1;
  const maxPage=byPage[0]?.[1]||1;

  // ── GRAPHIQUE DÉTAILLÉ ──
  const todayStr=new Date().toISOString().split('T')[0];
  const bins=period==='today'?24:period==='week'?7:30;
  const chartData=Array.from({length:bins},(_,i)=>{
    if(period==='today'){
      const h=i;
      const count=events.filter(e=>{const t=new Date(e.created_at);return t.toISOString().split('T')[0]===todayStr&&t.getHours()===h;}).length;
      const mobile=events.filter(e=>{const t=new Date(e.created_at);return t.toISOString().split('T')[0]===todayStr&&t.getHours()===h&&e.device==='mobile';}).length;
      return{label:`${h}h`,sublabel:'',date:todayStr,isToday:true,count,mobile};
    }
    const d=new Date(Date.now()-(bins-1-i)*86400000);
    const dateStr=d.toISOString().split('T')[0];
    const isToday=dateStr===todayStr;
    const dayName=d.toLocaleDateString('fr-FR',{weekday:'short'}).replace('.','');
    const dayNum=d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
    const count=events.filter(e=>e.created_at?.split('T')[0]===dateStr).length;
    const mobile=events.filter(e=>e.created_at?.split('T')[0]===dateStr&&e.device==='mobile').length;
    return{label:dayName,sublabel:dayNum,date:dateStr,isToday,count,mobile};
  });
  const chartMax=Math.max(...chartData.map(d=>d.count),1);
  const chartAvg=Math.round(total/Math.max(bins,1));
  const avgPct=Math.round(chartAvg/chartMax*100);

  return (
    <div>
      <SectionTitle>Analytics</SectionTitle>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>

      {/* Header bar */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',flexWrap:'wrap',gap:'.75rem'}}>
        <div style={{display:'flex',gap:'.4rem'}}>
          {(['today','week','month'] as const).map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} style={{fontSize:'.62rem',fontWeight:700,padding:'.32rem .85rem',borderRadius:999,background:period===p?'white':'rgba(255,255,255,.06)',color:period===p?'black':'rgba(255,255,255,.5)',border:'none',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.08em'}}>
              {p==='today'?'Aujourd\'hui':p==='week'?'7 jours':'30 jours'}
            </button>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.5rem',background:realtime>0?'rgba(52,211,153,.1)':'rgba(255,255,255,.05)',border:`1px solid ${realtime>0?'rgba(52,211,153,.3)':'rgba(255,255,255,.1)'}`,borderRadius:999,padding:'.3rem .9rem'}}>
          <span style={{width:7,height:7,borderRadius:'50%',background:realtime>0?'#34d399':'rgba(255,255,255,.3)',display:'inline-block',animation:realtime>0?'blink 2s infinite':undefined}}/>
          <span style={{fontSize:'.65rem',fontWeight:700,color:realtime>0?'#34d399':'rgba(255,255,255,.4)'}}>{realtime>0?`${realtime} visiteur${realtime>1?'s':''} actif${realtime>1?'s':''}` :'Aucun visiteur actif'}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'.75rem',marginBottom:'1.25rem'}}>
        <StatCard label="Pages vues" value={loading?'…':total.toLocaleString('fr-FR')} sub={period==='today'?'aujourd\'hui':period==='week'?'7 jours':'30 jours'}/>
        <StatCard label="Sessions" value={loading?'…':sessions.toLocaleString('fr-FR')} sub="visites uniques"/>
        <StatCard label="Pages / session" value={loading?'…':ppp} sub="profondeur de visite"/>
        <StatCard label="Temps moyen" value={loading?'…':avgTimeStr} sub="par session"/>
      </div>

      {/* MiniChart — sparkline aperçu trafic */}
      {!loading && chartData.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginBottom:'1.25rem'}}>
          <MiniChart
            data={chartData.slice(-7).map(d => ({ label: d.label, value: d.count }))}
            title="Trafic"
            unit=" vues"
          />
          <MiniChart
            data={chartData.slice(-7).map(d => ({ label: d.label, value: d.mobile }))}
            title="Mobile"
            unit=" visites"
          />
        </div>
      )}

      {/* ── GRAPHIQUE DÉTAILLÉ ── */}
      <Card style={{marginBottom:'1rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem',flexWrap:'wrap',gap:'.5rem'}}>
          <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35}}>{period==='today'?'Trafic par heure (aujourd\'hui)':period==='week'?'Trafic sur 7 jours':'Trafic sur 30 jours'}</p>
          <div style={{display:'flex',gap:'1rem',fontSize:'.6rem',opacity:.45}}>
            <span><span style={{color:'#a78bfa'}}>■</span> Mobile</span>
            <span><span style={{color:'rgba(167,139,250,.35)'}}>■</span> Desktop</span>
            <span style={{color:'#facc15'}}>— Moyenne ({chartAvg}/j)</span>
          </div>
        </div>
        {loading?<p style={{opacity:.3,fontSize:'.75rem'}}>Chargement…</p>:(
          <div style={{overflowX:'auto'}}>
            <div style={{minWidth:bins<=7?'auto':'480px'}}>
              {/* Bars */}
              <div style={{position:'relative',display:'flex',alignItems:'flex-end',gap:bins===30?3:6,height:140,marginBottom:0,paddingBottom:0}}>
                {/* Average line */}
                <div style={{position:'absolute',left:0,right:0,bottom:`${Math.round(avgPct*120/100)}px`,borderTop:'1px dashed rgba(250,204,21,.4)',pointerEvents:'none',zIndex:1}}/>

                {chartData.map((d,i)=>{
                  const barH=Math.max(Math.round(d.count/chartMax*120),d.count>0?4:1);
                  const mobileH=d.count>0?Math.round(d.mobile/Math.max(d.count,1)*barH):0;
                  return(
                    <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:0,minWidth:bins===30?8:undefined}}>
                      {/* Count label */}
                      <span style={{fontSize:bins===30?'.48rem':'.58rem',fontWeight:d.isToday?700:400,color:d.isToday?'#a78bfa':'rgba(255,255,255,.5)',marginBottom:3,opacity:d.count>0?1:.2,letterSpacing:'-0.02em'}}>
                        {d.count>0||d.isToday?d.count:''}
                      </span>
                      {/* Stacked bar: desktop + mobile */}
                      <div style={{width:'100%',height:barH,display:'flex',flexDirection:'column',justifyContent:'flex-end',borderRadius:'3px 3px 0 0',overflow:'hidden',background:d.isToday?'rgba(167,139,250,.25)':'rgba(255,255,255,.06)'}}>
                        {d.count>0&&<>
                          <div style={{width:'100%',height:barH-mobileH,background:d.isToday?'rgba(52,211,153,.6)':'rgba(52,211,153,.3)',transition:'height 600ms'}}/>
                          <div style={{width:'100%',height:mobileH,background:d.isToday?'#a78bfa':'rgba(167,139,250,.55)',transition:'height 600ms'}}/>
                        </>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X labels */}
              <div style={{display:'flex',gap:bins===30?3:6,borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:6,marginTop:0}}>
                {chartData.map((d,i)=>(
                  <div key={i} style={{flex:1,textAlign:'center',minWidth:bins===30?8:undefined}}>
                    <p style={{fontSize:bins===30?'.44rem':'.58rem',fontWeight:d.isToday?700:400,color:d.isToday?'#a78bfa':'rgba(255,255,255,.35)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{d.label}</p>
                    {bins<=7&&d.sublabel&&<p style={{fontSize:'.48rem',opacity:.3,marginTop:1}}>{d.sublabel}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Appareils + Navigateurs */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
        <Card>
          <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'1rem'}}>Appareils</p>
          {loading?<p style={{opacity:.3,fontSize:'.75rem'}}>Chargement…</p>:byDevice.length===0?<p style={{opacity:.25,fontSize:'.75rem'}}>Aucune donnée</p>:
            <div style={{display:'flex',flexDirection:'column',gap:'.85rem'}}>
              {byDevice.map(([dev,cnt])=>(
                <div key={dev}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.3rem'}}>
                    <span style={{display:'flex',alignItems:'center',gap:'.35rem',fontSize:'.7rem',fontWeight:600,color:DEV_COLOR[dev]||'white'}}><DevIcon type={dev}/>{DEV_LABEL[dev]||dev}</span>
                    <span style={{fontSize:'.7rem',opacity:.5}}>{Math.round(cnt/Math.max(total,1)*100)}%</span>
                  </div>
                  <MiniBar pct={Math.round(cnt/Math.max(total,1)*100)} color={DEV_COLOR[dev]||'#fff'} h={8}/>
                </div>
              ))}
            </div>
          }
        </Card>
        <Card>
          <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'1rem'}}>Navigateurs</p>
          {loading?<p style={{opacity:.3,fontSize:'.75rem'}}>Chargement…</p>:byBrowser.length===0?<p style={{opacity:.25,fontSize:'.75rem'}}>Aucune donnée</p>:
            <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
              {byBrowser.map(([br,cnt])=>(
                <div key={br} style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
                  <span style={{display:'flex',alignItems:'center',gap:'.35rem',fontSize:'.7rem',minWidth:72,opacity:.85}}><BrowserIcon name={br}/>{br}</span>
                  <MiniBar pct={Math.round(cnt/(byBrowser[0]?.[1]||1)*100)} color='rgba(167,139,250,.7)'/>
                  <span style={{fontSize:'.65rem',opacity:.4,minWidth:24,textAlign:'right'}}>{cnt}</span>
                </div>
              ))}
            </div>
          }
        </Card>
      </div>

      {/* Pays */}
      <Card style={{marginBottom:'1rem'}}>
        <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'1rem'}}>Pays</p>
        {loading?<p style={{opacity:.3,fontSize:'.75rem'}}>Chargement…</p>:
          byCountry.length===0?
          <p style={{opacity:.25,fontSize:'.8rem',textAlign:'center',padding:'1.5rem 0'}}>
            Aucune donnée.<br/>
            <span style={{fontSize:'.7rem',opacity:.6}}>Le pays s'affiche dès qu'un vrai visiteur arrive sur le site en production.</span>
          </p>:
          <div style={{display:'flex',flexDirection:'column',gap:'.7rem'}}>
            {byCountry.map(([code,cnt],i)=>{
              const flag=countryFlag(code);
              const name=countryName[code]||code;
              const pct=Math.round(cnt/Math.max(total,1)*100);
              const barColor=i===0?'#a78bfa':i===1?'#60a5fa':i===2?'#34d399':i<5?'rgba(250,204,21,.6)':'rgba(255,255,255,.25)';
              return(
                <div key={code} style={{display:'grid',gridTemplateColumns:'28px 1fr auto auto',alignItems:'center',gap:'.6rem'}}>
                  <span style={{fontSize:'1.1rem',textAlign:'center',lineHeight:1}}>{flag}</span>
                  <div style={{display:'flex',flexDirection:'column',gap:2}}>
                    <span style={{fontSize:'.7rem',fontWeight:600,opacity:.85}}>{name}</span>
                    <div style={{height:5,background:'rgba(255,255,255,.07)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${Math.round(cnt/maxCountry*100)}%`,background:barColor,borderRadius:3,transition:'width 700ms'}}/>
                    </div>
                  </div>
                  <span style={{fontSize:'.7rem',fontWeight:700,color:barColor,minWidth:28,textAlign:'right'}}>{cnt}</span>
                  <span style={{fontSize:'.62rem',opacity:.3,minWidth:32,textAlign:'right'}}>{pct}%</span>
                </div>
              );
            })}
          </div>
        }
      </Card>

      {/* Pages + Sources */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
        <Card>
          <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'1rem'}}>Pages visitées</p>
          {loading?<p style={{opacity:.3,fontSize:'.75rem'}}>Chargement…</p>:byPage.length===0?<p style={{opacity:.25,fontSize:'.75rem'}}>Aucune donnée</p>:
            <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
              {byPage.map(([page,cnt])=>(
                <div key={page} style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.68rem'}}>
                  <PageLabel page={page}/>
                  <MiniBar pct={Math.round(cnt/maxPage*100)} color='rgba(250,204,21,.65)'/>
                  <span style={{opacity:.4,minWidth:22,textAlign:'right'}}>{cnt}</span>
                </div>
              ))}
            </div>
          }
        </Card>
        <Card>
          <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'1rem'}}>Sources de trafic</p>
          {loading?<p style={{opacity:.3,fontSize:'.75rem'}}>Chargement…</p>:byRef.length===0?<p style={{opacity:.25,fontSize:'.75rem'}}>Aucune donnée</p>:
            <div style={{display:'flex',flexDirection:'column',gap:'.6rem'}}>
              {byRef.map(([ref,cnt])=>(
                <div key={ref} style={{display:'flex',alignItems:'center',gap:'.5rem'}}>
                  <span style={{fontSize:'.68rem',flex:1,opacity:.75,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ref}</span>
                  <MiniBar pct={Math.round(cnt/(byRef[0]?.[1]||1)*100)} color='rgba(96,165,250,.7)'/>
                  <span style={{fontSize:'.68rem',opacity:.4,minWidth:22,textAlign:'right'}}>{cnt}</span>
                </div>
              ))}
            </div>
          }
        </Card>
      </div>

      {/* ── INSIGHTS IA ── */}
      <Card style={{borderColor:'rgba(167,139,250,.2)',background:'rgba(167,139,250,.04)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem',flexWrap:'wrap',gap:'.5rem'}}>
          <div>
            <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#a78bfa',marginBottom:'.2rem'}}>Analyse IA — Recommandations</p>
            <p style={{fontSize:'.65rem',opacity:.4,lineHeight:1.4}}>Claude analyse le comportement des visiteurs et recommande les meilleurs horaires de post, pays à cibler et contenus qui vont performer.</p>
          </div>
          <Btn loading={insightsLoading} onClick={getInsights} variant="ghost" small>{insightsLoading?'Analyse en cours…':'Analyser avec l\'IA'}</Btn>
        </div>

        {insights&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {/* Score santé */}
            {insights.insights?.score_sante&&(
              <div style={{background:'rgba(255,255,255,.04)',borderRadius:12,padding:'.85rem 1rem',display:'flex',alignItems:'center',gap:'1rem'}}>
                <div style={{textAlign:'center',minWidth:52}}>
                  <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.75rem',color:'#34d399',lineHeight:1}}>{insights.insights.score_sante.note}</p>
                  <p style={{fontSize:'.5rem',opacity:.4,textTransform:'uppercase',letterSpacing:'.1em'}}>Santé</p>
                </div>
                <p style={{fontSize:'.7rem',opacity:.65,lineHeight:1.6}}>{insights.insights.score_sante.commentaire}</p>
              </div>
            )}

            {/* Alerte */}
            {insights.insights?.alerte&&(
              <div style={{background:'rgba(250,204,21,.06)',border:'1px solid rgba(250,204,21,.2)',borderRadius:10,padding:'.75rem 1rem'}}>
                <p style={{fontSize:'.65rem',color:'#facc15',lineHeight:1.55}}>⚡ {insights.insights.alerte}</p>
              </div>
            )}

            {/* Horaires post */}
            {insights.insights?.meilleur_moment_post&&(
              <div>
                <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'.6rem'}}>Meilleurs horaires de publication</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem'}}>
                  {Object.entries(insights.insights.meilleur_moment_post).map(([pl,time])=>(
                    <div key={pl} style={{background:'rgba(255,255,255,.04)',borderRadius:10,padding:'.6rem .85rem',display:'flex',alignItems:'center',gap:'.6rem'}}>
                      <span style={{flexShrink:0}}>{PLATFORM_LOGO[pl as keyof typeof PLATFORM_LOGO]||<span style={{fontSize:'.75rem'}}>{pl}</span>}</span>
                      <div>
                        <p style={{fontSize:'.55rem',textTransform:'uppercase',opacity:.35,letterSpacing:'.08em',marginBottom:'.1rem'}}>{PLATFORM_NAME[pl]||pl}</p>
                        <p style={{fontSize:'.7rem',fontWeight:600,lineHeight:1.4}}>{time as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marchés prioritaires */}
            {insights.insights?.marches_prioritaires?.length>0&&(
              <div>
                <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'.6rem'}}>Marchés prioritaires</p>
                <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
                  {insights.insights.marches_prioritaires.map((m:string,i:number)=>(
                    <div key={i} style={{display:'flex',gap:'.6rem',alignItems:'flex-start',fontSize:'.7rem',opacity:.75,lineHeight:1.5}}>
                      <span style={{color:'#a78bfa',flexShrink:0,fontWeight:700}}>{i+1}.</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comportement mobile */}
            {insights.insights?.comportement_mobile&&(
              <div style={{background:'rgba(255,255,255,.03)',borderRadius:10,padding:'.75rem 1rem'}}>
                <p style={{fontSize:'.55rem',textTransform:'uppercase',opacity:.35,letterSpacing:'.1em',marginBottom:'.35rem'}}>Comportement mobile</p>
                <p style={{fontSize:'.7rem',opacity:.7,lineHeight:1.6}}>{insights.insights.comportement_mobile}</p>
              </div>
            )}

            {/* Ciblage publicitaire */}
            {insights.insights?.ciblage_publicitaire&&(
              <div>
                <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'.6rem'}}>Ciblage publicitaire recommandé</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem'}}>
                  {[['🇨🇮 Côte d\'Ivoire',insights.insights.ciblage_publicitaire.audience_ci],['🇫🇷 France',insights.insights.ciblage_publicitaire.audience_fr]].map(([label,text])=>(
                    <div key={label} style={{background:'rgba(255,255,255,.04)',borderRadius:10,padding:'.7rem .85rem'}}>
                      <p style={{fontSize:'.6rem',fontWeight:700,marginBottom:'.35rem',opacity:.7}}>{label}</p>
                      <p style={{fontSize:'.65rem',opacity:.6,lineHeight:1.55}}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions immédiates */}
            {insights.insights?.actions_immediates?.length>0&&(
              <div style={{background:'rgba(52,211,153,.05)',border:'1px solid rgba(52,211,153,.15)',borderRadius:12,padding:'.85rem 1rem'}}>
                <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',color:'#34d399',marginBottom:'.65rem'}}>Actions immédiates</p>
                <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                  {insights.insights.actions_immediates.map((a:string,i:number)=>(
                    <div key={i} style={{display:'flex',gap:'.65rem',alignItems:'flex-start',fontSize:'.7rem',opacity:.8,lineHeight:1.5}}>
                      <span style={{color:'#34d399',flexShrink:0,fontWeight:700}}>→</span>
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {insights.dataPoints!==undefined&&<p style={{fontSize:'.58rem',opacity:.25,textAlign:'center'}}>Basé sur {insights.dataPoints} page vue{insights.dataPoints!==1?'s':''} · {insights.sessions} session{insights.sessions!==1?'s':''}</p>}
          </div>
        )}

        {!insights&&!insightsLoading&&(
          <div style={{textAlign:'center',padding:'1.5rem 0',opacity:.3}}>
            <p style={{fontSize:'.75rem'}}>Clique sur "Analyser avec l'IA" pour obtenir des recommandations personnalisées basées sur ton trafic réel.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ── EMAIL AGENT ───────────────────────────────────────────── */
function EmailAgent() {
  const EMAIL_TYPES = [
    { type:'welcome',        label:'Bienvenue',         desc:'Nouvel inscrit' },
    { type:'order_confirm',  label:'Confirmation',      desc:'Commande confirmée' },
    { type:'shipping',       label:'Expédition',        desc:'Colis en route' },
    { type:'cart_abandon',   label:'Relance panier',    desc:'Panier abandonné' },
    { type:'sav_escalation', label:'SAV',               desc:'Prise en charge problème' },
  ];

  const [selType,  setSelType]  = useState('welcome');
  const [toEmail,  setToEmail]  = useState('');
  const [dataJson, setDataJson] = useState('{\n  "customer_name": "Jean Koné",\n  "product_name": "FLORAL HOODIE",\n  "total_amount": "89€"\n}');
  const [result,   setResult]   = useState<any>(null);
  const [loading,  setLoading]  = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  async function generate(send=false) {
    setLoading(true); setResult(null);
    let data: Record<string,unknown> = {};
    try { data = JSON.parse(dataJson); } catch {}

    const res = await fetch('/api/ai/email', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', 'x-admin-secret': ADMIN_PWD },
      body: JSON.stringify({ type: selType, to: send && toEmail ? toEmail : undefined, data }),
    });
    const json = await res.json();
    setResult(json);
    if (json.html) setPreviewHtml(json.html);
    setLoading(false);
  }

  return (
    <div>
      <SectionTitle>✉️ Email Agent</SectionTitle>
      <p style={{fontSize:'0.72rem',opacity:.4,marginBottom:'1.5rem',marginTop:'-1rem'}}>
        Génère des emails transactionnels HTML avec Claude · Envoi via Resend si configuré
      </p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:'0.65rem',marginBottom:'1.5rem'}}>
        {EMAIL_TYPES.map(t=>(
          <button key={t.type} onClick={()=>setSelType(t.type)}
            style={{padding:'0.85rem',background:selType===t.type?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)',border:`1px solid ${selType===t.type?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.07)'}`,borderRadius:12,cursor:'pointer',textAlign:'left',transition:'all 150ms'}}>
            <p style={{margin:0,fontSize:'0.7rem',fontWeight:700,color:'white',marginBottom:'0.2rem'}}>{t.label}</p>
            <p style={{margin:0,fontSize:'0.6rem',opacity:.4}}>{t.desc}</p>
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
        <div>
          <label style={{fontSize:'0.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',opacity:.4,display:'block',marginBottom:'0.4rem'}}>Destinataire (optionnel)</label>
          <input value={toEmail} onChange={e=>setToEmail(e.target.value)} placeholder="client@email.com"
            style={{width:'100%',padding:'0.7rem 1rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:10,color:'white',fontSize:'0.8rem',fontFamily:'system-ui',outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div>
          <label style={{fontSize:'0.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',opacity:.4,display:'block',marginBottom:'0.4rem'}}>Données (JSON)</label>
          <textarea value={dataJson} onChange={e=>setDataJson(e.target.value)} rows={3}
            style={{width:'100%',padding:'0.7rem 1rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.09)',borderRadius:10,color:'white',fontSize:'0.72rem',fontFamily:'monospace',outline:'none',boxSizing:'border-box',resize:'vertical'}}/>
        </div>
      </div>

      <div style={{display:'flex',gap:'0.65rem',marginBottom:'1.5rem'}}>
        <Btn onClick={()=>generate(false)} loading={loading}>Générer l'aperçu</Btn>
        {toEmail && <Btn onClick={()=>generate(true)} loading={loading} variant="ghost">Envoyer à {toEmail}</Btn>}
      </div>

      {result && (
        <div style={{display:'grid',gap:'1rem'}}>
          <Card>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
              <p style={{margin:0,fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}}>Résultat</p>
              <div style={{display:'flex',gap:'0.5rem'}}>
                {result.resend_configured
                  ? <Badge label="Resend ✓" color="#22c55e"/>
                  : <Badge label="Resend non configuré" color="#f59e0b"/>}
                {result.send?.sent && <Badge label="Envoyé ✓" color="#22c55e"/>}
              </div>
            </div>
            <p style={{fontSize:'0.72rem',opacity:.5,marginBottom:'0.3rem'}}>Objet :</p>
            <p style={{fontSize:'0.85rem',fontWeight:600,marginBottom:'0.75rem'}}>{result.subject}</p>
            <p style={{fontSize:'0.72rem',opacity:.5,marginBottom:'0.3rem'}}>Preview text :</p>
            <p style={{fontSize:'0.78rem',opacity:.7,marginBottom:'0.75rem'}}>{result.preview_text}</p>
            {result.send?.reason && <p style={{fontSize:'0.65rem',color:'#f59e0b'}}>{result.send.reason}</p>}
          </Card>

          {previewHtml && (
            <Card style={{padding:0,overflow:'hidden'}}>
              <div style={{padding:'0.75rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <p style={{margin:0,fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}}>Aperçu HTML</p>
                <CopyBtn text={previewHtml}/>
              </div>
              <div style={{background:'white',minHeight:200}}>
                <iframe
                  srcDoc={previewHtml}
                  style={{width:'100%',minHeight:400,border:'none',display:'block'}}
                  title="Email preview"
                />
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ── SQL CHAT ──────────────────────────────────────────────── */
function SqlChat() {
  const [question, setQuestion] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [steps,    setSteps]    = useState<{msg:string;detail?:string}[]>([]);
  const [result,   setResult]   = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const EXAMPLES = [
    'Combien de commandes en attente ?',
    'Quel est le chiffre d\'affaires total payé ?',
    'Les 5 dernières commandes',
    'Combien d\'articles de blog publiés ?',
    'Répartition des commandes par statut',
    'Posts en attente sur Instagram',
  ];

  async function ask(q?: string) {
    const query = (q || question).trim();
    if (!query || loading) return;
    setQuestion(q || question);
    setLoading(true); setSteps([]); setResult(null);

    try {
      const res = await fetch('/api/ai/sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_PWD },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok || !res.body) throw new Error('Erreur serveur');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part.replace(/^data: /, '').trim();
          if (!line) continue;
          try {
            const evt = JSON.parse(line);
            if (evt.type === 'step') {
              setSteps(prev => [...prev, { msg: evt.message, detail: evt.plan ? `Table: ${evt.plan.table}` : undefined }]);
            } else if (evt.type === 'done') {
              setResult(evt);
            } else if (evt.type === 'error') {
              setSteps(prev => [...prev, { msg: '❌ ' + evt.error }]);
            }
          } catch {}
        }
      }
    } catch (err) {
      setSteps(prev => [...prev, { msg: '❌ Erreur : ' + String(err) }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <SectionTitle>🗄️ SQL Chat</SectionTitle>
      <p style={{fontSize:'0.72rem',opacity:.4,marginBottom:'1.5rem',marginTop:'-1rem'}}>
        Interroge ta base Supabase en français · Lecture seule · Alimenté par Claude
      </p>

      {/* Exemples */}
      <div style={{display:'flex',flexWrap:'wrap',gap:'0.35rem',marginBottom:'1.25rem'}}>
        {EXAMPLES.map((ex,i) => (
          <button key={i} onClick={()=>{ setQuestion(ex); ask(ex); }}
            style={{padding:'0.35rem 0.85rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:999,color:'rgba(255,255,255,0.65)',fontSize:'0.65rem',cursor:'pointer',transition:'all 150ms'}}
            onMouseEnter={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.09)'; }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.04)'; }}>
            {ex}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{display:'flex',gap:'0.65rem',marginBottom:'1.5rem'}}>
        <input ref={inputRef} value={question} onChange={e=>setQuestion(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') ask(); }}
          placeholder="Ex: Combien de commandes livrées ce mois-ci ?"
          style={{flex:1,padding:'0.8rem 1.1rem',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'white',fontSize:'0.82rem',fontFamily:'system-ui',outline:'none'}}/>
        <Btn onClick={()=>ask()} loading={loading}>Requête</Btn>
      </div>

      {/* Steps */}
      {steps.length > 0 && (
        <div style={{display:'flex',flexDirection:'column',gap:'0.35rem',marginBottom:'1rem'}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'0.5rem',fontSize:'0.7rem',opacity:.6}}>
              <span>→</span>
              <div>
                <span>{s.msg}</span>
                {s.detail && <span style={{opacity:.5,marginLeft:'0.5rem'}}>{s.detail}</span>}
              </div>
            </div>
          ))}
          {loading && <div style={{fontSize:'0.7rem',opacity:.4}}>→ En cours…</div>}
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div style={{display:'grid',gap:'1rem'}}>
          {/* Résumé IA */}
          <Card style={{background:'rgba(255,255,255,0.05)',borderColor:'rgba(255,255,255,0.12)'}}>
            <p style={{margin:'0 0 0.5rem',fontSize:'0.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.14em',opacity:.4}}>Réponse</p>
            <p style={{margin:0,fontSize:'0.88rem',lineHeight:1.6}}>{result.summary}</p>
            <div style={{display:'flex',gap:'1rem',marginTop:'0.75rem'}}>
              <span style={{fontSize:'0.62rem',opacity:.35}}>Table : {result.table}</span>
              <span style={{fontSize:'0.62rem',opacity:.35}}>{result.rows} lignes retournées {result.total ? `/ ${result.total} au total` : ''}</span>
            </div>
          </Card>

          {/* Table de données */}
          {result.data?.length > 0 && (
            <Card style={{padding:0,overflow:'hidden'}}>
              <div style={{padding:'0.75rem 1.25rem',borderBottom:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <p style={{margin:0,fontSize:'0.68rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}}>Données brutes</p>
                <CopyBtn text={JSON.stringify(result.data, null, 2)}/>
              </div>
              <div style={{overflowX:'auto',maxHeight:320,overflowY:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.68rem'}}>
                  <thead>
                    <tr style={{background:'rgba(255,255,255,0.04)'}}>
                      {Object.keys(result.data[0]).slice(0,8).map((col:string)=>(
                        <th key={col} style={{padding:'0.5rem 0.75rem',textAlign:'left',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',opacity:.5,whiteSpace:'nowrap',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.slice(0,50).map((row:Record<string,unknown>,i:number)=>(
                      <tr key={i} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                        {Object.values(row).slice(0,8).map((val:unknown,j:number)=>(
                          <td key={j} style={{padding:'0.45rem 0.75rem',opacity:.75,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                            {String(val ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

/* ── MEMBRES ────────────────────────────────────────────────── */
function Membres() {
  const [members,setMembers]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  useEffect(()=>{
    sb.from('profiles').select('id,email,full_name,phone,city,country,created_at').order('created_at',{ascending:false}).limit(200)
      .then(({data})=>{setMembers(data||[]);setLoading(false);});
  },[]);
  const filtered=members.filter(m=>{
    if(!search) return true;
    const q=search.toLowerCase();
    return (m.email||'').toLowerCase().includes(q)||(m.full_name||'').toLowerCase().includes(q)||(m.city||'').toLowerCase().includes(q);
  });
  return (
    <div>
      <SectionTitle>Membres ({members.length})</SectionTitle>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard label="Total membres" value={members.length} sub="comptes créés"/>
        <StatCard label="Ce mois" value={members.filter(m=>new Date(m.created_at)>=new Date(Date.now()-30*86400000)).length} sub="nouveaux"/>
        <StatCard label="Avec téléphone" value={members.filter(m=>m.phone).length} sub="notifiables SMS"/>
      </div>
      <Card style={{marginBottom:'1rem'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par email, nom, ville…"
          style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'.65rem 1rem',color:'white',fontSize:'.8rem',outline:'none'}}/>
      </Card>
      {loading?<p style={{opacity:.4}}>Chargement…</p>:
        filtered.length===0?<Card><p style={{opacity:.3,textAlign:'center',padding:'2rem',fontSize:'.85rem'}}>Aucun membre trouvé.</p></Card>:
        <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
          {filtered.map(m=>(
            <Card key={m.id} style={{padding:'.9rem 1.25rem'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'.5rem'}}>
                <div>
                  <p style={{fontSize:'.82rem',fontWeight:600}}>{m.full_name||'—'}</p>
                  <p style={{fontSize:'.68rem',opacity:.5}}>{m.email}</p>
                  {(m.city||m.country)&&<p style={{fontSize:'.62rem',opacity:.3}}>{[m.city,m.country].filter(Boolean).join(', ')}</p>}
                </div>
                <div style={{textAlign:'right'}}>
                  {m.phone&&<p style={{fontSize:'.7rem',opacity:.6}}>📞 {m.phone}</p>}
                  <p style={{fontSize:'.6rem',opacity:.25}}>{new Date(m.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

/* ── NEWSLETTER ─────────────────────────────────────────────── */
function Newsletter() {
  const [subs,setSubs]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [broadcast,setBroadcast]=useState('');
  const [sending,setSending]=useState(false);
  const [sendLog,setSendLog]=useState('');
  const [subject,setSubject]=useState('');

  useEffect(()=>{
    sb.from('newsletter_subscribers').select('id,email,source,status,created_at').order('created_at',{ascending:false}).limit(300)
      .then(({data})=>{setSubs(data||[]);setLoading(false);});
  },[]);

  const actives=subs.filter(s=>s.status==='active');

  async function sendBroadcast() {
    if(!subject.trim()||!broadcast.trim()||actives.length===0) return;
    if(!confirm(`Envoyer à ${actives.length} abonnés actifs ?`)) return;
    setSending(true); setSendLog('');
    let ok=0,fail=0;
    // Send in batches of 10
    for(let i=0;i<actives.length;i+=10){
      const batch=actives.slice(i,i+10);
      await Promise.all(batch.map(async(sub)=>{
        try{
          const r=await fetch('/api/ai/email',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({
            type:'cart_abandon',to:sub.email,
            data:{custom_subject:subject,custom_message:broadcast,email:sub.email},
          })});
          const d=await r.json();
          if(d.send?.sent) ok++; else fail++;
        }catch{ fail++; }
      }));
    }
    setSending(false);
    setSendLog(`✅ Envoyé : ${ok} | ❌ Échec : ${fail}`);
  }

  async function unsubscribe(id:string) {
    await sb.from('newsletter_subscribers').update({status:'unsubscribed',unsubscribed_at:new Date().toISOString()}).eq('id',id);
    setSubs(p=>p.map(s=>s.id===id?{...s,status:'unsubscribed'}:s));
  }

  return (
    <div>
      <SectionTitle>Newsletter</SectionTitle>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard label="Total abonnés" value={subs.length}/>
        <StatCard label="Actifs" value={actives.length} sub="recevront l'email"/>
        <StatCard label="Désabonnés" value={subs.filter(s=>s.status!=='active').length}/>
      </div>

      {/* Broadcast composer */}
      <Card style={{marginBottom:'1.5rem'}}>
        <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'1rem'}}>Envoyer une campagne</p>
        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Objet de l'email…"
          style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'.65rem 1rem',color:'white',fontSize:'.8rem',outline:'none',marginBottom:'.75rem'}}/>
        <textarea value={broadcast} onChange={e=>setBroadcast(e.target.value)} rows={4}
          placeholder="Message de la campagne (l'IA va générer un email HTML élégant)…"
          style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'.65rem 1rem',color:'white',fontSize:'.8rem',outline:'none',resize:'vertical',marginBottom:'1rem',fontFamily:'inherit'}}/>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
          <Btn onClick={sendBroadcast} loading={sending}>Envoyer à {actives.length} abonnés</Btn>
          {sendLog&&<span style={{fontSize:'.72rem',opacity:.7}}>{sendLog}</span>}
        </div>
      </Card>

      {/* Subscriber list */}
      <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.75rem'}}>Liste des abonnés</p>
      {loading?<p style={{opacity:.4}}>Chargement…</p>:
        <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
          {subs.map(s=>(
            <div key={s.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'.65rem 1rem',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.05)',borderRadius:10,gap:'.5rem',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:s.status==='active'?'#34d399':'#f87171',flexShrink:0,display:'inline-block'}}/>
                <p style={{fontSize:'.8rem'}}>{s.email}</p>
                <span style={{fontSize:'.6rem',opacity:.35,background:'rgba(255,255,255,.06)',padding:'.1rem .5rem',borderRadius:999}}>{s.source||'popup'}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'.75rem'}}>
                <span style={{fontSize:'.62rem',opacity:.3}}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
                {s.status==='active'&&<Btn onClick={()=>unsubscribe(s.id)} variant="ghost" small>Désabonner</Btn>}
                {s.status!=='active'&&<span style={{fontSize:'.62rem',color:'#f87171'}}>Désabonné</span>}
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

/* ── SMS ─────────────────────────────────────────────────────── */
function Sms() {
  const [to,setTo]=useState('');
  const [type,setType]=useState('custom');
  const [message,setMessage]=useState('');
  const [phones,setPhones]=useState('');
  const [sending,setSending]=useState(false);
  const [result,setResult]=useState('');
  const [logs,setLogs]=useState<any[]>([]);
  const [logsLoading,setLogsLoading]=useState(true);

  const SMS_TYPES=[
    {value:'order_confirm',label:'Confirmation commande'},
    {value:'shipping',     label:'Expédition'},
    {value:'cart_abandon', label:'Panier abandonné'},
    {value:'promo',        label:'Promotion / Code promo'},
    {value:'welcome',      label:'Bienvenue'},
    {value:'custom',       label:'Message libre'},
  ];

  useEffect(()=>{
    fetch('/api/sms',{headers:ADMIN_HDR}).then(r=>r.json()).then(d=>{setLogs(d.logs||[]);setLogsLoading(false);}).catch(()=>setLogsLoading(false));
  },[]);

  async function send() {
    setSending(true); setResult('');
    const isMulti=phones.trim().length>0;
    const body:Record<string,unknown>={type,data:{message,name:'Client PIETRI'}};
    if(isMulti) body.phones=phones.split('\n').map((p:string)=>p.trim()).filter(Boolean);
    else body.to=to;
    const r=await fetch('/api/sms',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify(body)});
    const d=await r.json();
    setSending(false);
    if(d.success||d.sent) setResult(`✅ ${isMulti?`${d.sent}/${d.total} envoyés`:'SMS envoyé'} via ${d.provider||'provider'}`);
    else setResult(`❌ Erreur : ${d.error||'inconnue'}`);
    // Reload logs
    fetch('/api/sms',{headers:ADMIN_HDR}).then(r=>r.json()).then(d=>setLogs(d.logs||[]));
  }

  const STATUS_CLR:Record<string,string>={sent:'#34d399',pending:'#facc15',failed:'#f87171'};

  return (
    <div>
      <SectionTitle>SMS</SectionTitle>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard label="SMS envoyés" value={logs.filter(l=>l.status==='sent').length}/>
        <StatCard label="Échecs" value={logs.filter(l=>l.status==='failed').length}/>
      </div>

      <Card style={{marginBottom:'1.5rem'}}>
        <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'1rem'}}>Envoyer un SMS</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.75rem',marginBottom:'.75rem'}}>
          <div>
            <p style={{fontSize:'.62rem',opacity:.4,marginBottom:'.3rem'}}>Type de message</p>
            <select value={type} onChange={e=>setType(e.target.value)}
              style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'.6rem .85rem',color:'white',fontSize:'.78rem',outline:'none'}}>
              {SMS_TYPES.map(t=><option key={t.value} value={t.value} style={{background:'#111'}}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <p style={{fontSize:'.62rem',opacity:.4,marginBottom:'.3rem'}}>Numéro (ex: +22507xxxxxxxx)</p>
            <input value={to} onChange={e=>setTo(e.target.value)} placeholder="+225 07 00 00 00 00"
              style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'.6rem .85rem',color:'white',fontSize:'.78rem',outline:'none'}}/>
          </div>
        </div>
        {type==='custom'||type==='promo'?
          <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
            placeholder={type==='promo'?'Ex: Nouveau drop ! Code -15% : PIETRI15 → pietri.io':'Ton message SMS…'}
            style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'.65rem 1rem',color:'white',fontSize:'.78rem',outline:'none',resize:'vertical',marginBottom:'.75rem',fontFamily:'inherit'}}/>
        :null}
        <div style={{marginBottom:'.75rem'}}>
          <p style={{fontSize:'.62rem',opacity:.4,marginBottom:'.3rem'}}>Envoi en masse — un numéro par ligne (optionnel)</p>
          <textarea value={phones} onChange={e=>setPhones(e.target.value)} rows={3}
            placeholder={"+22507000000\n+22508000000\n+33600000000"}
            style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'.65rem 1rem',color:'white',fontSize:'.72rem',outline:'none',resize:'vertical',fontFamily:'monospace'}}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
          <Btn onClick={send} loading={sending}>Envoyer</Btn>
          {result&&<span style={{fontSize:'.72rem',opacity:.8}}>{result}</span>}
        </div>
        <p style={{fontSize:'.6rem',opacity:.25,marginTop:'.75rem'}}>Provider : Africa's Talking (CI) → Twilio fallback. Configurez AFRICASTALKING_API_KEY dans Vercel.</p>
      </Card>

      {/* Logs */}
      <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.75rem'}}>Historique SMS</p>
      {logsLoading?<p style={{opacity:.4}}>Chargement…</p>:
        logs.length===0?<Card><p style={{opacity:.3,textAlign:'center',padding:'2rem',fontSize:'.85rem'}}>Aucun SMS envoyé pour l'instant.</p></Card>:
        <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
          {logs.map(l=>(
            <div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'.65rem 1rem',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.05)',borderRadius:10,gap:'1rem',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.2rem'}}>
                  <span style={{width:7,height:7,borderRadius:'50%',background:STATUS_CLR[l.status]||'#888',flexShrink:0,display:'inline-block'}}/>
                  <span style={{fontSize:'.78rem',fontWeight:600}}>{l.to_number}</span>
                  <span style={{fontSize:'.58rem',opacity:.35,background:'rgba(255,255,255,.06)',padding:'.1rem .45rem',borderRadius:999}}>{l.type}</span>
                </div>
                <p style={{fontSize:'.68rem',opacity:.45,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{l.message?.slice(0,80)}…</p>
                {l.error&&<p style={{fontSize:'.62rem',color:'#f87171',opacity:.7,marginTop:'.2rem'}}>{l.error}</p>}
              </div>
              <span style={{fontSize:'.6rem',opacity:.25,whiteSpace:'nowrap'}}>{new Date(l.created_at).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})}</span>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

/* ── CEO AGENT ──────────────────────────────────────────────── */
function CeoAgent() {
  const [loading,setLoading]=useState(false);
  const [report,setReport]=useState<any>(null);
  const [error,setError]=useState('');
  const [question,setQuestion]=useState('');
  const [askResult,setAskResult]=useState('');
  const [askLoading,setAskLoading]=useState(false);
  const [history,setHistory]=useState<any[]>([]);
  const [executing,setExecuting]=useState(false);

  useEffect(()=>{
    fetch('/api/ai/ceo',{headers:ADMIN_HDR}).then(r=>r.json()).then(d=>setHistory(d.reports||[])).catch(()=>{});
  },[]);

  async function generateReport(execute=false){
    setLoading(true); setError(''); setReport(null);
    try{
      const r=await fetch('/api/ai/ceo',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({mode:'report',execute_actions:execute})});
      const d=await r.json();
      if(d.error){setError(d.error);}else{setReport(d);}
    }catch(e){setError(String(e));}
    setLoading(false);
  }

  async function executeOrders(){
    setExecuting(true);
    await fetch('/api/ai/ceo',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({mode:'execute',execute_actions:true})});
    setExecuting(false);
    alert('Ordres exécutés ! Vérifiez Email Agent, SMS et Agent IA.');
  }

  async function askCeo(){
    if(!question.trim()) return;
    setAskLoading(true); setAskResult('');
    try{
      const r=await fetch('/api/ai/ceo',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({mode:'ask',custom_question:question})});
      const d=await r.json();
      setAskResult(d.data?.answer||d.error||'Pas de réponse');
    }catch(e){setAskResult(String(e));}
    setAskLoading(false);
  }

  const SCORE_COLOR=(s:number)=>s>=75?'#34d399':s>=50?'#facc15':'#f87171';
  const IMPACT_CLR:Record<string,string>={high:'#f87171',medium:'#facc15',low:'#34d399',urgent:'#f87171'};

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
        <h2 style={{fontFamily:"'Anton',sans-serif",fontSize:'clamp(1.2rem,4vw,1.75rem)',textTransform:'uppercase',letterSpacing:'0.02em',marginBottom:0}}>🧠 CEO Agent</h2>
        <span style={{fontSize:'.6rem',fontWeight:700,padding:'.2rem .65rem',borderRadius:999,background:'rgba(168,85,247,.15)',color:'#a855f7',border:'1px solid rgba(168,85,247,.3)',textTransform:'uppercase',letterSpacing:'.1em'}}>Supervise tout</span>
      </div>
      <p style={{fontSize:'.75rem',opacity:.4,marginBottom:'1.5rem',marginTop:'-1rem'}}>Le CEO IA analyse l'entreprise, supervise tous les agents et te donne un rapport exécutif complet.</p>

      {/* Actions */}
      <div style={{display:'flex',gap:'.65rem',marginBottom:'1.5rem',flexWrap:'wrap'}}>
        <Btn onClick={()=>generateReport(false)} loading={loading}>📊 Générer rapport</Btn>
        <Btn onClick={executeOrders} loading={executing} variant="ghost">⚡ Exécuter ordres urgents</Btn>
      </div>

      {error&&<Card style={{borderColor:'rgba(248,113,113,.3)',marginBottom:'1rem'}}><p style={{color:'#f87171',fontSize:'.8rem'}}>{error}</p></Card>}

      {loading&&<Card><div style={{textAlign:'center',padding:'2rem'}}><p style={{opacity:.5,fontSize:'.85rem'}}>🧠 Le CEO analyse toutes les données de l'entreprise…</p></div></Card>}

      {report&&(
        <div style={{display:'grid',gap:'1rem'}}>
          {/* Score + Summary */}
          <Card>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',marginBottom:'1rem'}}>
              <div style={{flex:1}}>
                <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.5rem'}}>Rapport exécutif</p>
                <p style={{fontSize:'.85rem',lineHeight:1.6}}>{report.data?.executive_summary}</p>
              </div>
              {report.data?.performance_score&&(
                <div style={{textAlign:'center',flexShrink:0}}>
                  <p style={{fontFamily:"'Anton',sans-serif",fontSize:'2.5rem',color:SCORE_COLOR(report.data.performance_score),lineHeight:1}}>{report.data.performance_score}</p>
                  <p style={{fontSize:'.55rem',opacity:.4,textTransform:'uppercase',letterSpacing:'.1em'}}>Score /100</p>
                </div>
              )}
            </div>
            {report.data?.ceo_message&&(
              <div style={{borderTop:'1px solid rgba(255,255,255,.07)',paddingTop:'.85rem',marginTop:'.85rem'}}>
                <p style={{fontSize:'.62rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'.4rem'}}>Message CEO</p>
                <p style={{fontSize:'.82rem',fontStyle:'italic',opacity:.8}}>"{report.data.ceo_message}"</p>
              </div>
            )}
          </Card>

          {/* KPIs */}
          {report.data?.kpi_analysis&&(
            <Card>
              <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'1rem'}}>Analyse KPIs</p>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'.65rem'}}>
                {Object.entries(report.data.kpi_analysis).map(([k,v])=>(
                  <div key={k} style={{background:'rgba(255,255,255,.03)',borderRadius:10,padding:'.75rem 1rem'}}>
                    <p style={{fontSize:'.55rem',textTransform:'uppercase',letterSpacing:'.1em',opacity:.35,marginBottom:'.3rem'}}>{k}</p>
                    <p style={{fontSize:'.75rem',opacity:.8}}>{String(v)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Opportunités + Risques */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            {report.data?.top_3_opportunities?.length>0&&(
              <Card>
                <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.85rem'}}>🚀 Opportunités</p>
                {report.data.top_3_opportunities.map((o:any,i:number)=>(
                  <div key={i} style={{marginBottom:'.85rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.2rem'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:IMPACT_CLR[o.impact]||'#888',display:'inline-block',flexShrink:0}}/>
                      <p style={{fontSize:'.78rem',fontWeight:600}}>{o.title}</p>
                    </div>
                    <p style={{fontSize:'.68rem',opacity:.5,paddingLeft:'1rem'}}>{o.action}</p>
                  </div>
                ))}
              </Card>
            )}
            {report.data?.top_3_risks?.length>0&&(
              <Card>
                <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.85rem'}}>⚠️ Risques</p>
                {report.data.top_3_risks.map((r:any,i:number)=>(
                  <div key={i} style={{marginBottom:'.85rem'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.2rem'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:IMPACT_CLR[r.severity]||'#888',display:'inline-block',flexShrink:0}}/>
                      <p style={{fontSize:'.78rem',fontWeight:600}}>{r.title}</p>
                    </div>
                    <p style={{fontSize:'.68rem',opacity:.5,paddingLeft:'1rem'}}>{r.mitigation}</p>
                  </div>
                ))}
              </Card>
            )}
          </div>

          {/* Ordres agents */}
          {report.data?.agent_orders?.length>0&&(
            <Card>
              <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'1rem'}}>📋 Ordres aux agents</p>
              <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
                {report.data.agent_orders.map((o:any,i:number)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.6rem 1rem',background:'rgba(255,255,255,.03)',borderRadius:8}}>
                    <span style={{fontSize:'.58rem',fontWeight:700,padding:'.15rem .5rem',borderRadius:999,background:IMPACT_CLR[o.priority]+'22',color:IMPACT_CLR[o.priority]||'#888',textTransform:'uppercase',letterSpacing:'.07em',flexShrink:0}}>{o.priority}</span>
                    <span style={{fontSize:'.6rem',opacity:.5,flexShrink:0}}>[{o.agent}]</span>
                    <p style={{fontSize:'.75rem',flex:1}}>{o.action}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {report.data?.weekly_prediction&&(
            <Card>
              <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.5rem'}}>🔮 Prédiction semaine prochaine</p>
              <p style={{fontSize:'.8rem',opacity:.75}}>{report.data.weekly_prediction}</p>
            </Card>
          )}
        </div>
      )}

      {/* Ask CEO */}
      <Card style={{marginTop:'1.5rem'}}>
        <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.85rem'}}>💬 Poser une question au CEO</p>
        <div style={{display:'flex',gap:'.65rem'}}>
          <input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>e.key==='Enter'&&askCeo()}
            placeholder="Ex: Quel est mon produit le plus rentable ? Comment augmenter le CA ce mois ?"
            style={{flex:1,background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:8,padding:'.65rem 1rem',color:'white',fontSize:'.8rem',outline:'none'}}/>
          <Btn onClick={askCeo} loading={askLoading}>Demander</Btn>
        </div>
        {askResult&&<p style={{fontSize:'.8rem',lineHeight:1.65,marginTop:'1rem',opacity:.85,whiteSpace:'pre-wrap'}}>{askResult}</p>}
      </Card>

      {/* Historique rapports */}
      {history.length>0&&(
        <Card style={{marginTop:'1.5rem'}}>
          <p style={{fontSize:'.58rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.4,marginBottom:'.85rem'}}>📁 Historique rapports ({history.length})</p>
          <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
            {history.slice(0,5).map((r:any)=>(
              <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'.6rem 1rem',background:'rgba(255,255,255,.025)',borderRadius:8,gap:'1rem'}}>
                <p style={{fontSize:'.75rem',flex:1,opacity:.7}}>{r.summary?.slice(0,120)}…</p>
                <p style={{fontSize:'.6rem',opacity:.3,whiteSpace:'nowrap'}}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ── NÉGOCIATIONS ────────────────────────────────────────────── */
function Negotiations() {
  const [negos,setNegos]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState('all');
  const [stats,setStats]=useState<any>({});
  const [responding,setResponding]=useState<string|null>(null);
  const [counterPrice,setCounterPrice]=useState('');
  const [adminNote,setAdminNote]=useState('');

  useEffect(()=>{
    const url=filter==='all'?'/api/negotiations':`/api/negotiations?status=${filter}`;
    fetch(url,{headers:ADMIN_HDR}).then(r=>r.json()).then(d=>{setNegos(d.negotiations||[]);setStats(d.stats||{});setLoading(false);}).catch(()=>setLoading(false));
  },[filter]);

  async function respond(id:string,decision:string){
    setResponding(id);
    await fetch('/api/negotiations',{method:'POST',headers:ADMIN_HDR,body:JSON.stringify({
      action:'admin_respond',negotiation_id:id,decision,
      counter_price:decision==='counter'&&counterPrice?parseFloat(counterPrice):undefined,
      admin_note:adminNote||undefined,
    })});
    setResponding(null); setCounterPrice(''); setAdminNote('');
    // Reload
    fetch(`/api/negotiations?status=${filter}`,{headers:ADMIN_HDR}).then(r=>r.json()).then(d=>setNegos(d.negotiations||[]));
  }

  const STATUS_CLR:Record<string,string>={pending:'#facc15',accepted:'#34d399',rejected:'#f87171',countered:'#60a5fa',completed:'#34d399',expired:'rgba(255,255,255,.3)',cancelled:'rgba(255,255,255,.3)'};
  const STATUS_LBL:Record<string,string>={pending:'En attente',accepted:'Acceptée',rejected:'Refusée',countered:'Contre-offre',completed:'Terminée',expired:'Expirée',cancelled:'Annulée'};
  const FILTERS=['all','pending','countered','accepted','rejected'];

  return (
    <div>
      <SectionTitle>🤝 Négociations</SectionTitle>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
        <StatCard label="En attente" value={stats.pending||0} sub="à traiter"/>
        <StatCard label="Acceptées" value={stats.accepted||0}/>
        <StatCard label="Refusées" value={stats.rejected||0}/>
      </div>

      <div style={{display:'flex',gap:'.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        {FILTERS.map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:'.35rem .85rem',borderRadius:999,border:`1px solid ${filter===f?'rgba(255,255,255,.3)':'rgba(255,255,255,.08)'}`,background:filter===f?'rgba(255,255,255,.1)':'transparent',color:filter===f?'white':'rgba(255,255,255,.45)',fontSize:'.65rem',fontWeight:700,cursor:'pointer',textTransform:'uppercase',letterSpacing:'.07em'}}>
            {f==='all'?'Toutes':STATUS_LBL[f]||f}
          </button>
        ))}
      </div>

      {loading?<p style={{opacity:.4}}>Chargement…</p>:
        negos.length===0?<Card><p style={{opacity:.3,textAlign:'center',padding:'2rem',fontSize:'.85rem'}}>Aucune négociation.</p></Card>:
        <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
          {negos.map(n=>(
            <Card key={n.id}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap',marginBottom:'.75rem'}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:'.5rem',marginBottom:'.25rem'}}>
                    <p style={{fontWeight:700,fontSize:'.85rem'}}>{n.product_name}</p>
                    <Badge label={STATUS_LBL[n.status]||n.status} color={STATUS_CLR[n.status]||'#888'}/>
                    <span style={{fontSize:'.6rem',opacity:.3}}>{n.attempts}/{n.max_attempts} tentatives</span>
                  </div>
                  <p style={{fontSize:'.72rem',opacity:.5}}>{n.user_email}{n.user_name?` · ${n.user_name}`:''}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontSize:'.65rem',opacity:.35}}>Prix original</p>
                  <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.1rem'}}>{((n.original_price||0)/100).toFixed(0)} €</p>
                </div>
              </div>

              <div style={{display:'flex',gap:'1rem',marginBottom:n.status==='pending'||n.status==='countered'?'.75rem':'0',flexWrap:'wrap'}}>
                <div style={{background:'rgba(255,255,255,.04)',borderRadius:8,padding:'.5rem .85rem',flex:1,minWidth:100}}>
                  <p style={{fontSize:'.55rem',opacity:.35,textTransform:'uppercase',letterSpacing:'.1em'}}>Offre client</p>
                  <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.2rem',color:'#facc15'}}>{((n.offered_price||0)/100).toFixed(0)} €</p>
                  <p style={{fontSize:'.6rem',opacity:.3}}>{(((n.offered_price||0)/(n.original_price||1))*100).toFixed(0)}% du prix</p>
                </div>
                {n.counter_price&&(
                  <div style={{background:'rgba(96,165,250,.08)',borderRadius:8,padding:'.5rem .85rem',flex:1,minWidth:100}}>
                    <p style={{fontSize:'.55rem',opacity:.35,textTransform:'uppercase',letterSpacing:'.1em'}}>Contre-offre</p>
                    <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.2rem',color:'#60a5fa'}}>{((n.counter_price||0)/100).toFixed(0)} €</p>
                  </div>
                )}
                {n.final_price&&(
                  <div style={{background:'rgba(52,211,153,.08)',borderRadius:8,padding:'.5rem .85rem',flex:1,minWidth:100}}>
                    <p style={{fontSize:'.55rem',opacity:.35,textTransform:'uppercase',letterSpacing:'.1em'}}>Prix final</p>
                    <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.2rem',color:'#34d399'}}>{((n.final_price||0)/100).toFixed(0)} €</p>
                  </div>
                )}
              </div>

              {n.ai_decision&&<p style={{fontSize:'.6rem',opacity:.3,marginBottom:'.5rem'}}>IA : {n.ai_decision}</p>}

              {/* Actions admin */}
              {(n.status==='pending')&&(
                <div>
                  <div style={{display:'flex',gap:'.5rem',marginBottom:'.5rem',flexWrap:'wrap'}}>
                    <Btn onClick={()=>respond(n.id,'accept')} loading={responding===n.id} small>✅ Accepter</Btn>
                    <Btn onClick={()=>respond(n.id,'reject')} loading={responding===n.id} variant="danger" small>❌ Refuser</Btn>
                    <Btn onClick={()=>setResponding(responding===n.id+'counter'?null:n.id+'counter')} variant="ghost" small>💬 Contre-proposer</Btn>
                  </div>
                  {responding===n.id+'counter'&&(
                    <div style={{display:'flex',gap:'.5rem',marginTop:'.5rem'}}>
                      <input value={counterPrice} onChange={e=>setCounterPrice(e.target.value)} placeholder="Montant €" type="number"
                        style={{width:100,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:8,padding:'.5rem .75rem',color:'white',fontSize:'.78rem',outline:'none'}}/>
                      <input value={adminNote} onChange={e=>setAdminNote(e.target.value)} placeholder="Note optionnelle…"
                        style={{flex:1,background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:8,padding:'.5rem .75rem',color:'white',fontSize:'.78rem',outline:'none'}}/>
                      <Btn onClick={()=>respond(n.id,'counter')} loading={responding===n.id} small>Envoyer</Btn>
                    </div>
                  )}
                </div>
              )}
              <p style={{fontSize:'.58rem',opacity:.2,marginTop:'.5rem'}}>{new Date(n.created_at).toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'})} · expire {new Date(n.expires_at).toLocaleDateString('fr-FR')}</p>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

/* ── PARAMÈTRES ────────────────────────────────────────────── */
function Parametres() {
  const items = [
    {ico:<IcoGlobe/>,  label:'Site web',        value:'pietri.io',       ok:true},
    {ico:<IcoCpu/>,    label:'IA Textes',        value:'Claude Sonnet 4.6 · Anthropic',ok:true},
    {ico:<IcoPalette/>,label:'IA Images',        value:'DALL-E 3 · OpenAI',           ok:true},
    {ico:<IcoDb/>,     label:'Base de données',  value:'Supabase · pietri-io',        ok:true},
    {ico:<IcoZap/>,    label:'Hébergement',      value:'Netlify',                      ok:true},
    {ico:<IcoCard/>,   label:'Paiements',        value:'MTN MoMo + SumUp',            ok:true},
  ];
  return (
    <div>
      <SectionTitle>Paramètres</SectionTitle>
      <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
        {items.map(item=>(
          <Card key={item.label} style={{display:'flex',alignItems:'center',gap:'1rem'}}>
            <span style={{opacity:.5,flexShrink:0}}>{item.ico}</span>
            <div style={{flex:1}}>
              <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.3,marginBottom:'.12rem'}}>{item.label}</p>
              <p style={{fontSize:'.82rem'}}>{item.value}</p>
            </div>
            <span style={{fontSize:'.62rem',fontWeight:700,color:'#34d399',background:'rgba(52,211,153,.1)',padding:'.18rem .55rem',borderRadius:999,border:'1px solid rgba(52,211,153,.2)',whiteSpace:'nowrap'}}>Actif</span>
          </Card>
        ))}
        <Card>
          <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.35,marginBottom:'.75rem'}}>Liens rapides</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'.5rem'}}>
            {[{label:'← Site public',href:'/'},{label:'Blog',href:'/blog'},{label:'Espace client',href:'/espace-client'},{label:'Produits',href:'/produits'}].map(l=>(
              <a key={l.href} href={l.href} style={{fontSize:'.68rem',fontWeight:600,padding:'.38rem .9rem',borderRadius:999,background:'rgba(255,255,255,.06)',color:'rgba(255,255,255,.65)',textDecoration:'none'}}>{l.label}</a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── ROOT ──────────────────────────────────────────────────── */
export default function AdminPage() {
  const [authed,setAuthed]=useState(false);
  const [pwd,setPwd]=useState('');
  const [section,setSection]=useState<Section>('dashboard');
  const [sheetOpen,setSheetOpen]=useState(false);

  if(!authed) return (
    <div style={{background:'#0a0a0a',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Inter',sans-serif"}}>
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'2.5rem 2rem',width:'100%',maxWidth:360}}>
        <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.75rem',color:'white',textTransform:'uppercase',marginBottom:'.2rem'}}>PIETRI</p>
        <p style={{fontSize:'.6rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.2em',opacity:.3,marginBottom:'2rem'}}>Admin Dashboard</p>
        <input type="password" placeholder="Mot de passe" value={pwd} onChange={e=>setPwd(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&pwd===ADMIN_PWD&&setAuthed(true)}
          style={{width:'100%',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:10,padding:'.85rem 1rem',color:'white',fontSize:'.9rem',marginBottom:'.75rem',boxSizing:'border-box',outline:'none'}}/>
        <button onClick={()=>pwd===ADMIN_PWD&&setAuthed(true)}
          style={{width:'100%',background:'white',color:'black',border:'none',borderRadius:999,padding:'.85rem',fontWeight:700,fontSize:'.85rem',cursor:'pointer',textTransform:'uppercase',letterSpacing:'.1em'}}>
          Connexion
        </button>
      </div>
    </div>
  );

  const cur=NAV.find(n=>n.id===section)!;

  return (
    <div style={{background:'#0a0a0a',minHeight:'100vh',fontFamily:"'Inter',sans-serif",color:'white',display:'flex'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
        .admin-sidebar{display:flex;flex-direction:column;width:215px;min-height:100vh;border-right:1px solid rgba(255,255,255,.06);padding:1.5rem 1rem;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto}
        .admin-main{flex:1;padding:2rem 2.5rem;min-width:0;padding-bottom:6rem}
        @media(min-width:1100px){.stat-grid{grid-template-columns:repeat(4,1fr)!important}}
        @media(min-width:1100px){.kpi-grid{grid-template-columns:repeat(4,1fr)!important}}
        .admin-fab-wrap{display:none}
        @media(max-width:768px){
          .admin-sidebar{display:none}
          .admin-fab-wrap{display:block;position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);z-index:150}
          .admin-main{padding:1.25rem 1rem 7rem}
        }
        .nav-btn{display:flex;align-items:center;gap:.65rem;padding:.58rem .85rem;border-radius:10px;cursor:pointer;font-size:.78rem;font-weight:500;transition:background 150ms;color:rgba(255,255,255,.5);border:none;background:transparent;width:100%;text-align:left}
        .nav-btn:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.85)}
        .nav-btn.active{background:rgba(255,255,255,.09);color:white;font-weight:600}
        @keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
      `}</style>

      {/* Desktop sidebar */}
      <aside className="admin-sidebar">
        <p style={{fontFamily:"'Anton',sans-serif",fontSize:'1.1rem',letterSpacing:'.06em',marginBottom:'.2rem'}}>PIETRI</p>
        <p style={{fontSize:'.52rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.2em',opacity:.25,marginBottom:'2rem'}}>Admin</p>
        {NAV.map(n=>(
          <button key={n.id} className={`nav-btn${section===n.id?' active':''}`} onClick={()=>setSection(n.id)}>
            <span style={{fontSize:'.95rem'}}>{n.icon}</span>{n.label}
          </button>
        ))}
        <div style={{marginTop:'auto',paddingTop:'1.5rem'}}>
          <a href="/" style={{fontSize:'.62rem',opacity:.22,color:'white',textDecoration:'none'}}>← Retour au site</a>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        {section==='dashboard'&&<Dashboard onNav={setSection}/>}
        {section==='analytics'&&<Analytics/>}
        {section==='commandes'&&<Commandes/>}
        {section==='produits'&&<Produits/>}
        {section==='blog'&&<Blog/>}
        {section==='social'&&<Social/>}
        {section==='medias'&&<Medias/>}
        {section==='seo'&&<SEO/>}
        {section==='agent'&&<Agent/>}
        {section==='email_agent'&&<EmailAgent/>}
        {section==='sql_chat'&&<SqlChat/>}
        {section==='membres'&&<Membres/>}
        {section==='newsletter'&&<Newsletter/>}
        {section==='sms'&&<Sms/>}
        {section==='ceo'&&<CeoAgent/>}
        {section==='negotiations'&&<Negotiations/>}
        {section==='parametres'&&<Parametres/>}
      </main>

      {/* Mobile FAB + sheet */}
      <div className="admin-fab-wrap">
        <button onClick={()=>setSheetOpen(true)} style={{display:'flex',alignItems:'center',gap:'.6rem',background:'rgba(20,20,20,0.95)',border:'1px solid rgba(255,255,255,.15)',borderRadius:999,padding:'.6rem 1.2rem',color:'white',fontSize:'.72rem',fontWeight:700,cursor:'pointer',backdropFilter:'blur(12px)',boxShadow:'0 4px 24px rgba(0,0,0,.6)',textTransform:'uppercase',letterSpacing:'.08em'}}>
          <span style={{fontSize:'1rem'}}>{cur.icon}</span>{cur.label}<span style={{fontSize:'.65rem',opacity:.5}}>▲</span>
        </button>
      </div>
      {sheetOpen&&(
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.7)',backdropFilter:'blur(4px)'}} onClick={()=>setSheetOpen(false)}>
          <div style={{position:'absolute',bottom:0,left:0,right:0,background:'#111',borderRadius:'20px 20px 0 0',padding:'1rem 1rem 2rem',animation:'sheetUp 220ms ease'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:'rgba(255,255,255,.15)',borderRadius:2,margin:'0 auto .75rem'}}/>
            <p style={{fontSize:'.55rem',fontWeight:700,textTransform:'uppercase',letterSpacing:'.18em',opacity:.3,textAlign:'center',marginBottom:'.75rem'}}>Navigation</p>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'.5rem'}}>
              {NAV.map(n=>(
                <button key={n.id} onClick={()=>{setSection(n.id);setSheetOpen(false);}} style={{display:'flex',alignItems:'center',gap:'.6rem',padding:'.75rem 1rem',background:section===n.id?'rgba(255,255,255,.1)':'rgba(255,255,255,.04)',border:`1px solid ${section===n.id?'rgba(255,255,255,.15)':'transparent'}`,borderRadius:12,cursor:'pointer',color:'white',fontSize:'.78rem',fontWeight:section===n.id?700:500,textAlign:'left'}}>
                  <span style={{fontSize:'1rem'}}>{n.icon}</span>{n.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

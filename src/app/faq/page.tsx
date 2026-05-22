'use client';

import { useState } from 'react';
import Link from 'next/link';

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

const FAQS = [
  {
    cat: 'Commandes',
    items: [
      {
        q: 'Comment passer une commande ?',
        a: 'Choisissez votre article, sélectionnez la taille, ajoutez au panier et finalisez le paiement via MTN MoMo. Vous recevez une confirmation par SMS/email.'
      },
      {
        q: 'Quels sont les moyens de paiement acceptés ?',
        a: 'Nous acceptons MTN Mobile Money (MoMo) pour les commandes en Côte d\'Ivoire. Le paiement par carte est disponible pour les commandes internationales.'
      },
      {
        q: 'Puis-je modifier ou annuler ma commande ?',
        a: 'Les modifications sont possibles dans les 2 heures suivant la commande. Passé ce délai, la production est lancée et l\'annulation n\'est plus possible, surtout pour les articles personnalisés.'
      },
      {
        q: 'Comment utiliser un code promo ?',
        a: 'Les codes promo s\'appliquent lors du paiement dans votre panier. Chaque code est à usage unique et non cumulable.'
      },
    ]
  },
  {
    cat: 'Personnalisation',
    items: [
      {
        q: 'Qu\'est-ce qu\'un article personnalisé ?',
        a: 'Un article personnalisé est tout vêtement avec un prénom brodé, un motif sur commande, une couleur hors catalogue, ou toute modification spécifique à votre demande.'
      },
      {
        q: 'Quel est le délai pour un article personnalisé ?',
        a: 'Les pièces personnalisées sont fabriquées à la main. Comptez 5 à 10 jours ouvrés de fabrication, auxquels s\'ajoutent les délais de livraison selon votre zone.'
      },
      {
        q: 'Puis-je retourner un article personnalisé ?',
        a: 'Non. Les articles personnalisés sont exclus de tout retour et remboursement. En cas de défaut de fabrication avéré, nous échangeons l\'article par une pièce identique.'
      },
    ]
  },
  {
    cat: 'Livraison',
    items: [
      {
        q: 'Dans quels pays livrez-vous ?',
        a: 'Nous livrons à Abidjan (GPS), dans toute la Côte d\'Ivoire, et à l\'international. Les tarifs varient selon la zone (2 000 XOF / 3 500 XOF / 15 €).'
      },
      {
        q: 'Comment suivre ma livraison ?',
        a: 'Connectez-vous à votre espace client et accédez à la section "Suivi en direct". Vous pouvez aussi suivre l\'avancement par SMS.'
      },
      {
        q: 'Que faire si mon colis n\'arrive pas ?',
        a: 'Contactez-nous via la page contact ou votre espace client dans les 7 jours suivant la date de livraison estimée. Nous faisons le nécessaire.'
      },
    ]
  },
  {
    cat: 'Retours & échanges',
    items: [
      {
        q: 'Quelle est votre politique de retour ?',
        a: 'Aucun retour n\'est accepté sur les articles personnalisés. Pour les articles standards, un échange est possible sous 48h après réception, article non porté avec étiquette intacte. Pas de remboursement en espèces — échange uniquement.'
      },
      {
        q: 'Comment initier un échange ?',
        a: 'Rendez-vous dans votre espace client, section "Retours & SAV", et remplissez le formulaire. Notre équipe vous répond sous 48h.'
      },
    ]
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: '100%', background: 'none', border: 'none', color: 'white', textAlign: 'left', padding: '1.1rem 0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontFamily: "'Inter', sans-serif" }}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: open ? 600 : 400, opacity: open ? 1 : 0.75, lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: '1.2rem', opacity: 0.4, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 200ms' }}>+</span>
      </button>
      {open && (
        <p style={{ fontSize: '0.8rem', lineHeight: 1.8, opacity: 0.55, paddingBottom: '1.1rem', paddingRight: '2rem' }}>{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', position: 'relative' }}>
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', background: '#0a0a0af0', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Retour</Link>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', opacity: 0.9 }}>PIETRI</span>
        <Link href="/panier" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Panier</Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem 6rem', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', opacity: 0.35, marginBottom: '0.8rem' }}>Aide</p>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.95, marginBottom: '3.5rem' }}>
          QUESTIONS<br /><span style={{ opacity: 0.35 }}>FRÉQUENTES</span>
        </h1>

        {FAQS.map(cat => (
          <div key={cat.cat} style={{ marginBottom: '3rem' }}>
            <p style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', opacity: 0.3, marginBottom: '0.5rem' }}>{cat.cat}</p>
            {cat.items.map(item => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        {/* Contact CTA */}
        <div style={{ marginTop: '3rem', padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Pas trouvé ta réponse ?</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.45 }}>On répond sous 24h</p>
          </div>
          <Link href="/contact" style={{ display: 'inline-block', padding: '0.7rem 1.5rem', background: 'white', color: '#0a0a0a', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}

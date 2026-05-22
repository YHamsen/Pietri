import Link from 'next/link';

export const metadata = { title: 'Mentions légales — PIETRI' };

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.85rem', opacity: 0.9 }}>{title}</h2>
    <div style={{ fontSize: '0.82rem', lineHeight: 1.85, opacity: 0.55 }}>{children}</div>
  </div>
);

export default function MentionsLegales() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', position: 'relative' }}>
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', background: '#0a0a0af0', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Retour</Link>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', opacity: 0.9 }}>PIETRI</span>
        <Link href="/panier" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Panier</Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '4rem 2rem 6rem', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', opacity: 0.35, marginBottom: '0.8rem' }}>Légal</p>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.95, marginBottom: '0.75rem' }}>
          MENTIONS<br /><span style={{ opacity: 0.35 }}>LÉGALES</span>
        </h1>
        <p style={{ fontSize: '0.72rem', opacity: 0.3, marginBottom: '3rem' }}>Dernière mise à jour : mai 2026</p>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '2.5rem' }} />

        <Block title="Éditeur du site">
          <p>Le site <strong style={{ opacity: 1 }}>pietri.io</strong> est édité par <strong style={{ opacity: 0.9 }}>PIETRI Ltd</strong>, société enregistrée en Angleterre et au Pays de Galles.</p>
          <p style={{ marginTop: '0.5rem' }}>Siège social : London, United Kingdom 🇬🇧</p>
          <p>Email : <a href="mailto:bonjour@pietri.io" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>bonjour@pietri.io</a></p>
          <p>Contact : <Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>via notre formulaire de contact</Link></p>
        </Block>

        <Block title="Hébergement">
          <p>Le site est hébergé par Vercel Inc., 340 Pine Street, Suite 801, San Francisco, CA 94104, États-Unis.</p>
        </Block>

        <Block title="Propriété intellectuelle">
          <p>L'ensemble des contenus présents sur le site pietri.io — textes, images, visuels, logos, photographies, éléments graphiques — sont la propriété exclusive de PIETRI et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
          <p style={{ marginTop: '0.75rem' }}>Toute reproduction, distribution ou utilisation sans autorisation écrite préalable est strictement interdite.</p>
        </Block>

        <Block title="Politique de retour & remboursement">
          <p><strong style={{ color: 'rgba(239,68,68,0.9)' }}>Articles personnalisés :</strong> Aucun retour ni remboursement. En cas de défaut de fabrication avéré, un échange par un article identique est effectué.</p>
          <p style={{ marginTop: '0.75rem' }}><strong style={{ opacity: 0.9 }}>Articles standards :</strong> Échange possible sous 48h après réception, article non porté avec étiquette intacte. Pas de remboursement en espèces — échange uniquement.</p>
        </Block>

        <Block title="Protection des données personnelles">
          <p>Les données collectées sur le site (nom, email, téléphone, adresse) sont utilisées exclusivement pour le traitement des commandes et la communication relative à celles-ci. Elles ne sont jamais cédées à des tiers.</p>
          <p style={{ marginTop: '0.75rem' }}>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ce droit, contactez-nous via <Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>notre formulaire</Link>.</p>
        </Block>

        <Block title="Cookies">
          <p>Le site pietri.io peut utiliser des cookies techniques nécessaires au bon fonctionnement de la boutique (panier, préférences). Aucun cookie de tracking publicitaire n'est déposé sans votre consentement.</p>
        </Block>

        <Block title="Droit applicable">
          <p>Les présentes mentions légales sont soumises au droit anglais (England &amp; Wales). En cas de litige, les juridictions anglaises seront compétentes. Pour les clients de l'Union Européenne, les droits légaux des consommateurs restent applicables selon la législation locale.</p>
        </Block>
      </div>
    </div>
  );
}

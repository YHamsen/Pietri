import Link from 'next/link';

export const metadata = { title: 'Livraison & retours — PIETRI' };

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '2.5rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }}>
    <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.15rem', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '1rem' }}>{title}</h2>
    {children}
  </div>
);

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span style={{ fontSize: '0.8rem', opacity: 0.55 }}>{label}</span>
    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: highlight ? '#10b981' : 'white' }}>{value}</span>
  </div>
);

export default function LivraisonRetours() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', position: 'relative' }}>
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', background: '#0a0a0af0', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Retour</Link>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', opacity: 0.9 }}>PIETRI</span>
        <Link href="/panier" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Panier</Link>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '4rem 2rem 6rem', position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', opacity: 0.35, marginBottom: '0.8rem' }}>Politique</p>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2.5rem, 6vw, 4rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.95, marginBottom: '3rem' }}>
          LIVRAISON<br /><span style={{ opacity: 0.35 }}>&</span> RETOURS
        </h1>

        {/* Livraison */}
        <Section title="Zones & tarifs de livraison">
          <Row label="Abidjan (GPS)" value="2 000 XOF" />
          <Row label="Côte d'Ivoire — hors Abidjan" value="3 500 XOF" />
          <Row label="International" value="15 €" />
          <p style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '1rem', lineHeight: 1.6 }}>
            Les délais de livraison varient selon la zone. Les commandes sont expédiées sous 3 à 5 jours ouvrés après confirmation du paiement. Les pièces personnalisées nécessitent un délai de fabrication supplémentaire de 5 à 10 jours.
          </p>
        </Section>

        {/* Vêtements personnalisés — Règle principale */}
        <div style={{ marginBottom: '2.5rem', padding: '1.75rem 2rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#ef4444' }}>Vêtements personnalisés</h2>
          </div>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.8, opacity: 0.75, marginBottom: '0.85rem' }}>
            Toute commande impliquant une <strong>personnalisation</strong> (prénom brodé, motif spécifique, couleur sur commande, etc.) est <strong>définitive et non remboursable</strong>.
          </p>
          <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
            {[
              'Aucun retour accepté sur les articles personnalisés.',
              'Aucun remboursement en espèces ou par virement.',
              'En cas de défaut de fabrication avéré, nous procédons à un échange de l\'article par une pièce identique.',
            ].map((t, i) => (
              <li key={i} style={{ fontSize: '0.8rem', opacity: 0.65, lineHeight: 1.7, marginBottom: '0.3rem' }}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Vêtements non personnalisés */}
        <Section title="Vêtements non personnalisés">
          <p style={{ fontSize: '0.82rem', lineHeight: 1.8, opacity: 0.65, marginBottom: '1rem' }}>
            Pour les articles standards (sans personnalisation), nous acceptons les échanges sous conditions.
          </p>
          <Row label="Délai pour signaler" value="48h après réception" />
          <Row label="État de l'article" value="Non porté, étiquette intacte" />
          <Row label="Remboursement" value="Non — échange uniquement" />
          <Row label="Frais de retour" value="À la charge du client" />
          <p style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: '1rem', lineHeight: 1.6 }}>
            Pour initier un échange, rendez-vous dans votre <Link href="/espace-client" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>espace client</Link> &gt; Retours & SAV, ou contactez-nous directement via la <Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>page contact</Link>.
          </p>
        </Section>

        {/* Suivi */}
        <Section title="Suivi de commande">
          <p style={{ fontSize: '0.82rem', lineHeight: 1.8, opacity: 0.65 }}>
            Un numéro de suivi vous est communiqué par SMS ou email dès l'expédition de votre colis. Vous pouvez également consulter l'état de votre commande en temps réel depuis votre <Link href="/espace-client" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'underline' }}>espace client</Link>.
          </p>
        </Section>

        {/* Contact */}
        <div style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>Une question ?</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.45 }}>Notre équipe répond sous 24h</p>
          </div>
          <Link href="/contact" style={{ display: 'inline-block', padding: '0.7rem 1.5rem', background: 'white', color: '#0a0a0a', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}

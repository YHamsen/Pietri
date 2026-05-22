import Link from 'next/link';

export const metadata = { title: 'À propos — PIETRI' };

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`;

export default function APropos() {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', position: 'relative' }}>
      <div style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px', position: 'fixed', inset: 0, opacity: 0.3, pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 2rem', background: '#0a0a0af0', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
        <Link href="/" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Retour</Link>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', letterSpacing: '0.08em', opacity: 0.9 }}>PIETRI</span>
        <Link href="/panier" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Panier</Link>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '5rem 2rem 3rem' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', opacity: 0.35, marginBottom: '1rem' }}>Notre histoire</p>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(3rem, 8vw, 5.5rem)', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.95, marginBottom: '2.5rem' }}>
            FAIT EN FRANCE.<br />
            <span style={{ opacity: 0.35 }}>INSPIRÉ</span><br />
            D'AFRIQUE.
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.8, opacity: 0.7, maxWidth: '580px' }}>
            PIETRI est né d'une conviction simple : le streetwear peut raconter une histoire. Celle d'une génération qui grandit entre deux cultures, deux continents, deux esthétiques.
          </p>
        </div>

        {/* Separateur */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Sections */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3.5rem 2rem' }}>

          {[
            {
              titre: 'Notre ADN',
              texte: 'Chaque pièce PIETRI est pensée comme une édition limitée. Pas de surproduction, pas de stock dormant. Nous créons des drops précis, en petite quantité, pour que ce que tu portes reste rare. Streetwear français avec une âme africaine — des coupes oversized, des broderies denses, des matières sélectionnées.'
            },
            {
              titre: 'Sur-mesure & personnalisation',
              texte: 'La personnalisation est au cœur de PIETRI. Ton prénom brodé, un motif spécifique, une couleur hors catalogue — nous travaillons avec toi pour créer une pièce unique qui t\'appartient vraiment. Chaque commande personnalisée est fabriquée à la main, une à une, sans compromis sur la qualité.'
            },
            {
              titre: 'Qualité sans concession',
              texte: 'Nous utilisons exclusivement des matières premium : coton épais 400g/m², broderie haute densité, finitions renforcées. Chaque vêtement passe par un contrôle qualité avant expédition. Si ce n\'est pas parfait, ça ne part pas.'
            },
            {
              titre: 'Livraison mondiale',
              texte: 'Basés à Paris, nous livrons en Côte d\'Ivoire (Abidjan et hors Abidjan), dans toute l\'Afrique et à l\'international. PIETRI s\'adresse à tous ceux qui vivent cette culture, peu importe où ils se trouvent.'
            },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.3rem', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '0.85rem' }}>{s.titre}</h2>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.85, opacity: 0.6 }}>{s.texte}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem 6rem', textAlign: 'center' }}>
          <div style={{ padding: '3rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px' }}>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Prêt à porter PIETRI ?</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.45, marginBottom: '1.5rem' }}>Des drops exclusifs, des pièces que tu ne trouveras nulle part ailleurs.</p>
            <Link href="/produits" style={{ display: 'inline-block', padding: '0.85rem 2rem', background: 'white', color: '#0a0a0a', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Voir la collection →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

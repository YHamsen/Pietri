import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — PIETRI | Streetwear culture africaine',
  description: 'Actualités, inspirations et histoire derrière les drops PIETRI. Streetwear français inspiré par la culture africaine.',
};

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, title, excerpt, keywords, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white' }}>
      <style>{`
        .blog-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
        @media(max-width:768px){ .blog-grid { grid-template-columns: 1fr; } }
        .blog-card:hover { border-color: rgba(255,255,255,0.2) !important; transform: translateY(-2px); }
      `}</style>

      {/* Nav */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', color: 'white', textDecoration: 'none', letterSpacing: '0.08em' }}>PIETRI</a>
        <a href="/produits" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'white', opacity: 0.6, textDecoration: 'none' }}>Shop</a>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.4, marginBottom: '0.5rem' }}>Journal</p>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(2rem,5vw,3.5rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '3rem', lineHeight: 1 }}>
          CULTURE & DROPS
        </h1>

        {!posts || posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.3 }}>
            <p>Articles en cours de génération…</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map(post => (
              <a key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'white' }}>
                <div className="blog-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', transition: 'all 200ms', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {(post.keywords || []).slice(0, 2).map((kw: string) => (
                      <span key={kw} style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{kw}</span>
                    ))}
                  </div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '0.75rem' }}>{post.title}</h2>
                  <p style={{ fontSize: '0.78rem', opacity: 0.5, lineHeight: 1.6, marginBottom: '1.25rem' }}>{post.excerpt}</p>
                  <p style={{ fontSize: '0.62rem', opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true);
  return (data || []).map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('meta_title, meta_description, title')
    .eq('slug', params.slug)
    .single();

  if (!post) return {};
  return {
    title: post.meta_title || post.title,
    description: post.meta_description,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();

  if (!post) notFound();

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white' }}>
      <style>{`
        .blog-content h2 { font-family: 'Anton', sans-serif; font-size: clamp(1.1rem,3vw,1.5rem); text-transform: uppercase; letter-spacing: 0.04em; margin: 2rem 0 0.75rem; color: white; }
        .blog-content p { font-size: 0.9rem; line-height: 1.8; opacity: 0.75; margin-bottom: 1rem; }
        .blog-content strong { color: white; opacity: 1; }
        .blog-content ul { padding-left: 1.25rem; margin-bottom: 1rem; }
        .blog-content li { font-size: 0.9rem; line-height: 1.8; opacity: 0.75; margin-bottom: 0.25rem; }
        .blog-content a { color: white; text-decoration: underline; text-underline-offset: 3px; }
      `}</style>

      {/* Nav */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ fontFamily: "'Anton', sans-serif", fontSize: '1rem', color: 'white', textDecoration: 'none', letterSpacing: '0.08em' }}>PIETRI</a>
        <a href="/blog" style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'white', opacity: 0.6, textDecoration: 'none' }}>← Journal</a>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
        {/* Keywords */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {(post.keywords || []).slice(0, 3).map((kw: string) => (
            <span key={kw} style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{kw}</span>
          ))}
        </div>

        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(1.75rem,5vw,2.75rem)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: '1rem' }}>
          {post.title}
        </h1>

        <p style={{ fontSize: '0.82rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem' }}>
          {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.4, marginBottom: '0.5rem' }}>Découvrir</p>
          <p style={{ fontFamily: "'Anton', sans-serif", fontSize: '1.25rem', textTransform: 'uppercase', marginBottom: '1rem' }}>La Collection PIETRI</p>
          <a href="/produits" style={{ display: 'inline-block', background: 'white', color: 'black', padding: '0.6rem 1.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', textDecoration: 'none' }}>
            Shop Now
          </a>
        </div>
      </div>
    </div>
  );
}

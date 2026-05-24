import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://pietri.io';

const STATIC_ROUTES = [
  { url: '/', changeFrequency: 'weekly' as const, priority: 1.0 },
  { url: '/produits', changeFrequency: 'weekly' as const, priority: 0.9 },
  { url: '/produits/floral-hoodie', changeFrequency: 'monthly' as const, priority: 0.8 },
  { url: '/produits/koala-tee', changeFrequency: 'monthly' as const, priority: 0.8 },
  { url: '/produits/floral-tee', changeFrequency: 'monthly' as const, priority: 0.8 },
  { url: '/produits/signature', changeFrequency: 'monthly' as const, priority: 0.8 },
  { url: '/produits/robe-florale', changeFrequency: 'monthly' as const, priority: 0.8 },
  { url: '/blog', changeFrequency: 'daily' as const, priority: 0.7 },
  { url: '/contact', changeFrequency: 'yearly' as const, priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('published', true);

  const blogRoutes = (posts || []).map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...STATIC_ROUTES.map(r => ({
      url: `${BASE_URL}${r.url}`,
      lastModified: new Date(),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...blogRoutes,
  ];
}

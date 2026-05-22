import { createClient } from '@supabase/supabase-js';

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon);

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  keywords: string[];
  meta_title: string;
  meta_description: string;
  og_image: string;
  published: boolean;
  created_at: string;
};

export type SocialPost = {
  id: string;
  platform: 'instagram' | 'facebook' | 'tiktok' | 'x';
  content: string;
  image_url: string;
  product_slug: string;
  status: 'pending' | 'posted' | 'failed';
  scheduled_at: string;
  created_at: string;
};

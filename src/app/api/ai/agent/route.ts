import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const BASE = process.env.NEXT_PUBLIC_BASE_URL!;
const SECRET = process.env.ADMIN_SECRET!;
const NOTIFY_SECRET = process.env.NOTIFY_SECRET!;

export const maxDuration = 300;

const PRODUCTS: Record<string, { label: string; desc: string; price: number; style: string }> = {
  'floral-hoodie': { label: 'FLORAL HOODIE', desc: 'Hoodie oversize noir broderie pavot. Édition limitée.', price: 89, style: 'premium dark streetwear, embroidered floral detail, black oversize hoodie' },
  'koala-tee':     { label: 'KOALA TEE',     desc: 'T-shirt oversize logo Koala. Coton premium 320g.',    price: 49, style: 'urban graphic tee, oversized white/black, Koala logo artwork' },
  'floral-tee':    { label: 'FLORAL TEE',    desc: 'T-shirt oversize imprimé coquelicot. Washed vintage.', price: 59, style: 'vintage washed tee, poppy print, faded aesthetic' },
  'signature':     { label: 'SIGNATURE',     desc: 'Pièce signature collection automne. Drop exclusif.',   price: 79, style: 'exclusive signature piece, autumn collection, limited drop' },
  'robe-florale':  { label: 'ROBE FLORALE',  desc: 'Robe oversize imprimé floral. Coupe asymétrique.',     price: 69, style: 'floral asymmetric dress, oversize silhouette, feminine streetwear' },
};

const TOPICS = ['streetwear-culture-africaine','guide-tailles-hoodie-oversize','drops-limites-pietri','mode-abidjan-paris','broderie-artisanale-streetwear'];
const PLATFORMS = ['instagram','facebook','tiktok','x'] as const;

async function callInternal(path: string, body: object) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-secret': SECRET },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function sendPushNotification(title: string, message: string, data?: Record<string, string>, target: string = 'all') {
  try {
    await fetch(`${BASE}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${NOTIFY_SECRET}` },
      body: JSON.stringify({ title, message, data, target }),
    });
  } catch {
    // Silently ignore — la notif est bonus, pas bloquante
  }
}

async function generateDallEImage(prompt: string, size: '1024x1024' | '1024x1792' | '1792x1024' = '1024x1024') {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size, quality: 'hd' }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'OpenAI error');
  return { url: data.data[0].url as string, revised_prompt: data.data[0].revised_prompt as string };
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== SECRET) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { mode = 'campaign', slug, market = 'both' } = body;
  const enc = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (d: object) => { try { ctrl.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`)); } catch {} };
      const { data: run } = await sb.from('agent_runs').insert({ status: 'running', steps: [], summary: {} }).select().single();
      const runId = run?.id;
      const summary: Record<string, any> = {};

      try {
        send({ type: 'start', runId, mode });

        // ═══════════════════════════════════════════════════
        // MODE CAMPAIGN — 1 produit → stratégie + image + 4 posts
        // ═══════════════════════════════════════════════════
        if (mode === 'campaign') {
          const product = PRODUCTS[slug];
          if (!product) { send({ type: 'error', error: `Produit inconnu: ${slug}` }); ctrl.close(); return; }

          // ── ÉTAPE 1 : STRATÉGIE ÉDITORIALE ──────────────
          send({ type: 'step_start', step: 'context' });

          const ctxMsg = await claude.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 1200,
            system: `Tu es directeur artistique et stratège social media d'une marque de streetwear afro-française premium (PIETRI). Tu maîtrises les marchés Côte d'Ivoire et France.`,
            messages: [{
              role: 'user',
              content: `Définis la stratégie de campagne pour ce produit PIETRI :
Produit : ${product.label}
Description : ${product.desc}
Prix : ${product.price}€
Style visuel : ${product.style}

Retourne un JSON strict (pas de markdown) :
{
  "tone": "une phrase décrivant le ton exact pour ce produit",
  "hook_ci": "accroche courte percutante pour la Côte d'Ivoire (nouchi/français mélangé)",
  "hook_fr": "accroche courte percutante pour la France (français urbain premium)",
  "hashtags_ci": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "hashtags_fr": ["#tag1","#tag2","#tag3","#tag4","#tag5"],
  "best_time_ci": "meilleur moment de publication pour CI (ex: Mer 19h30)",
  "best_time_fr": "meilleur moment de publication pour FR (ex: Jeu 18h00)",
  "visual_direction": "direction artistique de l'image en anglais pour DALL-E, 1-2 phrases",
  "image_prompt": "prompt DALL-E 3 complet en anglais pour générer 1 photo éditoriale de ce produit (ultra-réaliste, pas de texte, pas de watermark)"
}`
            }]
          });

          const raw = (ctxMsg.content[0] as any).text.trim();
          let ctx: any = {};
          try { ctx = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')); } catch (e) {
            send({ type: 'step_error', step: 'context', error: 'Parsing JSON échoué' });
          }
          summary.context = ctx;
          send({ type: 'step_done', step: 'context', data: ctx });

          // ── ÉTAPE 2 : IMAGE DALL-E ────────────────────────
          send({ type: 'step_start', step: 'image' });

          const imagePrompt = ctx.image_prompt || `High-end editorial fashion photography of ${product.style} by PIETRI, African-French luxury streetwear. Dark studio, dramatic moody cinematic lighting. Ultra-realistic, no text, no watermarks.`;
          let imageUrl = '';
          let imageRevised = '';
          try {
            const img = await generateDallEImage(imagePrompt, '1024x1024');
            imageUrl = img.url;
            imageRevised = img.revised_prompt;
            await sb.from('media_library').insert({
              type: 'image', url: imageUrl, product_slug: slug,
              platform: 'all', prompt: imagePrompt, status: 'ready'
            });
            summary.image_url = imageUrl;
            send({ type: 'step_done', step: 'image', url: imageUrl, revised_prompt: imageRevised });
          } catch (e) {
            send({ type: 'step_error', step: 'image', error: String(e) });
          }

          // ── ÉTAPE 3 : 4 POSTS ADAPTÉS ─────────────────────
          send({ type: 'step_start', step: 'posts' });

          const postsMsg = await claude.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 2000,
            system: `Tu es social media manager de PIETRI. Tu rédiges des posts authentiques, impactants et adaptés à chaque plateforme. Marché: ${market === 'ci' ? 'Côte d\'Ivoire' : market === 'fr' ? 'France' : 'Côte d\'Ivoire et France'}.`,
            messages: [{
              role: 'user',
              content: `Rédige 4 posts pour ${product.label} (${product.desc}, ${product.price}€).
Ton : ${ctx.tone || 'premium streetwear afro-français'}
Accroche CI : ${ctx.hook_ci || ''}
Accroche FR : ${ctx.hook_fr || ''}
Hashtags CI : ${ctx.hashtags_ci?.join(' ') || ''}
Hashtags FR : ${ctx.hashtags_fr?.join(' ') || ''}
${imageUrl ? 'Une photo éditoriale sera jointe au post.' : ''}

Adapte le style à chaque plateforme (${market === 'ci' ? 'uniquement marché CI, nouchi/français' : market === 'fr' ? 'uniquement marché FR, français premium' : 'marché CI pour tiktok/instagram, FR pour facebook/x'}) :
- Instagram : caption courte + émotionnelle + hashtags (max 150 mots)
- Facebook : post engageant avec storytelling + CTA clair (max 100 mots)
- TikTok : hook ultra-accro 1ère phrase + script court dynamique + hashtags trending (max 80 mots)
- X (Twitter) : tweet court et percutant, style drop culture (max 280 caractères)

Retourne un JSON strict (pas de markdown) :
{
  "instagram": "le post complet",
  "facebook": "le post complet",
  "tiktok": "le post complet",
  "x": "le post complet",
  "market_instagram": "ci",
  "market_facebook": "fr",
  "market_tiktok": "ci",
  "market_x": "fr"
}`
            }]
          });

          const raw2 = (postsMsg.content[0] as any).text.trim();
          let posts: any = {};
          try { posts = JSON.parse(raw2.replace(/^```json?\n?/, '').replace(/\n?```$/, '')); } catch {}

          // Save to social_queue
          for (const platform of PLATFORMS) {
            if (posts[platform]) {
              const mkt = posts[`market_${platform}`] || (market === 'both' ? (platform === 'instagram' || platform === 'tiktok' ? 'ci' : 'fr') : market);
              await sb.from('social_queue').insert({
                platform,
                content: posts[platform],
                product_slug: slug,
                status: 'pending',
                market: mkt,
                image_url: imageUrl || null,
                scheduled_at: new Date(Date.now() + 2 * 3600000).toISOString()
              });
            }
          }
          summary.posts = 4;
          send({ type: 'step_done', step: 'posts', data: posts });

          // ── NOTIF PUSH AUTO ────────────────────────────────
          send({ type: 'step_start', step: 'notify' });
          const notifTitle = `🆕 ${product.label}`;
          const notifMsg = ctx.hook_fr || ctx.hook_ci || product.desc;
          await sendPushNotification(notifTitle, notifMsg, { slug, screen: 'product' });
          summary.push_notif_sent = true;
          send({ type: 'step_done', step: 'notify', title: notifTitle, message: notifMsg });

          // ── DONE ──────────────────────────────────────────
          summary.slug = slug;
          if (runId) await sb.from('agent_runs').update({ status: 'done', summary, finished_at: new Date().toISOString() }).eq('id', runId);
          send({ type: 'done', summary, runId });
          return;
        }

        // ═══════════════════════════════════════════════════
        // NOTIFY — génère + envoie une notif push intelligente
        // ═══════════════════════════════════════════════════
        if (mode === 'notify') {
          send({ type: 'step_start', step: 'notify' });
          const { title: manualTitle, message: manualMessage, target = 'all', auto_slug } = body;

          let finalTitle = manualTitle;
          let finalMessage = manualMessage;

          // Si pas de titre/message manuels mais un produit → Claude génère
          if (auto_slug && (!manualTitle || !manualMessage)) {
            const product = PRODUCTS[auto_slug];
            if (product) {
              const notifMsg = await claude.messages.create({
                model: 'claude-sonnet-4-6',
                max_tokens: 300,
                system: `Tu es copywriter push notification pour PIETRI (streetwear afro-français premium). Génère des notifs courtes, percutantes, qui donnent envie d'ouvrir l'app. Toujours en français. JSON strict sans markdown.`,
                messages: [{ role: 'user', content: `Génère une notification push pour ce produit PIETRI :\nProduit : ${product.label}\nDescription : ${product.desc}\nPrix : ${product.price}€\n\nJSON : {"title": "max 50 chars, avec emoji", "message": "max 100 chars, accrocheur"}` }]
              });
              const raw = (notifMsg.content[0] as any).text.trim();
              try {
                const parsed = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, ''));
                finalTitle = parsed.title;
                finalMessage = parsed.message;
              } catch {}
            }
          }

          if (!finalTitle || !finalMessage) {
            send({ type: 'error', error: 'title et message requis (ou auto_slug pour génération automatique)' });
            ctrl.close(); return;
          }

          const notifData: Record<string, string> = {};
          if (auto_slug) { notifData.slug = auto_slug; notifData.screen = 'product'; }

          await sendPushNotification(finalTitle, finalMessage, notifData, target);
          if (runId) await sb.from('agent_runs').update({ status: 'done', summary: { notify: 1, title: finalTitle, target }, finished_at: new Date().toISOString() }).eq('id', runId);
          send({ type: 'step_done', step: 'notify', title: finalTitle, message: finalMessage, target });
          send({ type: 'done', summary: { notify: 1 }, runId });
          return;
        }

        // ═══════════════════════════════════════════════════
        // INFLUENCER HUNTER — trouve des micro-influenceurs CI/diaspora
        // ═══════════════════════════════════════════════════
        if (mode === 'influencer_hunt') {
          send({ type: 'step_start', step: 'influencer_hunt' });
          const niche = body.niche || 'streetwear afro-français';
          const market = body.market || 'both';
          const msg = await claude.messages.create({
            model: 'claude-sonnet-4-6', max_tokens: 3000,
            system: `Tu es expert en influence marketing streetwear africain. Tu identifies des micro-influenceurs authentiques sur TikTok, Instagram et Snapchat, particulièrement sur les marchés Côte d'Ivoire, Ghana, France et diaspora africaine.`,
            messages: [{
              role: 'user',
              content: `Identifie 10 micro-influenceurs parfaits pour PIETRI (streetwear afro-français premium, drops limités, audience jeune africaine et diaspora).
Niche : ${niche}
Marché : ${market === 'ci' ? 'Côte d\'Ivoire + Afrique de l\'Ouest' : market === 'fr' ? 'France + Diaspora africaine' : 'Côte d\'Ivoire + France + Diaspora'}

Pour chaque influenceur, génère un profil RÉALISTE et détaillé. JSON strict sans markdown :
{
  "influenceurs": [
    {
      "pseudo": "@...",
      "plateforme": "instagram|tiktok|snapchat",
      "niche": "...",
      "followers": "...",
      "engagement_rate": "...%",
      "marche": "CI|FR|Diaspora",
      "ville": "...",
      "style": "description du style éditorial",
      "pourquoi_pietri": "pourquoi cet influenceur est parfait pour PIETRI",
      "type_collab": "gifting|paiement|co-création|affiliation",
      "budget_estime": "0€|50-200€|200-500€|500-1000€",
      "accroche_dm": "premier message personnalisé à lui envoyer",
      "profil_type": "macro|micro|nano"
    }
  ],
  "strategie_globale": "stratégie de campagne d'influence recommandée",
  "budget_total_estime": "...",
  "kpis": ["KPI 1", "KPI 2", "KPI 3"]
}`,
            }]
          });
          const raw = (msg.content[0] as any).text.trim();
          let result: any = {};
          try { result = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')); } catch {}
          await sb.from('agent_runs').update({
            status: 'done',
            summary: { influencer_hunt: result, count: result.influenceurs?.length || 0 },
            finished_at: new Date().toISOString()
          }).eq('id', runId);
          summary.influencer_hunt = result;
          send({ type: 'step_done', step: 'influencer_hunt', data: result });
          send({ type: 'done', summary, runId });
          return;
        }

        // ═══════════════════════════════════════════════════
        // SERVICE CLIENT 24/7 — répond à une question client
        // ═══════════════════════════════════════════════════
        if (mode === 'service_client') {
          const question = body.question || '';
          const channel = body.channel || 'chat';
          const lang = body.lang || 'fr';
          if (!question) { send({ type: 'error', error: 'question requise' }); ctrl.close(); return; }

          send({ type: 'step_start', step: 'service_client' });
          const msg = await claude.messages.create({
            model: 'claude-sonnet-4-6', max_tokens: 1000,
            system: `Tu es l'agent service client de PIETRI, marque streetwear afro-française premium.
Ton style : chaleureux, authentique, efficace. Tu connais toute la marque : produits, prix, livraison, retours, paiement MoMo.
Informations clés :
- Livraison Abidjan : 24-48h, livraison offerte dès 50€
- Livraison internationale : 5-10 jours, DHL
- Paiement : MTN MoMo, Orange Money, carte bancaire
- Retours : 14 jours après réception
- Contact WhatsApp : +225 00 00 00 00
- Email : contact@pietri.io
- Canal actuel : ${channel}
- Langue demandée : ${lang === 'ci' ? 'français CI (peut utiliser nouchi léger)' : 'français standard'}`,
            messages: [{
              role: 'user',
              content: question
            }]
          });
          const response = (msg.content[0] as any).text.trim();
          send({ type: 'step_done', step: 'service_client', response, channel });
          send({ type: 'done', summary: { service_client: 1 }, runId });
          return;
        }

        // ═══════════════════════════════════════════════════
        // COLLECTION STORY — fiche culturelle pour une pièce
        // ═══════════════════════════════════════════════════
        if (mode === 'collection_story') {
          const productSlug = body.slug;
          const product = PRODUCTS[productSlug];
          if (!product) { send({ type: 'error', error: `Produit inconnu: ${productSlug}` }); ctrl.close(); return; }

          send({ type: 'step_start', step: 'collection_story' });
          const msg = await claude.messages.create({
            model: 'claude-sonnet-4-6', max_tokens: 2500,
            system: `Tu es directeur artistique et historien de la mode pour PIETRI. Tu rédiges des fiches culturelles riches qui connectent chaque pièce à son héritage africain et à la culture streetwear mondiale. Ton style est poétique, précis et inspirant.`,
            messages: [{
              role: 'user',
              content: `Crée une fiche culturelle complète pour cette pièce PIETRI :
Produit : ${product.label}
Description : ${product.desc}
Style visuel : ${product.style}
Prix : ${product.price}€

La fiche doit raconter l'histoire, l'inspiration, le patrimoine culturel, et pourquoi cette pièce est importante.
JSON strict sans markdown :
{
  "titre_editorial": "titre accrocheur 4-6 mots",
  "sous_titre": "sous-titre évocateur",
  "histoire": "paragraphe 150 mots — l'histoire derrière cette pièce, son inspiration culturelle africaine",
  "heritage_culturel": "d'où vient l'inspiration (lieu, tradition, mouvement culturel)",
  "materiaux_savoir_faire": "description des matières et du savoir-faire artisanal",
  "connexion_contemporaine": "comment cette pièce connecte tradition africaine et streetwear global",
  "styling_notes": ["conseil style 1", "conseil style 2", "conseil style 3"],
  "playlist": ["titre artiste — pour porter cette pièce", "titre artiste", "titre artiste"],
  "hashtags_editorial": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "quote_brand": "citation courte percutante à mettre en avant (< 20 mots)",
  "destinations": ["Abidjan — contexte", "Paris — contexte", "Londres — contexte"]
}`,
            }]
          });
          const raw = (msg.content[0] as any).text.trim();
          let story: any = {};
          try { story = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')); } catch {}
          // Persist story in media/SEO context
          await sb.from('seo_pages').upsert({
            page_path: `/produits/${productSlug}`,
            og_title: story.titre_editorial,
            og_description: story.sous_titre,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'page_path' });
          send({ type: 'step_done', step: 'collection_story', data: story, slug: productSlug });
          send({ type: 'done', summary: { collection_story: 1 }, runId });
          return;
        }

        // ═══════════════════════════════════════════════════
        // MODES GLOBAUX (blog, seo, editorial, intel)
        // ═══════════════════════════════════════════════════

        // ── LIGNE ÉDITORIALE ──────────────────────────────
        if (mode === 'all' || mode === 'editorial') {
          send({ type: 'step_start', step: 'editorial' });
          const editMsg = await claude.messages.create({
            model: 'claude-sonnet-4-6', max_tokens: 2000,
            system: `Tu es stratège marketing expert en mode streetwear africain ciblant la jeunesse africaine et la diaspora.`,
            messages: [{ role: 'user', content: `Définis la ligne éditoriale complète de PIETRI (streetwear afro-français, Abidjan + Paris). JSON strict sans markdown :\n{"brand_values":["...","...","...","...","..."],"tone_of_voice":"...","content_pillars":[{"name":"...","description":"...","exemples":["...","..."]}],"target_audience":{"primaire":"...","secondaire":"...","tertiaire":"..."},"language_ci":"style CI détaillé","language_fr":"style FR détaillé"}` }]
          });
          const raw = (editMsg.content[0] as any).text.trim();
          let editConfig: any = {};
          try { editConfig = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')); } catch {}
          await sb.from('editorial_config').upsert({ id: '00000000-0000-0000-0000-000000000001', ...editConfig, updated_at: new Date().toISOString() });
          summary.editorial = 1;
          send({ type: 'step_done', step: 'editorial', data: editConfig });
        }

        // ── VEILLE CONCURRENTIELLE ────────────────────────
        if (mode === 'all' || mode === 'intel') {
          send({ type: 'step_start', step: 'intel' });
          const intelMsg = await claude.messages.create({
            model: 'claude-sonnet-4-6', max_tokens: 1500,
            system: `Tu es expert en marketing streetwear et veille concurrentielle pour les marchés africain et français.`,
            messages: [{ role: 'user', content: `Analyse le marché streetwear pour PIETRI (afro-français, drops limités, Abidjan/Paris). JSON strict sans markdown :\n{"competitors":[{"name":"...","pays":"...","opportunite":"..."}],"opportunites_marche":["..."],"tendances_2025":["..."],"influenceurs_tiktok_ci":[{"profil":"...","niche":"...","pourquoi":"..."}],"strategie_tiktok_ci":"...","hashtags_ci":["#..."],"hashtags_fr":["#..."]}` }]
          });
          const raw2 = (intelMsg.content[0] as any).text.trim();
          let intel: any = {};
          try { intel = JSON.parse(raw2.replace(/^```json?\n?/, '').replace(/\n?```$/, '')); } catch {}
          await sb.from('editorial_config').upsert({ id: '00000000-0000-0000-0000-000000000001', competitive_intel: JSON.stringify(intel), influencer_strategy: intel.strategie_tiktok_ci, updated_at: new Date().toISOString() });
          summary.intel = 1;
          send({ type: 'step_done', step: 'intel', data: intel });
        }

        // ── BLOG ─────────────────────────────────────────
        if (mode === 'all' || mode === 'blog') {
          send({ type: 'step_start', step: 'blog' });
          let ok = 0;
          for (const slug of TOPICS) {
            try {
              const d = await callInternal('/api/ai/blog', { topic_slug: slug });
              if (d.post) { ok++; send({ type: 'item', section: 'blog', slug, title: d.post.title, status: 'done' }); }
              else send({ type: 'item', section: 'blog', slug, error: d.error, status: 'error' });
            } catch (e) { send({ type: 'item', section: 'blog', slug, error: String(e), status: 'error' }); }
          }
          summary.blog = ok;
          send({ type: 'step_done', step: 'blog', count: ok });
        }

        // ── SEO ──────────────────────────────────────────
        if (mode === 'all' || mode === 'seo') {
          send({ type: 'step_start', step: 'seo' });
          let ok = 0;
          for (const p of Object.entries(PRODUCTS)) {
            try {
              const d = await callInternal('/api/ai/seo', { slug: p[0] });
              if (d.seo) { ok++; send({ type: 'item', section: 'seo', slug: p[0], status: 'done' }); }
              else send({ type: 'item', section: 'seo', slug: p[0], error: d.error, status: 'error' });
            } catch (e) { send({ type: 'item', section: 'seo', slug: p[0], error: String(e), status: 'error' }); }
          }
          summary.seo = ok;
          send({ type: 'step_done', step: 'seo', count: ok });
        }

        if (runId) await sb.from('agent_runs').update({ status: 'done', summary, finished_at: new Date().toISOString() }).eq('id', runId);
        send({ type: 'done', summary, runId });

      } catch (err) {
        if (runId) await sb.from('agent_runs').update({ status: 'error' }).eq('id', runId);
        send({ type: 'error', error: String(err) });
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' },
  });
}

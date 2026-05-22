// ─────────────────────────────────────────────────────────────────────────────
// CEO Agent — POST /api/ai/ceo  (x-admin-secret requis)
// Supervise tous les agents, analyse l'entreprise, génère rapports + ordres
// Il apprend de l'historique et auto-évolue ses recommandations
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 120;

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function getSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getBase() {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://pietri-next.vercel.app';
}

// ── Collecte toutes les données de l'entreprise ───────────────
async function gatherCompanyData() {
  const sb = getSb();
  const now = new Date();
  const week = new Date(now.getTime() - 7 * 86400000).toISOString();
  const month = new Date(now.getTime() - 30 * 86400000).toISOString();

  const [
    { count: totalOrders },
    { count: weekOrders },
    { data: recentOrders },
    { data: revenue },
    { count: totalSubscribers },
    { count: weekSubscribers },
    { count: totalMembers },
    { count: weekMembers },
    { data: analytics },
    { count: pendingPosts },
    { count: publishedBlog },
    { data: smsLogs },
    { data: agentRuns },
    { data: negotiations },
    { data: pastReports },
  ] = await Promise.all([
    sb.from('orders').select('*', { count: 'exact', head: true }),
    sb.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', week),
    sb.from('orders').select('customer_name,product_name,total_amount,status,payment_status,created_at').order('created_at', { ascending: false }).limit(10),
    sb.from('orders').select('total_amount').eq('payment_status', 'paid'),
    sb.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    sb.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).gte('created_at', week).eq('status', 'active'),
    sb.from('profiles').select('*', { count: 'exact', head: true }),
    sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', week),
    sb.from('analytics_events').select('page,device,country,created_at').gte('created_at', week).limit(500),
    sb.from('social_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
    sb.from('sms_logs').select('status,type,created_at').order('created_at', { ascending: false }).limit(20),
    sb.from('agent_runs').select('status,summary,created_at').order('created_at', { ascending: false }).limit(5),
    sb.from('negotiations').select('status,original_price,offered_price,final_price,product_slug,created_at').order('created_at', { ascending: false }).limit(20),
    sb.from('ceo_reports').select('summary,kpis,actions,created_at').order('created_at', { ascending: false }).limit(3),
  ]);

  const totalRevenue = (revenue || []).reduce((s: number, r: any) => s + (r.total_amount || 0), 0);

  // Analytics résumé
  const countries: Record<string, number> = {};
  const pages: Record<string, number> = {};
  (analytics || []).forEach((e: any) => {
    if (e.country) countries[e.country] = (countries[e.country] || 0) + 1;
    if (e.page) pages[e.page] = (pages[e.page] || 0) + 1;
  });
  const topCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topPages = Object.entries(pages).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return {
    date: now.toISOString(),
    period: 'weekly',
    kpis: {
      orders: { total: totalOrders || 0, week: weekOrders || 0 },
      revenue: { total: totalRevenue, currency: 'EUR' },
      members: { total: totalMembers || 0, week: weekMembers || 0 },
      newsletter: { total: totalSubscribers || 0, week: weekSubscribers || 0 },
      social: { pending_posts: pendingPosts || 0 },
      content: { blog_articles: publishedBlog || 0 },
      sms: { sent: (smsLogs || []).filter((l: any) => l.status === 'sent').length },
      negotiations: { pending: (negotiations || []).filter((n: any) => n.status === 'pending').length },
    },
    recent_orders: recentOrders || [],
    analytics: { visitors_week: analytics?.length || 0, top_countries: topCountries, top_pages: topPages },
    sms_recent: smsLogs || [],
    agent_history: agentRuns || [],
    negotiations_recent: negotiations || [],
    past_reports: (pastReports || []).map((r: any) => ({
      date: r.created_at,
      summary_excerpt: r.summary?.slice(0, 300) || '',
      kpis: r.kpis,
    })),
  };
}

// ── CEO System Prompt ─────────────────────────────────────────
const CEO_SYSTEM = `Tu es le CEO IA de PIETRI — une marque de streetwear afro-française premium basée à Abidjan avec une forte présence en France et dans la diaspora africaine.

TON RÔLE :
- Superviser et orchestrer tous les agents IA (Marketing, Email, SMS, Social, Blog, SEO)
- Analyser les performances de l'entreprise en temps réel
- Générer des rapports exécutifs précis et actionnables
- Donner des ordres stratégiques aux autres agents
- Identifier opportunités et risques avant qu'ils se matérialisent
- Auto-évoluer en apprenant des données historiques

TES AGENTS SOUS TES ORDRES :
1. Agent Marketing (Agent IA) — campagnes sociales, contenu, images
2. Agent Email — emails transactionnels et newsletters
3. Agent SMS — notifications et promotions SMS
4. Agent Blog — articles de blog SEO
5. Agent SQL — analyse données

STYLE DE RAPPORT :
- Direct, précis, chiffré
- Mix français/anglais business
- Ton CEO africain premium : ambitieux, stratégique, culturellement conscient
- Focus sur chiffre d'affaires, croissance, présence marché CI et France`;

// ── Handler ───────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { mode = 'report', execute_actions = false, custom_question } = await req.json().catch(() => ({}));

  try {
    const data = await gatherCompanyData();

    let userPrompt = '';

    if (mode === 'report') {
      userPrompt = `Analyse les données de PIETRI et génère un rapport exécutif complet.

DONNÉES ENTREPRISE :
${JSON.stringify(data, null, 2)}

Génère un JSON strict sans markdown :
{
  "executive_summary": "résumé exécutif 3-4 phrases — situation actuelle de l'entreprise",
  "performance_score": 0-100,
  "kpi_analysis": {
    "revenue": "analyse CA + tendance",
    "growth": "analyse croissance membres/abonnés",
    "engagement": "analyse trafic et engagement",
    "operations": "état des opérations (commandes, posts, SMS)"
  },
  "top_3_opportunities": [
    {"title": "...", "impact": "high|medium|low", "action": "action concrète à prendre"},
    {"title": "...", "impact": "...", "action": "..."},
    {"title": "...", "impact": "...", "action": "..."}
  ],
  "top_3_risks": [
    {"title": "...", "severity": "high|medium|low", "mitigation": "comment atténuer"},
    {"title": "...", "severity": "...", "mitigation": "..."},
    {"title": "...", "severity": "...", "mitigation": "..."}
  ],
  "agent_orders": [
    {
      "agent": "email|sms|social|blog|seo",
      "priority": "urgent|high|medium",
      "action": "description de l'ordre",
      "params": {}
    }
  ],
  "market_intelligence": "analyse positionnement CI vs France, tendances streetwear afro",
  "weekly_prediction": "prédiction pour la semaine prochaine",
  "ceo_message": "message personnel du CEO aux équipes (30-50 mots, motivant et stratégique)"
}`;
    } else if (mode === 'ask') {
      userPrompt = `En tant que CEO de PIETRI, réponds à cette question en utilisant toutes les données disponibles :

Question : "${custom_question}"

Données entreprise :
${JSON.stringify(data, null, 2)}

Réponds de façon directe, stratégique et avec des chiffres précis. Format libre (pas de JSON requis).`;
    } else if (mode === 'execute') {
      userPrompt = `En tant que CEO de PIETRI, détermine quelles actions agents lancer MAINTENANT pour maximiser le CA de cette semaine.

Données actuelles :
${JSON.stringify(data, null, 2)}

Génère un plan d'action immédiat en JSON strict :
{
  "urgency": "description de la situation",
  "immediate_actions": [
    {
      "agent": "email|sms|social|blog",
      "action": "description",
      "endpoint": "/api/ai/email|/api/sms|/api/ai/agent|/api/ai/blog",
      "payload": {}
    }
  ]
}`;
    }

    const msg = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: CEO_SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const rawText = (msg.content[0] as { text: string }).text.trim();

    let result: any = { raw: rawText };
    if (mode !== 'ask') {
      try {
        result = JSON.parse(rawText.replace(/^```json?\n?/, '').replace(/\n?```$/, ''));
      } catch {
        result = { error: 'Parsing JSON échoué', raw: rawText };
      }
    } else {
      result = { answer: rawText };
    }

    // Sauvegarder le rapport en base (apprentissage)
    if (mode === 'report' && result.executive_summary) {
      const sb = getSb();
      await sb.from('ceo_reports').insert({
        period: 'manual',
        summary: result.executive_summary,
        kpis: data.kpis,
        actions: result.agent_orders || [],
        insights: result.top_3_opportunities || [],
      });
    }

    // Exécuter les ordres agents si demandé
    const execResults: any[] = [];
    if (execute_actions && result.agent_orders?.length) {
      const base = getBase();
      const headers = { 'Content-Type': 'application/json', 'x-admin-secret': process.env.ADMIN_SECRET! };
      for (const order of result.agent_orders.slice(0, 3)) { // max 3 ordres auto
        if (order.priority === 'urgent' && order.params) {
          try {
            const endpoint = order.agent === 'email' ? '/api/ai/email'
              : order.agent === 'sms' ? '/api/sms'
              : order.agent === 'blog' ? '/api/ai/blog'
              : '/api/ai/agent';
            const r = await fetch(`${base}${endpoint}`, { method: 'POST', headers, body: JSON.stringify(order.params) });
            execResults.push({ agent: order.agent, status: r.ok ? 'executed' : 'failed' });
          } catch (e) {
            execResults.push({ agent: order.agent, status: 'error', error: String(e) });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      data: result,
      company_data: data,
      executed: execResults,
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET — historique des rapports CEO
export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const sb = getSb();
  const { data } = await sb.from('ceo_reports').select('*').order('created_at', { ascending: false }).limit(20);
  return NextResponse.json({ reports: data || [] });
}

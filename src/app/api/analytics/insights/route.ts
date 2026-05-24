import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const from = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: events } = await sb.from('analytics_events').select('*').gte('created_at', from).limit(3000);

  if (!events || events.length < 10) {
    return NextResponse.json({
      insights: {
        message: 'Pas encore assez de données (minimum 10 visites). Partage le lien du site pour obtenir du trafic réel.',
        meilleur_moment_post: { instagram: 'Données insuffisantes', tiktok: 'Données insuffisantes', facebook: 'Données insuffisantes', x: 'Données insuffisantes' },
        marches_prioritaires: [],
        contenu_qui_performe: [],
        actions_immediates: ['Partage le lien pietri.io sur tes réseaux pour générer des données analytiques réelles'],
        alerte: `Seulement ${events?.length || 0} visite(s) enregistrée(s) cette semaine.`,
      },
      dataPoints: events?.length || 0,
    });
  }

  // Agrégations
  const total = events.length;
  const sessions = new Set(events.map(e => e.session_id || e.id)).size;

  const agg = (key: string) => {
    const m: Record<string, number> = {};
    events.forEach(e => { const v = e[key] || 'Inconnu'; m[v] = (m[v] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  };

  const topCountries = agg('country').slice(0, 6).map(([k, v]) => `${k}: ${v}`).join(', ');
  const topPages     = agg('page').slice(0, 6).map(([k, v]) => `${k}: ${v}`).join(', ');
  const topRefs      = agg('referrer').slice(0, 6).map(([k, v]) => `${k}: ${v}`).join(', ');
  const devices      = agg('device').map(([k, v]) => `${k}: ${Math.round(v / total * 100)}%`).join(', ');

  const hourMap: Record<string, number> = {};
  events.forEach(e => {
    const h = new Date(e.created_at).getHours();
    hourMap[`${h}h`] = (hourMap[`${h}h`] || 0) + 1;
  });
  const hourSorted = Object.entries(hourMap).sort((a, b) => +a[0].replace('h','') - +b[0].replace('h','')).map(([h,c]) => `${h}:${c}`).join(' ');
  const peakHours  = Object.entries(hourMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([h]) => h).join(', ');

  const dayMap: Record<string, number> = {};
  events.forEach(e => {
    const day = new Date(e.created_at).toLocaleDateString('fr-FR', { weekday: 'short' });
    dayMap[day] = (dayMap[day] || 0) + 1;
  });
  const peakDays = Object.entries(dayMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d).join(', ');

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1800,
    system: `Tu es analyste data et stratège marketing digital expert en e-commerce streetwear pour les marchés africain (Côte d'Ivoire) et français. Tu analyses des données réelles de trafic web et fournis des recommandations CONCRÈTES, CHIFFRÉES et ACTIONNABLES pour maximiser les ventes et l'engagement.`,
    messages: [{
      role: 'user',
      content: `ANALYSE ANALYTICS — PIETRI (streetwear afro-français, pietri.io)
Période : 7 derniers jours

DONNÉES RÉELLES :
- Pages vues totales : ${total}
- Sessions uniques : ${sessions}
- Pages/session : ${(total / sessions).toFixed(1)}
- Appareils : ${devices}
- Top pays : ${topCountries}
- Top pages visitées : ${topPages}
- Sources de trafic : ${topRefs}
- Heures de pic : ${peakHours}
- Jours de pic : ${peakDays}
- Trafic heure par heure : ${hourSorted}

Donne des recommandations PRÉCISES basées sur ces données. JSON strict sans markdown :
{
  "meilleur_moment_post": {
    "instagram": "jours + horaires précis basés sur les données",
    "tiktok": "jours + horaires précis basés sur les données",
    "facebook": "jours + horaires précis basés sur les données",
    "x": "jours + horaires précis basés sur les données"
  },
  "marches_prioritaires": [
    "Pays 1 — X% du trafic — budget pub recommandé : XX%",
    "Pays 2 — X% du trafic — budget pub recommandé : XX%",
    "Pays 3 — X% du trafic — budget pub recommandé : XX%"
  ],
  "comportement_mobile": "analyse du comportement mobile vs desktop et implication pour le design/contenu",
  "contenu_qui_performe": [
    "Page/contenu le plus visité et pourquoi",
    "Recommandation contenu basée sur les données",
    "Type de post qui va le mieux performer"
  ],
  "ciblage_publicitaire": {
    "audience_ci": "ciblage précis pour Meta Ads CI (âge, intérêts, zones géo)",
    "audience_fr": "ciblage précis pour Meta Ads France (âge, intérêts, zones géo)"
  },
  "actions_immediates": [
    "Action concrète #1 à faire AUJOURD'HUI",
    "Action concrète #2 à faire cette SEMAINE",
    "Action concrète #3 à faire ce MOIS"
  ],
  "score_sante": {
    "note": "X/10",
    "commentaire": "évaluation honnête de la santé du trafic actuel"
  },
  "alerte": "insight surprenant ou point d'attention urgent (une phrase)"
}`
    }],
  });

  const raw = (msg.content[0] as any).text.trim();
  let insights: any = {};
  try { insights = JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '')); } catch { insights = { message: raw }; }

  return NextResponse.json({ insights, dataPoints: total, sessions });
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent 3 : SQL Chat Admin — langage naturel → requête Supabase
// POST /api/ai/sql  (x-admin-secret requis)
// { question: string }
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const maxDuration = 60;

// Client Supabase avec service_role pour lecture admin
const sbAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Schéma connu de la base PIETRI ────────────────────────────────────────
const DB_SCHEMA = `
Tables Supabase disponibles (lecture seule) :

orders (id, customer_name, customer_email, product_name, product_slug, size, quantity, total_amount, payment_status, status, created_at)
  → status: pending|confirmed|shipped|delivered|cancelled
  → payment_status: pending|paid|failed

profiles (id, email, full_name, phone, address, city, country, created_at)

blog_posts (id, slug, title, excerpt, published, created_at)

social_queue (id, platform, content, product_slug, status, market, scheduled_at, created_at)
  → platform: instagram|facebook|tiktok|x
  → status: pending|posted|failed

media_library (id, type, url, product_slug, platform, status, prompt, created_at)

seo_pages (id, page_path, meta_title, meta_description, og_title, og_description, keywords, created_at)

agent_runs (id, status, steps, summary, finished_at, created_at)
  → status: running|done|error
`;

// ── Traduire la question en requête structurée ────────────────────────────
type QueryPlan = {
  table: string;
  select: string;
  filter?: Record<string, unknown>;
  order?: { column: string; ascending: boolean };
  limit?: number;
  aggregate?: 'count' | 'sum';
  aggregate_column?: string;
  summary_question: string;
};

async function planQuery(question: string): Promise<QueryPlan> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: `Tu es un expert Supabase. Tu traduis des questions en langage naturel en requêtes structurées JSON.
Tu connais ce schéma :
${DB_SCHEMA}
Règle absolue : uniquement des opérations de LECTURE (SELECT). Jamais de mutation.`,
    messages: [{
      role: 'user',
      content: `Traduis cette question en requête JSON structurée :
"${question}"

Retourne un JSON strict sans markdown :
{
  "table": "nom_table",
  "select": "colonnes ou *",
  "filter": { "colonne": "valeur" } ou null,
  "order": { "column": "colonne", "ascending": false } ou null,
  "limit": 50,
  "aggregate": "count" ou "sum" ou null,
  "aggregate_column": "colonne à agréger" ou null,
  "summary_question": "reformulation courte de la question"
}`,
    }],
  });

  const raw = (msg.content[0] as { text: string }).text.trim();
  return JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, ''));
}

// ── Exécuter la requête via Supabase ORM ──────────────────────────────────
async function executeQuery(plan: QueryPlan): Promise<{ data: unknown[]; count?: number }> {
  let query = sbAdmin.from(plan.table).select(plan.select || '*', { count: 'exact' });

  // Filtres
  if (plan.filter) {
    for (const [col, val] of Object.entries(plan.filter)) {
      query = query.eq(col, val as string);
    }
  }

  // Tri
  if (plan.order) {
    query = query.order(plan.order.column, { ascending: plan.order.ascending });
  }

  // Limite
  query = query.limit(plan.limit || 50);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { data: data || [], count: count || undefined };
}

// ── Résumer les résultats en français ─────────────────────────────────────
async function summarize(question: string, data: unknown[], count?: number): Promise<string> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: `Tu es l'analyste data de PIETRI. Tu résumes des données Supabase en langage naturel, en français.
Sois précis, concis (2-4 phrases max). Mets en avant les chiffres clés.`,
    messages: [{
      role: 'user',
      content: `Question : "${question}"
Nombre total de résultats : ${count ?? data.length}
Données (premiers résultats) :
${JSON.stringify(data.slice(0, 20), null, 2)}

Fournis un résumé en 2-4 phrases.`,
    }],
  });
  return (msg.content[0] as { text: string }).text.trim();
}

// ── Handler principal (SSE streaming) ────────────────────────────────────
export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401 });
  }

  const { question } = await req.json().catch(() => ({}));
  if (!question?.trim()) {
    return new Response(JSON.stringify({ error: 'Question requise' }), { status: 400 });
  }

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (d: object) => {
        try { ctrl.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`)); } catch {}
      };

      try {
        // Étape 1 : Planifier la requête
        send({ type: 'step', step: 'planning', message: 'Analyse de ta question…' });
        const plan = await planQuery(question);
        send({ type: 'step', step: 'querying', message: `Requête sur la table "${plan.table}"…`, plan });

        // Étape 2 : Exécuter
        const { data, count } = await executeQuery(plan);
        send({ type: 'step', step: 'summarizing', message: 'Génération du résumé…', rows: data.length, total: count });

        // Étape 3 : Résumer
        const summary = await summarize(question, data, count);

        send({
          type: 'done',
          summary,
          table: plan.table,
          rows: data.length,
          total: count,
          data: data.slice(0, 100), // max 100 rows retournées
        });

      } catch (err) {
        send({ type: 'error', error: String(err) });
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

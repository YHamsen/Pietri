// ─────────────────────────────────────────────────────────────────────────────
// Agent 2 : Email Automation — génère + envoie des emails transactionnels
// POST /api/ai/email  (x-admin-secret requis)
// { type: string, to?: string, data: object }
// Types : welcome | order_confirm | shipping | cart_abandon | sav_escalation
// Envoie via Resend si RESEND_API_KEY est configuré, sinon retourne le HTML.
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Lire les env vars à chaque requête (pas au niveau module) pour Vercel
function getResend() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}
function getFromEmail() {
  // Utilise onboarding@resend.dev tant que pietri.io n'est pas vérifié sur Resend
  return process.env.FROM_EMAIL || 'onboarding@resend.dev';
}

export const maxDuration = 60;

// ── Templates de base pour chaque type ────────────────────────────────────
const EMAIL_TEMPLATES: Record<string, { subject_hint: string; context: string }> = {
  welcome: {
    subject_hint: 'Bienvenue dans la famille PIETRI 🖤',
    context: `Email de bienvenue pour un nouveau membre.
Ton de marque : premium, chaleureux, culturellement fier.
Mentionne : la marque, les drops exclusifs, la communauté, le code promo de bienvenue PIETRI10 (-10%).
CTA principal : "Découvrir la collection" → https://pietri.io`,
  },
  order_confirm: {
    subject_hint: 'Ta commande PIETRI est confirmée ✓',
    context: `Email de confirmation de commande.
Inclure : récapitulatif commande, délai de livraison, numéro de commande, CTA tracking.
Ton : rassurant, enthousiaste, professionnel.
Signature : équipe PIETRI + contact@pietri.io`,
  },
  shipping: {
    subject_hint: 'Ton colis PIETRI est en route 🚀',
    context: `Email d'expédition.
Inclure : numéro de suivi DHL si disponible, délai estimé, lien de tracking.
Ton : excitant, dynamique. Le colis va arriver.`,
  },
  cart_abandon: {
    subject_hint: 'Tu as oublié quelque chose 👀',
    context: `Email de relance panier abandonné. Urgent mais non insistant.
Rappeler les articles laissés dans le panier.
Créer de l'urgence : stocks limités, éditions limitées.
CTA : "Finaliser ma commande" → https://pietri.io/panier
Offrir -5% avec code PIETRI5 pour inciter à finaliser.`,
  },
  sav_escalation: {
    subject_hint: 'Ton dossier PIETRI a été pris en charge',
    context: `Email de prise en charge SAV. Client a un problème (retour, échange, commande introuvable).
Ton : empathique, professionnel, rassurant.
Indiquer délai de réponse : 24-48h ouvrés.
Référence dossier à inclure si fournie.`,
  },
};

// ── Génération HTML email par Claude ──────────────────────────────────────
async function generateEmail(type: string, data: Record<string, unknown>) {
  const template = EMAIL_TEMPLATES[type] || EMAIL_TEMPLATES.welcome;

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: `Tu es le responsable CRM de PIETRI, marque streetwear afro-française premium.
Tu génères des emails HTML transactionnels élégants qui correspondent à l'identité de marque.
Design email : fond noir (#0a0a0a), texte blanc, accent blanc/gris. Police système. Largeur max 600px.
Pas de balises <!DOCTYPE> ou <html> — retourne uniquement le contenu du <body> en HTML inline styles.
Toujours inclure le logo texte "PIETRI" en Anton-like (font-weight:900, letter-spacing:0.1em, font-size:28px).`,
    messages: [{
      role: 'user',
      content: `Génère un email HTML complet de type "${type}" pour PIETRI.

Contexte template : ${template.context}

Données client/commande :
${JSON.stringify(data, null, 2)}

Retourne un JSON strict sans markdown :
{
  "subject": "objet de l'email",
  "preview_text": "texte preview (50 chars max)",
  "html": "le HTML complet du body email avec styles inline"
}`,
    }],
  });

  const raw = (msg.content[0] as { text: string }).text.trim();
  return JSON.parse(raw.replace(/^```json?\n?/, '').replace(/\n?```$/, ''));
}

// ── Envoi via Resend SDK ───────────────────────────────────────────────────
async function sendViaResend(to: string, subject: string, html: string) {
  const client = getResend();
  if (!client) return { sent: false, reason: 'RESEND_API_KEY non configurée dans Vercel' };

  const { data, error } = await client.emails.send({
    from: getFromEmail(),
    to: [to],
    subject,
    html,
  });

  if (error) return { sent: false, reason: error.message };
  return { sent: true, id: data?.id };
}

// ── Handler principal ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { type = 'welcome', to, data = {} } = await req.json();

    if (!EMAIL_TEMPLATES[type]) {
      return NextResponse.json({
        error: `Type inconnu: ${type}`,
        available: Object.keys(EMAIL_TEMPLATES),
      }, { status: 400 });
    }

    // Générer l'email
    const email = await generateEmail(type, data as Record<string, unknown>);

    // Envoyer si destinataire fourni
    let sendResult = { sent: false, reason: 'Aucun destinataire fourni' } as Record<string, unknown>;
    if (to) {
      sendResult = await sendViaResend(to, email.subject, email.html);
    }

    return NextResponse.json({
      success: true,
      type,
      subject: email.subject,
      preview_text: email.preview_text,
      html: email.html,
      send: sendResult,
      resend_configured: !!process.env.RESEND_API_KEY,
      from: getFromEmail(),
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── GET — liste les types disponibles ─────────────────────────────────────
export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  return NextResponse.json({
    types: Object.entries(EMAIL_TEMPLATES).map(([type, t]) => ({
      type,
      subject_hint: t.subject_hint,
    })),
    resend_configured: !!process.env.RESEND_API_KEY,
    from: getFromEmail(),
  });
}

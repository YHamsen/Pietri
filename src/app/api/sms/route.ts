// ─────────────────────────────────────────────────────────────────────────────
// SMS Notifications — POST /api/sms  (x-admin-secret requis)
// { type, to, data? }  — ou  { type:'broadcast', phones:string[], data? }
// Types : order_confirm | shipping | cart_abandon | promo | custom | welcome
// Provider : Africa's Talking (CI/West Africa) → Twilio fallback
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

function getSbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── Message templates ─────────────────────────────────────────
const SMS_TEMPLATES: Record<string, (d: Record<string, string>) => string> = {
  order_confirm: (d) =>
    `✅ Commande PIETRI confirmée !\nMerci ${d.name || 'cher client'}, ta commande ${d.order_id ? `#${d.order_id.slice(0, 8)}` : ''} est confirmée.\nProduit : ${d.product || 'PIETRI'}\nMontant : ${d.amount || ''}€\nOn te tient informé. 🖤 pietri.io`,

  shipping: (d) =>
    `🚀 Ton colis PIETRI est en route !\n${d.tracking ? `Suivi : ${d.tracking}` : 'Livraison dans 2-4 jours.'}\nMerci de ta confiance. 🖤 pietri.io`,

  cart_abandon: (d) =>
    `👀 Tu as oublié ton panier PIETRI !\n${d.product ? `${d.product} t'attend.` : 'Tes articles t\'attendent.'}\nStocks limités — finalise maintenant :\npietri.io/panier\nCode -5% : PIETRI5`,

  promo: (d) =>
    `🔥 PIETRI DROP ALERT !\n${d.message || 'Nouvelle collection disponible.'}\n${d.code ? `Code promo : ${d.code}` : ''}\npietri.io`,

  welcome: (d) =>
    `🖤 Bienvenue dans la famille PIETRI, ${d.name || ''} !\nDécouvre nos drops exclusifs : pietri.io\nCode bienvenue : PIETRI10 (-10%)`,

  custom: (d) => d.message || 'Message PIETRI',
};

// ── Africa's Talking sender ───────────────────────────────────
async function sendAfricasTalking(to: string, message: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
  const senderId = process.env.AFRICASTALKING_SENDER || 'PIETRI';

  if (!apiKey) return { success: false, error: 'AFRICASTALKING_API_KEY non configurée' };

  const body = new URLSearchParams({
    username,
    to,
    message,
    from: senderId,
  });

  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await res.json();
  const recipient = data?.SMSMessageData?.Recipients?.[0];
  if (recipient?.statusCode === 101) {
    return { success: true, id: recipient.messageId };
  }
  return { success: false, error: recipient?.status || JSON.stringify(data) };
}

// ── Twilio fallback ───────────────────────────────────────────
async function sendTwilio(to: string, message: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !from) {
    return { success: false, error: 'Twilio non configuré' };
  }

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: message }).toString(),
    }
  );

  const data = await res.json();
  if (data.sid) return { success: true, id: data.sid };
  return { success: false, error: data.message || JSON.stringify(data) };
}

// ── Send one SMS (AT first, Twilio fallback) ──────────────────
async function sendSms(to: string, message: string): Promise<{ success: boolean; id?: string; provider: string; error?: string }> {
  // Try Africa's Talking first
  const at = await sendAfricasTalking(to, message);
  if (at.success) return { ...at, provider: 'africas_talking' };

  // Fallback to Twilio
  const tw = await sendTwilio(to, message);
  if (tw.success) return { ...tw, provider: 'twilio' };

  return { success: false, provider: 'none', error: `AT: ${at.error} | Twilio: ${tw.error}` };
}

// ── Log SMS in Supabase ───────────────────────────────────────
async function logSms(
  to: string, message: string, type: string,
  result: { success: boolean; id?: string; provider: string; error?: string }
) {
  const sb = getSbAdmin();
  await sb.from('sms_logs').insert({
    to_number: to,
    message,
    type,
    status: result.success ? 'sent' : 'failed',
    provider_id: result.id,
    error: result.error,
  });
}

// ── Main handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type = 'custom', to, phones, data = {} } = body;

    const templateFn = SMS_TEMPLATES[type] || SMS_TEMPLATES.custom;
    const message = templateFn(data as Record<string, string>);

    // Broadcast to multiple numbers
    if (phones && Array.isArray(phones)) {
      const results = await Promise.all(
        phones.map(async (phone: string) => {
          const result = await sendSms(phone, message);
          await logSms(phone, message, type, result);
          return { phone, ...result };
        })
      );
      const sent = results.filter(r => r.success).length;
      return NextResponse.json({ success: true, broadcast: true, sent, total: phones.length, results });
    }

    // Single recipient
    if (!to) return NextResponse.json({ error: 'Destinataire requis (to ou phones)' }, { status: 400 });

    const result = await sendSms(to, message);
    await logSms(to, message, type, result);

    return NextResponse.json({
      success: result.success,
      to,
      type,
      message,
      provider: result.provider,
      id: result.id,
      error: result.error,
    });

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// ── GET — logs SMS (admin) ────────────────────────────────────
export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const sb = getSbAdmin();
  const { data, count } = await sb
    .from('sms_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(100);

  return NextResponse.json({ logs: data || [], total: count || 0 });
}

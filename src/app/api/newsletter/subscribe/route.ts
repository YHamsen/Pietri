// ─────────────────────────────────────────────────────────────────────────────
// Newsletter Subscribe — POST /api/newsletter/subscribe
// { email: string, source?: string }
// Saves to Supabase, adds to Resend audience, sends welcome email via AI agent
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getSbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function getFromEmail() {
  return process.env.FROM_EMAIL || 'PIETRI <bonjour@pietri.io>';
}

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'popup' } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const sb = getSbAdmin();

    // 1. Save to Supabase newsletter_subscribers
    const { error: dbError } = await sb
      .from('newsletter_subscribers')
      .upsert({ email: email.toLowerCase().trim(), source, status: 'active' }, { onConflict: 'email' });

    if (dbError && !dbError.message.includes('duplicate')) {
      console.error('[newsletter] DB error:', dbError.message);
    }

    // 2. Add to Resend audience if configured
    const resend = getResend();
    if (resend && process.env.RESEND_AUDIENCE_ID) {
      await resend.contacts.create({
        email: email.toLowerCase().trim(),
        audienceId: process.env.RESEND_AUDIENCE_ID,
        unsubscribed: false,
      }).catch(e => console.error('[newsletter] Resend audience error:', e));
    }

    // 3. Email de bienvenue standalone (sans dépendance Anthropic)
    const resendClient = getResend();
    let emailSent = false;
    if (resendClient) {
      const cleanMail = email.toLowerCase().trim();
      const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pietri.io';
      const welcomeHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Bienvenue chez PIETRI</title></head><body style="margin:0;padding:0;background:#080808;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 16px">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

  <!-- Header -->
  <tr><td style="padding-bottom:36px;text-align:center">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.25)">STREETWEAR · LONDON</p>
    <h1 style="margin:10px 0 0;font-size:36px;font-weight:900;letter-spacing:0.12em;color:#fff;text-transform:uppercase;line-height:1">PIETRI</h1>
  </td></tr>

  <!-- Hero card -->
  <tr><td style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden">
    <!-- Accent bar -->
    <div style="height:3px;background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.15) 100%)"></div>

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 32px">
      <!-- Badge -->
      <tr><td style="padding-bottom:20px">
        <span style="display:inline-block;padding:5px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:999px;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4)">Famille PIETRI</span>
      </td></tr>

      <!-- Headline -->
      <tr><td style="padding-bottom:16px">
        <h2 style="margin:0;font-size:28px;font-weight:800;color:#fff;line-height:1.25;letter-spacing:-0.01em">Tu es l'un des premiers<br>à recevoir nos drops 🖤</h2>
      </td></tr>

      <!-- Subtitle -->
      <tr><td style="padding-bottom:32px;border-bottom:1px solid rgba(255,255,255,0.06)">
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.45);line-height:1.75">Streetwear afro-britannique premium. Chaque pièce est une déclaration — culture africaine, éditions limitées, qualité London.</p>
      </td></tr>

      <!-- Promo code -->
      <tr><td style="padding:28px 0 0">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.35)">Ton code de bienvenue</p>
        <table cellpadding="0" cellspacing="0" style="width:100%">
          <tr>
            <td style="background:rgba(255,255,255,0.04);border:1.5px dashed rgba(255,255,255,0.18);border-radius:12px;padding:18px 24px">
              <p style="margin:0 0 4px;font-size:28px;font-weight:900;letter-spacing:0.18em;color:#fff;text-align:center">PIETRI10</p>
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);text-align:center;letter-spacing:0.1em">−10 % sur ta première commande</p>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding-top:24px;text-align:center">
        <a href="${siteUrl}" style="display:inline-block;background:#fff;color:#080808;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;padding:16px 40px;border-radius:999px;text-decoration:none">Découvrir la collection &rarr;</a>
      </td></tr>

      <!-- Trust badges -->
      <tr><td style="padding-top:28px">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align:center;padding:0 6px">
              <p style="margin:0;font-size:18px">🇬🇧</p>
              <p style="margin:4px 0 0;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase">London</p>
            </td>
            <td style="text-align:center;padding:0 6px">
              <p style="margin:0;font-size:18px">🌍</p>
              <p style="margin:4px 0 0;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase">Diaspora</p>
            </td>
            <td style="text-align:center;padding:0 6px">
              <p style="margin:0;font-size:18px">⚡</p>
              <p style="margin:4px 0 0;font-size:10px;font-weight:700;color:rgba(255,255,255,0.3);letter-spacing:0.1em;text-transform:uppercase">Édition limitée</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding-top:28px;text-align:center">
    <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.2)">PIETRI Ltd · Registered in England &amp; Wales</p>
    <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15)">London, United Kingdom · <a href="mailto:bonjour@pietri.io" style="color:rgba(255,255,255,0.2);text-decoration:none">bonjour@pietri.io</a></p>
    <p style="margin:12px 0 0;font-size:10px;color:rgba(255,255,255,0.1)">Tu reçois cet email car tu t'es inscrit(e) sur pietri.io</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

      const { error: emailError } = await resendClient.emails.send({
        from: getFromEmail(),
        to: [cleanMail],
        subject: 'Bienvenue dans la famille PIETRI 🖤',
        html: welcomeHtml,
      }).catch(() => ({ error: 'send failed', data: null }));

      emailSent = !emailError;
    }

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie !',
      email_sent: emailSent,
    });

  } catch (err) {
    console.error('[newsletter] Error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// GET — stats abonnés (admin only)
export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const sb = getSbAdmin();
  const [{ count: total }, { count: active }, { data: recent }] = await Promise.all([
    sb.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
    sb.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    sb.from('newsletter_subscribers').select('id,email,source,status,created_at').order('created_at', { ascending: false }).limit(50),
  ]);

  return NextResponse.json({ total, active, recent: recent || [] });
}

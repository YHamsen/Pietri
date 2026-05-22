import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

// Sandbox: https://sandbox.momodeveloper.mtn.com
// Production: https://proxy.momoapi.mtn.com
const MOMO_BASE = process.env.MOMO_ENV === 'production'
  ? 'https://proxy.momoapi.mtn.com'
  : 'https://sandbox.momodeveloper.mtn.com';

const SUB_KEY = process.env.MOMO_COLLECTIONS_PRIMARY_KEY!;
const TARGET_ENV = process.env.MOMO_ENV === 'production' ? 'production' : 'sandbox';

async function getApiUser(): Promise<{ apiUser: string; apiKey: string }> {
  const apiUser = process.env.MOMO_API_USER;
  const apiKey  = process.env.MOMO_API_KEY;

  if (apiUser && apiKey) return { apiUser, apiKey };

  // Sandbox auto-provisioning (one-time, called when env vars are missing)
  const newUser = randomUUID();
  const createRes = await fetch(`${MOMO_BASE}/v1_0/apiuser`, {
    method: 'POST',
    headers: {
      'X-Reference-Id': newUser,
      'Ocp-Apim-Subscription-Key': SUB_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ providerCallbackHost: process.env.NEXT_PUBLIC_BASE_URL || 'localhost' }),
  });
  if (!createRes.ok) throw new Error(`API User creation failed: ${createRes.status}`);

  const keyRes = await fetch(`${MOMO_BASE}/v1_0/apiuser/${newUser}/apikey`, {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': SUB_KEY },
  });
  if (!keyRes.ok) throw new Error(`API Key retrieval failed: ${keyRes.status}`);
  const { apiKey: newKey } = await keyRes.json();
  return { apiUser: newUser, apiKey: newKey };
}

async function getToken(apiUser: string, apiKey: string): Promise<string> {
  const credentials = Buffer.from(`${apiUser}:${apiKey}`).toString('base64');
  const res = await fetch(`${MOMO_BASE}/collection/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': SUB_KEY,
    },
  });
  if (!res.ok) throw new Error(`Token failed: ${res.status}`);
  const { access_token } = await res.json();
  return access_token;
}

// POST — initier un paiement
export async function POST(req: NextRequest) {
  try {
    const { phone, amount, currency = 'EUR', produit, taille, adresse } = await req.json();
    if (!phone || !amount || !produit) {
      return NextResponse.json({ error: 'Champs requis: phone, amount, produit' }, { status: 400 });
    }

    const { apiUser, apiKey } = await getApiUser();
    const token = await getToken(apiUser, apiKey);
    const referenceId = randomUUID();

    const payRes = await fetch(`${MOMO_BASE}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': TARGET_ENV,
        'Ocp-Apim-Subscription-Key': SUB_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(amount),
        currency,
        externalId: referenceId,
        payer: { partyIdType: 'MSISDN', partyId: phone.replace(/\s+/g, '').replace('+', '') },
        payerMessage: `PIETRI — ${produit} (${taille})`,
        payeeNote: `Commande PIETRI | ${adresse || 'International'}`,
      }),
    });

    if (payRes.status !== 202) {
      const errText = await payRes.text();
      // Don't forward raw HTML (WAF rejection etc.) to the client
      const isHtml = errText.trim().startsWith('<');
      const detail = isHtml
        ? `Erreur MoMo (${payRes.status}). Vérifie ton numéro et réessaie.`
        : errText.slice(0, 200);
      return NextResponse.json({ error: 'Refusé par MoMo', detail }, { status: 502 });
    }

    return NextResponse.json({ success: true, referenceId });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}

// GET ?ref=xxx — vérifier le statut d'un paiement
export async function GET(req: NextRequest) {
  const ref = new URL(req.url).searchParams.get('ref');
  if (!ref) return NextResponse.json({ error: 'ref manquant' }, { status: 400 });
  try {
    const { apiUser, apiKey } = await getApiUser();
    const token = await getToken(apiUser, apiKey);
    const res = await fetch(`${MOMO_BASE}/collection/v1_0/requesttopay/${ref}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Target-Environment': TARGET_ENV,
        'Ocp-Apim-Subscription-Key': SUB_KEY,
      },
    });
    return NextResponse.json(await res.json());
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}

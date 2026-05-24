import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.NOTIFY_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, message, data, target } = body as {
    title: string;
    message: string;
    data?: Record<string, string>;
    target?: 'all' | string; // 'all' ou email spécifique
  };

  if (!title || !message) {
    return NextResponse.json({ error: 'title and message required' }, { status: 400 });
  }

  // Récupérer les tokens ciblés
  let query = supabase.from('push_tokens').select('token');
  if (target && target !== 'all') {
    query = query.eq('email', target);
  }
  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tokens = (rows ?? []).map((r: { token: string }) => r.token);
  if (tokens.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No tokens found' });
  }

  // Expo Push API accepte 100 messages max par batch
  const batches = [];
  for (let i = 0; i < tokens.length; i += 100) {
    batches.push(tokens.slice(i, i + 100));
  }

  let totalSent = 0;
  for (const batch of batches) {
    const messages = batch.map((token: string) => ({
      to: token,
      title,
      body: message,
      data: data ?? {},
      sound: 'default',
      priority: 'high',
    }));

    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(messages),
    });

    if (res.ok) totalSent += batch.length;
  }

  return NextResponse.json({ sent: totalSent });
}

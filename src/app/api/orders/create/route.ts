import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { referenceId, items, total, delivery, address, phone, profile } = body;

    if (!referenceId || !items || !total) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const productName = items.map((i: { label: string; taille: string }) => `${i.label} (${i.taille})`).join(', ');
    const customerName = profile ? `${profile.prenom} ${profile.nom}`.trim() || 'Client' : 'Client';

    const { error } = await sb.from('orders').insert({
      id: referenceId,
      customer_name: customerName,
      customer_email: profile?.email || null,
      customer_phone: phone || null,
      product_name: productName,
      items_json: JSON.stringify(items),
      total_amount: total,
      status: 'pending',
      payment_status: 'pending',
      momo_ref: referenceId,
      delivery_type: delivery,
      delivery_address: address || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase order insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: referenceId });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

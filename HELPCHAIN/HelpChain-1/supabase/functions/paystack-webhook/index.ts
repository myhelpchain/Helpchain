import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

async function verifySignature(secret: string, body: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return computed === signature;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY') || Deno.env.get('PAYSTACK_API_KEY');
  if (!paystackKey) {
    return new Response('Not configured', { status: 500, headers: corsHeaders });
  }

  const signature = req.headers.get('x-paystack-signature') || '';
  const body = await req.text();

  // Verify webhook signature
  const valid = await verifySignature(paystackKey, body, signature);
  if (!valid) {
    console.error('Invalid Paystack webhook signature');
    return new Response('Invalid signature', { status: 400, headers: corsHeaders });
  }

  const event = JSON.parse(body);
  console.log('Paystack webhook event:', event.event);

  if (event.event !== 'charge.success') {
    return new Response('OK', { status: 200, headers: corsHeaders });
  }

  const { reference, amount: amountKobo, customer } = event.data;
  const amount = amountKobo / 100;
  const paystackUserId = event.data.metadata?.user_id;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // Check if already processed
    const { data: deposit } = await supabase
      .from('deposits')
      .select('*')
      .eq('paystack_reference', reference)
      .maybeSingle();

    if (deposit?.status === 'completed') {
      return new Response('Already processed', { status: 200, headers: corsHeaders });
    }

    // Determine user ID from deposit record or metadata
    const userId = deposit?.user_id || paystackUserId;
    if (!userId) {
      console.error('No user ID found for reference:', reference);
      return new Response('No user found', { status: 400, headers: corsHeaders });
    }

    // Get current wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    const prevBalance = Number(wallet?.available_balance || 0);
    const newBalance = prevBalance + amount;

    if (wallet) {
      await supabase
        .from('wallets')
        .update({ available_balance: newBalance })
        .eq('id', wallet.id);
    } else {
      await supabase.from('wallets').insert({
        user_id: userId,
        available_balance: newBalance,
        escrow_balance: 0,
        currency: 'NGN',
      });
    }

    // Record transaction
    await supabase.from('wallet_transactions').insert({
      user_id: userId,
      transaction_type: 'deposit',
      amount,
      balance_before: prevBalance,
      balance_after: newBalance,
      status: 'completed',
      description: `Deposit of ₦${amount.toLocaleString()} via Paystack`,
      reference,
    });

    // Mark deposit completed
    if (deposit) {
      await supabase
        .from('deposits')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          webhook_verified: true,
          payment_method: event.data.channel || 'card',
        })
        .eq('paystack_reference', reference);
    } else {
      await supabase.from('deposits').insert({
        user_id: userId,
        amount,
        status: 'completed',
        paystack_reference: reference,
        completed_at: new Date().toISOString(),
        webhook_verified: true,
        payment_method: event.data.channel || 'card',
      });
    }

    // Create notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'wallet',
      title: 'Deposit Successful',
      message: `₦${amount.toLocaleString()} has been added to your wallet.`,
      related_entity_type: 'deposit',
    });

    console.log(`Deposit processed: ₦${amount} for user ${userId}`);
    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return new Response('Processing error', { status: 500, headers: corsHeaders });
  }
});

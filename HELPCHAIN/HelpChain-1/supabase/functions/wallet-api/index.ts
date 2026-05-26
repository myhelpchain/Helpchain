import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as jose from 'https://deno.land/x/jose@v5.6.3/index.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FIREBASE_PROJECT_ID = Deno.env.get('FIREBASE_PROJECT_ID') ?? 'myhelpchain123';
const FIREBASE_JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let cachedJWKS: ReturnType<typeof jose.createRemoteJWKSet> | null = null;
function getJWKS() {
  if (!cachedJWKS) {
    cachedJWKS = jose.createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));
  }
  return cachedJWKS;
}

async function verifyFirebaseToken(token: string): Promise<string | null> {
  try {
    const JWKS = getJWKS();
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
    });
    const uid = (payload.sub ?? (payload as Record<string, unknown>).user_id) as string | undefined;
    if (!uid) return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return uid;
  } catch (err) {
    console.error('[wallet-api] Token verification failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function getVerifiedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  return verifyFirebaseToken(token);
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getRoute(url: URL): string {
  const pathname = url.pathname;
  const patterns = [
    /^\/functions\/v1\/wallet-api/,
    /^\/wallet-api/,
  ];
  for (const p of patterns) {
    if (p.test(pathname)) {
      return pathname.replace(p, '') || '/';
    }
  }
  return pathname || '/';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const route = getRoute(url);
  console.log(`[wallet-api] ${req.method} ${url.pathname} -> route: ${route}`);

  const userId = await getVerifiedUserId(req);
  if (!userId) {
    console.log('[wallet-api] Authentication failed — invalid or missing token');
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  console.log(`[wallet-api] Verified userId: ${userId.slice(0, 8)}...`);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // ─── GET /wallet ────────────────────────────────────────
    if (req.method === 'GET' && route === '/wallet') {
      let { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!wallet) {
        const { data: newWallet, error: createErr } = await supabase
          .from('wallets')
          .insert({ user_id: userId, available_balance: 0, escrow_balance: 0, currency: 'NGN' })
          .select()
          .single();
        if (createErr) throw createErr;
        wallet = newWallet;
      }

      return jsonResponse({
        wallet: {
          id: wallet.id,
          userId: wallet.user_id,
          availableBalance: Number(wallet.available_balance),
          escrowBalance: Number(wallet.escrow_balance),
          status: wallet.wallet_status,
          createdAt: wallet.created_at,
          updatedAt: wallet.updated_at,
        },
      });
    }

    // ─── GET /wallet/transactions ───────────────────────────
    if (req.method === 'GET' && route === '/wallet/transactions') {
      const { data: txs, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      return jsonResponse({
        transactions: (txs || []).map((tx: any) => ({
          id: tx.id,
          type: tx.transaction_type,
          amount: Number(tx.amount),
          status: tx.status,
          description: tx.description || '',
          reference: tx.reference,
          balanceBefore: Number(tx.balance_before),
          balanceAfter: Number(tx.balance_after),
          createdAt: tx.created_at,
        })),
      });
    }

    // ─── POST /wallet/deposit/initialize ────────────────────
    if (req.method === 'POST' && route === '/wallet/deposit/initialize') {
      const { amount, callbackUrl } = await req.json();
      console.log(`[wallet-api] Deposit initialize: amount=${amount}`);

      if (!amount || amount < 100) {
        return jsonResponse({ message: 'Minimum deposit is ₦100' }, 400);
      }

      const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY') || Deno.env.get('PAYSTACK_API_KEY');
      if (!paystackKey) {
        console.error('[wallet-api] PAYSTACK_SECRET_KEY not set');
        throw new Error('Payment service not configured');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', userId)
        .maybeSingle();

      const email = profile?.email || `${userId.slice(0, 8)}@helpchain.app`;
      const reference = `hc_${Date.now()}_${userId.slice(0, 6)}`;

      const { error: insertErr } = await supabase.from('deposits').insert({
        user_id: userId,
        amount,
        status: 'pending',
        paystack_reference: reference,
      });
      if (insertErr) console.error('[wallet-api] Deposit insert error:', insertErr);

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100),
          reference,
          callback_url: callbackUrl || 'https://helpchain.lovable.app/wallet',
          metadata: {
            user_id: userId,
            custom_fields: [
              { display_name: 'User ID', variable_name: 'user_id', value: userId },
            ],
          },
        }),
      });

      const paystackData = await paystackRes.json();
      console.log('[wallet-api] Paystack response:', JSON.stringify(paystackData));

      if (!paystackData.status) {
        throw new Error(paystackData.message || 'Failed to initialize payment');
      }

      return jsonResponse({
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        access_code: paystackData.data.access_code,
      });
    }

    // ─── POST /wallet/deposit/verify ────────────────────────
    if (req.method === 'POST' && route === '/wallet/deposit/verify') {
      const { reference } = await req.json();
      console.log(`[wallet-api] Verify deposit: ref=${reference}`);

      const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY') || Deno.env.get('PAYSTACK_API_KEY');
      if (!paystackKey) throw new Error('Payment service not configured');

      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: { Authorization: `Bearer ${paystackKey}` } },
      );
      const verifyData = await verifyRes.json();

      if (!verifyData.status || verifyData.data?.status !== 'success') {
        return jsonResponse({ message: 'Payment not yet successful' }, 400);
      }

      const { data: deposit } = await supabase
        .from('deposits')
        .select('status, user_id')
        .eq('paystack_reference', reference)
        .maybeSingle();

      if (deposit?.status === 'completed') {
        return jsonResponse({ message: 'Already processed', alreadyProcessed: true });
      }

      if (deposit && deposit.user_id !== userId) {
        console.error('[wallet-api] Deposit user_id mismatch — possible fraud attempt');
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const depositAmount = verifyData.data.amount / 100;

      let { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      const prevBalance = Number(wallet?.available_balance || 0);
      const newBalance = prevBalance + depositAmount;

      if (wallet) {
        await supabase.from('wallets').update({ available_balance: newBalance }).eq('id', wallet.id);
      } else {
        await supabase.from('wallets').insert({ user_id: userId, available_balance: newBalance, escrow_balance: 0, currency: 'NGN' });
      }

      await supabase.from('wallet_transactions').insert({
        user_id: userId,
        transaction_type: 'deposit',
        amount: depositAmount,
        balance_before: prevBalance,
        balance_after: newBalance,
        status: 'completed',
        description: `Deposit of ₦${depositAmount.toLocaleString()} via Paystack`,
        reference,
      });

      await supabase.from('deposits').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        webhook_verified: true,
        payment_method: verifyData.data.channel || 'card',
      }).eq('paystack_reference', reference);

      return jsonResponse({ success: true, amount: depositAmount, newBalance });
    }

    // ─── POST /wallet/withdraw ──────────────────────────────
    if (req.method === 'POST' && route === '/wallet/withdraw') {
      const { amount, bankCode, accountNumber, accountName, walletAddress } = await req.json();
      console.log(`[wallet-api] Withdraw: amount=${amount}, method=${walletAddress ? 'crypto' : 'bank'}`);

      if (!amount || amount <= 0) {
        return jsonResponse({ message: 'Invalid amount' }, 400);
      }

      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      const balance = Number(wallet?.available_balance || 0);
      if (balance < amount) {
        return jsonResponse({ message: 'Insufficient balance' }, 400);
      }

      const newBalance = balance - amount;

      if (!walletAddress && (bankCode || (req as any).bank) && accountNumber) {
        const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY') || Deno.env.get('PAYSTACK_API_KEY');
        if (!paystackKey) throw new Error('Payment service not configured');

        const actualBankCode = bankCode || (req as any).bank || (await req.clone().json()).bank;

        const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
          method: 'POST',
          headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'nuban',
            name: accountName || 'HelpChain User',
            account_number: accountNumber,
            bank_code: actualBankCode,
            currency: 'NGN',
          }),
        });
        const recipientData = await recipientRes.json();

        if (!recipientData.status) {
          throw new Error(recipientData.message || 'Failed to create transfer recipient');
        }

        const transferRef = `hc_w_${Date.now()}_${userId.slice(0, 6)}`;
        const transferRes = await fetch('https://api.paystack.co/transfer', {
          method: 'POST',
          headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source: 'balance',
            amount: Math.round(amount * 100),
            recipient: recipientData.data.recipient_code,
            reason: `HelpChain withdrawal for user ${userId.slice(0, 8)}`,
            reference: transferRef,
          }),
        });
        const transferData = await transferRes.json();

        if (!transferData.status) {
          throw new Error(transferData.message || 'Transfer failed');
        }

        await supabase.from('wallets').update({ available_balance: newBalance }).eq('id', wallet!.id);

        await supabase.from('withdrawals').insert({
          user_id: userId,
          amount,
          status: 'processing',
          paystack_reference: transferRef,
        });

        await supabase.from('wallet_transactions').insert({
          user_id: userId,
          transaction_type: 'withdrawal',
          amount,
          balance_before: balance,
          balance_after: newBalance,
          status: 'processing',
          description: `Bank withdrawal of ₦${amount.toLocaleString()}`,
          reference: transferRef,
        });

        return jsonResponse({
          success: true,
          message: 'Withdrawal initiated. Funds will arrive in your bank account within 24 hours.',
        });
      }

      await supabase.from('wallets').update({ available_balance: newBalance }).eq('id', wallet!.id);

      await supabase.from('withdrawals').insert({
        user_id: userId,
        amount,
        status: 'pending',
      });

      await supabase.from('wallet_transactions').insert({
        user_id: userId,
        transaction_type: 'withdrawal',
        amount,
        balance_before: balance,
        balance_after: newBalance,
        status: 'pending',
        description: walletAddress
          ? `Withdrawal to Solana wallet`
          : `Withdrawal to bank account`,
      });

      return jsonResponse({
        success: true,
        message: walletAddress
          ? 'Crypto withdrawal submitted. Processing in 1-3 business days.'
          : 'Withdrawal submitted. Processing in 1-3 business days.',
      });
    }

    // ─── GET /banks (Paystack bank list) ────────────────────
    if (req.method === 'GET' && route === '/banks') {
      const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY') || Deno.env.get('PAYSTACK_API_KEY');
      if (!paystackKey) throw new Error('Payment service not configured');

      const res = await fetch('https://api.paystack.co/bank?country=nigeria', {
        headers: { Authorization: `Bearer ${paystackKey}` },
      });
      const data = await res.json();
      return jsonResponse({ banks: data.data || [] });
    }

    // ─── POST /verify-account (Paystack account verification) ─
    if (req.method === 'POST' && route === '/verify-account') {
      const { accountNumber, bankCode } = await req.json();
      const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY') || Deno.env.get('PAYSTACK_API_KEY');
      if (!paystackKey) throw new Error('Payment service not configured');

      const res = await fetch(
        `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
        { headers: { Authorization: `Bearer ${paystackKey}` } },
      );
      const data = await res.json();
      if (!data.status) {
        return jsonResponse({ message: data.message || 'Could not verify account' }, 400);
      }
      return jsonResponse({ accountName: data.data.account_name });
    }

    // ─── POST /wallet/escrow/lock ───────────────────────────
    if (req.method === 'POST' && route === '/wallet/escrow/lock') {
      const { taskId, amount } = await req.json();

      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!wallet || Number(wallet.available_balance) < amount) {
        return jsonResponse({ error: 'Insufficient balance' }, 400);
      }

      const newAvailable = Number(wallet.available_balance) - amount;
      const newEscrow = Number(wallet.escrow_balance) + amount;

      await supabase.from('wallets').update({
        available_balance: newAvailable,
        escrow_balance: newEscrow
      }).eq('id', wallet.id);

      await supabase.from('wallet_transactions').insert({
        user_id: userId,
        transaction_type: 'escrow_lock',
        amount,
        balance_before: wallet.available_balance,
        balance_after: newAvailable,
        status: 'completed',
        description: `Escrow locked for task ${taskId.slice(0, 8)}`,
        metadata: { task_id: taskId }
      });

      return jsonResponse({ success: true });
    }

    // ─── POST /wallet/escrow/release ────────────────────────
    if (req.method === 'POST' && route === '/wallet/escrow/release') {
      const { taskId, workerId, amount } = await req.json();

      // 1. Deduct from requester's escrow
      const { data: reqWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!reqWallet || Number(reqWallet.escrow_balance) < amount) {
        return jsonResponse({ error: 'Insufficient escrow balance' }, 400);
      }

      await supabase.from('wallets').update({
        escrow_balance: Number(reqWallet.escrow_balance) - amount
      }).eq('id', reqWallet.id);

      // 2. Add to worker's available balance
      let { data: workerWallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', workerId)
        .maybeSingle();

      if (!workerWallet) {
        const { data: newW } = await supabase.from('wallets').insert({
          user_id: workerId, available_balance: amount, escrow_balance: 0
        }).select().single();
        workerWallet = newW;
      } else {
        await supabase.from('wallets').update({
          available_balance: Number(workerWallet.available_balance) + amount
        }).eq('id', workerWallet.id);
      }

      await supabase.from('wallet_transactions').insert({
        user_id: workerId,
        transaction_type: 'earning',
        amount,
        balance_before: workerWallet?.available_balance || 0,
        balance_after: Number(workerWallet?.available_balance || 0) + amount,
        status: 'completed',
        description: `Earning from task ${taskId.slice(0, 8)}`,
        metadata: { task_id: taskId }
      });

      return jsonResponse({ success: true });
    }

    console.log(`[wallet-api] 404 for route: ${route}`);
    return jsonResponse({ error: 'Not found' }, 404);
  } catch (err: any) {
    console.error('[wallet-api] Error:', err);
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
});

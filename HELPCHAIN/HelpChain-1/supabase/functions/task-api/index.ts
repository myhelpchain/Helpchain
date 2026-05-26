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
  if (!cachedJWKS) cachedJWKS = jose.createRemoteJWKSet(new URL(FIREBASE_JWKS_URL));
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
    console.error('[task-api] Token verification failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

async function getVerifiedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return verifyFirebaseToken(authHeader.slice(7));
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getRoute(url: URL): string {
  const pathname = url.pathname;
  const patterns = [/^\/functions\/v1\/task-api/, /^\/task-api/];
  for (const p of patterns) {
    if (p.test(pathname)) return pathname.replace(p, '') || '/';
  }
  return pathname || '/';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const url = new URL(req.url);
  const route = getRoute(url);
  console.log(`[task-api] ${req.method} ${url.pathname} -> route: ${route}`);

  const userId = await getVerifiedUserId(req);
  if (!userId) {
    console.log('[task-api] Authentication failed');
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {

    // ─── POST /tasks ─────────────────────────────────────────
    if (req.method === 'POST' && route === '/tasks') {
      const body = await req.json();
      const { title, description, category, location, locationType, urgency, budget, workerCount } = body;

      if (!title || !description || !category) {
        return jsonResponse({ error: 'Title, description, and category are required' }, 400);
      }

      const budgetNum = Number(budget) || 0;
      const workers = Number(workerCount) || 1;
      const totalBudget = budgetNum * workers;
      const platformFee = Math.round(totalBudget * 0.06);
      const grandTotal = totalBudget + platformFee;
      const isRemote = locationType === 'remote' || !location;

      if (totalBudget > 0) {
        const { data: wallet } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!wallet || Number(wallet.available_balance) < grandTotal) {
          return jsonResponse({
            error: 'Insufficient balance',
            message: `You need ₦${grandTotal.toLocaleString()} but only have ₦${(wallet ? Number(wallet.available_balance) : 0).toLocaleString()}.`,
          }, 400);
        }

        const newAvailable = Number(wallet.available_balance) - grandTotal;
        const newEscrow = Number(wallet.escrow_balance) + grandTotal;

        await supabase.from('wallets').update({ available_balance: newAvailable, escrow_balance: newEscrow }).eq('user_id', userId);
        await supabase.from('wallet_transactions').insert({
          user_id: userId,
          amount: grandTotal,
          transaction_type: 'escrow_lock',
          description: `Task escrow: ${title}`,
          balance_before: Number(wallet.available_balance),
          balance_after: newAvailable,
          status: 'completed',
        });
      }

      const { data: task, error: taskErr } = await supabase
        .from('tasks')
        .insert({
          requester_id: userId,
          title,
          description,
          category,
          location: isRemote ? null : (location || null),
          urgency: urgency || 'flexible',
          budget: budgetNum,
          platform_fee: platformFee,
          status: 'open',
          funded_from: totalBudget > 0 ? 'wallet' : null,
          is_remote: isRemote,
        })
        .select()
        .single();

      if (taskErr) throw taskErr;

      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'task_created',
        title: 'Task Posted!',
        message: `Your task "${title}" is now live on the marketplace.`,
        related_entity_type: 'task',
        related_entity_id: task.id,
      });

      return jsonResponse({ task, message: 'Task created successfully' }, 201);
    }

    // ─── GET /tasks ──────────────────────────────────────────
    if (req.method === 'GET' && route === '/tasks') {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`requester_id.eq.${userId},helper_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return jsonResponse({ tasks: tasks || [] });
    }

    // ─── GET /tasks/open ─────────────────────────────────────
    if (req.method === 'GET' && route === '/tasks/open') {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*, profiles:requester_id(full_name, avatar_url, location)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return jsonResponse({ tasks: tasks || [] });
    }

    // ─── GET /tasks/:id ──────────────────────────────────────
    if (req.method === 'GET' && route.match(/^\/tasks\/[^\/]+$/)) {
      const taskId = route.replace('/tasks/', '');
      if (taskId === 'open') {
        // handled above — fallthrough shouldn't happen but just in case
        return jsonResponse({ error: 'Not found' }, 404);
      }
      const { data: task, error } = await supabase
        .from('tasks')
        .select('*, profiles:requester_id(full_name, avatar_url, location, reputation_score, total_tasks_posted)')
        .eq('id', taskId)
        .maybeSingle();

      if (error) throw error;
      if (!task) return jsonResponse({ error: 'Task not found' }, 404);

      // Increment view count
      await supabase.from('tasks').update({ views_count: (task.views_count || 0) + 1 }).eq('id', taskId);

      return jsonResponse({ task });
    }

    // ─── PATCH /tasks/:id ────────────────────────────────────
    if (req.method === 'PATCH' && route.match(/^\/tasks\/[^\/]+$/) && !route.includes('/offers') && !route.includes('/complete')) {
      const taskId = route.replace('/tasks/', '');
      const body = await req.json();

      const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
      if (!task) return jsonResponse({ error: 'Task not found' }, 404);
      if (task.requester_id !== userId) return jsonResponse({ error: 'Forbidden' }, 403);

      const allowed = ['title', 'description', 'status', 'urgency', 'budget'];
      const updates: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) updates[key] = body[key];
      }

      const { data: updated, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single();
      if (error) throw error;
      return jsonResponse({ task: updated });
    }

    // ─── POST /tasks/:id/offers ──────────────────────────────
    if (req.method === 'POST' && route.match(/^\/tasks\/[^\/]+\/offers$/)) {
      const taskId = route.split('/')[2];
      const body = await req.json();
      const { message, amount, deliveryTime } = body;

      if (!message || message.length < 50) {
        return jsonResponse({ error: 'Offer message must be at least 50 characters' }, 400);
      }

      // Check task exists and is open
      const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
      if (!task) return jsonResponse({ error: 'Task not found' }, 404);
      if (task.status !== 'open') return jsonResponse({ error: 'This task is no longer accepting offers' }, 400);
      if (task.requester_id === userId) return jsonResponse({ error: 'You cannot offer on your own task' }, 400);

      // Check not already offered
      const { data: existing } = await supabase
        .from('offers')
        .select('id')
        .eq('task_id', taskId)
        .eq('worker_id', userId)
        .maybeSingle();

      if (existing) return jsonResponse({ error: 'You have already submitted an offer for this task' }, 400);

      const { data: offer, error: offerErr } = await supabase
        .from('offers')
        .insert({
          task_id: taskId,
          worker_id: userId,
          message,
          amount: Number(amount) || task.budget,
          delivery_time: deliveryTime || null,
          status: 'pending',
        })
        .select()
        .single();

      if (offerErr) throw offerErr;

      // Increment offers_count on task
      await supabase.from('tasks').update({ offers_count: (task.offers_count || 0) + 1 }).eq('id', taskId);

      // Notify task creator
      const { data: workerProfile } = await supabase.from('profiles').select('full_name').eq('user_id', userId).maybeSingle();
      const workerName = workerProfile?.full_name || 'Someone';
      await supabase.from('notifications').insert({
        user_id: task.requester_id,
        type: 'offer_received',
        title: 'New Offer Received!',
        message: `${workerName} submitted an offer for your task "${task.title}".`,
        related_entity_type: 'offer',
        related_entity_id: offer.id,
      });

      return jsonResponse({ offer, message: 'Offer submitted successfully' }, 201);
    }

    // ─── GET /tasks/:id/offers ───────────────────────────────
    if (req.method === 'GET' && route.match(/^\/tasks\/[^\/]+\/offers$/)) {
      const taskId = route.split('/')[2];

      const { data: task } = await supabase.from('tasks').select('requester_id').eq('id', taskId).maybeSingle();
      if (!task) return jsonResponse({ error: 'Task not found' }, 404);

      // Fetch offers with worker profile info
      const { data: offers, error } = await supabase
        .from('offers')
        .select('*, profiles:worker_id(full_name, avatar_url, reputation_score, total_tasks_done, location)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return jsonResponse({ offers: offers || [] });
    }

    // ─── PATCH /offers/:id/accept ────────────────────────────
    if (req.method === 'PATCH' && route.match(/^\/offers\/[^\/]+\/accept$/)) {
      const offerId = route.split('/')[2];

      const { data: offer } = await supabase.from('offers').select('*, tasks(*)').eq('id', offerId).maybeSingle();
      if (!offer) return jsonResponse({ error: 'Offer not found' }, 404);

      const task = offer.tasks as Record<string, unknown>;
      if (task.requester_id !== userId) return jsonResponse({ error: 'Forbidden' }, 403);
      if (task.status !== 'open') return jsonResponse({ error: 'Task is not open' }, 400);
      if (offer.status !== 'pending') return jsonResponse({ error: 'Offer is not pending' }, 400);

      // Accept offer
      await supabase.from('offers').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', offerId);

      // Reject all other pending offers for this task
      await supabase.from('offers').update({ status: 'rejected' })
        .eq('task_id', offer.task_id)
        .eq('status', 'pending')
        .neq('id', offerId);

      // Update task status to in_progress and set helper_id
      await supabase.from('tasks').update({
        status: 'in_progress',
        helper_id: offer.worker_id,
        assigned_at: new Date().toISOString(),
      }).eq('id', offer.task_id);

      // Lock escrow if not already locked (task budget to helper)
      const offerAmount = Number(offer.amount) || Number(task.budget) || 0;
      if (offerAmount > 0) {
        const { data: requesterWallet } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
        if (requesterWallet) {
          const currentAvail = Number(requesterWallet.available_balance);
          const currentEscrow = Number(requesterWallet.escrow_balance);
          if (currentAvail >= offerAmount) {
            await supabase.from('wallets').update({
              available_balance: currentAvail - offerAmount,
              escrow_balance: currentEscrow + offerAmount,
            }).eq('user_id', userId);
          }
        }
      }

      // Notify worker
      await supabase.from('notifications').insert({
        user_id: offer.worker_id,
        type: 'offer_accepted',
        title: 'Your Offer Was Accepted!',
        message: `Great news! Your offer for "${task.title}" has been accepted. Get started right away!`,
        related_entity_type: 'task',
        related_entity_id: offer.task_id,
      });

      // Create conversation thread between requester and worker
      const participantA = userId < (offer.worker_id as string) ? userId : offer.worker_id as string;
      const participantB = userId < (offer.worker_id as string) ? offer.worker_id as string : userId;
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('participant_a', participantA)
        .eq('participant_b', participantB)
        .eq('task_id', offer.task_id)
        .maybeSingle();

      if (!existingConv) {
        await supabase.from('conversations').insert({
          task_id: offer.task_id,
          offer_id: offerId,
          participant_a: participantA,
          participant_b: participantB,
          last_message: 'Offer accepted — conversation started',
          last_message_at: new Date().toISOString(),
        });
      }

      return jsonResponse({ success: true, message: 'Offer accepted' });
    }

    // ─── PATCH /offers/:id/reject ────────────────────────────
    if (req.method === 'PATCH' && route.match(/^\/offers\/[^\/]+\/reject$/)) {
      const offerId = route.split('/')[2];

      const { data: offer } = await supabase.from('offers').select('*, tasks(requester_id, title)').eq('id', offerId).maybeSingle();
      if (!offer) return jsonResponse({ error: 'Offer not found' }, 404);

      const task = offer.tasks as Record<string, unknown>;
      if (task.requester_id !== userId) return jsonResponse({ error: 'Forbidden' }, 403);

      await supabase.from('offers').update({ status: 'rejected' }).eq('id', offerId);

      await supabase.from('notifications').insert({
        user_id: offer.worker_id,
        type: 'offer_rejected',
        title: 'Offer Update',
        message: `Your offer for "${task.title}" was not selected this time. Keep looking for other opportunities!`,
        related_entity_type: 'offer',
        related_entity_id: offerId,
      });

      return jsonResponse({ success: true });
    }

    // ─── PATCH /offers/:id/withdraw ─────────────────────────
    if (req.method === 'PATCH' && route.match(/^\/offers\/[^\/]+\/withdraw$/)) {
      const offerId = route.split('/')[2];

      const { data: offer } = await supabase.from('offers').select('*').eq('id', offerId).maybeSingle();
      if (!offer) return jsonResponse({ error: 'Offer not found' }, 404);
      if (offer.worker_id !== userId) return jsonResponse({ error: 'Forbidden' }, 403);
      if (offer.status !== 'pending') return jsonResponse({ error: 'Can only withdraw pending offers' }, 400);

      await supabase.from('offers').update({ status: 'withdrawn' }).eq('id', offerId);
      return jsonResponse({ success: true });
    }

    // ─── PATCH /tasks/:id/complete ───────────────────────────
    if (req.method === 'PATCH' && route.match(/^\/tasks\/[^\/]+\/complete$/)) {
      const taskId = route.split('/')[2];

      const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
      if (!task) return jsonResponse({ error: 'Task not found' }, 404);
      if (task.requester_id !== userId) return jsonResponse({ error: 'Forbidden' }, 403);
      if (task.status !== 'in_progress') return jsonResponse({ error: 'Task must be in progress to complete' }, 400);

      // Get accepted offer
      const { data: acceptedOffer } = await supabase
        .from('offers')
        .select('*')
        .eq('task_id', taskId)
        .eq('status', 'accepted')
        .maybeSingle();

      const payoutAmount = acceptedOffer ? Number(acceptedOffer.amount) : Number(task.budget);

      // Release escrow — deduct from requester's escrow, add to worker's available
      if (task.helper_id && payoutAmount > 0) {
        const { data: requesterWallet } = await supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle();
        const { data: workerWallet } = await supabase.from('wallets').select('*').eq('user_id', task.helper_id).maybeSingle();

        if (requesterWallet) {
          const newEscrow = Math.max(0, Number(requesterWallet.escrow_balance) - payoutAmount);
          await supabase.from('wallets').update({ escrow_balance: newEscrow }).eq('user_id', userId);
          await supabase.from('wallet_transactions').insert({
            user_id: userId,
            amount: payoutAmount,
            transaction_type: 'escrow_release',
            description: `Payment released for task: ${task.title}`,
            balance_before: Number(requesterWallet.escrow_balance),
            balance_after: newEscrow,
            status: 'completed',
          });
        }

        if (workerWallet) {
          const newAvail = Number(workerWallet.available_balance) + payoutAmount;
          const newLifetime = Number(workerWallet.lifetime_earned || 0) + payoutAmount;
          await supabase.from('wallets').update({ available_balance: newAvail, lifetime_earned: newLifetime }).eq('user_id', task.helper_id);
          await supabase.from('wallet_transactions').insert({
            user_id: task.helper_id,
            amount: payoutAmount,
            transaction_type: 'earning',
            description: `Payment for task: ${task.title}`,
            balance_before: Number(workerWallet.available_balance),
            balance_after: newAvail,
            status: 'completed',
          });
        } else {
          // Create wallet for worker if doesn't exist
          await supabase.from('wallets').insert({
            user_id: task.helper_id,
            available_balance: payoutAmount,
            lifetime_earned: payoutAmount,
          });
        }

        // Mark offer as completed
        if (acceptedOffer) {
          await supabase.from('offers').update({ status: 'completed' }).eq('id', acceptedOffer.id);
        }

        // Update worker profile stats
        await supabase.rpc('increment_tasks_done', { uid: task.helper_id }).catch(() => null);
      }

      // Update task
      await supabase.from('tasks').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      }).eq('id', taskId);

      // Update requester stats
      await supabase.rpc('increment_tasks_posted', { uid: userId }).catch(() => null);

      // Notify worker
      if (task.helper_id) {
        await supabase.from('notifications').insert({
          user_id: task.helper_id,
          type: 'payment_received',
          title: 'Payment Released!',
          message: `You've been paid ₦${payoutAmount.toLocaleString()} for completing "${task.title}". Great work!`,
          related_entity_type: 'task',
          related_entity_id: taskId,
        });
      }

      return jsonResponse({ success: true, payout: payoutAmount });
    }

    // ─── POST /reviews ───────────────────────────────────────
    if (req.method === 'POST' && route === '/reviews') {
      const body = await req.json();
      const { taskId, revieweeId, rating, comment } = body;

      if (!taskId || !revieweeId || !rating) {
        return jsonResponse({ error: 'taskId, revieweeId, and rating are required' }, 400);
      }
      if (rating < 1 || rating > 5) {
        return jsonResponse({ error: 'Rating must be between 1 and 5' }, 400);
      }

      const { data: task } = await supabase.from('tasks').select('*').eq('id', taskId).maybeSingle();
      if (!task) return jsonResponse({ error: 'Task not found' }, 404);
      if (task.status !== 'completed') return jsonResponse({ error: 'Can only review completed tasks' }, 400);

      // Check reviewer is involved in task
      if (task.requester_id !== userId && task.helper_id !== userId) {
        return jsonResponse({ error: 'You are not part of this task' }, 403);
      }

      // Check not already reviewed
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('task_id', taskId)
        .eq('reviewer_id', userId)
        .maybeSingle();

      if (existingReview) return jsonResponse({ error: 'You have already reviewed this task' }, 400);

      const { data: review, error: reviewErr } = await supabase
        .from('reviews')
        .insert({
          task_id: taskId,
          reviewer_id: userId,
          reviewee_id: revieweeId,
          rating,
          comment: comment || null,
          role: task.requester_id === userId ? 'client_to_worker' : 'worker_to_client',
        })
        .select()
        .single();

      if (reviewErr) throw reviewErr;

      // Update reviewee's reputation score (average of all ratings)
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', revieweeId);

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length;
        await supabase.from('profiles').update({
          reputation_score: Math.round(avg * 10) / 10,
          total_reviews: allReviews.length,
        }).eq('user_id', revieweeId);
      }

      // Notify reviewee
      await supabase.from('notifications').insert({
        user_id: revieweeId,
        type: 'review_received',
        title: 'New Review!',
        message: `You received a ${rating}-star review for task "${task.title}".`,
        related_entity_type: 'review',
        related_entity_id: review.id,
      });

      return jsonResponse({ review }, 201);
    }

    // ─── GET /reviews/:userId ────────────────────────────────
    if (req.method === 'GET' && route.match(/^\/reviews\/[^\/]+$/)) {
      const revieweeUserId = route.replace('/reviews/', '');

      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*, reviewer:reviewer_id(full_name, avatar_url), task:task_id(title)')
        .eq('reviewee_id', revieweeUserId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return jsonResponse({ reviews: reviews || [] });
    }

    // ─── GET /conversations ──────────────────────────────────
    if (req.method === 'GET' && route === '/conversations') {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*, other_a:participant_a(full_name, avatar_url), other_b:participant_b(full_name, avatar_url), task:task_id(title)')
        .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
        .order('last_message_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      return jsonResponse({ conversations: conversations || [] });
    }

    // ─── GET /conversations/:id/messages ─────────────────────
    if (req.method === 'GET' && route.match(/^\/conversations\/[^\/]+\/messages$/)) {
      const convId = route.split('/')[2];

      // Verify user is participant
      const { data: conv } = await supabase
        .from('conversations')
        .select('participant_a, participant_b')
        .eq('id', convId)
        .maybeSingle();

      if (!conv) return jsonResponse({ error: 'Conversation not found' }, 404);
      if (conv.participant_a !== userId && conv.participant_b !== userId) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*, sender:sender_id(full_name, avatar_url)')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', convId)
        .neq('sender_id', userId)
        .is('read_at', null);

      // Reset unread count
      const field = conv.participant_a === userId ? 'unread_a' : 'unread_b';
      await supabase.from('conversations').update({ [field]: 0 }).eq('id', convId);

      return jsonResponse({ messages: messages || [] });
    }

    // ─── POST /conversations/:id/messages ────────────────────
    if (req.method === 'POST' && route.match(/^\/conversations\/[^\/]+\/messages$/)) {
      const convId = route.split('/')[2];
      const body = await req.json();
      const { body: msgBody } = body;

      if (!msgBody || !msgBody.trim()) {
        return jsonResponse({ error: 'Message body is required' }, 400);
      }

      // Verify participant
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', convId)
        .maybeSingle();

      if (!conv) return jsonResponse({ error: 'Conversation not found' }, 404);
      if (conv.participant_a !== userId && conv.participant_b !== userId) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }

      const { data: message, error: msgErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          sender_id: userId,
          body: msgBody.trim(),
          message_type: 'text',
        })
        .select()
        .single();

      if (msgErr) throw msgErr;

      // Update conversation last message + increment unread for other party
      const isA = conv.participant_a === userId;
      const otherField = isA ? 'unread_b' : 'unread_a';
      await supabase.from('conversations').update({
        last_message: msgBody.trim().slice(0, 100),
        last_message_at: new Date().toISOString(),
        [otherField]: (conv[otherField] || 0) + 1,
      }).eq('id', convId);

      // Notify other party
      const otherUserId = isA ? conv.participant_b : conv.participant_a;
      const { data: senderProfile } = await supabase.from('profiles').select('full_name').eq('user_id', userId).maybeSingle();
      await supabase.from('notifications').insert({
        user_id: otherUserId,
        type: 'message',
        title: `New message from ${senderProfile?.full_name || 'Someone'}`,
        message: msgBody.trim().slice(0, 80),
        related_entity_type: 'conversation',
        related_entity_id: convId,
      });

      return jsonResponse({ message }, 201);
    }

    // ─── POST /conversations ─────────────────────────────────
    if (req.method === 'POST' && route === '/conversations') {
      const body = await req.json();
      const { otherUserId, taskId, message: initialMessage } = body;

      if (!otherUserId) return jsonResponse({ error: 'otherUserId required' }, 400);
      if (otherUserId === userId) return jsonResponse({ error: 'Cannot message yourself' }, 400);

      const participantA = userId < otherUserId ? userId : otherUserId;
      const participantB = userId < otherUserId ? otherUserId : userId;

      // Check if conversation already exists
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('participant_a', participantA)
        .eq('participant_b', participantB);

      if (taskId) query = query.eq('task_id', taskId);

      const { data: existing } = await query.maybeSingle();
      if (existing) return jsonResponse({ conversation: existing });

      const { data: conversation, error: convErr } = await supabase
        .from('conversations')
        .insert({
          participant_a: participantA,
          participant_b: participantB,
          task_id: taskId || null,
          last_message_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (convErr) throw convErr;

      // Send initial message if provided
      if (initialMessage) {
        await supabase.from('messages').insert({
          conversation_id: conversation.id,
          sender_id: userId,
          body: initialMessage.trim(),
          message_type: 'text',
        });
        await supabase.from('conversations').update({
          last_message: initialMessage.trim().slice(0, 100),
          last_message_at: new Date().toISOString(),
          unread_b: participantA === userId ? 1 : 0,
          unread_a: participantA !== userId ? 1 : 0,
        }).eq('id', conversation.id);
      }

      return jsonResponse({ conversation }, 201);
    }

    // ─── GET /public-profile/:userId ─────────────────────────
    if (req.method === 'GET' && route.match(/^\/public-profile\/[^\/]+$/)) {
      const profileUserId = route.replace('/public-profile/', '');
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profileUserId)
        .maybeSingle();

      if (error) throw error;
      if (!profile) return jsonResponse({ error: 'Profile not found' }, 404);

      // Fetch recent reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('*, reviewer:reviewer_id(full_name, avatar_url), task:task_id(title)')
        .eq('reviewee_id', profileUserId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch completed tasks count
      const { count: completedCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('helper_id', profileUserId)
        .eq('status', 'completed');

      return jsonResponse({ profile, reviews: reviews || [], completedTasks: completedCount || 0 });
    }

    // ─── POST /notifications/welcome ─────────────────────────
    if (req.method === 'POST' && route === '/notifications/welcome') {
      const { displayName } = await req.json();
      await supabase.from('notifications').insert({
        user_id: userId,
        type: 'welcome',
        title: 'Welcome to HelpChain! 🎉',
        message: `Hey ${displayName || 'there'}! Welcome to HelpChain. Start by posting a task or browsing available tasks. Complete your profile to boost your visibility!`,
      });
      return jsonResponse({ success: true });
    }

    // ─── GET /notifications ──────────────────────────────────
    if (req.method === 'GET' && route === '/notifications') {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return jsonResponse({ notifications: notifications || [] });
    }

    // ─── PATCH /notifications/:id/read ───────────────────────
    if (req.method === 'PATCH' && route.startsWith('/notifications/') && route.endsWith('/read')) {
      const notifId = route.replace('/notifications/', '').replace('/read', '');
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notifId).eq('user_id', userId);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // ─── PATCH /notifications/read-all ───────────────────────
    if (req.method === 'PATCH' && route === '/notifications/read-all') {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    // ─── GET /profile ─────────────────────────────────────────
    if (req.method === 'GET' && route === '/profile') {
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return jsonResponse({ profile });
    }

    // ─── PUT /profile ─────────────────────────────────────────
    if (req.method === 'PUT' && route === '/profile') {
      const body = await req.json();
      const { fullName, bio, location, skills, country, baseCurrency, avatarUrl, phone } = body;

      const { data: existing } = await supabase.from('profiles').select('id').eq('user_id', userId).maybeSingle();

      if (existing) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .update({
            ...(fullName !== undefined && { full_name: fullName }),
            ...(bio !== undefined && { bio }),
            ...(location !== undefined && { location }),
            ...(skills !== undefined && { skills }),
            ...(country !== undefined && { country }),
            ...(baseCurrency !== undefined && { base_currency: baseCurrency }),
            ...(avatarUrl !== undefined && { avatar_url: avatarUrl }),
            ...(phone !== undefined && { phone }),
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ profile });
      } else {
        const { data: profile, error } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: fullName || 'User',
            email: body.email || `${userId.slice(0, 8)}@helpchain.app`,
            bio: bio || '',
            location: location || '',
            skills: skills || [],
            country: country || 'NG',
            base_currency: baseCurrency || 'NGN',
            avatar_url: avatarUrl || null,
          })
          .select()
          .single();

        if (error) throw error;
        return jsonResponse({ profile }, 201);
      }
    }

    // ─── GET /admin/stats ────────────────────────────────────
    if (req.method === 'GET' && route === '/admin/stats') {
      // Simple admin check by email (expand as needed)
      const adminEmails = (Deno.env.get('ADMIN_EMAILS') || '').split(',').map((e: string) => e.trim());
      const { data: profile } = await supabase.from('profiles').select('email').eq('user_id', userId).maybeSingle();
      if (!profile || !adminEmails.includes(profile.email)) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }

      const [tasksRes, usersRes, offersRes] = await Promise.all([
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('offers').select('*', { count: 'exact', head: true }),
      ]);

      return jsonResponse({
        totalTasks: tasksRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalOffers: offersRes.count || 0,
      });
    }

    return jsonResponse({ error: 'Not found' }, 404);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[task-api] Error:', err);
    return jsonResponse({ error: message }, 500);
  }
});

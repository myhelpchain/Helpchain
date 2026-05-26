-- =============================================
-- HELPCHAIN WALLET, ESCROW & TRANSACTIONS SCHEMA
-- USDC as internal ledger (decimal 18,6)
-- Firebase user_id references (text, not UUID)
-- =============================================

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- WALLETS TABLE (USDC Ledger)
-- =============================================
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  available_balance DECIMAL(18,6) NOT NULL DEFAULT 0,
  escrow_balance DECIMAL(18,6) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USDC',
  wallet_status TEXT NOT NULL DEFAULT 'active' CHECK (wallet_status IN ('active', 'restricted', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT positive_balances CHECK (available_balance >= 0 AND escrow_balance >= 0)
);

-- =============================================
-- WALLET TRANSACTIONS (Audit Log)
-- =============================================
CREATE TABLE public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'escrow_lock', 'escrow_release', 'escrow_refund', 'fee', 'earning', 'adjustment')),
  amount DECIMAL(18,6) NOT NULL,
  balance_before DECIMAL(18,6) NOT NULL,
  balance_after DECIMAL(18,6) NOT NULL,
  reference TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- DEPOSIT RECORDS
-- =============================================
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  amount DECIMAL(18,6) NOT NULL,
  paystack_reference TEXT UNIQUE,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  webhook_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- WITHDRAWAL RECORDS
-- =============================================
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  amount DECIMAL(18,6) NOT NULL,
  paystack_reference TEXT,
  bank_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- ESCROW RECORDS
-- =============================================
CREATE TABLE public.escrow_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL,
  requester_id TEXT NOT NULL,
  helper_id TEXT,
  amount DECIMAL(18,6) NOT NULL,
  platform_fee DECIMAL(18,6) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'released', 'refunded', 'disputed')),
  locked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  released_to TEXT,
  dispute_id UUID
);

-- =============================================
-- TASKS TABLE
-- =============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT,
  budget DECIMAL(18,6) NOT NULL,
  platform_fee DECIMAL(18,6) NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'flexible' CHECK (urgency IN ('urgent', 'soon', 'flexible')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed')),
  helper_id TEXT,
  funded_from TEXT CHECK (funded_from IN ('wallet', 'direct_payment')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- OFFERS TABLE
-- =============================================
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  helper_id TEXT NOT NULL,
  message TEXT NOT NULL,
  offered_amount DECIMAL(18,6),
  is_price_suggestion BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON public.wallet_transactions(transaction_type);
CREATE INDEX idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX idx_deposits_reference ON public.deposits(paystack_reference);
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_escrow_task_id ON public.escrow_records(task_id);
CREATE INDEX idx_escrow_requester ON public.escrow_records(requester_id);
CREATE INDEX idx_escrow_helper ON public.escrow_records(helper_id);
CREATE INDEX idx_tasks_requester ON public.tasks(requester_id);
CREATE INDEX idx_tasks_helper ON public.tasks(helper_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_offers_task ON public.offers(task_id);
CREATE INDEX idx_offers_helper ON public.offers(helper_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Wallets RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet"
ON public.wallets FOR SELECT
USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own wallet"
ON public.wallets FOR INSERT
WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own wallet"
ON public.wallets FOR UPDATE
USING (user_id = current_setting('app.current_user_id', true));

-- Wallet Transactions RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON public.wallet_transactions FOR SELECT
USING (user_id = current_setting('app.current_user_id', true));

-- Deposits RLS
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deposits"
ON public.deposits FOR SELECT
USING (user_id = current_setting('app.current_user_id', true));

-- Withdrawals RLS
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdrawals"
ON public.withdrawals FOR SELECT
USING (user_id = current_setting('app.current_user_id', true));

-- Escrow Records RLS
ALTER TABLE public.escrow_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view escrow they're involved in"
ON public.escrow_records FOR SELECT
USING (requester_id = current_setting('app.current_user_id', true) OR helper_id = current_setting('app.current_user_id', true));

-- Tasks RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open tasks"
ON public.tasks FOR SELECT
USING (true);

CREATE POLICY "Users can create their own tasks"
ON public.tasks FOR INSERT
WITH CHECK (requester_id = current_setting('app.current_user_id', true));

CREATE POLICY "Task owner can update their task"
ON public.tasks FOR UPDATE
USING (requester_id = current_setting('app.current_user_id', true));

-- Offers RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task owner and helper can view offers"
ON public.offers FOR SELECT
USING (
  helper_id = current_setting('app.current_user_id', true) 
  OR 
  EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = offers.task_id AND tasks.requester_id = current_setting('app.current_user_id', true))
);

CREATE POLICY "Users can create offers"
ON public.offers FOR INSERT
WITH CHECK (helper_id = current_setting('app.current_user_id', true));

CREATE POLICY "Helper can update their own offer"
ON public.offers FOR UPDATE
USING (helper_id = current_setting('app.current_user_id', true));

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (user_id = current_setting('app.current_user_id', true));
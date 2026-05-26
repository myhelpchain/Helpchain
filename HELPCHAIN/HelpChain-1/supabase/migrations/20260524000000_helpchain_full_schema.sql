-- HelpChain Full Schema Migration
-- Adds: offers, reviews, conversations, messages tables
-- Plus missing columns on existing tables

-- ─── OFFERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  worker_id     TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  message       TEXT NOT NULL,
  delivery_time TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','rejected','withdrawn','completed')),
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_offers_task_id   ON offers(task_id);
CREATE INDEX IF NOT EXISTS idx_offers_worker_id  ON offers(worker_id);
CREATE INDEX IF NOT EXISTS idx_offers_status     ON offers(status);

-- ─── REVIEWS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  reviewer_id TEXT NOT NULL,
  reviewee_id TEXT NOT NULL,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  role        TEXT CHECK (role IN ('client_to_worker','worker_to_client')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, reviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_task     ON reviews(task_id);

-- ─── CONVERSATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID REFERENCES tasks(id) ON DELETE SET NULL,
  offer_id        UUID REFERENCES offers(id) ON DELETE SET NULL,
  participant_a   TEXT NOT NULL,
  participant_b   TEXT NOT NULL,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  unread_a        INT DEFAULT 0,
  unread_b        INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (participant_a, participant_b, task_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_a ON conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_conversations_b ON conversations(participant_b);

-- ─── MESSAGES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL,
  body            TEXT NOT NULL,
  message_type    TEXT DEFAULT 'text' CHECK (message_type IN ('text','image','file','system')),
  file_url        TEXT,
  file_name       TEXT,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conv   ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ─── ADD MISSING COLUMNS TO TASKS ────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='offers_count') THEN
    ALTER TABLE tasks ADD COLUMN offers_count INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='views_count') THEN
    ALTER TABLE tasks ADD COLUMN views_count INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='helper_id') THEN
    ALTER TABLE tasks ADD COLUMN helper_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='assigned_at') THEN
    ALTER TABLE tasks ADD COLUMN assigned_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='completed_at') THEN
    ALTER TABLE tasks ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='is_remote') THEN
    ALTER TABLE tasks ADD COLUMN is_remote BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ─── ADD MISSING COLUMNS TO PROFILES ─────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='reputation_score') THEN
    ALTER TABLE profiles ADD COLUMN reputation_score NUMERIC(3,1) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_reviews') THEN
    ALTER TABLE profiles ADD COLUMN total_reviews INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_tasks_done') THEN
    ALTER TABLE profiles ADD COLUMN total_tasks_done INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='total_tasks_posted') THEN
    ALTER TABLE profiles ADD COLUMN total_tasks_posted INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='id_verified') THEN
    ALTER TABLE profiles ADD COLUMN id_verified BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- ─── UPDATE NOTIFICATIONS TABLE ───────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='related_entity_type') THEN
    ALTER TABLE notifications ADD COLUMN related_entity_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='related_entity_id') THEN
    ALTER TABLE notifications ADD COLUMN related_entity_id UUID;
  END IF;
END $$;

-- ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_tasks_done(uid TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET total_tasks_done = COALESCE(total_tasks_done, 0) + 1 WHERE user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_tasks_posted(uid TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET total_tasks_posted = COALESCE(total_tasks_posted, 0) + 1 WHERE user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- profiles + daily_logs: align schema with what migrateLocalData() upserts,
-- enforce FK to auth.users, and lock down with RLS.
--
-- Both tables were originally created via the Supabase dashboard and drifted
-- from the code's contract: profiles has no FK (orphan rows possible), and
-- daily_logs in prod is missing columns (PostgREST: "Could not find the
-- 'date' column of 'daily_logs' in the schema cache").
--
-- Idempotent. Safe to run on dev and prod.
-- ============================================================================

-- ── profiles ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  user_id                uuid PRIMARY KEY,
  email                  text,
  stripe_customer_id     text,
  stripe_subscription_id text,
  conditions             jsonb,
  symptoms               jsonb,
  trial_ends_at          timestamptz,
  premium_type           text,
  premium_expires_at     timestamptz,
  community_opt_in       boolean DEFAULT true,
  awaiting_account_setup boolean DEFAULT false,
  updated_at             timestamptz DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email                  text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id     text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS conditions             jsonb,
  ADD COLUMN IF NOT EXISTS symptoms               jsonb,
  ADD COLUMN IF NOT EXISTS trial_ends_at          timestamptz,
  ADD COLUMN IF NOT EXISTS premium_type           text,
  ADD COLUMN IF NOT EXISTS premium_expires_at     timestamptz,
  ADD COLUMN IF NOT EXISTS community_opt_in       boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS awaiting_account_setup boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at             timestamptz DEFAULT now();

-- Destructive: drop any orphan profile rows whose user_id has no auth.users
-- match. Required before the FK can attach. Re-onboarding is the recovery
-- path for orphans (which only exist because the FK was missing).
DELETE FROM public.profiles
 WHERE user_id NOT IN (SELECT id FROM auth.users);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname  = 'profiles_user_id_fkey'
       AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_own_row_select ON public.profiles;
DROP POLICY IF EXISTS profiles_own_row_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_own_row_update ON public.profiles;
DROP POLICY IF EXISTS profiles_own_row_delete ON public.profiles;

CREATE POLICY profiles_own_row_select ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY profiles_own_row_insert ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_own_row_update ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_own_row_delete ON public.profiles
  FOR DELETE USING (auth.uid() = user_id);

-- ── daily_logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.daily_logs (
  id        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id   uuid NOT NULL,
  date      text NOT NULL,
  entries   jsonb NOT NULL,
  context   jsonb,
  note      text,
  logged_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.daily_logs
  ADD COLUMN IF NOT EXISTS user_id   uuid,
  ADD COLUMN IF NOT EXISTS date      text,
  ADD COLUMN IF NOT EXISTS entries   jsonb,
  ADD COLUMN IF NOT EXISTS context   jsonb,
  ADD COLUMN IF NOT EXISTS note      text,
  ADD COLUMN IF NOT EXISTS logged_at timestamptz DEFAULT now();

-- migrateLocalData() does upsert(rows, { onConflict: "user_id,date" }).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname  = 'daily_logs_user_id_date_key'
       AND conrelid = 'public.daily_logs'::regclass
  ) THEN
    ALTER TABLE public.daily_logs
      ADD CONSTRAINT daily_logs_user_id_date_key UNIQUE (user_id, date);
  END IF;
END $$;

DELETE FROM public.daily_logs
 WHERE user_id IS NULL
    OR user_id NOT IN (SELECT id FROM auth.users);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname  = 'daily_logs_user_id_fkey'
       AND conrelid = 'public.daily_logs'::regclass
  ) THEN
    ALTER TABLE public.daily_logs
      ADD CONSTRAINT daily_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS daily_logs_own_row_select ON public.daily_logs;
DROP POLICY IF EXISTS daily_logs_own_row_insert ON public.daily_logs;
DROP POLICY IF EXISTS daily_logs_own_row_update ON public.daily_logs;
DROP POLICY IF EXISTS daily_logs_own_row_delete ON public.daily_logs;

CREATE POLICY daily_logs_own_row_select ON public.daily_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY daily_logs_own_row_insert ON public.daily_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY daily_logs_own_row_update ON public.daily_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY daily_logs_own_row_delete ON public.daily_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Pick up the new columns/policies without waiting for a PostgREST restart.
NOTIFY pgrst, 'reload schema';

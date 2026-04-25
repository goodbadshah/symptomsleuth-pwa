-- daily_logs: add the columns migrateLocalData() upserts. Earlier sessions
-- never hit this path because trial users with no logs skipped the block,
-- masking the missing columns on mobile where smoke-test logs existed.
ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS context jsonb,
  ADD COLUMN IF NOT EXISTS note    text;

-- Refresh PostgREST's schema cache so the new columns are visible immediately
-- without a restart.
NOTIFY pgrst, 'reload schema';

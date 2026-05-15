-- User activity tracking: last login, last active, cleanup status
-- Run once in Supabase SQL Editor.
-- DEFAULT now() gives all existing users a 12-month grace period before the cron can touch them.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS last_login_at  timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS account_status text        NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS cleaned_at     timestamptz;

-- Partial index: cron only queries active users by login time
CREATE INDEX IF NOT EXISTS idx_user_profiles_activity
  ON user_profiles (last_login_at, account_status)
  WHERE account_status = 'active';

ALTER TABLE user_addresses
  ADD COLUMN IF NOT EXISTS address_line2 TEXT;

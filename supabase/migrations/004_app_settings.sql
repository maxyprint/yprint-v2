CREATE TABLE IF NOT EXISTS app_settings (
  key   TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'
);

-- Default shipping: 5 € standard, free above null (always charged)
INSERT INTO app_settings (key, value)
VALUES ('shipping', '{"standard_cents": 500, "free_above_cents": null}')
ON CONFLICT (key) DO NOTHING;

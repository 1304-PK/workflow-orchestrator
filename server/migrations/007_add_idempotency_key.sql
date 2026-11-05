-- Add idempotency_key column to workflows table.
-- NOT NULL enforces that every workflow must be created with a key.
-- UNIQUE ensures the DB rejects duplicate keys even if two requests race.
ALTER TABLE workflows
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT NOT NULL UNIQUE;

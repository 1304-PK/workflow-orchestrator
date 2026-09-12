-- Enable UUID generation (Supabase usually has this already, safe to run anyway)
create extension if not exists pgcrypto;

-- ===========================
-- STATUS ENUM
-- ===========================
-- Shared by both workflows and tasks, since both use the same 4 states in the MVP
create type status_enum as enum ('pending', 'running', 'completed', 'failed');

-- ===========================
-- WORKFLOWS TABLE
-- ===========================
create table workflows (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text,
  description text,
  status status_enum not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);
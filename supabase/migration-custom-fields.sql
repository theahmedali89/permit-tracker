-- Custom fields on permits (key-value JSONB)
-- Run in Supabase SQL editor after schema.sql

ALTER TABLE permits
  ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;

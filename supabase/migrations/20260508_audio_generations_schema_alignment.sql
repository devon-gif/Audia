-- ============================================================
-- Audia — Align audio_generations schema with application code
-- Run this in the Supabase SQL Editor.
--
-- The application references five columns that did not exist on
-- the live table: source_url, voice, brief_length, error_message,
-- and transcript_text. Code also reads `transcript_text` while the
-- legacy column is named `transcript`. This migration is additive
-- and backfills both source_url and transcript_text from existing
-- columns so old rows keep working.
-- ============================================================

alter table public.audio_generations
  add column if not exists source_url      text,
  add column if not exists voice           text not null default 'onyx',
  add column if not exists brief_length    text default '5m',
  add column if not exists error_message   text,
  add column if not exists transcript_text text;

-- Backfill source_url from existing audio_url for legacy rows
update public.audio_generations
set source_url = audio_url
where source_url is null and audio_url is not null;

-- Mirror existing transcript -> transcript_text so cache hits work
update public.audio_generations
set transcript_text = transcript
where transcript_text is null and transcript is not null;

-- Cache lookup index: makes (source_url, voice) cache hits O(1)
create index if not exists audio_generations_cache_idx
  on public.audio_generations (source_url, voice, status)
  where status = 'completed';

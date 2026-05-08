-- ============================================================
-- Audia — Add voice column + caching index to audio_generations
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- Add voice column to track which TTS voice was used
alter table public.audio_generations
  add column if not exists voice text not null default 'onyx';

-- Composite index for O(1) cache lookups: (source_url, voice, status)
create index if not exists audio_generations_cache_idx
  on public.audio_generations (source_url, voice, status)
  where status = 'completed';

-- RLS policies (service-role bypasses these automatically)
-- Allow users to read their own generations
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'audio_generations'
      and policyname = 'Users can view their own generations'
  ) then
    execute $policy$
      create policy "Users can view their own generations"
        on public.audio_generations for select
        using (auth.uid() = user_id)
    $policy$;
  end if;
end $$;

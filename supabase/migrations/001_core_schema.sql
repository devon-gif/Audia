-- ============================================================
-- Audia — Core Schema Migration
-- Run this in the Supabase SQL Editor (once, in order).
-- ============================================================


-- ── 1. profiles ──────────────────────────────────────────────────────────────
-- Extends auth.users. One row per registered user.

create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  email                  text,
  tier                   text not null default 'free'
                           check (tier in ('free', 'pro', 'elite')),
  favorites_slots        int  not null default 1,
  stripe_customer_id     text unique,
  stripe_subscription_id text,
  email_notifications    boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Auto-create a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at current automatically
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Service-role (webhook) can write freely — no RLS restriction needed for
-- service_role since it bypasses RLS by default in Supabase.


-- ── 2. user_favorites ────────────────────────────────────────────────────────
-- Tracks podcasts a user has "hearted" for automated delivery.

create table if not exists public.user_favorites (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  podcast_id   text not null,
  podcast_name text not null,
  image_url    text,
  rss_url      text not null,   -- required by the auto-distill worker
  created_at   timestamptz not null default now(),

  -- One entry per user+podcast
  unique (user_id, podcast_id)
);

create index if not exists user_favorites_user_id_idx on public.user_favorites(user_id);

-- RLS
alter table public.user_favorites enable row level security;

create policy "Users can view their own favorites"
  on public.user_favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.user_favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.user_favorites for delete
  using (auth.uid() = user_id);


-- ── 3. referrals ─────────────────────────────────────────────────────────────
-- Tracks affiliate / promo-code signups for podcast hosts.

create table if not exists public.referrals (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles(id) on delete cascade,
  promo_code         text not null,
  affiliate_code     text,           -- alias / readable handle if different
  stripe_session_id  text,
  tier_purchased     text,
  amount_paid        int,            -- in cents
  currency           text default 'usd',
  created_at         timestamptz not null default now()
);

create index if not exists referrals_user_id_idx    on public.referrals(user_id);
create index if not exists referrals_promo_code_idx on public.referrals(promo_code);

-- RLS
alter table public.referrals enable row level security;

create policy "Users can view their own referrals"
  on public.referrals for select
  using (auth.uid() = user_id);

-- Only the service-role (webhook) inserts referral rows — users cannot self-insert.


-- ── 4. Backfill existing auth users ──────────────────────────────────────────
-- If you already have users in auth.users, create their profile rows now.

insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do nothing;

-- Migration leaderboard / profils publics
-- À exécuter dans Supabase > SQL Editor si la base existe déjà

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "public read profiles" on profiles for select using (true);
create policy "users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "users update own profile" on profiles for update using (auth.uid() = id);

-- Créer un profil pour chaque utilisateur existant
insert into profiles (id, username)
select
  id,
  lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')) || '_' || substr(id::text, 1, 4)
from auth.users
on conflict (id) do nothing;

-- Remplacer les politiques runs / splits
drop policy if exists "users manage own runs" on runs;
drop policy if exists "users manage own run_splits" on run_splits;

create policy "authenticated read runs" on runs for select using (auth.uid() is not null);
create policy "users insert own runs" on runs for insert with check (auth.uid() = user_id);
create policy "users update own runs" on runs for update using (auth.uid() = user_id);
create policy "users delete own runs" on runs for delete using (auth.uid() = user_id);

create policy "authenticated read run_splits" on run_splits for select using (auth.uid() is not null);
create policy "users insert own run_splits" on run_splits for insert with check (
  exists (select 1 from runs where runs.id = run_splits.run_id and runs.user_id = auth.uid())
);
create policy "users update own run_splits" on run_splits for update using (
  exists (select 1 from runs where runs.id = run_splits.run_id and runs.user_id = auth.uid())
);
create policy "users delete own run_splits" on run_splits for delete using (
  exists (select 1 from runs where runs.id = run_splits.run_id and runs.user_id = auth.uid())
);

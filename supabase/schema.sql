-- ============================================================
-- MyPace - schéma de base
-- À coller dans Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- --- Jeux (pensé pour en accueillir plusieurs plus tard) ---
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  steam_app_id int,
  created_at timestamptz default now()
);

-- --- Catégories de run par jeu (Any%, All Chapters, ...) ---
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now(),
  unique (game_id, name)
);

-- --- Chapitres / segments par jeu, dans l'ordre ---
create table if not exists chapters (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade not null,
  name text not null,
  sort_order int not null,
  created_at timestamptz default now(),
  unique (game_id, name)
);

-- --- Runs (une ligne = une run terminée) ---
create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  game_id uuid references games(id) on delete cascade not null,
  category_id uuid references categories(id),
  run_date date not null,
  total_time_seconds numeric not null,
  intro_time_seconds numeric,
  total_deaths int default 0,
  comment text,
  created_at timestamptz default now()
);

-- --- Détail par chapitre pour chaque run ---
create table if not exists run_splits (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references runs(id) on delete cascade not null,
  chapter_id uuid references chapters(id) not null,
  time_seconds numeric,
  deaths int default 0,
  unique (run_id, chapter_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table games enable row level security;
alter table categories enable row level security;
alter table chapters enable row level security;
alter table runs enable row level security;
alter table run_splits enable row level security;

-- Référentiels (jeux/catégories/chapitres) : lecture publique, écriture par personne côté app
create policy "public read games" on games for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read chapters" on chapters for select using (true);

-- Runs : chacun ne voit / modifie que les siennes
create policy "users manage own runs" on runs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Splits : rattachés à une run qui doit appartenir à l'utilisateur
create policy "users manage own run_splits" on run_splits
  for all using (
    exists (select 1 from runs where runs.id = run_splits.run_id and runs.user_id = auth.uid())
  ) with check (
    exists (select 1 from runs where runs.id = run_splits.run_id and runs.user_id = auth.uid())
  );

-- ============================================================
-- Seed : Celeste
-- ============================================================

insert into games (slug, name, steam_app_id) values ('celeste', 'Celeste', 504230)
  on conflict (slug) do nothing;

insert into categories (game_id, name)
select g.id, c.name
from games g, (values
  ('Any%'), ('All Chapters'), ('All A-Sides'), ('All B-Sides'), ('All C-Sides'), ('100%')
) as c(name)
where g.slug = 'celeste'
on conflict do nothing;

insert into chapters (game_id, name, sort_order)
select g.id, c.name, c.sort_order
from games g, (values
  ('Forsaken City', 1),
  ('Old Site', 2),
  ('Celestial Resort', 3),
  ('Golden Ridge', 4),
  ('Mirror Temple', 5),
  ('Reflection', 6),
  ('The Summit', 7)
) as c(name, sort_order)
where g.slug = 'celeste'
on conflict do nothing;

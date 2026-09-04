-- Initial schema for FORJA (replaces the old local Drizzle/SQLite database).
-- Run this once in the Supabase project's SQL editor (or via `supabase db push`
-- if you link the CLI to the project) to create the tables the app expects.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  avatar_uri text,
  height_cm numeric not null,
  weekly_goal_days smallint not null,
  reminders_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id text primary key,
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  muscle_group text not null check (
    muscle_group in ('peito', 'costas', 'perna', 'ombro', 'biceps', 'triceps', 'core', 'cardio')
  ),
  is_custom boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_plans (
  id uuid primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  color_tag text not null check (color_tag in ('orange', 'blue', 'gold', 'green')),
  is_marked_today boolean not null default false,
  last_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_plan_exercises (
  id uuid primary key,
  workout_plan_id uuid not null references public.workout_plans (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id text not null references public.exercises (id),
  order_index integer not null,
  sets integer not null,
  reps integer not null,
  load_kg numeric not null,
  seat_height numeric,
  seat_distance numeric,
  seat_incline numeric,
  seat_lock numeric
);

create table if not exists public.attendances (
  id uuid primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  date text not null,
  workout_plan_id uuid references public.workout_plans (id) on delete set null,
  completed_at timestamptz not null,
  unique (profile_id, date)
);

create table if not exists public.weight_entries (
  id uuid primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  date text not null,
  weight_kg numeric not null,
  unique (profile_id, date)
);

-- Row Level Security: every table is scoped to the authenticated owner.
alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_plan_exercises enable row level security;
alter table public.attendances enable row level security;
alter table public.weight_entries enable row level security;

create policy "profiles: owner full access" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "exercises: read catalog and own" on public.exercises
  for select using (user_id is null or user_id = auth.uid());
create policy "exercises: manage own" on public.exercises
  for insert with check (user_id = auth.uid());
create policy "exercises: update own" on public.exercises
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "exercises: delete own" on public.exercises
  for delete using (user_id = auth.uid());

create policy "workout_plans: owner full access" on public.workout_plans
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "workout_plan_exercises: owner full access" on public.workout_plan_exercises
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "attendances: owner full access" on public.attendances
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "weight_entries: owner full access" on public.weight_entries
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Shared exercise catalog (visible to everyone, editable by no one via RLS above).
insert into public.exercises (id, name, muscle_group, is_custom) values
  ('peito-supino-reto', 'Supino reto', 'peito', false),
  ('peito-supino-inclinado-halteres', 'Supino inclinado halteres', 'peito', false),
  ('peito-crucifixo-maquina', 'Crucifixo máquina', 'peito', false),
  ('peito-supino-declinado', 'Supino declinado', 'peito', false),
  ('peito-crossover', 'Crossover', 'peito', false),
  ('costas-puxada-frente', 'Puxada frente', 'costas', false),
  ('costas-remada-baixa', 'Remada baixa', 'costas', false),
  ('costas-remada-curvada', 'Remada curvada', 'costas', false),
  ('costas-levantamento-terra', 'Levantamento terra', 'costas', false),
  ('costas-puxada-supinada', 'Puxada supinada', 'costas', false),
  ('perna-agachamento-livre', 'Agachamento livre', 'perna', false),
  ('perna-leg-press', 'Leg press', 'perna', false),
  ('perna-cadeira-extensora', 'Cadeira extensora', 'perna', false),
  ('perna-cadeira-flexora', 'Cadeira flexora', 'perna', false),
  ('perna-panturrilha-em-pe', 'Panturrilha em pé', 'perna', false),
  ('ombro-desenvolvimento-halteres', 'Desenvolvimento halteres', 'ombro', false),
  ('ombro-elevacao-lateral', 'Elevação lateral', 'ombro', false),
  ('ombro-elevacao-frontal', 'Elevação frontal', 'ombro', false),
  ('biceps-rosca-direta', 'Rosca direta', 'biceps', false),
  ('biceps-rosca-alternada', 'Rosca alternada', 'biceps', false),
  ('biceps-rosca-scott', 'Rosca scott', 'biceps', false),
  ('triceps-corda', 'Tríceps corda', 'triceps', false),
  ('triceps-testa', 'Tríceps testa', 'triceps', false),
  ('triceps-frances', 'Tríceps francês', 'triceps', false),
  ('core-abdominal-supra', 'Abdominal supra', 'core', false),
  ('core-prancha', 'Prancha', 'core', false),
  ('cardio-esteira', 'Esteira', 'cardio', false),
  ('cardio-bicicleta-ergometrica', 'Bicicleta ergométrica', 'cardio', false)
on conflict (id) do nothing;

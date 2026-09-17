create table if not exists public.exercise_logs (
  id uuid primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  exercise_id text not null references public.exercises (id),
  date text not null,
  sets integer not null,
  reps integer not null,
  load_kg numeric not null,
  unique (profile_id, exercise_id, date)
);

alter table public.exercise_logs enable row level security;

create policy "exercise_logs: owner full access" on public.exercise_logs
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

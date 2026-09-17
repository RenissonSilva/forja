create table if not exists public.body_measurements (
  id uuid primary key,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  date text not null,
  type text not null,
  value_cm numeric not null,
  unique (profile_id, date, type)
);

alter table public.body_measurements enable row level security;

create policy "body_measurements: owner full access" on public.body_measurements
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

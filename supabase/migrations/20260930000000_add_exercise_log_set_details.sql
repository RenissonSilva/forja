-- Per-set reps/load actually performed in the session (reps and load can change
-- from one set to the next). `sets`, `reps` and `load_kg` stay as a summary of
-- the top set so older rows (without set_details) remain readable.
alter table public.exercise_logs
  add column if not exists set_details jsonb;

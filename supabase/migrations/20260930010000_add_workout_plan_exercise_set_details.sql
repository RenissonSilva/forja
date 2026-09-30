-- Per-set reps/load targets for each exercise in a plan (they can differ from
-- one set to the next). `sets`, `reps` and `load_kg` stay as a summary so rows
-- saved before this column existed remain readable.
alter table public.workout_plan_exercises
  add column if not exists set_details jsonb;

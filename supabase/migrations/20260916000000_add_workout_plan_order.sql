alter table public.workout_plans
  add column if not exists order_index integer not null default 0;

with ranked as (
  select id, row_number() over (partition by profile_id order by created_at) - 1 as rn
  from public.workout_plans
)
update public.workout_plans wp
set order_index = ranked.rn
from ranked
where wp.id = ranked.id;

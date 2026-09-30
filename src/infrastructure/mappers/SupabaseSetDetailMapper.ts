import { WorkoutSet } from "@domain/entities/WorkoutPlanExercise";

/** One entry of the `set_details` jsonb column. `duration_seconds` is only there on timed sets. */
export interface SupabaseSetDetail {
  reps: number;
  load_kg: number;
  duration_seconds?: number;
}

export function setFromDetail(detail: SupabaseSetDetail): WorkoutSet {
  const set: WorkoutSet = { reps: detail.reps, loadKg: Number(detail.load_kg) };
  if (detail.duration_seconds !== undefined && detail.duration_seconds !== null) {
    set.durationSeconds = detail.duration_seconds;
  }
  return set;
}

export function setToDetail(set: WorkoutSet): SupabaseSetDetail {
  const detail: SupabaseSetDetail = { reps: set.reps, load_kg: set.loadKg };
  if (set.durationSeconds !== undefined) detail.duration_seconds = set.durationSeconds;
  return detail;
}

import { ExerciseLog, ExerciseSetLog } from "@domain/entities/ExerciseLog";
import { SupabaseSetDetail, setFromDetail, setToDetail } from "./SupabaseSetDetailMapper";

export interface SupabaseExerciseLogRow {
  id: string;
  profile_id: string;
  exercise_id: string;
  date: string;
  sets: number;
  reps: number;
  load_kg: number;
  /** Null on rows logged before per-set tracking existed. */
  set_details: SupabaseSetDetail[] | null;
}

export class SupabaseExerciseLogMapper {
  static toDomain(row: SupabaseExerciseLogRow): ExerciseLog {
    const sets: ExerciseSetLog[] = row.set_details
      ? row.set_details.map(setFromDetail)
      : Array.from({ length: row.sets }, () => ({ reps: row.reps, loadKg: Number(row.load_kg) }));

    return ExerciseLog.restore({
      id: row.id,
      profileId: row.profile_id,
      exerciseId: row.exercise_id,
      date: row.date,
      sets,
    });
  }

  static toRow(entry: ExerciseLog): SupabaseExerciseLogRow {
    const props = entry.toProps();
    return {
      id: props.id,
      profile_id: props.profileId,
      exercise_id: props.exerciseId,
      date: props.date,
      sets: entry.sets,
      reps: entry.reps,
      load_kg: entry.loadKg,
      set_details: props.sets.map(setToDetail),
    };
  }
}

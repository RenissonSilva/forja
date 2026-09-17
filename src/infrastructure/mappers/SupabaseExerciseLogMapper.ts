import { ExerciseLog } from "@domain/entities/ExerciseLog";

export interface SupabaseExerciseLogRow {
  id: string;
  profile_id: string;
  exercise_id: string;
  date: string;
  sets: number;
  reps: number;
  load_kg: number;
}

export class SupabaseExerciseLogMapper {
  static toDomain(row: SupabaseExerciseLogRow): ExerciseLog {
    return ExerciseLog.restore({
      id: row.id,
      profileId: row.profile_id,
      exerciseId: row.exercise_id,
      date: row.date,
      sets: row.sets,
      reps: row.reps,
      loadKg: row.load_kg,
    });
  }

  static toRow(entry: ExerciseLog): SupabaseExerciseLogRow {
    const props = entry.toProps();
    return {
      id: props.id,
      profile_id: props.profileId,
      exercise_id: props.exerciseId,
      date: props.date,
      sets: props.sets,
      reps: props.reps,
      load_kg: props.loadKg,
    };
  }
}

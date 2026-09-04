import { Exercise, MuscleGroup } from "@domain/entities/Exercise";

export interface SupabaseExerciseRow {
  id: string;
  user_id: string | null;
  name: string;
  muscle_group: string;
  is_custom: boolean;
  created_at: string;
}

export class SupabaseExerciseMapper {
  static toDomain(row: SupabaseExerciseRow): Exercise {
    return Exercise.restore({
      id: row.id,
      name: row.name,
      muscleGroup: row.muscle_group as MuscleGroup,
      isCustom: row.is_custom,
      createdAt: new Date(row.created_at),
    });
  }

  static toRow(exercise: Exercise, userId: string | null): SupabaseExerciseRow {
    const props = exercise.toProps();
    return {
      id: props.id,
      user_id: userId,
      name: props.name,
      muscle_group: props.muscleGroup,
      is_custom: props.isCustom,
      created_at: props.createdAt.toISOString(),
    };
  }
}

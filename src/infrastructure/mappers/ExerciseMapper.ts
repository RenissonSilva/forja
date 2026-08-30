import { Exercise, MuscleGroup } from "@domain/entities/Exercise";
import { exercises } from "../database/schema";

type ExerciseRow = typeof exercises.$inferSelect;
type ExerciseInsertRow = typeof exercises.$inferInsert;

export class ExerciseMapper {
  static toDomain(row: ExerciseRow): Exercise {
    return Exercise.restore({
      id: row.id,
      name: row.name,
      muscleGroup: row.muscleGroup as MuscleGroup,
      isCustom: row.isCustom,
      createdAt: row.createdAt,
    });
  }

  static toRow(exercise: Exercise): ExerciseInsertRow {
    const props = exercise.toProps();
    return {
      id: props.id,
      name: props.name,
      muscleGroup: props.muscleGroup,
      isCustom: props.isCustom,
      createdAt: props.createdAt,
    };
  }
}

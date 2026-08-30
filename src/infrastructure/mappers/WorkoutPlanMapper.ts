import { WorkoutPlan, WorkoutPlanColorTag } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { workoutPlanExercises, workoutPlans } from "../database/schema";

type WorkoutPlanRow = typeof workoutPlans.$inferSelect;
type WorkoutPlanInsertRow = typeof workoutPlans.$inferInsert;
type WorkoutPlanExerciseRow = typeof workoutPlanExercises.$inferSelect;
type WorkoutPlanExerciseInsertRow = typeof workoutPlanExercises.$inferInsert;

export class WorkoutPlanMapper {
  static toDomain(planRow: WorkoutPlanRow, exerciseRows: WorkoutPlanExerciseRow[]): WorkoutPlan {
    const exercises = exerciseRows
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((row) =>
        WorkoutPlanExercise.restore({
          id: row.id,
          exerciseId: row.exerciseId,
          order: row.orderIndex,
          sets: row.sets,
          reps: row.reps,
          loadKg: row.loadKg,
          seatHeight: row.seatHeight,
          seatDistance: row.seatDistance,
          seatIncline: row.seatIncline,
          seatLock: row.seatLock,
        }),
      );

    return WorkoutPlan.restore({
      id: planRow.id,
      profileId: planRow.profileId,
      name: planRow.name,
      colorTag: planRow.colorTag as WorkoutPlanColorTag,
      isMarkedToday: planRow.isMarkedToday,
      lastCompletedAt: planRow.lastCompletedAt,
      exercises,
      createdAt: planRow.createdAt,
      updatedAt: planRow.updatedAt,
    });
  }

  static toPlanRow(plan: WorkoutPlan): WorkoutPlanInsertRow {
    return {
      id: plan.id,
      profileId: plan.profileId,
      name: plan.name,
      colorTag: plan.colorTag,
      isMarkedToday: plan.isMarkedToday,
      lastCompletedAt: plan.lastCompletedAt,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  static toExerciseRows(plan: WorkoutPlan): WorkoutPlanExerciseInsertRow[] {
    return plan.exercises.map((exercise) => {
      const props = exercise.toProps();
      return {
        id: props.id,
        workoutPlanId: plan.id,
        exerciseId: props.exerciseId,
        orderIndex: props.order,
        sets: props.sets,
        reps: props.reps,
        loadKg: props.loadKg,
        seatHeight: props.seatHeight,
        seatDistance: props.seatDistance,
        seatIncline: props.seatIncline,
        seatLock: props.seatLock,
      };
    });
  }
}

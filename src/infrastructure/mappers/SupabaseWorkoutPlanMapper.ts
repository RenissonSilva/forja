import { WorkoutPlan, WorkoutPlanColorTag } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";

export interface SupabaseWorkoutPlanRow {
  id: string;
  profile_id: string;
  name: string;
  color_tag: string;
  is_marked_today: boolean;
  last_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseWorkoutPlanExerciseRow {
  id: string;
  workout_plan_id: string;
  profile_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: number;
  load_kg: number;
  seat_height: number | null;
  seat_distance: number | null;
  seat_incline: number | null;
  seat_lock: number | null;
}

export class SupabaseWorkoutPlanMapper {
  static toDomain(
    planRow: SupabaseWorkoutPlanRow,
    exerciseRows: SupabaseWorkoutPlanExerciseRow[],
  ): WorkoutPlan {
    const exercises = exerciseRows
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .map((row) =>
        WorkoutPlanExercise.restore({
          id: row.id,
          exerciseId: row.exercise_id,
          order: row.order_index,
          sets: row.sets,
          reps: row.reps,
          loadKg: row.load_kg,
          seatHeight: row.seat_height,
          seatDistance: row.seat_distance,
          seatIncline: row.seat_incline,
          seatLock: row.seat_lock,
        }),
      );

    return WorkoutPlan.restore({
      id: planRow.id,
      profileId: planRow.profile_id,
      name: planRow.name,
      colorTag: planRow.color_tag as WorkoutPlanColorTag,
      isMarkedToday: planRow.is_marked_today,
      lastCompletedAt: planRow.last_completed_at ? new Date(planRow.last_completed_at) : null,
      exercises,
      createdAt: new Date(planRow.created_at),
      updatedAt: new Date(planRow.updated_at),
    });
  }

  static toPlanRow(plan: WorkoutPlan): SupabaseWorkoutPlanRow {
    return {
      id: plan.id,
      profile_id: plan.profileId,
      name: plan.name,
      color_tag: plan.colorTag,
      is_marked_today: plan.isMarkedToday,
      last_completed_at: plan.lastCompletedAt ? plan.lastCompletedAt.toISOString() : null,
      created_at: plan.createdAt.toISOString(),
      updated_at: plan.updatedAt.toISOString(),
    };
  }

  static toExerciseRows(plan: WorkoutPlan): SupabaseWorkoutPlanExerciseRow[] {
    return plan.exercises.map((exercise) => {
      const props = exercise.toProps();
      return {
        id: props.id,
        workout_plan_id: plan.id,
        profile_id: plan.profileId,
        exercise_id: props.exerciseId,
        order_index: props.order,
        sets: props.sets,
        reps: props.reps,
        load_kg: props.loadKg,
        seat_height: props.seatHeight,
        seat_distance: props.seatDistance,
        seat_incline: props.seatIncline,
        seat_lock: props.seatLock,
      };
    });
  }
}

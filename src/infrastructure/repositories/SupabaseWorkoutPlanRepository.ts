import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SupabaseWorkoutPlanExerciseRow,
  SupabaseWorkoutPlanMapper,
  SupabaseWorkoutPlanRow,
} from "../mappers/SupabaseWorkoutPlanMapper";

export class SupabaseWorkoutPlanRepository implements WorkoutPlanRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAllByProfile(profileId: string): Promise<WorkoutPlan[]> {
    const { data: planRows, error: planError } = await this.client
      .from("workout_plans")
      .select("*")
      .eq("profile_id", profileId)
      .returns<SupabaseWorkoutPlanRow[]>();
    if (planError) throw planError;
    if (!planRows || planRows.length === 0) return [];

    const planIds = planRows.map((row) => row.id);
    const { data: exerciseRows, error: exerciseError } = await this.client
      .from("workout_plan_exercises")
      .select("*")
      .in("workout_plan_id", planIds)
      .returns<SupabaseWorkoutPlanExerciseRow[]>();
    if (exerciseError) throw exerciseError;

    const exerciseRowsByPlanId = new Map<string, SupabaseWorkoutPlanExerciseRow[]>();
    for (const row of exerciseRows ?? []) {
      const existing = exerciseRowsByPlanId.get(row.workout_plan_id);
      if (existing) existing.push(row);
      else exerciseRowsByPlanId.set(row.workout_plan_id, [row]);
    }

    return planRows.map((planRow) =>
      SupabaseWorkoutPlanMapper.toDomain(planRow, exerciseRowsByPlanId.get(planRow.id) ?? []),
    );
  }

  async findById(id: string): Promise<WorkoutPlan | null> {
    const { data: planRow, error: planError } = await this.client
      .from("workout_plans")
      .select("*")
      .eq("id", id)
      .maybeSingle<SupabaseWorkoutPlanRow>();
    if (planError) throw planError;
    if (!planRow) return null;

    const { data: exerciseRows, error: exerciseError } = await this.client
      .from("workout_plan_exercises")
      .select("*")
      .eq("workout_plan_id", id)
      .returns<SupabaseWorkoutPlanExerciseRow[]>();
    if (exerciseError) throw exerciseError;

    return SupabaseWorkoutPlanMapper.toDomain(planRow, exerciseRows ?? []);
  }

  async findMarkedToday(profileId: string): Promise<WorkoutPlan | null> {
    const { data: planRow, error: planError } = await this.client
      .from("workout_plans")
      .select("*")
      .eq("profile_id", profileId)
      .eq("is_marked_today", true)
      .maybeSingle<SupabaseWorkoutPlanRow>();
    if (planError) throw planError;
    if (!planRow) return null;

    const { data: exerciseRows, error: exerciseError } = await this.client
      .from("workout_plan_exercises")
      .select("*")
      .eq("workout_plan_id", planRow.id)
      .returns<SupabaseWorkoutPlanExerciseRow[]>();
    if (exerciseError) throw exerciseError;

    return SupabaseWorkoutPlanMapper.toDomain(planRow, exerciseRows ?? []);
  }

  async save(plan: WorkoutPlan): Promise<void> {
    const planRow = SupabaseWorkoutPlanMapper.toPlanRow(plan);
    const { error: planError } = await this.client.from("workout_plans").upsert(planRow);
    if (planError) throw planError;

    const { error: deleteError } = await this.client
      .from("workout_plan_exercises")
      .delete()
      .eq("workout_plan_id", plan.id);
    if (deleteError) throw deleteError;

    const exerciseRows = SupabaseWorkoutPlanMapper.toExerciseRows(plan);
    if (exerciseRows.length > 0) {
      const { error: insertError } = await this.client
        .from("workout_plan_exercises")
        .insert(exerciseRows);
      if (insertError) throw insertError;
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("workout_plans").delete().eq("id", id);
    if (error) throw error;
  }
}

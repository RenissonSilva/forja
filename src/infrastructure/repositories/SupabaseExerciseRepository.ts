import { Exercise } from "@domain/entities/Exercise";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseExerciseMapper, SupabaseExerciseRow } from "../mappers/SupabaseExerciseMapper";

export class SupabaseExerciseRepository implements ExerciseRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAll(): Promise<Exercise[]> {
    const { data, error } = await this.client
      .from("exercises")
      .select("*")
      .returns<SupabaseExerciseRow[]>();
    if (error) throw error;
    return (data ?? []).map(SupabaseExerciseMapper.toDomain);
  }

  async findById(id: string): Promise<Exercise | null> {
    const { data, error } = await this.client
      .from("exercises")
      .select("*")
      .eq("id", id)
      .maybeSingle<SupabaseExerciseRow>();
    if (error) throw error;
    return data ? SupabaseExerciseMapper.toDomain(data) : null;
  }

  async save(exercise: Exercise): Promise<void> {
    let userId: string | null = null;
    if (exercise.isCustom) {
      const { data, error } = await this.client.auth.getUser();
      if (error) throw error;
      userId = data.user?.id ?? null;
    }
    const row = SupabaseExerciseMapper.toRow(exercise, userId);
    const { error } = await this.client.from("exercises").upsert(row);
    if (error) throw error;
  }
}

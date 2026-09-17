import { ExerciseLog } from "@domain/entities/ExerciseLog";
import { ExerciseLogRepository } from "@domain/repositories/ExerciseLogRepository";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SupabaseExerciseLogMapper,
  SupabaseExerciseLogRow,
} from "../mappers/SupabaseExerciseLogMapper";

export class SupabaseExerciseLogRepository implements ExerciseLogRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAllByProfile(profileId: string): Promise<ExerciseLog[]> {
    const { data, error } = await this.client
      .from("exercise_logs")
      .select("*")
      .eq("profile_id", profileId)
      .order("date", { ascending: true })
      .returns<SupabaseExerciseLogRow[]>();
    if (error) throw error;
    return (data ?? []).map(SupabaseExerciseLogMapper.toDomain);
  }

  async saveMany(entries: ExerciseLog[]): Promise<void> {
    if (entries.length === 0) return;
    const rows = entries.map(SupabaseExerciseLogMapper.toRow);
    const { error } = await this.client
      .from("exercise_logs")
      .upsert(rows, { onConflict: "profile_id,exercise_id,date" });
    if (error) throw error;
  }
}

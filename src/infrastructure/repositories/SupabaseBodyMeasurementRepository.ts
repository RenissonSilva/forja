import { BodyMeasurement } from "@domain/entities/BodyMeasurement";
import { BodyMeasurementRepository } from "@domain/repositories/BodyMeasurementRepository";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SupabaseBodyMeasurementMapper,
  SupabaseBodyMeasurementRow,
} from "../mappers/SupabaseBodyMeasurementMapper";

export class SupabaseBodyMeasurementRepository implements BodyMeasurementRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAllByProfile(profileId: string): Promise<BodyMeasurement[]> {
    const { data, error } = await this.client
      .from("body_measurements")
      .select("*")
      .eq("profile_id", profileId)
      .order("date", { ascending: true })
      .returns<SupabaseBodyMeasurementRow[]>();
    if (error) throw error;
    return (data ?? []).map(SupabaseBodyMeasurementMapper.toDomain);
  }

  async saveMany(entries: BodyMeasurement[]): Promise<void> {
    if (entries.length === 0) return;
    const rows = entries.map(SupabaseBodyMeasurementMapper.toRow);
    const { error } = await this.client
      .from("body_measurements")
      .upsert(rows, { onConflict: "profile_id,date,type" });
    if (error) throw error;
  }
}

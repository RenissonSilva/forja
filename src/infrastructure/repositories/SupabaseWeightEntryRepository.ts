import { WeightEntry } from "@domain/entities/WeightEntry";
import { WeightEntryRepository } from "@domain/repositories/WeightEntryRepository";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SupabaseWeightEntryMapper,
  SupabaseWeightEntryRow,
} from "../mappers/SupabaseWeightEntryMapper";

export class SupabaseWeightEntryRepository implements WeightEntryRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAllByProfile(profileId: string): Promise<WeightEntry[]> {
    const { data, error } = await this.client
      .from("weight_entries")
      .select("*")
      .eq("profile_id", profileId)
      .order("date", { ascending: true })
      .returns<SupabaseWeightEntryRow[]>();
    if (error) throw error;
    return (data ?? []).map(SupabaseWeightEntryMapper.toDomain);
  }

  async findLatest(profileId: string): Promise<WeightEntry | null> {
    const { data, error } = await this.client
      .from("weight_entries")
      .select("*")
      .eq("profile_id", profileId)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle<SupabaseWeightEntryRow>();
    if (error) throw error;
    return data ? SupabaseWeightEntryMapper.toDomain(data) : null;
  }

  async save(entry: WeightEntry): Promise<void> {
    const row = SupabaseWeightEntryMapper.toRow(entry);
    const { error } = await this.client
      .from("weight_entries")
      .upsert(row, { onConflict: "profile_id,date" });
    if (error) throw error;
  }
}

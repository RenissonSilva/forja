import { Profile } from "@domain/entities/Profile";
import { ProfileRepository } from "@domain/repositories/ProfileRepository";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseProfileMapper, SupabaseProfileRow } from "../mappers/SupabaseProfileMapper";

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findCurrent(): Promise<Profile | null> {
    const { data, error } = await this.client
      .from("profiles")
      .select("*")
      .maybeSingle<SupabaseProfileRow>();
    if (error) throw error;
    return data ? SupabaseProfileMapper.toDomain(data) : null;
  }

  async save(profile: Profile): Promise<void> {
    const row = SupabaseProfileMapper.toRow(profile);
    const { error } = await this.client.from("profiles").upsert(row);
    if (error) throw error;
  }
}

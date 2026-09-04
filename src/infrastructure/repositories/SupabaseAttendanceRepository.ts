import { Attendance } from "@domain/entities/Attendance";
import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import { DateKey } from "@shared/date-utils";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  SupabaseAttendanceMapper,
  SupabaseAttendanceRow,
} from "../mappers/SupabaseAttendanceMapper";

export class SupabaseAttendanceRepository implements AttendanceRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findByDate(profileId: string, date: DateKey): Promise<Attendance | null> {
    const { data, error } = await this.client
      .from("attendances")
      .select("*")
      .eq("profile_id", profileId)
      .eq("date", date)
      .maybeSingle<SupabaseAttendanceRow>();
    if (error) throw error;
    return data ? SupabaseAttendanceMapper.toDomain(data) : null;
  }

  async findByDateRange(profileId: string, start: DateKey, end: DateKey): Promise<Attendance[]> {
    const { data, error } = await this.client
      .from("attendances")
      .select("*")
      .eq("profile_id", profileId)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true })
      .returns<SupabaseAttendanceRow[]>();
    if (error) throw error;
    return (data ?? []).map(SupabaseAttendanceMapper.toDomain);
  }

  async save(attendance: Attendance): Promise<void> {
    const row = SupabaseAttendanceMapper.toRow(attendance);
    const { error } = await this.client
      .from("attendances")
      .upsert(row, { onConflict: "profile_id,date" });
    if (error) throw error;
  }
}

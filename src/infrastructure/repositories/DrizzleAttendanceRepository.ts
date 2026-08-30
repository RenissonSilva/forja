import { and, asc, between, eq } from "drizzle-orm";
import { Attendance } from "@domain/entities/Attendance";
import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import { DateKey } from "@shared/date-utils";
import { Database } from "../database/database";
import { attendances } from "../database/schema";
import { AttendanceMapper } from "../mappers/AttendanceMapper";

export class DrizzleAttendanceRepository implements AttendanceRepository {
  constructor(private readonly db: Database) {}

  async findByDate(profileId: string, date: DateKey): Promise<Attendance | null> {
    const [row] = await this.db
      .select()
      .from(attendances)
      .where(and(eq(attendances.profileId, profileId), eq(attendances.date, date)))
      .limit(1);
    return row ? AttendanceMapper.toDomain(row) : null;
  }

  async findByDateRange(profileId: string, start: DateKey, end: DateKey): Promise<Attendance[]> {
    const rows = await this.db
      .select()
      .from(attendances)
      .where(and(eq(attendances.profileId, profileId), between(attendances.date, start, end)))
      .orderBy(asc(attendances.date));
    return rows.map(AttendanceMapper.toDomain);
  }

  async save(attendance: Attendance): Promise<void> {
    const row = AttendanceMapper.toRow(attendance);
    await this.db
      .insert(attendances)
      .values(row)
      .onConflictDoUpdate({
        target: [attendances.profileId, attendances.date],
        set: row,
      });
  }
}

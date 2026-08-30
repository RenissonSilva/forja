import { Attendance } from "@domain/entities/Attendance";
import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import { DateKey } from "@shared/date-utils";

export class InMemoryAttendanceRepository implements AttendanceRepository {
  private readonly items = new Map<string, Attendance>();

  async findByDate(profileId: string, date: DateKey): Promise<Attendance | null> {
    return this.items.get(this.key(profileId, date)) ?? null;
  }

  async findByDateRange(profileId: string, start: DateKey, end: DateKey): Promise<Attendance[]> {
    return [...this.items.values()]
      .filter((a) => a.profileId === profileId && a.date >= start && a.date <= end)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async save(attendance: Attendance): Promise<void> {
    this.items.set(this.key(attendance.profileId, attendance.date), attendance);
  }

  private key(profileId: string, date: DateKey): string {
    return `${profileId}:${date}`;
  }
}

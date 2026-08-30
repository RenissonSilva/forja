import { Attendance } from "../entities/Attendance";
import { DateKey } from "@shared/date-utils";

export interface AttendanceRepository {
  findByDate(profileId: string, date: DateKey): Promise<Attendance | null>;
  /** Inclusive range, ordered by date ascending. */
  findByDateRange(profileId: string, start: DateKey, end: DateKey): Promise<Attendance[]>;
  /** One attendance per (profileId, date); saving an existing date overwrites it. */
  save(attendance: Attendance): Promise<void>;
}

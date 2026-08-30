import { Attendance } from "@domain/entities/Attendance";
import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import { DateKey, isToday as isTodayDate, toDateKey, weekDates } from "@shared/date-utils";

export interface DayAttendanceSummary {
  date: Date;
  dateKey: DateKey;
  isToday: boolean;
  attendance: Attendance | null;
}

export class GetWeeklyAttendanceUseCase {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async execute(input: {
    profileId: string;
    referenceDate?: Date;
  }): Promise<DayAttendanceSummary[]> {
    const days = weekDates(input.referenceDate ?? new Date());
    const start = toDateKey(days[0]!);
    const end = toDateKey(days[6]!);

    const records = await this.attendanceRepository.findByDateRange(input.profileId, start, end);
    const byDate = new Map(records.map((record) => [record.date, record]));

    return days.map((date) => {
      const dateKey = toDateKey(date);
      return {
        date,
        dateKey,
        isToday: isTodayDate(date),
        attendance: byDate.get(dateKey) ?? null,
      };
    });
  }
}

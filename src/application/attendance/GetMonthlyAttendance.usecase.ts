import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import {
  isInSameMonth,
  isToday as isTodayDate,
  monthGridDates,
  toDateKey,
} from "@shared/date-utils";
import { DayAttendanceSummary } from "./GetWeeklyAttendance.usecase";

export interface MonthDayAttendanceSummary extends DayAttendanceSummary {
  isInCurrentMonth: boolean;
}

export class GetMonthlyAttendanceUseCase {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async execute(input: {
    profileId: string;
    referenceDate?: Date;
  }): Promise<MonthDayAttendanceSummary[]> {
    const referenceDate = input.referenceDate ?? new Date();
    const gridDays = monthGridDates(referenceDate);
    const start = toDateKey(gridDays[0]!);
    const end = toDateKey(gridDays[gridDays.length - 1]!);

    const records = await this.attendanceRepository.findByDateRange(input.profileId, start, end);
    const byDate = new Map(records.map((record) => [record.date, record]));

    return gridDays.map((date) => {
      const dateKey = toDateKey(date);
      return {
        date,
        dateKey,
        isToday: isTodayDate(date),
        isInCurrentMonth: isInSameMonth(date, referenceDate),
        attendance: byDate.get(dateKey) ?? null,
      };
    });
  }
}

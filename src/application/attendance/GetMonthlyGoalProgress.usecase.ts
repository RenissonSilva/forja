import { ProfileNotFoundError } from "@domain/errors/ProfileErrors";
import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import { ProfileRepository } from "@domain/repositories/ProfileRepository";
import { GoalProgressService } from "@domain/services/GoalProgressService";
import { endOfMonthDate, startOfMonthDate, toDateKey } from "@shared/date-utils";

export interface MonthlyGoalProgress {
  completed: number;
  goal: number;
  progressPercentage: number;
  remaining: number;
}

export class GetMonthlyGoalProgressUseCase {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async execute(input: { profileId: string; referenceDate?: Date }): Promise<MonthlyGoalProgress> {
    const profile = await this.profileRepository.findCurrent();
    if (!profile) throw new ProfileNotFoundError();

    const referenceDate = input.referenceDate ?? new Date();
    const start = toDateKey(startOfMonthDate(referenceDate));
    const end = toDateKey(endOfMonthDate(referenceDate));

    const records = await this.attendanceRepository.findByDateRange(input.profileId, start, end);
    const goal = GoalProgressService.monthlyGoal(profile.weeklyGoalDays);
    const completed = records.length;

    return {
      completed,
      goal,
      progressPercentage: GoalProgressService.progressPercentage(completed, goal),
      remaining: GoalProgressService.remaining(completed, goal),
    };
  }
}

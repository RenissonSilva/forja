import { Attendance } from "@domain/entities/Attendance";
import { WorkoutPlanNotFoundError } from "@domain/errors/WorkoutPlanErrors";
import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import { generateId } from "@shared/id";
import { DateKey, todayKey } from "@shared/date-utils";

export class CompleteWorkoutSessionUseCase {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly workoutPlanRepository: WorkoutPlanRepository,
  ) {}

  async execute(input: {
    profileId: string;
    workoutPlanId: string;
    date?: DateKey;
  }): Promise<Attendance> {
    const plan = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!plan) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    const attendance = Attendance.create({
      id: generateId(),
      profileId: input.profileId,
      date: input.date ?? todayKey(),
      workoutPlanId: plan.id,
    });

    await this.attendanceRepository.save(attendance);
    return attendance;
  }
}

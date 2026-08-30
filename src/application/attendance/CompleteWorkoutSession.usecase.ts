import { Attendance } from "@domain/entities/Attendance";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
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
    await this.advanceTodayPlan(input.profileId, plan);

    return attendance;
  }

  /**
   * Records the completion on the finished plan and hands the "today" ★ to
   * whichever plan comes right after it in the profile's list, wrapping
   * around — so each session nudges the suggested next workout forward.
   */
  private async advanceTodayPlan(profileId: string, completedPlan: WorkoutPlan): Promise<void> {
    const now = new Date();
    const allPlans = await this.workoutPlanRepository.findAllByProfile(profileId);
    const completedIndex = allPlans.findIndex((candidate) => candidate.id === completedPlan.id);
    const nextPlan =
      completedIndex === -1 || allPlans.length === 0
        ? null
        : allPlans[(completedIndex + 1) % allPlans.length]!;
    const isOwnSuccessor = nextPlan?.id === completedPlan.id;

    const currentlyMarked = await this.workoutPlanRepository.findMarkedToday(profileId);

    let updatedCompletedPlan = completedPlan.markCompletedNow(now);
    if (!isOwnSuccessor) updatedCompletedPlan = updatedCompletedPlan.unmarkAsToday(now);
    await this.workoutPlanRepository.save(updatedCompletedPlan);

    if (
      currentlyMarked &&
      currentlyMarked.id !== completedPlan.id &&
      currentlyMarked.id !== nextPlan?.id
    ) {
      await this.workoutPlanRepository.save(currentlyMarked.unmarkAsToday(now));
    }

    if (nextPlan && !isOwnSuccessor) {
      await this.workoutPlanRepository.save(nextPlan.markAsToday(now));
    }
  }
}

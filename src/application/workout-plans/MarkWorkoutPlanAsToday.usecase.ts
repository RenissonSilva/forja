import { WorkoutPlanNotFoundError } from "@domain/errors/WorkoutPlanErrors";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

/** Toggles the ★ on Home: at most one workout plan is marked "today" per profile. */
export class MarkWorkoutPlanAsTodayUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: { profileId: string; workoutPlanId: string }): Promise<void> {
    const target = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!target) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    const currentlyMarked = await this.workoutPlanRepository.findMarkedToday(input.profileId);
    if (currentlyMarked && currentlyMarked.id !== target.id) {
      await this.workoutPlanRepository.save(currentlyMarked.unmarkAsToday());
    }

    const next = target.isMarkedToday ? target.unmarkAsToday() : target.markAsToday();
    await this.workoutPlanRepository.save(next);
  }
}

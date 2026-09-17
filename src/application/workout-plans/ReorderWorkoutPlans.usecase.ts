import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

export class ReorderWorkoutPlansUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: { profileId: string; orderedWorkoutPlanIds: string[] }): Promise<void> {
    await this.workoutPlanRepository.reorderAll(input.profileId, input.orderedWorkoutPlanIds);
  }
}

import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

export class ListWorkoutPlansUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: { profileId: string }): Promise<WorkoutPlan[]> {
    return this.workoutPlanRepository.findAllByProfile(input.profileId);
  }
}

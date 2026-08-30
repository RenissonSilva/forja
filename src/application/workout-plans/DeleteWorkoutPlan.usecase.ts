import { WorkoutPlanNotFoundError } from "@domain/errors/WorkoutPlanErrors";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

export class DeleteWorkoutPlanUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: { workoutPlanId: string }): Promise<void> {
    const plan = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!plan) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    await this.workoutPlanRepository.delete(input.workoutPlanId);
  }
}

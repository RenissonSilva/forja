import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanNotFoundError } from "@domain/errors/WorkoutPlanErrors";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

export class RemoveExerciseFromPlanUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: {
    workoutPlanId: string;
    workoutPlanExerciseId: string;
  }): Promise<WorkoutPlan> {
    const plan = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!plan) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    const updated = plan.removeExercise(input.workoutPlanExerciseId);
    await this.workoutPlanRepository.save(updated);
    return updated;
  }
}

import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanNotFoundError } from "@domain/errors/WorkoutPlanErrors";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

export class ReorderPlanExercisesUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(input: {
    workoutPlanId: string;
    orderedWorkoutPlanExerciseIds: string[];
  }): Promise<WorkoutPlan> {
    const plan = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!plan) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    const updated = plan.reorderExercises(input.orderedWorkoutPlanExerciseIds);
    await this.workoutPlanRepository.save(updated);
    return updated;
  }
}

import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanNotFoundError } from "@domain/errors/WorkoutPlanErrors";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import { UpdateWorkoutPlanInput, updateWorkoutPlanSchema } from "../dtos/UpdateWorkoutPlan.dto";

export class UpdateWorkoutPlanUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(rawInput: UpdateWorkoutPlanInput): Promise<WorkoutPlan> {
    const input = updateWorkoutPlanSchema.parse(rawInput);

    const plan = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!plan) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    const renamed = plan.rename(input.name);
    if (!renamed.ok) throw renamed.error;

    await this.workoutPlanRepository.save(renamed.value);
    return renamed.value;
  }
}

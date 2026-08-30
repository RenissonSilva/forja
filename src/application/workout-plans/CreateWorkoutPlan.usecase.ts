import { WORKOUT_PLAN_COLOR_TAGS, WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import { generateId } from "@shared/id";
import { CreateWorkoutPlanInput, createWorkoutPlanSchema } from "../dtos/CreateWorkoutPlan.dto";

export class CreateWorkoutPlanUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(rawInput: CreateWorkoutPlanInput): Promise<WorkoutPlan> {
    const input = createWorkoutPlanSchema.parse(rawInput);

    const existingPlans = await this.workoutPlanRepository.findAllByProfile(input.profileId);
    const colorTag =
      WORKOUT_PLAN_COLOR_TAGS[existingPlans.length % WORKOUT_PLAN_COLOR_TAGS.length]!;

    const result = WorkoutPlan.create({
      id: generateId(),
      profileId: input.profileId,
      name: input.name,
      colorTag,
    });
    if (!result.ok) throw result.error;

    await this.workoutPlanRepository.save(result.value);
    return result.value;
  }
}

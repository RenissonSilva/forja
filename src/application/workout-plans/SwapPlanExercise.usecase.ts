import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import {
  ExerciseNotFoundError,
  WorkoutPlanExerciseNotFoundError,
  WorkoutPlanNotFoundError,
} from "@domain/errors/WorkoutPlanErrors";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import { SwapPlanExerciseInput, swapPlanExerciseSchema } from "../dtos/SwapPlanExercise.dto";

/**
 * Puts another exercise in the place of one in the plan, keeping its position.
 * The seat adjustments belonged to the old machine, so they are cleared.
 */
export class SwapPlanExerciseUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async execute(rawInput: SwapPlanExerciseInput): Promise<WorkoutPlan> {
    const input = swapPlanExerciseSchema.parse(rawInput);

    const plan = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!plan) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    const current = plan.exercises.find((exercise) => exercise.id === input.workoutPlanExerciseId);
    if (!current) throw new WorkoutPlanExerciseNotFoundError(input.workoutPlanExerciseId);

    const exercise = await this.exerciseRepository.findById(input.exerciseId);
    if (!exercise) throw new ExerciseNotFoundError(input.exerciseId);

    const swappedResult = WorkoutPlanExercise.create({
      ...current.toProps(),
      exerciseId: input.exerciseId,
      sets: input.sets,
      seatHeight: null,
      seatDistance: null,
      seatIncline: null,
      seatLock: null,
    });
    if (!swappedResult.ok) throw swappedResult.error;

    const replaced = plan.replaceExercise(input.workoutPlanExerciseId, swappedResult.value);
    if (!replaced.ok) throw replaced.error;

    await this.workoutPlanRepository.save(replaced.value);
    return replaced.value;
  }
}

import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { ExerciseNotFoundError, WorkoutPlanNotFoundError } from "@domain/errors/WorkoutPlanErrors";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import { generateId } from "@shared/id";
import { AddExerciseToPlanInput, addExerciseToPlanSchema } from "../dtos/AddExerciseToPlan.dto";

export class AddExerciseToPlanUseCase {
  constructor(
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async execute(rawInput: AddExerciseToPlanInput): Promise<WorkoutPlan> {
    const input = addExerciseToPlanSchema.parse(rawInput);

    const plan = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!plan) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    const exercise = await this.exerciseRepository.findById(input.exerciseId);
    if (!exercise) throw new ExerciseNotFoundError(input.exerciseId);

    const planExerciseResult = WorkoutPlanExercise.create({
      id: generateId(),
      exerciseId: input.exerciseId,
      order: 0,
      sets: input.sets,
      reps: input.reps,
      loadKg: input.loadKg,
      seatHeight: input.seatHeight ?? null,
      seatDistance: input.seatDistance ?? null,
      seatIncline: input.seatIncline ?? null,
      seatLock: input.seatLock ?? null,
    });
    if (!planExerciseResult.ok) throw planExerciseResult.error;

    const updatedPlan = plan.addExercise(planExerciseResult.value);
    await this.workoutPlanRepository.save(updatedPlan);
    return updatedPlan;
  }
}

import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import {
  WorkoutPlanExerciseNotFoundError,
  WorkoutPlanNotFoundError,
} from "@domain/errors/WorkoutPlanErrors";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import {
  UpdateWorkoutPlanExerciseInput,
  updateWorkoutPlanExerciseSchema,
} from "../dtos/UpdateWorkoutPlanExercise.dto";

export class UpdateWorkoutPlanExerciseUseCase {
  constructor(private readonly workoutPlanRepository: WorkoutPlanRepository) {}

  async execute(rawInput: UpdateWorkoutPlanExerciseInput): Promise<WorkoutPlan> {
    const input = updateWorkoutPlanExerciseSchema.parse(rawInput);

    const plan = await this.workoutPlanRepository.findById(input.workoutPlanId);
    if (!plan) throw new WorkoutPlanNotFoundError(input.workoutPlanId);

    const current = plan.exercises.find((exercise) => exercise.id === input.workoutPlanExerciseId);
    if (!current) throw new WorkoutPlanExerciseNotFoundError(input.workoutPlanExerciseId);

    const currentProps = current.toProps();
    const updatedResult = WorkoutPlanExercise.create({
      ...currentProps,
      sets: input.sets ?? currentProps.sets,
      reps: input.reps ?? currentProps.reps,
      loadKg: input.loadKg ?? currentProps.loadKg,
      seatHeight: input.seatHeight !== undefined ? input.seatHeight : currentProps.seatHeight,
      seatDistance:
        input.seatDistance !== undefined ? input.seatDistance : currentProps.seatDistance,
      seatIncline: input.seatIncline !== undefined ? input.seatIncline : currentProps.seatIncline,
      seatLock: input.seatLock !== undefined ? input.seatLock : currentProps.seatLock,
    });
    if (!updatedResult.ok) throw updatedResult.error;

    const replaced = plan.replaceExercise(input.workoutPlanExerciseId, updatedResult.value);
    if (!replaced.ok) throw replaced.error;

    await this.workoutPlanRepository.save(replaced.value);
    return replaced.value;
  }
}

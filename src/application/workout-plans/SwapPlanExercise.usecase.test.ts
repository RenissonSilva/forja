import { Exercise } from "@domain/entities/Exercise";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { ExerciseNotFoundError } from "@domain/errors/WorkoutPlanErrors";
import { InMemoryExerciseRepository } from "../testing/InMemoryExerciseRepository";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { SwapPlanExerciseUseCase } from "./SwapPlanExercise.usecase";

function planExercise(id: string, exerciseId: string) {
  const result = WorkoutPlanExercise.create({
    id,
    exerciseId,
    order: 0,
    sets: [{ reps: 10, loadKg: 60 }],
    seatHeight: 3,
    seatDistance: 2,
    seatIncline: 1,
    seatLock: 4,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  return result.value;
}

async function seed() {
  const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
  const exerciseRepository = new InMemoryExerciseRepository();

  const planResult = WorkoutPlan.create({
    id: "plan-1",
    profileId: "profile-1",
    name: "Treino A",
    colorTag: "orange",
  });
  if (!planResult.ok) throw new Error("fixture should be valid");
  await workoutPlanRepository.save(
    planResult.value
      .addExercise(planExercise("wpe-1", "exercise-1"))
      .addExercise(planExercise("wpe-2", "exercise-2")),
  );

  const exerciseResult = Exercise.create({
    id: "exercise-3",
    name: "Supino inclinado",
    muscleGroup: "peito",
    isCustom: false,
  });
  if (!exerciseResult.ok) throw new Error("fixture should be valid");
  await exerciseRepository.save(exerciseResult.value);

  return {
    workoutPlanRepository,
    useCase: new SwapPlanExerciseUseCase(workoutPlanRepository, exerciseRepository),
  };
}

describe("SwapPlanExerciseUseCase", () => {
  it("puts the new exercise in the same position, with the given sets", async () => {
    const { workoutPlanRepository, useCase } = await seed();

    await useCase.execute({
      workoutPlanId: "plan-1",
      workoutPlanExerciseId: "wpe-1",
      exerciseId: "exercise-3",
      sets: [
        { reps: 12, loadKg: 20 },
        { reps: 10, loadKg: 25 },
      ],
    });

    const stored = await workoutPlanRepository.findById("plan-1");
    expect(stored?.exercises.map((exercise) => exercise.exerciseId)).toEqual([
      "exercise-3",
      "exercise-2",
    ]);
    expect(stored?.exercises[0]?.id).toBe("wpe-1");
    expect(stored?.exercises[0]?.sets).toEqual([
      { reps: 12, loadKg: 20 },
      { reps: 10, loadKg: 25 },
    ]);
  });

  it("clears the seat adjustments, which belonged to the old machine", async () => {
    const { useCase } = await seed();

    const updated = await useCase.execute({
      workoutPlanId: "plan-1",
      workoutPlanExerciseId: "wpe-1",
      exerciseId: "exercise-3",
      sets: [{ reps: 10, loadKg: 0 }],
    });

    const swapped = updated.exercises[0];
    expect(swapped?.seatHeight).toBeNull();
    expect(swapped?.seatDistance).toBeNull();
    expect(swapped?.seatIncline).toBeNull();
    expect(swapped?.seatLock).toBeNull();
    expect(updated.exercises[1]?.seatHeight).toBe(3);
  });

  it("rejects an exercise that doesn't exist", async () => {
    const { useCase } = await seed();

    await expect(
      useCase.execute({
        workoutPlanId: "plan-1",
        workoutPlanExerciseId: "wpe-1",
        exerciseId: "missing",
        sets: [{ reps: 10, loadKg: 0 }],
      }),
    ).rejects.toBeInstanceOf(ExerciseNotFoundError);
  });
});

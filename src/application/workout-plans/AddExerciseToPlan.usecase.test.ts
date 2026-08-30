import { Exercise } from "@domain/entities/Exercise";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { InMemoryExerciseRepository } from "../testing/InMemoryExerciseRepository";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { AddExerciseToPlanUseCase } from "./AddExerciseToPlan.usecase";

async function seedPlanAndExercise() {
  const workoutPlanRepository = new InMemoryWorkoutPlanRepository();
  const exerciseRepository = new InMemoryExerciseRepository();

  const planResult = WorkoutPlan.create({
    id: "plan-1",
    profileId: "profile-1",
    name: "Treino A",
    colorTag: "orange",
  });
  if (!planResult.ok) throw new Error("fixture should be valid");
  await workoutPlanRepository.save(planResult.value);

  const exerciseResult = Exercise.create({
    id: "exercise-1",
    name: "Supino reto",
    muscleGroup: "peito",
    isCustom: false,
  });
  if (!exerciseResult.ok) throw new Error("fixture should be valid");
  await exerciseRepository.save(exerciseResult.value);

  return { workoutPlanRepository, exerciseRepository };
}

describe("AddExerciseToPlanUseCase", () => {
  it("adds the exercise to the plan and persists it", async () => {
    const { workoutPlanRepository, exerciseRepository } = await seedPlanAndExercise();
    const useCase = new AddExerciseToPlanUseCase(workoutPlanRepository, exerciseRepository);

    const updated = await useCase.execute({
      workoutPlanId: "plan-1",
      exerciseId: "exercise-1",
      sets: 4,
      reps: 10,
      loadKg: 60,
    });

    expect(updated.exercises).toHaveLength(1);
    const stored = await workoutPlanRepository.findById("plan-1");
    expect(stored?.exercises).toHaveLength(1);
  });

  it("fails when the workout plan does not exist", async () => {
    const { workoutPlanRepository, exerciseRepository } = await seedPlanAndExercise();
    const useCase = new AddExerciseToPlanUseCase(workoutPlanRepository, exerciseRepository);

    await expect(
      useCase.execute({
        workoutPlanId: "missing",
        exerciseId: "exercise-1",
        sets: 4,
        reps: 10,
        loadKg: 60,
      }),
    ).rejects.toThrow();
  });

  it("fails when the exercise does not exist in the catalog", async () => {
    const { workoutPlanRepository, exerciseRepository } = await seedPlanAndExercise();
    const useCase = new AddExerciseToPlanUseCase(workoutPlanRepository, exerciseRepository);

    await expect(
      useCase.execute({
        workoutPlanId: "plan-1",
        exerciseId: "missing",
        sets: 4,
        reps: 10,
        loadKg: 60,
      }),
    ).rejects.toThrow();
  });

  it("fails validation without persisting when sets are out of range", async () => {
    const { workoutPlanRepository, exerciseRepository } = await seedPlanAndExercise();
    const useCase = new AddExerciseToPlanUseCase(workoutPlanRepository, exerciseRepository);

    await expect(
      useCase.execute({
        workoutPlanId: "plan-1",
        exerciseId: "exercise-1",
        sets: 99,
        reps: 10,
        loadKg: 60,
      }),
    ).rejects.toThrow();

    const stored = await workoutPlanRepository.findById("plan-1");
    expect(stored?.exercises).toHaveLength(0);
  });
});

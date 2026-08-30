import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { UpdateWorkoutPlanExerciseUseCase } from "./UpdateWorkoutPlanExercise.usecase";

async function seedPlanWithExercise(repository: InMemoryWorkoutPlanRepository) {
  const planResult = WorkoutPlan.create({
    id: "plan-1",
    profileId: "profile-1",
    name: "Treino A",
    colorTag: "orange",
  });
  if (!planResult.ok) throw new Error("fixture should be valid");

  const exerciseResult = WorkoutPlanExercise.create({
    id: "wpe-1",
    exerciseId: "exercise-1",
    order: 0,
    sets: 4,
    reps: 10,
    loadKg: 60,
    seatHeight: null,
    seatDistance: null,
    seatIncline: null,
    seatLock: null,
  });
  if (!exerciseResult.ok) throw new Error("fixture should be valid");

  await repository.save(planResult.value.addExercise(exerciseResult.value));
}

describe("UpdateWorkoutPlanExerciseUseCase", () => {
  it("merges only the provided fields, keeping the rest unchanged", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    await seedPlanWithExercise(repository);
    const useCase = new UpdateWorkoutPlanExerciseUseCase(repository);

    const updated = await useCase.execute({
      workoutPlanId: "plan-1",
      workoutPlanExerciseId: "wpe-1",
      loadKg: 65,
    });

    const exercise = updated.exercises[0];
    expect(exercise?.loadKg).toBe(65);
    expect(exercise?.sets).toBe(4);
    expect(exercise?.reps).toBe(10);
  });

  it("fails when the workout plan does not exist", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const useCase = new UpdateWorkoutPlanExerciseUseCase(repository);

    await expect(
      useCase.execute({ workoutPlanId: "missing", workoutPlanExerciseId: "wpe-1", sets: 5 }),
    ).rejects.toThrow();
  });

  it("fails when the exercise is not part of the plan", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    await seedPlanWithExercise(repository);
    const useCase = new UpdateWorkoutPlanExerciseUseCase(repository);

    await expect(
      useCase.execute({ workoutPlanId: "plan-1", workoutPlanExerciseId: "missing", sets: 5 }),
    ).rejects.toThrow();
  });

  it("fails validation without persisting an invalid merged value", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    await seedPlanWithExercise(repository);
    const useCase = new UpdateWorkoutPlanExerciseUseCase(repository);

    await expect(
      useCase.execute({ workoutPlanId: "plan-1", workoutPlanExerciseId: "wpe-1", sets: 99 }),
    ).rejects.toThrow();

    const stored = await repository.findById("plan-1");
    expect(stored?.exercises[0]?.sets).toBe(4);
  });
});

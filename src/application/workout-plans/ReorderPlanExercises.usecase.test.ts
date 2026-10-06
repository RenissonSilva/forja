import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { ReorderPlanExercisesUseCase } from "./ReorderPlanExercises.usecase";

function makePlanExercise(id: string) {
  const result = WorkoutPlanExercise.create({
    id,
    exerciseId: `exercise-${id}`,
    order: 0,
    sets: Array.from({ length: 3 }, () => ({ reps: 10, loadKg: 20 })),
    seatHeight: null,
    seatDistance: null,
    seatIncline: null,
    seatLock: null,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  return result.value;
}

describe("ReorderPlanExercisesUseCase", () => {
  it("persists the exercises in the new order", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const planResult = WorkoutPlan.create({
      id: "plan-1",
      profileId: "profile-1",
      name: "Treino A",
      colorTag: "orange",
    });
    if (!planResult.ok) throw new Error("fixture should be valid");
    const plan = planResult.value
      .addExercise(makePlanExercise("a"))
      .addExercise(makePlanExercise("b"));
    await repository.save(plan);

    const useCase = new ReorderPlanExercisesUseCase(repository);
    await useCase.execute({ workoutPlanId: "plan-1", orderedWorkoutPlanExerciseIds: ["b", "a"] });

    const stored = await repository.findById("plan-1");
    expect(stored?.exercises.map((e) => e.id)).toEqual(["b", "a"]);
    expect(stored?.exercises.map((e) => e.order)).toEqual([0, 1]);
  });

  it("fails when the workout plan does not exist", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const useCase = new ReorderPlanExercisesUseCase(repository);

    await expect(
      useCase.execute({ workoutPlanId: "missing", orderedWorkoutPlanExerciseIds: [] }),
    ).rejects.toThrow();
  });
});

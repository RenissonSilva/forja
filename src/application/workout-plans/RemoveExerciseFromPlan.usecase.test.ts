import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanExercise } from "@domain/entities/WorkoutPlanExercise";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { RemoveExerciseFromPlanUseCase } from "./RemoveExerciseFromPlan.usecase";

function makePlanExercise(id: string) {
  const result = WorkoutPlanExercise.create({
    id,
    exerciseId: `exercise-${id}`,
    order: 0,
    sets: 3,
    reps: 10,
    loadKg: 20,
    seatAdjustment: null,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  return result.value;
}

describe("RemoveExerciseFromPlanUseCase", () => {
  it("removes the exercise and persists the re-sequenced plan", async () => {
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

    const useCase = new RemoveExerciseFromPlanUseCase(repository);
    await useCase.execute({ workoutPlanId: "plan-1", workoutPlanExerciseId: "a" });

    const stored = await repository.findById("plan-1");
    expect(stored?.exercises.map((e) => e.id)).toEqual(["b"]);
    expect(stored?.exercises[0]?.order).toBe(0);
  });

  it("fails when the workout plan does not exist", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const useCase = new RemoveExerciseFromPlanUseCase(repository);

    await expect(
      useCase.execute({ workoutPlanId: "missing", workoutPlanExerciseId: "a" }),
    ).rejects.toThrow();
  });
});

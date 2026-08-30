import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { DeleteWorkoutPlanUseCase } from "./DeleteWorkoutPlan.usecase";

describe("DeleteWorkoutPlanUseCase", () => {
  it("deletes an existing plan", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const planResult = WorkoutPlan.create({
      id: "plan-1",
      profileId: "profile-1",
      name: "Treino A",
      colorTag: "orange",
    });
    if (!planResult.ok) throw new Error("fixture should be valid");
    await repository.save(planResult.value);

    const useCase = new DeleteWorkoutPlanUseCase(repository);
    await useCase.execute({ workoutPlanId: "plan-1" });

    expect(await repository.findById("plan-1")).toBeNull();
  });

  it("fails when the workout plan does not exist", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const useCase = new DeleteWorkoutPlanUseCase(repository);

    await expect(useCase.execute({ workoutPlanId: "missing" })).rejects.toThrow();
  });
});

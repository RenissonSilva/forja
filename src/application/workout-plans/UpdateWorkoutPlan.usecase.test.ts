import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { UpdateWorkoutPlanUseCase } from "./UpdateWorkoutPlan.usecase";

describe("UpdateWorkoutPlanUseCase", () => {
  it("renames the plan and persists the change", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const planResult = WorkoutPlan.create({
      id: "plan-1",
      profileId: "profile-1",
      name: "Treino A",
      colorTag: "orange",
    });
    if (!planResult.ok) throw new Error("fixture should be valid");
    await repository.save(planResult.value);

    const useCase = new UpdateWorkoutPlanUseCase(repository);
    await useCase.execute({ workoutPlanId: "plan-1", name: "Treino A — Peito e tríceps" });

    const stored = await repository.findById("plan-1");
    expect(stored?.name).toBe("Treino A — Peito e tríceps");
  });

  it("fails when the workout plan does not exist", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const useCase = new UpdateWorkoutPlanUseCase(repository);

    await expect(
      useCase.execute({ workoutPlanId: "missing", name: "Novo nome" }),
    ).rejects.toThrow();
  });
});

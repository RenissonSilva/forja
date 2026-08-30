import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { MarkWorkoutPlanAsTodayUseCase } from "./MarkWorkoutPlanAsToday.usecase";

async function seedTwoPlans(repository: InMemoryWorkoutPlanRepository) {
  for (const id of ["plan-a", "plan-b"]) {
    const result = WorkoutPlan.create({
      id,
      profileId: "profile-1",
      name: id,
      colorTag: "orange",
    });
    if (!result.ok) throw new Error("fixture should be valid");
    await repository.save(result.value);
  }
}

describe("MarkWorkoutPlanAsTodayUseCase", () => {
  it("marks a plan as today's when none is marked yet", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    await seedTwoPlans(repository);
    const useCase = new MarkWorkoutPlanAsTodayUseCase(repository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-a" });

    expect((await repository.findById("plan-a"))?.isMarkedToday).toBe(true);
    expect((await repository.findById("plan-b"))?.isMarkedToday).toBe(false);
  });

  it("unmarks the previously marked plan when a different one is marked (exclusivity)", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    await seedTwoPlans(repository);
    const useCase = new MarkWorkoutPlanAsTodayUseCase(repository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-a" });
    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-b" });

    expect((await repository.findById("plan-a"))?.isMarkedToday).toBe(false);
    expect((await repository.findById("plan-b"))?.isMarkedToday).toBe(true);
  });

  it("toggles a plan off when marking the already-marked plan again", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    await seedTwoPlans(repository);
    const useCase = new MarkWorkoutPlanAsTodayUseCase(repository);

    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-a" });
    await useCase.execute({ profileId: "profile-1", workoutPlanId: "plan-a" });

    expect((await repository.findById("plan-a"))?.isMarkedToday).toBe(false);
  });

  it("fails when the target plan does not exist", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    await seedTwoPlans(repository);
    const useCase = new MarkWorkoutPlanAsTodayUseCase(repository);

    await expect(
      useCase.execute({ profileId: "profile-1", workoutPlanId: "missing" }),
    ).rejects.toThrow();
  });
});

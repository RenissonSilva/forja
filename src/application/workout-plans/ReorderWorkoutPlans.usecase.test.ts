import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { CreateWorkoutPlanUseCase } from "./CreateWorkoutPlan.usecase";
import { ReorderWorkoutPlansUseCase } from "./ReorderWorkoutPlans.usecase";

describe("ReorderWorkoutPlansUseCase", () => {
  it("persists the new order and it is reflected on listing", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const createUseCase = new CreateWorkoutPlanUseCase(repository);
    const reorderUseCase = new ReorderWorkoutPlansUseCase(repository);

    const a = await createUseCase.execute({ profileId: "profile-1", name: "Treino A" });
    const b = await createUseCase.execute({ profileId: "profile-1", name: "Treino B" });
    const c = await createUseCase.execute({ profileId: "profile-1", name: "Treino C" });

    await reorderUseCase.execute({
      profileId: "profile-1",
      orderedWorkoutPlanIds: [a.id, c.id, b.id],
    });

    const plans = await repository.findAllByProfile("profile-1");
    expect(plans.map((plan) => plan.id)).toEqual([a.id, c.id, b.id]);
  });

  it("does not affect plans belonging to another profile", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const createUseCase = new CreateWorkoutPlanUseCase(repository);
    const reorderUseCase = new ReorderWorkoutPlansUseCase(repository);

    const other = await createUseCase.execute({ profileId: "profile-2", name: "Treino X" });

    await reorderUseCase.execute({
      profileId: "profile-1",
      orderedWorkoutPlanIds: [other.id],
    });

    const plans = await repository.findAllByProfile("profile-2");
    expect(plans[0]?.order).toBe(0);
  });
});

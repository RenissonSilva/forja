import { WORKOUT_PLAN_COLOR_TAGS } from "@domain/entities/WorkoutPlan";
import { InMemoryWorkoutPlanRepository } from "../testing/InMemoryWorkoutPlanRepository";
import { CreateWorkoutPlanUseCase } from "./CreateWorkoutPlan.usecase";

describe("CreateWorkoutPlanUseCase", () => {
  it("cycles through the color palette as plans are created for a profile", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const useCase = new CreateWorkoutPlanUseCase(repository);

    const colors: string[] = [];
    for (let i = 0; i < WORKOUT_PLAN_COLOR_TAGS.length + 1; i++) {
      const plan = await useCase.execute({ profileId: "profile-1", name: `Treino ${i}` });
      colors.push(plan.colorTag);
    }

    expect(colors.slice(0, WORKOUT_PLAN_COLOR_TAGS.length)).toEqual([...WORKOUT_PLAN_COLOR_TAGS]);
    // the (n+1)th plan wraps back around to the first color
    expect(colors[WORKOUT_PLAN_COLOR_TAGS.length]).toBe(WORKOUT_PLAN_COLOR_TAGS[0]);
  });

  it("scopes the color count to the given profile, not the whole catalog", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const useCase = new CreateWorkoutPlanUseCase(repository);

    await useCase.execute({ profileId: "profile-1", name: "Treino A" });
    const otherProfilePlan = await useCase.execute({ profileId: "profile-2", name: "Treino A" });

    expect(otherProfilePlan.colorTag).toBe(WORKOUT_PLAN_COLOR_TAGS[0]);
  });

  it("rejects an empty name", async () => {
    const repository = new InMemoryWorkoutPlanRepository();
    const useCase = new CreateWorkoutPlanUseCase(repository);

    await expect(useCase.execute({ profileId: "profile-1", name: "" })).rejects.toThrow();
  });
});

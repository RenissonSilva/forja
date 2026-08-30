import { GoalProgressService } from "./GoalProgressService";

describe("GoalProgressService", () => {
  it("matches the FORJA reference screen (4 dias/semana -> meta de 16)", () => {
    expect(GoalProgressService.monthlyGoal(4)).toBe(16);
  });

  it("computes progress percentage rounded to the nearest integer", () => {
    expect(GoalProgressService.progressPercentage(15, 16)).toBe(94);
  });

  it("clamps progress percentage at 100 even when completed exceeds the goal", () => {
    expect(GoalProgressService.progressPercentage(20, 16)).toBe(100);
  });

  it("returns 0 progress when the goal is zero (avoids division by zero)", () => {
    expect(GoalProgressService.progressPercentage(5, 0)).toBe(0);
  });

  it("computes remaining sessions, floored at zero", () => {
    expect(GoalProgressService.remaining(15, 16)).toBe(1);
    expect(GoalProgressService.remaining(20, 16)).toBe(0);
  });
});

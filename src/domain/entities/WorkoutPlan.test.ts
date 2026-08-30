import { WorkoutPlan } from "./WorkoutPlan";
import { WorkoutPlanExercise } from "./WorkoutPlanExercise";

function makePlan() {
  const result = WorkoutPlan.create({
    id: "plan-1",
    profileId: "profile-1",
    name: "Treino A — Peito e tríceps",
    colorTag: "orange",
  });
  if (!result.ok) throw new Error("fixture should be valid");
  return result.value;
}

function makeExercise(id: string) {
  const result = WorkoutPlanExercise.create({
    id,
    exerciseId: `exercise-${id}`,
    order: 0,
    sets: 4,
    reps: 10,
    loadKg: 60,
    seatHeight: null,
    seatDistance: null,
    seatIncline: null,
    seatLock: null,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  return result.value;
}

describe("WorkoutPlan.create", () => {
  it("starts with no exercises and not marked as today", () => {
    const plan = makePlan();
    expect(plan.exercises).toHaveLength(0);
    expect(plan.isMarkedToday).toBe(false);
    expect(plan.estimatedDurationMinutes).toBe(0);
  });

  it("rejects an empty name", () => {
    const result = WorkoutPlan.create({
      id: "plan-1",
      profileId: "profile-1",
      name: "",
      colorTag: "orange",
    });
    expect(result.ok).toBe(false);
  });
});

describe("WorkoutPlan#addExercise", () => {
  it("assigns sequential order and derives estimated duration (~8min/exercise)", () => {
    const plan = makePlan().addExercise(makeExercise("a")).addExercise(makeExercise("b"));

    expect(plan.exercises.map((e) => e.order)).toEqual([0, 1]);
    expect(plan.estimatedDurationMinutes).toBe(16);
  });
});

describe("WorkoutPlan#removeExercise", () => {
  it("re-sequences the order of the remaining exercises", () => {
    const plan = makePlan()
      .addExercise(makeExercise("a"))
      .addExercise(makeExercise("b"))
      .addExercise(makeExercise("c"))
      .removeExercise("b");

    expect(plan.exercises.map((e) => e.id)).toEqual(["a", "c"]);
    expect(plan.exercises.map((e) => e.order)).toEqual([0, 1]);
  });
});

describe("WorkoutPlan#replaceExercise", () => {
  it("replaces an exercise in place, preserving its order", () => {
    const plan = makePlan().addExercise(makeExercise("a")).addExercise(makeExercise("b"));
    const replacement = makeExercise("b"); // order will be overwritten to match slot 1

    const result = plan.replaceExercise("b", replacement);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.exercises[1]?.order).toBe(1);
    }
  });

  it("fails when the target exercise does not exist in the plan", () => {
    const plan = makePlan();
    const result = plan.replaceExercise("missing", makeExercise("x"));
    expect(result.ok).toBe(false);
  });
});

describe("WorkoutPlan mark as today", () => {
  it("toggles isMarkedToday", () => {
    const plan = makePlan();
    expect(plan.markAsToday().isMarkedToday).toBe(true);
    expect(plan.markAsToday().unmarkAsToday().isMarkedToday).toBe(false);
  });
});

describe("WorkoutPlan#markCompletedNow", () => {
  it("starts with no completion recorded", () => {
    expect(makePlan().lastCompletedAt).toBeNull();
  });

  it("records the completion timestamp", () => {
    const now = new Date("2026-08-30T12:00:00Z");
    expect(makePlan().markCompletedNow(now).lastCompletedAt).toEqual(now);
  });
});

describe("WorkoutPlan#rename", () => {
  it("renames the plan, trimming whitespace", () => {
    const result = makePlan().rename("  Treino B — Costas  ");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe("Treino B — Costas");
  });

  it("rejects an empty new name", () => {
    expect(makePlan().rename("").ok).toBe(false);
  });
});

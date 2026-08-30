import { WorkoutPlanExercise } from "./WorkoutPlanExercise";

const baseProps = {
  id: "wpe-1",
  exerciseId: "ex-1",
  order: 0,
  sets: 4,
  reps: 10,
  loadKg: 60,
  seatHeight: null,
  seatDistance: null,
  seatIncline: null,
  seatLock: null,
};

describe("WorkoutPlanExercise.create", () => {
  it("creates a valid entry", () => {
    const result = WorkoutPlanExercise.create(baseProps);
    expect(result.ok).toBe(true);
  });

  it("stores the seat adjustment values", () => {
    const result = WorkoutPlanExercise.create({
      ...baseProps,
      seatHeight: 3,
      seatDistance: 2,
      seatIncline: 1,
      seatLock: 4,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.seatHeight).toBe(3);
      expect(result.value.seatDistance).toBe(2);
      expect(result.value.seatIncline).toBe(1);
      expect(result.value.seatLock).toBe(4);
    }
  });

  it.each([0, 21, 1.5])("rejects an invalid sets count (%s)", (sets) => {
    expect(WorkoutPlanExercise.create({ ...baseProps, sets }).ok).toBe(false);
  });

  it.each([0, 101])("rejects an invalid reps count (%s)", (reps) => {
    expect(WorkoutPlanExercise.create({ ...baseProps, reps }).ok).toBe(false);
  });

  it.each([-1, 501])("rejects an invalid load (%s)", (loadKg) => {
    expect(WorkoutPlanExercise.create({ ...baseProps, loadKg }).ok).toBe(false);
  });

  it("accepts a zero load (bodyweight exercises)", () => {
    expect(WorkoutPlanExercise.create({ ...baseProps, loadKg: 0 }).ok).toBe(true);
  });
});

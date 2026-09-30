import { WorkoutPlanExercise } from "./WorkoutPlanExercise";

const baseProps = {
  id: "wpe-1",
  exerciseId: "ex-1",
  order: 0,
  sets: Array.from({ length: 4 }, () => ({ reps: 10, loadKg: 60 })),
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

  it("keeps each set's reps and load individually", () => {
    const sets = [
      { reps: 12, loadKg: 40 },
      { reps: 10, loadKg: 45 },
      { reps: 8, loadKg: 50 },
    ];
    const result = WorkoutPlanExercise.create({ ...baseProps, sets });
    expect(result.ok && result.value.sets).toEqual(sets);
  });

  it.each([0, 21])("rejects an invalid sets count (%s)", (count) => {
    const sets = Array.from({ length: count }, () => ({ reps: 10, loadKg: 60 }));
    expect(WorkoutPlanExercise.create({ ...baseProps, sets }).ok).toBe(false);
  });

  it.each([0, 101, 1.5])("rejects an invalid reps count in any set (%s)", (reps) => {
    const sets = [
      { reps: 10, loadKg: 60 },
      { reps, loadKg: 60 },
    ];
    expect(WorkoutPlanExercise.create({ ...baseProps, sets }).ok).toBe(false);
  });

  it.each([-1, 501])("rejects an invalid load in any set (%s)", (loadKg) => {
    const sets = [
      { reps: 10, loadKg: 60 },
      { reps: 10, loadKg },
    ];
    expect(WorkoutPlanExercise.create({ ...baseProps, sets }).ok).toBe(false);
  });

  it("accepts a zero load (bodyweight exercises)", () => {
    const sets = [{ reps: 10, loadKg: 0 }];
    expect(WorkoutPlanExercise.create({ ...baseProps, sets }).ok).toBe(true);
  });

  it("accepts timed sets without reps (core, cardio)", () => {
    const sets = [{ reps: 0, loadKg: 0, durationSeconds: 45 }];
    const result = WorkoutPlanExercise.create({ ...baseProps, sets });
    expect(result.ok && result.value.sets).toEqual(sets);
  });

  it.each([0, 6000, 1.5])("rejects an invalid duration in any set (%s)", (durationSeconds) => {
    const sets = [
      { reps: 0, loadKg: 0, durationSeconds: 30 },
      { reps: 0, loadKg: 0, durationSeconds },
    ];
    const result = WorkoutPlanExercise.create({ ...baseProps, sets });
    expect(!result.ok && result.error.code).toBe("INVALID_DURATION");
  });
});

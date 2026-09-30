import { ExerciseLog, estimateOneRepMaxKg } from "./ExerciseLog";

function logWithSets(sets: { reps: number; loadKg: number }[]): ExerciseLog {
  const result = ExerciseLog.create({
    id: "log-1",
    profileId: "profile-1",
    exerciseId: "supino-reto",
    date: "2026-08-20",
    sets,
  });
  if (!result.ok) throw new Error("fixture should be valid");
  return result.value;
}

describe("estimateOneRepMaxKg", () => {
  it("applies the Epley formula", () => {
    expect(estimateOneRepMaxKg({ reps: 10, loadKg: 60 })).toBeCloseTo(80);
  });

  it("treats a single rep as the 1RM itself", () => {
    expect(estimateOneRepMaxKg({ reps: 1, loadKg: 100 })).toBe(100);
  });
});

describe("ExerciseLog", () => {
  it("picks the set with the highest estimated 1RM as the best set, not just the heaviest", () => {
    const log = logWithSets([
      { reps: 10, loadKg: 60 },
      { reps: 5, loadKg: 65 },
    ]);

    expect(log.loadKg).toBe(65);
    expect(log.bestSet).toEqual({ reps: 10, loadKg: 60 });
    expect(log.estimatedOneRepMaxKg).toBeCloseTo(80);
  });

  it("sums the reps of every set", () => {
    const log = logWithSets([
      { reps: 12, loadKg: 0 },
      { reps: 10, loadKg: 0 },
      { reps: 8, loadKg: 0 },
    ]);

    expect(log.totalReps).toBe(30);
  });
});

describe("ExerciseLog with timed sets", () => {
  function timedLog(sets: { loadKg: number; durationSeconds: number }[]): ExerciseLog {
    const result = ExerciseLog.create({
      id: "log-1",
      profileId: "profile-1",
      exerciseId: "prancha",
      date: "2026-08-20",
      sets: sets.map((set) => ({ reps: 0, ...set })),
    });
    if (!result.ok) throw new Error("fixture should be valid");
    return result.value;
  }

  it("takes the longest set as the top set and sums the time", () => {
    const log = timedLog([
      { loadKg: 10, durationSeconds: 45 },
      { loadKg: 0, durationSeconds: 60 },
    ]);

    expect(log.isTimed).toBe(true);
    expect(log.durationSeconds).toBe(60);
    expect(log.totalDurationSeconds).toBe(105);
    expect(log.topSet).toEqual({ reps: 0, loadKg: 0, durationSeconds: 60 });
  });

  it("rejects a zero-length set", () => {
    const result = ExerciseLog.create({
      id: "log-1",
      profileId: "profile-1",
      exerciseId: "prancha",
      date: "2026-08-20",
      sets: [{ reps: 0, loadKg: 0, durationSeconds: 0 }],
    });
    expect(result.ok).toBe(false);
  });
});

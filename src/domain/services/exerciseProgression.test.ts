import { ExerciseLog } from "../entities/ExerciseLog";
import { buildExerciseProgress, progressChange } from "./exerciseProgression";

/** Each set is [loadKg, reps], read as "60 kg × 10". */
function session(
  id: string,
  exerciseId: string,
  date: string,
  ...sets: [number, number][]
): ExerciseLog {
  const result = ExerciseLog.create({
    id,
    profileId: "profile-1",
    exerciseId,
    date,
    sets: sets.map(([loadKg, reps]) => ({ reps, loadKg })),
  });
  if (!result.ok) throw new Error("fixture should be valid");
  return result.value;
}

// Load stays at 60 while reps go up, then load goes up and reps drop.
const benchS1 = session("s1", "supino", "2026-08-01", [60, 8], [60, 8], [60, 8]);
const benchS2 = session("s2", "supino", "2026-08-08", [60, 10], [60, 10], [60, 10]);
const benchS3 = session("s3", "supino", "2026-08-15", [62.5, 8], [62.5, 8], [62.5, 6]);

describe("buildExerciseProgress", () => {
  it("groups sessions per exercise, oldest first", () => {
    const pullUp = session("b1", "barra", "2026-08-02", [0, 8]);

    const progress = buildExerciseProgress([benchS3, pullUp, benchS1, benchS2]);

    expect(progress.map((item) => item.exerciseId)).toEqual(["supino", "barra"]);
    expect(progress[0]?.sessions.map((item) => item.id)).toEqual(["s1", "s2", "s3"]);
  });

  it("measures weighted exercises by load and bodyweight ones by reps", () => {
    const pullUp = session("b1", "barra", "2026-08-02", [0, 8]);

    const [bench, bar] = buildExerciseProgress([benchS1, pullUp]);

    expect(bench?.metrics).toEqual(["load", "estimatedOneRepMax", "volume"]);
    expect(bar?.metrics).toEqual(["reps", "totalReps"]);
  });

  it("keeps the all-time best per metric and the session that set it", () => {
    const [bench] = buildExerciseProgress([benchS1, benchS2, benchS3]);

    expect(bench?.records.map((record) => [record.metric, record.session.id])).toEqual([
      ["load", "s3"],
      ["estimatedOneRepMax", "s2"],
      ["volume", "s2"],
    ]);
    expect(bench?.records[0]?.value).toBe(62.5);
    expect(bench?.records[1]?.value).toBeCloseTo(80);
    expect(bench?.records[2]?.value).toBe(1800);
  });

  it("credits a record to the first session that reached it, not to one that only matched it", () => {
    const [bench] = buildExerciseProgress([benchS1, benchS2]);

    expect(bench?.records[0]?.session.id).toBe("s1");
  });

  it("flags the metrics each session beat, counting more reps at the same load as a better set", () => {
    const [bench] = buildExerciseProgress([benchS1, benchS2, benchS3]);

    expect(bench?.recordsBySessionId.get("s1")).toBeUndefined();
    expect(bench?.recordsBySessionId.get("s2")).toEqual(["estimatedOneRepMax", "volume"]);
    expect(bench?.recordsBySessionId.get("s3")).toEqual(["load"]);
  });

  it("tracks reps records for bodyweight exercises", () => {
    const [bar] = buildExerciseProgress([
      session("b1", "barra", "2026-08-02", [0, 8], [0, 6]),
      session("b2", "barra", "2026-08-09", [0, 10], [0, 7]),
    ]);

    expect(bar?.records.map((record) => record.value)).toEqual([10, 17]);
    expect(bar?.recordsBySessionId.get("b2")).toEqual(["reps", "totalReps"]);
  });
});

describe("progressChange", () => {
  it("compares the last session against the first", () => {
    const change = progressChange([benchS1, benchS2, benchS3], "load");

    expect(change?.absolute).toBe(2.5);
    expect(change?.percent).toBeCloseTo(4.17, 2);
  });

  it("returns null with fewer than two sessions", () => {
    expect(progressChange([benchS1], "load")).toBeNull();
    expect(progressChange([], "load")).toBeNull();
  });

  it("leaves the percentage out when starting from zero", () => {
    const change = progressChange(
      [session("c1", "barra", "2026-08-02", [0, 8]), session("c2", "barra", "2026-08-09", [5, 8])],
      "load",
    );

    expect(change).toEqual({ absolute: 5, percent: null });
  });
});

describe("timed exercises", () => {
  it("measures core and cardio by time, even with load", () => {
    const plank = (id: string, date: string, durationSeconds: number) => {
      const result = ExerciseLog.create({
        id,
        profileId: "profile-1",
        exerciseId: "prancha",
        date,
        sets: [
          { reps: 0, loadKg: 10, durationSeconds },
          { reps: 0, loadKg: 10, durationSeconds: 30 },
        ],
      });
      if (!result.ok) throw new Error("fixture should be valid");
      return result.value;
    };

    const [progress] = buildExerciseProgress([
      plank("p1", "2026-08-01", 45),
      plank("p2", "2026-08-08", 60),
    ]);

    expect(progress?.metrics).toEqual(["duration", "totalDuration"]);
    expect(progress?.records.map((record) => record.value)).toEqual([60, 90]);
    expect(progressChange(progress!.sessions, "duration")?.absolute).toBe(15);
  });
});

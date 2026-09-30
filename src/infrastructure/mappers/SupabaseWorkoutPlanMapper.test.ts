import {
  SupabaseWorkoutPlanExerciseRow,
  SupabaseWorkoutPlanMapper,
  SupabaseWorkoutPlanRow,
} from "./SupabaseWorkoutPlanMapper";

const planRow: SupabaseWorkoutPlanRow = {
  id: "plan-1",
  profile_id: "profile-1",
  name: "Treino A",
  color_tag: "orange",
  order_index: 0,
  is_marked_today: false,
  last_completed_at: null,
  created_at: "2026-09-01T00:00:00.000Z",
  updated_at: "2026-09-01T00:00:00.000Z",
};

const baseExerciseRow: SupabaseWorkoutPlanExerciseRow = {
  id: "wpe-1",
  workout_plan_id: "plan-1",
  profile_id: "profile-1",
  exercise_id: "supino-reto",
  order_index: 0,
  sets: 3,
  reps: 10,
  load_kg: 40,
  set_details: null,
  seat_height: null,
  seat_distance: null,
  seat_incline: null,
  seat_lock: null,
};

describe("SupabaseWorkoutPlanMapper", () => {
  it("expands a row saved before per-set targets into identical sets", () => {
    const { set_details: _omitted, ...legacyRow } = baseExerciseRow;
    const plan = SupabaseWorkoutPlanMapper.toDomain(planRow, [
      legacyRow as SupabaseWorkoutPlanExerciseRow,
    ]);

    expect(plan.exercises[0]?.sets).toEqual([
      { reps: 10, loadKg: 40 },
      { reps: 10, loadKg: 40 },
      { reps: 10, loadKg: 40 },
    ]);
  });

  it("round-trips per-set targets", () => {
    const row = {
      ...baseExerciseRow,
      set_details: [
        { reps: 12, load_kg: 40 },
        { reps: 8, load_kg: 50 },
      ],
    };
    const plan = SupabaseWorkoutPlanMapper.toDomain(planRow, [row]);

    expect(plan.exercises[0]?.sets).toEqual([
      { reps: 12, loadKg: 40 },
      { reps: 8, loadKg: 50 },
    ]);
    expect(SupabaseWorkoutPlanMapper.toExerciseRows(plan)[0]).toMatchObject({
      sets: 2,
      reps: 12,
      load_kg: 50,
      set_details: row.set_details,
    });
  });

  it("round-trips timed sets, without a duration on the others", () => {
    const row = {
      ...baseExerciseRow,
      set_details: [
        { reps: 0, load_kg: 0, duration_seconds: 45 },
        { reps: 0, load_kg: 5, duration_seconds: 60 },
      ],
    };
    const plan = SupabaseWorkoutPlanMapper.toDomain(planRow, [row]);

    expect(plan.exercises[0]?.sets).toEqual([
      { reps: 0, loadKg: 0, durationSeconds: 45 },
      { reps: 0, loadKg: 5, durationSeconds: 60 },
    ]);
    expect(SupabaseWorkoutPlanMapper.toExerciseRows(plan)[0]?.set_details).toStrictEqual(
      row.set_details,
    );
  });
});

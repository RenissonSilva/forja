import { Attendance } from "./Attendance";

describe("Attendance.create", () => {
  it("stamps completedAt with now by default", () => {
    const before = new Date();
    const attendance = Attendance.create({
      id: "att-1",
      profileId: "profile-1",
      date: "2026-08-30",
      workoutPlanId: "plan-1",
    });
    const after = new Date();

    expect(attendance.completedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(attendance.completedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("accepts an explicit workoutPlanId of null", () => {
    const attendance = Attendance.create({
      id: "att-1",
      profileId: "profile-1",
      date: "2026-08-30",
      workoutPlanId: null,
    });
    expect(attendance.workoutPlanId).toBeNull();
  });
});

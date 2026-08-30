import { Attendance } from "@domain/entities/Attendance";
import { InMemoryAttendanceRepository } from "../testing/InMemoryAttendanceRepository";
import { GetMonthlyAttendanceUseCase } from "./GetMonthlyAttendance.usecase";

describe("GetMonthlyAttendanceUseCase", () => {
  it("builds a full Monday-Sunday grid, including padding days from adjacent months", async () => {
    const repository = new InMemoryAttendanceRepository();
    const useCase = new GetMonthlyAttendanceUseCase(repository);

    const days = await useCase.execute({
      profileId: "profile-1",
      referenceDate: new Date("2026-08-15T12:00:00"),
    });

    expect(days[0]?.dateKey).toBe("2026-07-27");
    expect(days[0]?.isInCurrentMonth).toBe(false);
    expect(days[days.length - 1]?.dateKey).toBe("2026-09-06");
    expect(days[days.length - 1]?.isInCurrentMonth).toBe(false);

    const aug15 = days.find((day) => day.dateKey === "2026-08-15");
    expect(aug15?.isInCurrentMonth).toBe(true);
  });

  it("marks days with an attendance record as trained", async () => {
    const repository = new InMemoryAttendanceRepository();
    await repository.save(
      Attendance.create({
        id: "att-1",
        profileId: "profile-1",
        date: "2026-08-10",
        workoutPlanId: "plan-1",
      }),
    );
    const useCase = new GetMonthlyAttendanceUseCase(repository);

    const days = await useCase.execute({
      profileId: "profile-1",
      referenceDate: new Date("2026-08-15T12:00:00"),
    });

    const trainedDay = days.find((day) => day.dateKey === "2026-08-10");
    expect(trainedDay?.attendance).not.toBeNull();
  });
});

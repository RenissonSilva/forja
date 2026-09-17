import { InMemoryBodyMeasurementRepository } from "../testing/InMemoryBodyMeasurementRepository";
import { RegisterMeasurementsUseCase } from "./RegisterMeasurements.usecase";

describe("RegisterMeasurementsUseCase", () => {
  it("registers only the measurement types with a provided value", async () => {
    const repository = new InMemoryBodyMeasurementRepository();
    const useCase = new RegisterMeasurementsUseCase(repository);

    await useCase.execute({
      profileId: "profile-1",
      date: "2026-08-20",
      values: { cintura: 85, quadril: 100 },
    });

    const entries = await repository.findAllByProfile("profile-1");
    expect(entries).toHaveLength(2);
    expect(entries.map((entry) => entry.type).sort()).toEqual(["cintura", "quadril"]);
  });

  it("overwrites an existing entry for the same day and type instead of duplicating it", async () => {
    const repository = new InMemoryBodyMeasurementRepository();
    const useCase = new RegisterMeasurementsUseCase(repository);

    await useCase.execute({ profileId: "profile-1", date: "2026-08-20", values: { cintura: 85 } });
    await useCase.execute({ profileId: "profile-1", date: "2026-08-20", values: { cintura: 84 } });

    const entries = await repository.findAllByProfile("profile-1");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.valueCm).toBe(84);
  });

  it("rejects an out-of-range measurement", async () => {
    const repository = new InMemoryBodyMeasurementRepository();
    const useCase = new RegisterMeasurementsUseCase(repository);

    await expect(
      useCase.execute({ profileId: "profile-1", date: "2026-08-20", values: { cintura: 1 } }),
    ).rejects.toThrow();
  });
});

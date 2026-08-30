import { WeightEntry } from "./WeightEntry";

describe("WeightEntry.create", () => {
  it("creates a valid entry", () => {
    const result = WeightEntry.create({
      id: "we-1",
      profileId: "profile-1",
      date: "2026-08-30",
      weightKg: 76.4,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects an invalid weight", () => {
    const result = WeightEntry.create({
      id: "we-1",
      profileId: "profile-1",
      date: "2026-08-30",
      weightKg: 0,
    });
    expect(result.ok).toBe(false);
  });
});

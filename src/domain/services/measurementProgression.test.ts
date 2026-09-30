import { BodyMeasurement, MeasurementType } from "../entities/BodyMeasurement";
import {
  changeOutcome,
  groupMeasurementsByType,
  measurementChange,
} from "./measurementProgression";

function entry(id: string, type: MeasurementType, date: string, valueCm: number): BodyMeasurement {
  return BodyMeasurement.restore({ id, profileId: "profile-1", date, type, valueCm });
}

describe("groupMeasurementsByType", () => {
  it("groups entries per type, oldest first", () => {
    const grouped = groupMeasurementsByType([
      entry("w2", "cintura", "2026-09-01", 84),
      entry("b1", "biceps", "2026-08-01", 35),
      entry("w1", "cintura", "2026-08-01", 86),
    ]);

    expect(grouped.cintura?.map((item) => item.id)).toEqual(["w1", "w2"]);
    expect(grouped.biceps?.map((item) => item.id)).toEqual(["b1"]);
    expect(grouped.quadril).toBeUndefined();
  });
});

describe("measurementChange", () => {
  it("compares the last entry with the first", () => {
    const change = measurementChange([
      entry("w1", "cintura", "2026-08-01", 80),
      entry("w2", "cintura", "2026-08-15", 82),
      entry("w3", "cintura", "2026-09-01", 78),
    ]);

    expect(change?.absolute).toBe(-2);
    expect(change?.percent).toBeCloseTo(-2.5);
  });

  it("is null with a single entry", () => {
    expect(measurementChange([entry("w1", "cintura", "2026-08-01", 80)])).toBeNull();
    expect(measurementChange([])).toBeNull();
  });
});

describe("changeOutcome", () => {
  it("counts shrinking as progress for waist-like measures", () => {
    expect(changeOutcome("cintura", { absolute: -2, percent: -2.5 })).toBe("improved");
    expect(changeOutcome("abdomen", { absolute: 1, percent: 1 })).toBe("worsened");
  });

  it("counts growing as progress for muscle measures", () => {
    expect(changeOutcome("biceps", { absolute: 0.5, percent: 1.4 })).toBe("improved");
    expect(changeOutcome("coxas", { absolute: -1, percent: -1.7 })).toBe("worsened");
  });

  it("ignores float noise", () => {
    expect(changeOutcome("cintura", { absolute: 0.00001, percent: 0 })).toBe("unchanged");
  });
});

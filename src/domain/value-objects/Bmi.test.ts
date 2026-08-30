import { Height } from "./Height";
import { Weight } from "./Weight";
import { Bmi } from "./Bmi";

function bmiFor(weightKg: number, heightCm: number): Bmi {
  const weight = Weight.create(weightKg);
  const height = Height.create(heightCm);
  if (!weight.ok || !height.ok) throw new Error("invalid fixture");
  return Bmi.calculate(weight.value, height.value);
}

describe("Bmi", () => {
  it("matches the FORJA reference screen (178cm, 76.4kg -> 24.1, saudável)", () => {
    const bmi = bmiFor(76.4, 178);
    expect(bmi.value).toBeCloseTo(24.1, 1);
    expect(bmi.classification).toBe("saudavel");
  });

  it.each([
    [73, "abaixo"],
    [74, "saudavel"], // exact lower boundary (18.5)
    [99, "saudavel"],
    [100, "sobrepeso"], // exact boundary (25)
    [119, "sobrepeso"],
    [120, "obesidade"], // exact boundary (30)
  ] as const)("classifies %skg at 200cm as %s", (weightKg, expected) => {
    expect(bmiFor(weightKg, 200).classification).toBe(expected);
  });
});

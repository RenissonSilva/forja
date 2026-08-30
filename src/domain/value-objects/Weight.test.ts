import { Weight } from "./Weight";

describe("Weight", () => {
  it("creates a valid weight", () => {
    const result = Weight.create(76.4);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.kg).toBe(76.4);
  });

  it.each([19, 401, Number.NaN])("rejects an out-of-range weight (%s)", (kg) => {
    expect(Weight.create(kg).ok).toBe(false);
  });

  it("accepts the inclusive bounds", () => {
    expect(Weight.create(20).ok).toBe(true);
    expect(Weight.create(400).ok).toBe(true);
  });
});

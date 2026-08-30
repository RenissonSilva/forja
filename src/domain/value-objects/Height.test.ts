import { Height } from "./Height";

describe("Height", () => {
  it("creates a valid height", () => {
    const result = Height.create(178);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.cm).toBe(178);
      expect(result.value.meters).toBeCloseTo(1.78);
    }
  });

  it.each([99, 251, Number.NaN, -10])("rejects an out-of-range height (%s)", (cm) => {
    const result = Height.create(cm);
    expect(result.ok).toBe(false);
  });

  it("accepts the inclusive bounds", () => {
    expect(Height.create(100).ok).toBe(true);
    expect(Height.create(250).ok).toBe(true);
  });
});

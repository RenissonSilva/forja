import { Exercise } from "./Exercise";

describe("Exercise.create", () => {
  it("creates a valid exercise, trimming the name", () => {
    const result = Exercise.create({
      id: "ex-1",
      name: "  Supino reto  ",
      muscleGroup: "peito",
      isCustom: false,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe("Supino reto");
  });

  it("rejects an empty name", () => {
    const result = Exercise.create({
      id: "ex-1",
      name: "  ",
      muscleGroup: "peito",
      isCustom: true,
    });
    expect(result.ok).toBe(false);
  });
});

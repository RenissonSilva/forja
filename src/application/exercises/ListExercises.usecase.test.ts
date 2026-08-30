import { Exercise } from "@domain/entities/Exercise";
import { InMemoryExerciseRepository } from "../testing/InMemoryExerciseRepository";
import { ListExercisesUseCase } from "./ListExercises.usecase";

async function seedCatalog(repository: InMemoryExerciseRepository) {
  const fixtures = [
    { id: "1", name: "Supino reto", muscleGroup: "peito" as const },
    { id: "2", name: "Supino inclinado halteres", muscleGroup: "peito" as const },
    { id: "3", name: "Puxada frente", muscleGroup: "costas" as const },
  ];
  for (const fixture of fixtures) {
    const result = Exercise.create({ ...fixture, isCustom: false });
    if (!result.ok) throw new Error("fixture should be valid");
    await repository.save(result.value);
  }
}

describe("ListExercisesUseCase", () => {
  it("returns the whole catalog with no filter", async () => {
    const repository = new InMemoryExerciseRepository();
    await seedCatalog(repository);
    const useCase = new ListExercisesUseCase(repository);

    expect(await useCase.execute()).toHaveLength(3);
  });

  it("filters by a case-insensitive name query", async () => {
    const repository = new InMemoryExerciseRepository();
    await seedCatalog(repository);
    const useCase = new ListExercisesUseCase(repository);

    const results = await useCase.execute({ query: "supino" });
    expect(results.map((e) => e.id).sort()).toEqual(["1", "2"]);
  });

  it("filters by muscle group", async () => {
    const repository = new InMemoryExerciseRepository();
    await seedCatalog(repository);
    const useCase = new ListExercisesUseCase(repository);

    const results = await useCase.execute({ muscleGroup: "costas" });
    expect(results.map((e) => e.id)).toEqual(["3"]);
  });

  it("combines query and muscle group filters", async () => {
    const repository = new InMemoryExerciseRepository();
    await seedCatalog(repository);
    const useCase = new ListExercisesUseCase(repository);

    const results = await useCase.execute({ query: "supino", muscleGroup: "costas" });
    expect(results).toHaveLength(0);
  });
});

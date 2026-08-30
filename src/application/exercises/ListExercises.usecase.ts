import { Exercise, MuscleGroup } from "@domain/entities/Exercise";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";

export interface ListExercisesFilter {
  query?: string;
  muscleGroup?: MuscleGroup;
}

export class ListExercisesUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(filter: ListExercisesFilter = {}): Promise<Exercise[]> {
    const all = await this.exerciseRepository.findAll();
    const query = filter.query?.trim().toLowerCase();

    return all.filter((exercise) => {
      const matchesQuery = !query || exercise.name.toLowerCase().includes(query);
      const matchesGroup = !filter.muscleGroup || exercise.muscleGroup === filter.muscleGroup;
      return matchesQuery && matchesGroup;
    });
  }
}

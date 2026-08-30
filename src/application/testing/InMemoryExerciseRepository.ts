import { Exercise } from "@domain/entities/Exercise";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";

export class InMemoryExerciseRepository implements ExerciseRepository {
  private readonly items = new Map<string, Exercise>();

  async findAll(): Promise<Exercise[]> {
    return [...this.items.values()];
  }

  async findById(id: string): Promise<Exercise | null> {
    return this.items.get(id) ?? null;
  }

  async save(exercise: Exercise): Promise<void> {
    this.items.set(exercise.id, exercise);
  }
}

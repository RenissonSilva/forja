import { Exercise } from "../entities/Exercise";

export interface ExerciseRepository {
  findAll(): Promise<Exercise[]>;
  findById(id: string): Promise<Exercise | null>;
  save(exercise: Exercise): Promise<void>;
}

import { Exercise } from "@domain/entities/Exercise";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";
import { generateId } from "@shared/id";
import {
  CreateCustomExerciseInput,
  createCustomExerciseSchema,
} from "../dtos/CreateCustomExercise.dto";

export class CreateCustomExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(rawInput: CreateCustomExerciseInput): Promise<Exercise> {
    const input = createCustomExerciseSchema.parse(rawInput);

    const result = Exercise.create({
      id: generateId(),
      name: input.name,
      muscleGroup: input.muscleGroup,
      isCustom: true,
    });
    if (!result.ok) throw result.error;

    await this.exerciseRepository.save(result.value);
    return result.value;
  }
}

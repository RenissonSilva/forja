import { ExerciseLog } from "@domain/entities/ExerciseLog";
import { ExerciseLogRepository } from "@domain/repositories/ExerciseLogRepository";
import { generateId } from "@shared/id";
import { todayKey } from "@shared/date-utils";
import {
  LogExercisePerformanceInput,
  logExercisePerformanceSchema,
} from "../dtos/LogExercisePerformance.dto";

export class LogExercisePerformanceUseCase {
  constructor(private readonly exerciseLogRepository: ExerciseLogRepository) {}

  async execute(rawInput: LogExercisePerformanceInput): Promise<ExerciseLog[]> {
    const input = logExercisePerformanceSchema.parse(rawInput);
    const date = input.date ?? todayKey();

    const entries: ExerciseLog[] = [];
    for (const entry of input.entries) {
      const result = ExerciseLog.create({
        id: generateId(),
        profileId: input.profileId,
        exerciseId: entry.exerciseId,
        date,
        sets: entry.sets,
        reps: entry.reps,
        loadKg: entry.loadKg,
      });
      if (!result.ok) throw result.error;
      entries.push(result.value);
    }

    if (entries.length === 0) return [];

    await this.exerciseLogRepository.saveMany(entries);
    return entries;
  }
}

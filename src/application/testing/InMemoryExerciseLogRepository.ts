import { ExerciseLog } from "@domain/entities/ExerciseLog";
import { ExerciseLogRepository } from "@domain/repositories/ExerciseLogRepository";

export class InMemoryExerciseLogRepository implements ExerciseLogRepository {
  private readonly items = new Map<string, ExerciseLog>();

  async findAllByProfile(profileId: string): Promise<ExerciseLog[]> {
    return [...this.items.values()]
      .filter((entry) => entry.profileId === profileId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async saveMany(entries: ExerciseLog[]): Promise<void> {
    for (const entry of entries) {
      this.items.set(this.key(entry.profileId, entry.date, entry.exerciseId), entry);
    }
  }

  private key(profileId: string, date: string, exerciseId: string): string {
    return `${profileId}:${date}:${exerciseId}`;
  }
}

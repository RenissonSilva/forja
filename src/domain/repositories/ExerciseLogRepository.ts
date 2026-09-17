import { ExerciseLog } from "../entities/ExerciseLog";

export interface ExerciseLogRepository {
  /** Ordered by date ascending. */
  findAllByProfile(profileId: string): Promise<ExerciseLog[]>;
  /** One entry per (profileId, exerciseId, date); saving an existing (exerciseId, date) overwrites it. */
  saveMany(entries: ExerciseLog[]): Promise<void>;
}

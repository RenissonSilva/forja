import { ExerciseLog } from "../entities/ExerciseLog";
import { DateKey } from "@shared/date-utils";

export interface ExerciseLogRepository {
  /** Ordered by date ascending. */
  findAllByProfile(profileId: string): Promise<ExerciseLog[]>;
  /** Every exercise logged on that day, in no particular order. */
  findByDate(profileId: string, date: DateKey): Promise<ExerciseLog[]>;
  /** One entry per (profileId, exerciseId, date); saving an existing (exerciseId, date) overwrites it. */
  saveMany(entries: ExerciseLog[]): Promise<void>;
}

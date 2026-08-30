import { WeightEntry } from "../entities/WeightEntry";

export interface WeightEntryRepository {
  /** Ordered by date ascending. */
  findAllByProfile(profileId: string): Promise<WeightEntry[]>;
  findLatest(profileId: string): Promise<WeightEntry | null>;
  /** One entry per (profileId, date); saving an existing date overwrites it. */
  save(entry: WeightEntry): Promise<void>;
}

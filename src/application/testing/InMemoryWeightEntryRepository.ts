import { WeightEntry } from "@domain/entities/WeightEntry";
import { WeightEntryRepository } from "@domain/repositories/WeightEntryRepository";

export class InMemoryWeightEntryRepository implements WeightEntryRepository {
  private readonly items = new Map<string, WeightEntry>();

  async findAllByProfile(profileId: string): Promise<WeightEntry[]> {
    return [...this.items.values()]
      .filter((entry) => entry.profileId === profileId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async findLatest(profileId: string): Promise<WeightEntry | null> {
    const all = await this.findAllByProfile(profileId);
    return all[all.length - 1] ?? null;
  }

  async save(entry: WeightEntry): Promise<void> {
    this.items.set(this.key(entry.profileId, entry.date), entry);
  }

  private key(profileId: string, date: string): string {
    return `${profileId}:${date}`;
  }
}

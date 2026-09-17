import { BodyMeasurement } from "@domain/entities/BodyMeasurement";
import { BodyMeasurementRepository } from "@domain/repositories/BodyMeasurementRepository";

export class InMemoryBodyMeasurementRepository implements BodyMeasurementRepository {
  private readonly items = new Map<string, BodyMeasurement>();

  async findAllByProfile(profileId: string): Promise<BodyMeasurement[]> {
    return [...this.items.values()]
      .filter((entry) => entry.profileId === profileId)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async saveMany(entries: BodyMeasurement[]): Promise<void> {
    for (const entry of entries) {
      this.items.set(this.key(entry.profileId, entry.date, entry.type), entry);
    }
  }

  private key(profileId: string, date: string, type: string): string {
    return `${profileId}:${date}:${type}`;
  }
}

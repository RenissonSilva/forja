import { BodyMeasurement } from "../entities/BodyMeasurement";

export interface BodyMeasurementRepository {
  /** Ordered by date ascending. */
  findAllByProfile(profileId: string): Promise<BodyMeasurement[]>;
  /** One entry per (profileId, date, type); saving an existing (date, type) overwrites it. */
  saveMany(entries: BodyMeasurement[]): Promise<void>;
}

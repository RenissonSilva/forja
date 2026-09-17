import { BodyMeasurement, MeasurementType } from "@domain/entities/BodyMeasurement";

export interface SupabaseBodyMeasurementRow {
  id: string;
  profile_id: string;
  date: string;
  type: string;
  value_cm: number;
}

export class SupabaseBodyMeasurementMapper {
  static toDomain(row: SupabaseBodyMeasurementRow): BodyMeasurement {
    return BodyMeasurement.restore({
      id: row.id,
      profileId: row.profile_id,
      date: row.date,
      type: row.type as MeasurementType,
      valueCm: row.value_cm,
    });
  }

  static toRow(entry: BodyMeasurement): SupabaseBodyMeasurementRow {
    const props = entry.toProps();
    return {
      id: props.id,
      profile_id: props.profileId,
      date: props.date,
      type: props.type,
      value_cm: props.valueCm,
    };
  }
}

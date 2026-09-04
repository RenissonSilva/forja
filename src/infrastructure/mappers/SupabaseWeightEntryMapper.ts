import { WeightEntry } from "@domain/entities/WeightEntry";

export interface SupabaseWeightEntryRow {
  id: string;
  profile_id: string;
  date: string;
  weight_kg: number;
}

export class SupabaseWeightEntryMapper {
  static toDomain(row: SupabaseWeightEntryRow): WeightEntry {
    return WeightEntry.restore({
      id: row.id,
      profileId: row.profile_id,
      date: row.date,
      weightKg: row.weight_kg,
    });
  }

  static toRow(entry: WeightEntry): SupabaseWeightEntryRow {
    const props = entry.toProps();
    return {
      id: props.id,
      profile_id: props.profileId,
      date: props.date,
      weight_kg: props.weightKg,
    };
  }
}

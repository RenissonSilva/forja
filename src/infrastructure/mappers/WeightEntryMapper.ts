import { WeightEntry } from "@domain/entities/WeightEntry";
import { weightEntries } from "../database/schema";

type WeightEntryRow = typeof weightEntries.$inferSelect;
type WeightEntryInsertRow = typeof weightEntries.$inferInsert;

export class WeightEntryMapper {
  static toDomain(row: WeightEntryRow): WeightEntry {
    return WeightEntry.restore({
      id: row.id,
      profileId: row.profileId,
      date: row.date,
      weightKg: row.weightKg,
    });
  }

  static toRow(entry: WeightEntry): WeightEntryInsertRow {
    const props = entry.toProps();
    return {
      id: props.id,
      profileId: props.profileId,
      date: props.date,
      weightKg: props.weightKg,
    };
  }
}

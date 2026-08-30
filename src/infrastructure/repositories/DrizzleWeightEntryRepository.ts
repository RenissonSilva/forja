import { asc, desc, eq } from "drizzle-orm";
import { WeightEntry } from "@domain/entities/WeightEntry";
import { WeightEntryRepository } from "@domain/repositories/WeightEntryRepository";
import { Database } from "../database/database";
import { weightEntries } from "../database/schema";
import { WeightEntryMapper } from "../mappers/WeightEntryMapper";

export class DrizzleWeightEntryRepository implements WeightEntryRepository {
  constructor(private readonly db: Database) {}

  async findAllByProfile(profileId: string): Promise<WeightEntry[]> {
    const rows = await this.db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.profileId, profileId))
      .orderBy(asc(weightEntries.date));
    return rows.map(WeightEntryMapper.toDomain);
  }

  async findLatest(profileId: string): Promise<WeightEntry | null> {
    const [row] = await this.db
      .select()
      .from(weightEntries)
      .where(eq(weightEntries.profileId, profileId))
      .orderBy(desc(weightEntries.date))
      .limit(1);
    return row ? WeightEntryMapper.toDomain(row) : null;
  }

  async save(entry: WeightEntry): Promise<void> {
    const row = WeightEntryMapper.toRow(entry);
    await this.db
      .insert(weightEntries)
      .values(row)
      .onConflictDoUpdate({
        target: [weightEntries.profileId, weightEntries.date],
        set: row,
      });
  }
}

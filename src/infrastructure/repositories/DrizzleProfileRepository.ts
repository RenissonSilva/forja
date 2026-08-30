import { Profile } from "@domain/entities/Profile";
import { ProfileRepository } from "@domain/repositories/ProfileRepository";
import { Database } from "../database/database";
import { profiles } from "../database/schema";
import { ProfileMapper } from "../mappers/ProfileMapper";

export class DrizzleProfileRepository implements ProfileRepository {
  constructor(private readonly db: Database) {}

  async findCurrent(): Promise<Profile | null> {
    const [row] = await this.db.select().from(profiles).limit(1);
    return row ? ProfileMapper.toDomain(row) : null;
  }

  async save(profile: Profile): Promise<void> {
    const row = ProfileMapper.toRow(profile);
    await this.db
      .insert(profiles)
      .values(row)
      .onConflictDoUpdate({ target: profiles.id, set: row });
  }
}

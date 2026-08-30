import { Profile } from "@domain/entities/Profile";
import { profiles } from "../database/schema";

type ProfileRow = typeof profiles.$inferSelect;
type ProfileInsertRow = typeof profiles.$inferInsert;

export class ProfileMapper {
  static toDomain(row: ProfileRow): Profile {
    return Profile.restore({
      id: row.id,
      name: row.name,
      avatarUri: row.avatarUri,
      heightCm: row.heightCm,
      weeklyGoalDays: row.weeklyGoalDays,
      remindersEnabled: row.remindersEnabled,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toRow(profile: Profile): ProfileInsertRow {
    const props = profile.toProps();
    return {
      id: props.id,
      name: props.name,
      avatarUri: props.avatarUri,
      heightCm: props.heightCm,
      weeklyGoalDays: props.weeklyGoalDays,
      remindersEnabled: props.remindersEnabled,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

import { Profile } from "@domain/entities/Profile";

export interface SupabaseProfileRow {
  id: string;
  name: string;
  avatar_uri: string | null;
  height_cm: number;
  weekly_goal_days: number;
  reminders_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export class SupabaseProfileMapper {
  static toDomain(row: SupabaseProfileRow): Profile {
    return Profile.restore({
      id: row.id,
      name: row.name,
      avatarUri: row.avatar_uri,
      heightCm: row.height_cm,
      weeklyGoalDays: row.weekly_goal_days,
      remindersEnabled: row.reminders_enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toRow(profile: Profile): SupabaseProfileRow {
    const props = profile.toProps();
    return {
      id: props.id,
      name: props.name,
      avatar_uri: props.avatarUri,
      height_cm: props.heightCm,
      weekly_goal_days: props.weeklyGoalDays,
      reminders_enabled: props.remindersEnabled,
      created_at: props.createdAt.toISOString(),
      updated_at: props.updatedAt.toISOString(),
    };
  }
}

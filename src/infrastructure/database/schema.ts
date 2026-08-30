import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  avatarUri: text("avatar_uri"),
  heightCm: real("height_cm").notNull(),
  weeklyGoalDays: integer("weekly_goal_days").notNull(),
  remindersEnabled: integer("reminders_enabled", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const exercises = sqliteTable("exercises", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  isCustom: integer("is_custom", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const workoutPlans = sqliteTable("workout_plans", {
  id: text("id").primaryKey(),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  colorTag: text("color_tag").notNull(),
  isMarkedToday: integer("is_marked_today", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const workoutPlanExercises = sqliteTable("workout_plan_exercises", {
  id: text("id").primaryKey(),
  workoutPlanId: text("workout_plan_id")
    .notNull()
    .references(() => workoutPlans.id, { onDelete: "cascade" }),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  orderIndex: integer("order_index").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  loadKg: real("load_kg").notNull(),
  seatAdjustment: text("seat_adjustment"),
});

export const attendances = sqliteTable(
  "attendances",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    workoutPlanId: text("workout_plan_id").references(() => workoutPlans.id, {
      onDelete: "set null",
    }),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [uniqueIndex("attendances_profile_date_unique").on(table.profileId, table.date)],
);

export const weightEntries = sqliteTable(
  "weight_entries",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    weightKg: real("weight_kg").notNull(),
  },
  (table) => [uniqueIndex("weight_entries_profile_date_unique").on(table.profileId, table.date)],
);

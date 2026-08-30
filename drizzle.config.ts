import type { Config } from "drizzle-kit";

// `driver: "expo"` makes drizzle-kit emit migrations in the format consumed by
// drizzle-orm/expo-sqlite's `useMigrations` hook (bundled into the app via Metro
// and applied on-device at boot — see src/infrastructure/database/database.ts,
// created in Passo 3).
export default {
  schema: "./src/infrastructure/database/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo",
} satisfies Config;

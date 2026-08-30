import { z } from "zod";

// process.env.EXPO_PUBLIC_* is statically inlined by Expo's babel transform at
// bundle time, so each variable must be referenced by its literal full name
// (no dynamic lookups) for the inlining to work.
const envSchema = z.object({
  APP_ENV: z.enum(["development", "production"]).default("development"),
  DB_NAME: z.string().min(1).default("forja.db"),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    DB_NAME: process.env.EXPO_PUBLIC_DB_NAME,
  });

  if (!parsed.success) {
    throw new Error(
      `Configuração de ambiente inválida:\n${parsed.error.issues
        .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();

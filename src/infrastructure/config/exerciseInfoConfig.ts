// process.env.EXPO_PUBLIC_* is statically inlined by Expo's babel transform at
// bundle time, so each variable must be referenced by its literal full name.
// These are optional (unlike env.ts) — the feature degrades gracefully without them.
export const EXERCISE_INFO_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_EXERCISEDB_BASE_URL ?? "https://oss.exercisedb.dev/api/v1",
  translateBaseUrl:
    process.env.EXPO_PUBLIC_TRANSLATE_BASE_URL ?? "https://api.mymemory.translated.net/get",
  /** Optional contact e-mail to raise MyMemory's free daily quota. Never auto-filled with the user's own e-mail. */
  translateContactEmail: process.env.EXPO_PUBLIC_TRANSLATE_CONTACT_EMAIL || undefined,
  requestTimeoutMs: 8000,
};

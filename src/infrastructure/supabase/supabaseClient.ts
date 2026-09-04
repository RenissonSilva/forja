import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env";
import { ExpoSecureStoreAdapter } from "./ExpoSecureStoreAdapter";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

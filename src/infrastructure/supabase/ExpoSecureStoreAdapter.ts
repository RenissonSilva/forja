import * as SecureStore from "expo-secure-store";

/** Storage adapter so supabase-js persists the session via expo-secure-store instead of localStorage. */
export const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

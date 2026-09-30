import AsyncStorage from "@react-native-async-storage/async-storage";

interface CacheEnvelope<T> {
  value: T;
  expiresAt: number;
}

/** Generic cache-aside helper over AsyncStorage. Any read/parse failure is treated as a cache miss. */
export class AsyncStorageCache {
  async getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const cached = await this.read<T>(key);
    if (cached !== null) return cached;

    const value = await loader();
    await this.write(key, value, ttlMs);
    return value;
  }

  async invalidate(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // best-effort
    }
  }

  private async read<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;

      const envelope = JSON.parse(raw) as CacheEnvelope<T>;
      if (typeof envelope.expiresAt !== "number" || Date.now() > envelope.expiresAt) {
        return null;
      }
      return envelope.value;
    } catch {
      return null;
    }
  }

  private async write<T>(key: string, value: T, ttlMs: number): Promise<void> {
    try {
      const envelope: CacheEnvelope<T> = { value, expiresAt: Date.now() + ttlMs };
      await AsyncStorage.setItem(key, JSON.stringify(envelope));
    } catch {
      // best-effort — a failed write just means no caching this time
    }
  }
}

import { TranslatorRepository } from "@domain/repositories/TranslatorRepository";
import { AsyncStorageCache } from "@infrastructure/cache/AsyncStorageCache";

interface MyMemoryResponse {
  responseData?: { translatedText?: string; match?: number };
}

const TRANSLATION_TTL_MS = 180 * 24 * 60 * 60 * 1000;
const MIN_MATCH_SCORE = 0.3;
const REQUEST_TIMEOUT_MS = 6000;

/** djb2 — fast, dependency-free hash, good enough for cache-key deduplication (not security-sensitive). */
function hashText(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

export class MyMemoryTranslatorRepository implements TranslatorRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly cache: AsyncStorageCache,
    private readonly contactEmail?: string,
  ) {}

  async translateMany(texts: string[], from: string, to: string): Promise<string[]> {
    return Promise.all(texts.map((text) => this.translateOne(text, from, to)));
  }

  private async translateOne(text: string, from: string, to: string): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return text;

    const cacheKey = `translate:v1:${from}:${to}:${hashText(trimmed)}`;
    return this.cache.getOrSet(cacheKey, TRANSLATION_TTL_MS, async () => {
      const translated = await this.fetchTranslation(trimmed, from, to);
      return translated ?? text;
    });
  }

  private async fetchTranslation(text: string, from: string, to: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const params = new URLSearchParams({ q: text, langpair: `${from}|${to}` });
      if (this.contactEmail) params.set("de", this.contactEmail);

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!response.ok) return null;

      const body = (await response.json()) as MyMemoryResponse;
      const translatedText = body.responseData?.translatedText;
      const match = body.responseData?.match ?? 1;

      if (!translatedText || match < MIN_MATCH_SCORE) return null;
      return translatedText;
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }
}

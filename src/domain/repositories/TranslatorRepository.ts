export interface TranslatorRepository {
  /** Never rejects — on failure or low-confidence result, returns the original texts unchanged. */
  translateMany(texts: string[], from: string, to: string): Promise<string[]>;
}

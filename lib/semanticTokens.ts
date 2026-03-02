/**
 * Semantic Token Extractor
 * Extracts meaningful keywords from a dream title to be injected into content blocks.
 */

export interface SemanticTokens {
  primaryToken: string;
  secondaryTokens: string[];
}

const STOP_WORDS = new Set([
  "rüyada", "görmek", "olmak", "etmek", "yapmak", "ve", "ile", "veya", "için", "bir", "çok", "ne", "anlama", "gelir"
]);

export function extractSemanticTokens(title: string): SemanticTokens {
  // Clean title
  const cleanTitle = title.toLowerCase().replace(/rüyada\s+/i, "").trim();
  
  // Split into words and remove stop words
  const words = cleanTitle
    .split(/\s+/)
    .map(w => w.replace(/[^\wğüşıöç]/gi, ""))
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length === 0) {
    return { primaryToken: cleanTitle, secondaryTokens: [] };
  }

  // The most prominent noun/action is usually the first or last meaningful word
  const primaryToken = words[0];
  const secondaryTokens = words.slice(1);

  return {
    primaryToken,
    secondaryTokens
  };
}

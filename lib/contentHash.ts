/**
 * contentHash.ts — Deterministik içerik parmak izi
 *
 * SHA-256 tabanlı içerik özeti sistemi.
 *
 * Amaç:
 *  - generate-all-content.ts içinde çift/özdeş içerik yayınını önlemek
 *  - wordCount < 500 içerik kalite korumasıyla birlikte katmanlı bir guard sağlamak
 *  - DB'de saklanan hash değeriyle render-time duplikat tespiti
 *
 * Kullanım:
 *   const hash = hashContent(markdown);
 *   // DB'ye kaydet: { contentHash: hash }
 *   // Daha önce görüldüyse: isPublished = false
 */

import { createHash } from "crypto";

/**
 * Verilen metin için deterministik SHA-256 hash üretir.
 * @param text  Ham markdown içerik
 * @returns     64 karakter hex string
 */
export function hashContent(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * İki hash'i güvenli biçimde karşılaştırır.
 * Kısa devre saldırılarına karşı timing-safe compare kullanılır.
 */
export function hashesEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    return bufA.length === bufB.length &&
      require("crypto").timingSafeEqual(bufA, bufB);
  } catch {
    return a === b;
  }
}

export default hashContent;

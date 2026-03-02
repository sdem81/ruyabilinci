/**
 * sceneExtractor.ts — Sahne Çıkarma Motoru
 *
 * Türkçe rüya başlıklarından sahne sinyalleri çıkarır:
 * eylemler, duygusal ton, yoğunluk, sosyal bağlam, risk seviyesi.
 *
 * Tamamen deterministik, O(n), dış API yok, <1ms / başlık.
 * 45k+ sayfa için production-safe.
 */

// ─── Dışa Aktarılan Tipler ──────────────────────────────────────────────────

export type DreamScene = {
  /** Tespit edilen eylem fiilleri */
  actions: string[];
  /** Duygusal ton */
  emotionalTone: "positive" | "negative" | "neutral" | "mixed";
  /** Yoğunluk seviyesi */
  intensity: "low" | "medium" | "high";
  /** Sosyal bağlam */
  socialContext: "alone" | "family" | "crowd" | "unknown";
  /** Risk seviyesi */
  riskLevel: "safe" | "warning" | "danger";
  /** Anlamlı anahtar kelimeler */
  keywords: string[];
};

// ─── Varsayılan Sahne (boş / geçersiz başlık) ───────────────────────────────

const DEFAULT_SCENE: DreamScene = {
  actions: [],
  emotionalTone: "neutral",
  intensity: "low",
  socialContext: "unknown",
  riskLevel: "safe",
  keywords: [],
};

// ─── Türkçe Küçük Harf ──────────────────────────────────────────────────────

function trLower(s: string): string {
  return s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
}

// ─── Durak Kelimeler ─────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "rüyada", "rüyasında", "görmek", "gördüğünü", "görme", "gören",
  "bir", "ve", "ile", "de", "da", "den", "dan", "ne", "olan",
  "nasıl", "nedir", "için", "ya", "veya", "bu", "ise", "olarak",
  "edilmesi", "yapılması", "çok", "daha", "gibi",
]);

// ═══════════════════════════════════════════════════════════════════════════════
//  1 — EYLEM TESPİTİ
// ═══════════════════════════════════════════════════════════════════════════════

interface ActionStem {
  stem: string;
  action: string;
  /** Bu kök varsa eylemi iptal eden alt-kök */
  exclude?: string;
}

const ACTION_STEMS: ActionStem[] = [
  { stem: "gör", action: "görmek" },
  { stem: "konuş", action: "konuşmak" },
  { stem: "kaç", action: "kaçmak" },
  { stem: "kovala", action: "kovalamak" },
  { stem: "kaybet", action: "kaybetmek" },
  { stem: "kaybol", action: "kaybetmek" },
  { stem: "bul", action: "bulmak" },
  { stem: "düş", action: "düşmek", exclude: "düşün" },
  { stem: "saldır", action: "saldırmak" },
  { stem: "sarıl", action: "sarılmak" },
  { stem: "evlen", action: "evlenmek" },
  { stem: "öl", action: "ölmek", exclude: "ölç" },
  { stem: "ölüm", action: "ölmek" },
  { stem: "ağla", action: "ağlamak" },
  { stem: "gül", action: "gülmek", exclude: "gülistan" },
  { stem: "koş", action: "koşmak" },
  { stem: "uç", action: "uçmak" },
  { stem: "yüz", action: "yüzmek" },
  { stem: "kavga", action: "kavga etmek" },
  { stem: "tartış", action: "tartışmak" },
];

function detectActions(lower: string): string[] {
  const found = new Set<string>();
  for (const { stem, action, exclude } of ACTION_STEMS) {
    if (lower.includes(stem)) {
      if (exclude && lower.includes(exclude)) continue;
      found.add(action);
    }
  }
  return Array.from(found);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  2 — DUYGUSAL TON
// ═══════════════════════════════════════════════════════════════════════════════

const NEGATIVE_STEMS = [
  "kork", "kaç", "saldır", "öl", "ağla", "kaybet",
  "düş", "kaybol", "kavga", "tartış", "kız",
];

const POSITIVE_STEMS = [
  "mutlu", "evlen", "sarıl", "gül", "sevin",
  "bul", "kucak", "güzel", "huzur",
];

function detectTone(lower: string): DreamScene["emotionalTone"] {
  let hasNeg = false;
  let hasPos = false;
  for (const s of NEGATIVE_STEMS) {
    if (lower.includes(s)) { hasNeg = true; break; }
  }
  for (const s of POSITIVE_STEMS) {
    if (lower.includes(s)) { hasPos = true; break; }
  }
  if (hasNeg && hasPos) return "mixed";
  if (hasNeg) return "negative";
  if (hasPos) return "positive";
  return "neutral";
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3 — YOĞUNLUK
// ═══════════════════════════════════════════════════════════════════════════════

const HIGH_INTENSITY = [
  "deprem", "ölüm", "saldırı", "kavga", "yangın",
  "savaş", "sel", "kaza", "patlama",
];

const MED_INTENSITY = [
  "tartış", "kaç", "kaybet", "düş",
  "kovala", "ağla", "kork", "kaybol",
];

function detectIntensity(lower: string): DreamScene["intensity"] {
  for (const w of HIGH_INTENSITY) {
    if (lower.includes(w)) return "high";
  }
  for (const w of MED_INTENSITY) {
    if (lower.includes(w)) return "medium";
  }
  return "low";
}

// ═══════════════════════════════════════════════════════════════════════════════
//  4 — SOSYAL BAĞLAM
// ═══════════════════════════════════════════════════════════════════════════════

const FAMILY_WORDS = [
  "aile", "anne", "baba", "kardeş", "dede", "nine",
  "eş", "oğul", "çocuk", "torun", "kayınvalide", "gelin", "damat",
];

const CROWD_WORDS = [
  "kalabalık", "insanlar", "topluluk", "grup", "cemaat", "düğün",
];

// "tek başına" iki kelimelik — title.includes() ile yakalanır
const ALONE_PHRASES = ["tek başına", "yalnız", "yapayalnız"];

function detectSocialContext(lower: string): DreamScene["socialContext"] {
  for (const w of ALONE_PHRASES) {
    if (lower.includes(w)) return "alone";
  }
  for (const w of FAMILY_WORDS) {
    if (lower.includes(w)) return "family";
  }
  for (const w of CROWD_WORDS) {
    if (lower.includes(w)) return "crowd";
  }
  return "unknown";
}

// ═══════════════════════════════════════════════════════════════════════════════
//  5 — RİSK SEVİYESİ
// ═══════════════════════════════════════════════════════════════════════════════

const DANGER_WORDS = [
  "ölüm", "saldır", "yangın", "deprem", "savaş", "patlama", "sel", "kaza",
];

const WARNING_WORDS = ["kaç", "kovala", "kavga", "tartış", "düş"];

function detectRisk(lower: string): DreamScene["riskLevel"] {
  for (const w of DANGER_WORDS) {
    if (lower.includes(w)) return "danger";
  }
  for (const w of WARNING_WORDS) {
    if (lower.includes(w)) return "warning";
  }
  return "safe";
}

// ═══════════════════════════════════════════════════════════════════════════════
//  6 — ANAHTAR KELİME ÇIKARMA
// ═══════════════════════════════════════════════════════════════════════════════

function extractKeywords(lower: string): string[] {
  const words = lower
    .split(/\s+/)
    .map((w) => w.replace(/[^\wğüşıöçĞÜŞİÖÇ]/gi, ""))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return Array.from(new Set(words));
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ANA FONKSİYON
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Rüya başlığından sahne sinyalleri çıkarır.
 *
 * Deterministik, O(n), <1ms / başlık.
 * Boş veya geçersiz başlık → varsayılan güvenli sahne döner.
 */
export function extractDreamScene(title: string): DreamScene {
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return { ...DEFAULT_SCENE };
  }

  const lower = trLower(title.trim());

  return {
    actions: detectActions(lower),
    emotionalTone: detectTone(lower),
    intensity: detectIntensity(lower),
    socialContext: detectSocialContext(lower),
    riskLevel: detectRisk(lower),
    keywords: extractKeywords(lower),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DEV DOĞRULAMA — import sonrası _devValidateScene() ile çağrılabilir
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Örnek başlıklar için sahne analizi sonuçlarını konsola yazar.
 * Yalnızca geliştirme / debug amacıyla kullanılır.
 */
export function _devValidateScene(): void {
  const samples = [
    "Rüyada Yılandan Kaçmak",
    "Rüyada Ölen Birini Görmek",
    "Rüyada Anne ile Konuşmak",
    "Rüyada Depremde Kalabalıktan Kaçmak",
    "Rüyada Evlenmek",
    "Rüyada Tek Başına Ağlamak",
    "Rüyada Kavga Etmek",
    "Rüyada Uçmak",
    "",
  ];
  for (const title of samples) {
    const scene = extractDreamScene(title);
    console.log(`\n--- "${title || "(boş)"}" ---`);
    console.log(`  Actions   : [${scene.actions.join(", ")}]`);
    console.log(`  Tone      : ${scene.emotionalTone}`);
    console.log(`  Intensity : ${scene.intensity}`);
    console.log(`  Social    : ${scene.socialContext}`);
    console.log(`  Risk      : ${scene.riskLevel}`);
    console.log(`  Keywords  : [${scene.keywords.join(", ")}]`);
  }
}

export default extractDreamScene;

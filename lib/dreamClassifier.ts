/**
 * Dream Title Classifier
 * Başlığı analiz ederek semantik tip döndürür.
 * Tüm içerik motoru bu sınıflandırmaya göre farklı blok seçer.
 */

export type DreamType =
  | "family"    // abi, anne, baba, kardeş, eş, sevgili, çocuk
  | "animal"    // yılan, köpek, kuş, at, arı, balık
  | "object"    // araba, ev, para, silah, anahtar, telefon
  | "action"    // uçmak, düşmek, koşmak, kavga, öpmek
  | "nature"    // su, deniz, ateş, dağ, yağmur, güneş
  | "body"      // diş, el, kan, göz, saç, yüz
  | "spiritual" // melek, cin, cennet, camii, dua, namaz
  | "emotion"   // korku, üzüntü, sevinç, ağlamak
  | "mixed";    // hiçbirine uymayan, genel

export interface ClassificationResult {
  type: DreamType;
  confidence: "high" | "medium" | "low";
  matchedKeyword?: string;
  subtheme?: string; // örn. family→"anne", animal→"yılan"
}

// ─── Anahtar kelime haritaları ────────────────────────────────────────────────

const FAMILY_KEYWORDS: Record<string, string> = {
  "anne": "anne", "ana": "anne", "annem": "anne",
  "baba": "baba", "babam": "baba",
  "abi": "erkek kardeş", "abim": "erkek kardeş", "kardeş": "kardeş",
  "abla": "kız kardeş", "ablam": "kız kardeş",
  "teyze": "teyze", "hala": "hala", "amca": "amca",
  "dede": "dede", "nine": "nine", "büyükannem": "büyükanne",
  "eş": "eş", "koca": "eş", "kocam": "eş", "karım": "eş",
  "sevgili": "sevgili", "sevgilim": "sevgili",
  "çocuk": "çocuk", "bebek": "bebek", "oğul": "oğul", "oğlum": "oğul",
  "kızım": "kız çocuğu", "torunu": "torun", "torun": "torun",
  "arkadaş": "arkadaş", "arkadaşım": "arkadaş",
  "komşu": "komşu", "hoca": "otorite figürü",
  "dayı": "dayı", "yeğen": "yeğen",
};

const ANIMAL_KEYWORDS: Record<string, string> = {
  "yılan": "yılan", "yilan": "yılan",
  "köpek": "köpek", "kopek": "köpek",
  "kedi": "kedi",
  "at": "at", "ata": "at",
  "inek": "inek", "öküz": "öküz", "boğa": "boğa",
  "aslan": "aslan", "kaplan": "kaplan",
  "kurt": "kurt", "tilki": "tilki",
  "kuş": "kuş", "kartal": "kartal", "güvercin": "güvercin",
  "arı": "arı", "kelebek": "kelebek", "örümcek": "örümcek",
  "fare": "fare", "sıçan": "sıçan",
  "balık": "balık", "yunus": "yunus",
  "kaplumbağa": "kaplumbağa", "timsah": "timsah",
  "ejderha": "ejderha", "canavar": "canavar",
  "tavuk": "tavuk", "horoz": "horoz",
  "keçi": "keçi", "koyun": "koyun", "domuz": "domuz",
  "fil": "fil", "maymun": "maymun", "zürafa": "zürafa",
  "ahtapot": "ahtapot", "yengeç": "yengeç",
};

const NATURE_KEYWORDS: Record<string, string> = {
  "su": "su", "suya": "su", "suda": "su",
  "deniz": "deniz", "okyanus": "okyanus",
  "nehir": "nehir", "irmak": "nehir", "dere": "dere",
  "ateş": "ateş", "yangın": "yangın", "alev": "ateş",
  "dağ": "dağ", "tepe": "tepe",
  "orman": "orman", "ağaç": "ağaç",
  "yağmur": "yağmur", "kar": "kar", "fırtına": "fırtına",
  "güneş": "güneş", "ay": "ay", "yıldız": "yıldız",
  "toprak": "toprak", "taş": "taş", "kaya": "kaya",
  "çiçek": "çiçek", "gül": "gül",
  "gökyüzü": "gökyüzü", "bulut": "bulut", "gökkuşağı": "gökkuşağı",
  "çöl": "çöl", "bataklık": "bataklık",
  "deprem": "deprem", "sel": "sel", "tsunami": "tsunami",
};

const BODY_KEYWORDS: Record<string, string> = {
  "diş": "diş", "dişlerin": "diş",
  "el": "el", "elin": "el", "ellerin": "el",
  "ayak": "ayak", "ayaklar": "ayak",
  "kan": "kan", "kanama": "kan",
  "göz": "göz", "gözler": "göz",
  "saç": "saç", "saçlar": "saç",
  "yüz": "yüz", "surat": "yüz",
  "kalp": "kalp", "yürek": "kalp",
  "mide": "mide", "kar": "karın",
  "kulak": "kulak", "burun": "burun",
  "deri": "deri", "tırnak": "tırnak",
  "kol": "kol", "bacak": "bacak",
  "kemik": "kemik", "et": "et",
  "beyin": "beyin", "kafatası": "kafa",
};

const SPIRITUAL_KEYWORDS: Record<string, string> = {
  "melek": "melek", "melekler": "melek",
  "cin": "cin", "şeytan": "şeytan", "iblis": "şeytan",
  "cennet": "cennet", "cehennem": "cehennem",
  "namaz": "namaz", "dua": "dua",
  "camii": "cami", "cami": "cami", "mescit": "cami",
  "kabe": "Kâbe", "hac": "hac", "umre": "umre",
  "peygamber": "peygamber", "hz": "peygamber",
  "allah": "Allah", "tanrı": "ilahi varlık",
  "kuran": "Kur'an", "ayet": "ayet",
  "oruç": "oruç", "ramazan": "Ramazan",
  "ruhlar": "ruh", "ölü": "öte dünya", "ahiret": "ahiret",
  "günah": "günah", "tövbe": "tövbe",
  "mucize": "mucize", "keramet": "keramet",
};

const ACTION_KEYWORDS: Record<string, string> = {
  "uçmak": "uçmak", "uçu": "uçmak",
  "düşmek": "düşmek", "düşü": "düşmek",
  "koşmak": "koşmak", "kaçmak": "kaçmak", "kaçı": "kaçmak",
  "yüzmek": "yüzmek", "boğulmak": "boğulmak",
  "dövmek": "kavga", "kavga": "kavga", "dövü": "kavga",
  "öpmek": "öpüşmek", "sarılmak": "sarılmak",
  "evlenmek": "evlilik", "evlendiğini": "evlilik",
  "ölmek": "ölüm", "öldürmek": "ölüm", "öldürme": "ölüm",
  "doğurmak": "doğum", "hamile": "hamilelik",
  "ağlamak": "ağlamak", "gülmek": "gülmek",
  "yemek yemek": "yemek", "yemek": "yiyecek",
  "içmek": "içmek",
  "sürünmek": "sürünmek",
  "inşaat": "inşaat", "bina yapmak": "inşaat",
  "okumak": "okumak", "yazmak": "yazmak",
  "para kazanmak": "kazanç", "para kaybetmek": "kayıp",
  "çalmak": "hırsızlık", "çalınmak": "hırsızlık",
  "saldırı": "saldırı", "saldırılmak": "saldırı",
  "kurtulmak": "kurtuluş", "kurtarılmak": "kurtuluş",
  "kaybolmak": "kaybolmak",
  "aramak": "arayış",
  "bulmak": "bulma",
};

const EMOTION_KEYWORDS: Record<string, string> = {
  "korku": "korku", "korkmak": "korku",
  "üzüntü": "üzüntü", "ağlama": "üzüntü",
  "sevinç": "sevinç", "mutluluk": "mutluluk", "neşe": "mutluluk",
  "endişe": "endişe", "kaygı": "kaygı",
  "öfke": "öfke", "kızgınlık": "öfke",
  "hüzün": "hüzün", "keder": "keder",
  "yalnızlık": "yalnızlık", "özlem": "özlem",
  "utanmak": "utanç", "utanç": "utanç",
  "kıskançlık": "kıskançlık",
  "nefret": "nefret",
  "umut": "umut", "ümit": "umut",
};

const OBJECT_KEYWORDS: Record<string, string> = {
  "araba": "araba", "otomobil": "araba", "araç": "araba",
  "ev": "ev", "ev görmek": "ev", "evi": "ev",
  "para": "para", "altın": "altın", "mücevher": "mücevher",
  "silah": "silah", "bıçak": "bıçak", "tabanca": "tabanca",
  "telefon": "telefon", "cep telefonu": "telefon",
  "anahtar": "anahtar", "kilit": "kilit",
  "kitap": "kitap", "defter": "kitap",
  "ilaç": "ilaç", "şırınga": "ilaç",
  "yüzük": "yüzük", "takı": "takı",
  "çanta": "çanta", "valiz": "valiz",
  "merdiven": "merdiven",
  "kapı": "kapı", "pencere": "pencere",
  "masa": "mobilya", "sandalye": "mobilya",
  "uçak": "uçak", "gemi": "gemi", "tren": "tren",
  "kıyafet": "kıyafet", "elbise": "kıyafet", "gömlek": "kıyafet",
  "yiyecek": "yiyecek", "ekmek": "yiyecek", "meyve": "yiyecek",
};

// ─── Sınıflandırıcı fonksiyon ────────────────────────────────────────────────

export function classifyDreamTitle(title: string): ClassificationResult {
  const lower = title.toLowerCase();

  // Öncelik sırası: spiritual > family > animal > body > nature > action > emotion > object > mixed
  const checks: Array<[DreamType, Record<string, string>]> = [
    ["spiritual", SPIRITUAL_KEYWORDS],
    ["family",    FAMILY_KEYWORDS],
    ["animal",    ANIMAL_KEYWORDS],
    ["body",      BODY_KEYWORDS],
    ["nature",    NATURE_KEYWORDS],
    ["action",    ACTION_KEYWORDS],
    ["emotion",   EMOTION_KEYWORDS],
    ["object",    OBJECT_KEYWORDS],
  ];

  for (const [type, map] of checks) {
    for (const [keyword, subtheme] of Object.entries(map)) {
      if (lower.includes(keyword)) {
        return {
          type,
          confidence: keyword.length >= 4 ? "high" : "medium",
          matchedKeyword: keyword,
          subtheme,
        };
      }
    }
  }

  return { type: "mixed", confidence: "low" };
}

/** Başlıktaki ana eylemi veya nesneyi temiz metin olarak döndürür */
export function extractCore(title: string): string {
  return title
    .replace(/^rüyada\s+/i, "")
    .replace(/^rüyasında\s+/i, "")
    .replace(/\s+görmek$/i, "")
    .replace(/\s+rüyası$/i, "")
    .trim();
}

export default classifyDreamTitle;

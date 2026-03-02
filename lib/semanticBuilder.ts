/**
 * Semantic Builder
 * Başlıktan anlamlı Türkçe varlıklar (entity) çıkarır.
 * İçerik motorları bu varlıkları doğal cümleler içinde kullanır —
 * {token} yer tutucusu ASLA kullanılmaz.
 */

import type { DreamType } from "./dreamClassifier";
import { classifyDreamTitle, extractCore } from "./dreamClassifier";
import { extractDreamScene, type DreamScene } from "./sceneExtractor";

// ─── Public Interface ────────────────────────────────────────────────────────

export interface SemanticEntities {
  /** Ana varlık: "köpek", "anne", "uçmak" vb. */
  primaryEntity: string;
  /** İkincil varlık / bağlam: "sokakta", "siyah", "koşarak" vb. */
  secondaryEntity: string;
  /** Bağlamsal terimler — cümle zenginleştirmede kullanılır */
  contextTerms: string[];
  /** Rüya tipi */
  type: DreamType;
  /** Doğal Türkçe ifade: "rüyada köpek görmek" */
  naturalPhrase: string;
  /** Kısa konu: "köpek" */
  core: string;
  /** Sahne analizi: eylemler, ton, yoğunluk, sosyal bağlam, risk */
  scene: DreamScene;
}

// ─── Durak kelimeler ─────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "rüyada", "rüyasında", "görmek", "gördüğünü", "görme",
  "olmak", "etmek", "yapmak", "ve", "ile", "veya", "için",
  "bir", "çok", "ne", "anlama", "gelir", "tabiri", "yorumu",
  "nasıl", "nedir", "demek", "ise", "bu", "de", "da",
]);

// ─── Bağlamsal terim havuzları ───────────────────────────────────────────────

const TYPE_CONTEXT: Record<DreamType, string[]> = {
  family: [
    "bağlanma ihtiyacı", "aile ilişkileri", "duygusal bağlar",
    "nesiller arası aktarım", "koruyucu içgüdü", "aile içi iletişim",
  ],
  animal: [
    "içgüdüsel dürtüler", "arketipsel semboller", "hayatta kalma güdüsü",
    "doğayla bağ", "ilkel enerji", "bilinçdışı güçler",
  ],
  object: [
    "maddi değerler", "sahiplik duygusu", "yaşam hedefleri",
    "güvenlik arayışı", "statü ve kimlik", "pragmatik düşünce",
  ],
  action: [
    "eylem dürtüsü", "kontrol ihtiyacı", "dönüşüm arzusu",
    "özgürleşme çabası", "içsel motivasyon", "karar alma süreci",
  ],
  nature: [
    "kozmik döngüler", "elementsel güçler", "doğal denge",
    "mevsimsel dönüşüm", "ekolojik farkındalık", "evrensel düzen",
  ],
  body: [
    "beden farkındalığı", "psikosomatik bağ", "fiziksel sağlık",
    "bedensel sinyaller", "zihin-beden bütünlüğü", "somatik deneyim",
  ],
  spiritual: [
    "manevi arayış", "ilahi mesajlar", "ruhsal olgunluk",
    "inanç boyutu", "tasavvufi bakış", "manevi arınma",
  ],
  emotion: [
    "duygusal işleme", "psikolojik denge", "duygusal zeka",
    "bastırılmış hisler", "içsel çatışma", "duygusal arınma",
  ],
  mixed: [
    "çok katmanlı anlam", "sembolik zenginlik", "bilinçdışı sentez",
    "karmaşık mesajlar", "bütüncül yorum", "derin sembolizm",
  ],
};

// ─── Sıfat zenginleştirme ────────────────────────────────────────────────────

const ENTITY_ENRICHMENT: Record<string, string[]> = {
  yılan: ["hem korku hem dönüşüm simgesi olan", "güçlü arketipsel anlamlar taşıyan"],
  köpek: ["sadakat ve güven duygusunun sembolü", "yakın ilişkileri temsil eden"],
  kedi: ["bağımsızlık ve sezgisel bilgeliğin temsilcisi", "gizemli ve zarif"],
  at: ["güç ve özgürlüğün arketipi", "hayat enerjisinin simgesi"],
  anne: ["koşulsuz sevgi ve güvenin kaynağı", "temel bağlanma figürü"],
  baba: ["otorite ve koruyuculuğun simgesi", "rehberlik figürü"],
  su: ["duygusal derinliğin evrensel metaforu", "arınma ve yenilenmenin simgesi"],
  ateş: ["hem yıkım hem aydınlanmanın simgesi", "tutku ve enerjinin temsilcisi"],
  diş: ["güç ve özgüven algısının bedendeki yansıması", "iletişim kapasitesinin sembolü"],
  para: ["değer ve güvenlik duygusunun temsili", "maddi kaygıların sembolik dili"],
  ev: ["kimlik ve sığınak duygusunun merkezi", "iç dünyanın mimari aynası"],
  araba: ["hayat yolculuğunun ve kontrol duygusunun sembolü", "ilerleme ve yönelimin imgesi"],
  bebek: ["yeni başlangıçların ve masumiyetin simgesi", "potansiyel ve kırılganlığın temsili"],
  uçmak: ["özgürlük ve sınırları aşma arzusunun dışavurumu", "yükselme ve perspektif kazanmanın imgesi"],
  düşmek: ["kontrol kaybı ve güvensizlik hissinin yansıması", "geçiş dönemlerinin sembolik ifadesi"],
  ölüm: ["dönüşüm ve yenilenmenin en güçlü arketipi", "bir dönemin kapanışının sembolü"],
  namaz: ["manevi bağlılık ve teslimiyetin ifadesi", "içsel huzur arayışının yansıması"],
  deniz: ["bilinçdışının uçsuz bucaksız derinliğinin imgesi", "duygusal kapasitenin sembolü"],
};

// ─── Ana fonksiyon ───────────────────────────────────────────────────────────

export function enrichWithEntities(
  title: string,
  type?: DreamType
): SemanticEntities {
  const classification = classifyDreamTitle(title);
  const resolvedType = type ?? classification.type;
  const core = extractCore(title);

  // Başlıktan anlamlı kelimeleri çıkar
  const words = title
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^\wğüşıöçĞÜŞİÖÇ]/gi, ""))
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  // Birincil varlık: sınıflandırıcıdan gelen subtheme veya ilk anlamlı kelime
  const primaryEntity =
    classification.subtheme || words[0] || core;

  // İkincil varlık: başlıktaki ikinci anlamlı kelime
  const remainingWords = words.filter(
    (w) => w !== primaryEntity && w !== classification.matchedKeyword
  );
  const secondaryEntity = remainingWords[0] || "";

  // Bağlamsal terimler: tip-bazlı + varlık bazlı zenginleştirme
  const contextTerms = [...TYPE_CONTEXT[resolvedType]];
  const enrichment = ENTITY_ENRICHMENT[primaryEntity];
  if (enrichment) {
    contextTerms.push(...enrichment);
  }

  // Doğal ifade oluştur
  const naturalPhrase = buildNaturalPhrase(core, resolvedType);

  // Sahne analizi
  const scene = extractDreamScene(title);

  return {
    primaryEntity,
    secondaryEntity,
    contextTerms,
    type: resolvedType,
    naturalPhrase,
    core,
    scene,
  };
}

// ─── Doğal Türkçe ifade üreticisi ───────────────────────────────────────────

function buildNaturalPhrase(core: string, type: DreamType): string {
  switch (type) {
    case "family":
      return `rüyada ${core} ile karşılaşmak`;
    case "animal":
      return `rüyada ${core} görmek`;
    case "object":
      return `rüyada ${core} ile ilgili bir sahne görmek`;
    case "action":
      return `rüyada ${core} deneyimlemek`;
    case "nature":
      return `rüyada ${core} görmek`;
    case "body":
      return `rüyada ${core} ile ilgili bir görüntü yaşamak`;
    case "spiritual":
      return `rüyada ${core} görmek`;
    case "emotion":
      return `rüyada yoğun ${core} hissi yaşamak`;
    case "mixed":
    default:
      return `rüyada ${core} görmek`;
  }
}

// ─── Deterministik seçici (seed-based) ───────────────────────────────────────

export function pickFromPool<T>(pool: T[], seed: string, offset = 0): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return pool[(Math.abs(hash) + offset) % pool.length];
}

export default enrichWithEntities;

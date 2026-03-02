/**
 * Intro Generator
 * Başlığa özgü, tip-farkındalıklı giriş cümlesi üretir.
 * Her sayfa ilk cümlede kendi başlığına özgü ifade taşımalı.
 */

import type { DreamType, ClassificationResult } from "../dreamClassifier";
import { classifyDreamTitle, extractCore } from "../dreamClassifier";

// ─── Eylem sözlüğü (fiil kökü → bağlamsal açıklama) ─────────────────────────

const actionContexts: Record<string, string> = {
  "dövmek":    "kavga veya şiddet içeren",
  "dövü":      "kavga veya şiddet içeren",
  "uçmak":     "özgürlük ve yükseliş temasına sahip",
  "uçu":       "özgürlük ve yükseliş temasına sahip",
  "düşmek":    "düşüş ve kontrol kaybı temasını barındıran",
  "düşü":      "düşüş ve kontrol kaybı temasını barındıran",
  "koşmak":    "acele veya kaçış içgüdüsünü yansıtan",
  "kaçmak":    "bir tehditten uzaklaşma çabasını simgeleyen",
  "ölmek":     "dönüşüm ve yenilenme sembolizmi taşıyan",
  "öldürmek":  "bastırılmış öfke ya da dönüşüm arzusu içeren",
  "öpmek":     "sevgi ve bağlılık duygusunu simgeleyen",
  "sarılmak":  "yakınlık ve güven ihtiyacını ortaya koyan",
  "evlenmek":  "ciddi bir bağlılık ya da dönüşüm temelli",
  "hamile":    "yeni bir başlangıç ya da yüklü sorumluluk içeren",
  "doğurmak":  "yeni bir yaratım ya da potansiyeli simgeleyen",
  "ağlamak":   "duygusal tahliye ve arınma ihtiyacını barındıran",
  "gülmek":    "iç neşe ve hafiflik hissini yansıtan",
  "yüzmek":    "duygularla baş etme kapasitesini simgeleyen",
  "boğulmak":  "bunaltıcı bir yükün ve çaresizlik hissinin dışavurumu olan",
  "çalmak":    "haksız kazanç korkusu ya da kıskançlığı simgeleyen",
  "kaybolmak": "yön arayışı ve kimlik belirsizliğini yansıtan",
  "aramak":    "bilinçdışının aktif bir arayış sürecinde olduğuna işaret eden",
  "bulmak":    "uzun süredir aranan bir cevabın eşiğini temsil eden",
  "saldırmak": "bastırılmış çatışma enerjisini açığa çıkaran",
  "kurtulmak": "uzun süren bir yükten arınma özlemini taşıyan",
};

// ─── Sıfat/vasfı zenginleştirme ──────────────────────────────────────────────

const familyContexts: Record<string, string> = {
  "anne":    "anne figürünün",
  "baba":    "baba otoritesinin",
  "abi":     "abi/erkek kardeş ilişkisinin",
  "abla":    "ablalık rolünün",
  "kardeş":  "kardeşlik bağının",
  "eş":      "eş ilişkisinin",
  "sevgili": "duygusal partnerin",
  "çocuk":   "çocuk figürünün",
  "bebek":   "bebek kırılganlığının",
  "dede":    "dede bilgeliğinin",
  "nine":    "nine şefkatinin",
  "teyze":   "teyze/dayı figürünün",
  "amca":    "amca figürünün",
  "arkadaş": "samimi bir dost figürünün",
};

const animalContexts: Record<string, string> = {
  "yılan":    "tehlike, ihanet ya da dönüşümün arketipik simgesi olan yılanın",
  "köpek":    "sadakat ve güven duygusunun evrensel sembolü olan köpeğin",
  "kedi":     "bağımsızlık ve sezgisel bilgeliğin simgesi olan kedinin",
  "at":       "güç, özgürlük ve hayat enerjisinin simgesi olan atın",
  "kuş":      "özgürlük, mesaj ve aşkınlığın simgesi olan kuşun",
  "arı":      "çalışkanlık, topluluk ve bereketin simgesi olan arının",
  "aslan":    "güç, cesaret ve otorite sembolü olan aslanın",
  "balık":    "bilinçdışı derinlikler ve özgür akışın simgesi olan balığın",
  "örümcek":  "yaratıcılık ve ağ kurma yetisinin sembolü olan örümceğin",
  "fare":     "küçük kaygılar ve dikkat gerektiren durumların simgesi olan farenin",
  "kurt":     "özgürlük ve vahşi güdülerin temsilcisi olan kurdun",
  "kartal":   "yüksek vizyon ve manevi yükselişin simgesi olan kartalın",
};

// ─── Tip başına intro şablonları ─────────────────────────────────────────────

type IntroTemplate = (title: string, core: string, result: ClassificationResult) => string;

const introTemplates: Record<DreamType, IntroTemplate[]> = {
  family: [
    (title, core, r) => {
      const ctx = r.subtheme ? familyContexts[r.subtheme] ?? `${r.subtheme} figürünün` : "bir aile üyesinin";
      return `"${title}" rüyası, bilinçaltımızda ${ctx} nasıl yer tuttuğunu ustaca yansıtan, duygusal açıdan yoğun bir rüya tecrübesidir.`;
    },
    (title, core, r) => {
      const who = r.subtheme ?? "bir aile bireyi";
      return `Rüyanızda ${who} görmek, gerçek hayattaki bu ilişkinin ne denli derin izler bıraktığının bilinçaltından gelen en güçlü kanıtlarından biridir.`;
    },
    (title, core) =>
      `"${core}" rüyası, aile dinamiklerinin ve duygusal bağların bilinçaltımıza yansıdığı, anlam katmanları bakımından son derece zengin bir deneyimdir.`,
    (title, core, r) => {
      const who = r.subtheme ?? "aile üyesi";
      return `Rüyada ${who} ile karşılaşmak; paylaşılan anıların, çözüme kavuşmamış duyguların ya da karşılıksız kalan ifadelerin bilinç yüzeyine taşındığı nadir ve değerli anlardandır.`;
    },
    (title) =>
      `"${title}" gibi güçlü bir aile rüyası, rüya bilimleri açısından bilinçaltının en derin mesajlarını barındıran rüyalar arasında yer almaktadır.`,
  ],

  animal: [
    (title, core, r) => {
      const ctx = r.matchedKeyword ? (animalContexts[r.matchedKeyword] ?? `${r.matchedKeyword} sembolünün`) : "hayvan figürünün";
      return `"${title}" rüyası, ${ctx} bilinçaltımızdaki karşılığını keşfetmek açısından son derece anlamlı ve içgörü dolu bir rüya deneyimidir.`;
    },
    (title, core, r) => {
      const animal = r.subtheme ?? "hayvan";
      return `Rüyada ${animal} görmek, evrensel semboller arasında en köklü anlamlara sahip olanlardan biridir; hem bireysel hem de kültürel katmanlarda derin izler taşır.`;
    },
    (title, core, r) => {
      const animal = r.subtheme ?? "hayvan";
      return `${animal} figürü, rüya yorumunun en kadim ve köklü temalarından birini oluşturur; bu sembol, bilinçdışının içgüdüsel sesini en etkileyici biçimde dile getirir.`;
    },
    (title) =>
      `"${title}" rüyası, insanın doğayla ve kendi ilkel içgüdüleriyle kurduğu derin bağı sembolik bir dille anlatan, psikolojik açıdan zengin bir rüya deneyimidir.`,
    (title, core, r) => {
      const animal = r.subtheme ?? "hayvan";
      return `Rüyalarımızda ${animal} karşımıza çıktığında, bilinçdışımız bize içgüdüsel bilgeliğin kapılarını aralıyor olabilir; bu mesajın ne ifade ettiğini anlamak büyük bir içgörü sunacaktır.`;
    },
  ],

  object: [
    (title, core, r) => {
      const obj = r.subtheme ?? "nesne";
      return `"${title}" rüyası, ${obj} sembolünün bilinçaltımızdaki yansımalarını araştırmak için son derece verimli ve değerli bir rüya deneyimini temsil etmektedir.`;
    },
    (title, core, r) => {
      const obj = r.subtheme ?? "nesne";
      return `Rüyada ${obj} görmek; maddi dünyanın, hedeflerin ve değerlerin bilinçaltımıza nasıl yansıdığını anlamamız için güçlü bir sembolik pencere açmaktadır.`;
    },
    (title) =>
      `"${title}" rüyası, bilinçaltımızın maddi ve sembolik gerçeklikleri nasıl harmanlayıp işlediğini gözler önüne seren derin ve çok katmanlı bir rüya tecrübesidir.`,
    (title, core, r) => {
      const obj = r.subtheme ?? "nesne";
      return `${obj} sembolü, rüya yorumunun evrensel dağarcığında hem bireysel arzuları hem de daha geniş ilişkileri kodlayan zengin anlamlara sahiptir.`;
    },
    (title) =>
      `"${title}" rüyasında bilinçaltını arayanlar, genellikle hayatlarındaki önemli değerlerin, hedeflerin ya da korku ve arzuların simgesel bir yansımasıyla karşılaştıklarını bildirmektedir.`,
  ],

  action: [
    (title, core, r) => {
      const actionCtx = r.matchedKeyword ? (actionContexts[r.matchedKeyword] ?? "belirgin bir eylemi barındıran") : "aktif bir eylemi içeren";
      return `"${title}" rüyası, ${actionCtx} ve bu nedenle bilinçaltımızın etkin süreçleri açısından özellikle dikkat gerektiren bir rüya deneyimidir.`;
    },
    (title, core, r) => {
      const act = r.subtheme ?? "eylem";
      return `Rüyada ${act} deneyimlemek, bilinçaltımızın bu temayla ilgili dürtü, istek ya da korkunun üzerine aktif biçimde çalıştığına dair güçlü bir sinyal vermektedir.`;
    },
    (title) =>
      `"${title}" rüyası, bilinçaltımızın en güçlü tema kategorilerinden birini oluşturan eylem rüyaları arasında yer almakta ve psikolojik açıdan son derece anlamlı mesajlar barındırmaktadır.`,
    (title, core, r) => {
      const act = r.subtheme ?? "bu eylem";
      return `Rüya geleneğinde ${act} sahnesinin sıkça karşımıza çıkması bir rastlantı değildir; bu evrensel bilinçdışı temi hem bireysel hem de kültürel katmanlarda önemli anlamlar üretmektedir.`;
    },
    (title) =>
      `"${title}" rüyası, bilinçaltının tamamlanmamış bir eylemi ya da güçlü bir arzuyu sembolik sahnelerle ifade ettiği, derin anlam katmanları barındıran bir rüya tecrübesidir.`,
  ],

  nature: [
    (title, core, r) => {
      const elem = r.subtheme ?? "doğa unsuru";
      return `"${title}" rüyası, ${elem} sembolünün bilinçaltımızdaki derin rezonansını keşfetmek açısından son derece anlamlı ve içgörü dolu bir rüya deneyimidir.`;
    },
    (title, core, r) => {
      const elem = r.subtheme ?? "doğal unsur";
      return `Rüyada ${elem} görmek; evrenin döngüsel düzeni, duygusal akışlarımız ve içsel dönüşüm süreçlerimiz arasındaki derin bağı sembolik bir dille gözler önüne serer.`;
    },
    (title) =>
      `"${title}" rüyası, binlerce yıldır insanlığın ortak rüya sembolizmi arasında yer alan doğa imgelerinden birini barındırmakta ve psikolojik açıdan zengin mesajlar taşımaktadır.`,
    (title, core, r) => {
      const elem = r.subtheme ?? "doğa";
      return `${elem} unsuru, hem Jung'un arketip teorisinde hem de İslami rüya yorumunda güçlü sembolik çağrışımlara sahiptir ve "rüyada ${core}" deneyimi tam da bu köklü geleneğin izinde yorumlanmayı hak etmektedir.`;
    },
    (title) =>
      `"${title}" rüyası, bilinçaltının bu güçlü doğa imgesini seçmesini, o anın psikolojik ve duygusal ihtiyaçları açısından son derece anlamlı bir mesaj olarak değerlendirmek gerekmektedir.`,
  ],

  body: [
    (title, core, r) => {
      const part = r.subtheme ?? "beden";
      return `"${title}" rüyası, ${part}ın bilinçaltımızdaki karşılığını araştırmak açısından son derece anlamlı ve psikosomatik bağlantılar bakımından dikkat çekici bir rüya deneyimidir.`;
    },
    (title, core, r) => {
      const part = r.subtheme ?? "beden uzvu";
      return `Rüyada ${part} görmenin psikolojik ve kültürel sembolizmi, bireysel yaşam deneyimleriyle iç içe geçtiğinde, bu rüyayı anlamanın gerçek derinliği ortaya çıkmaktadır.`;
    },
    (title) =>
      `"${title}" rüyası, beden-zihin bütünlüğünün rüya dilindeki en çarpıcı örneklerinden birini oluşturmakta ve bilinçaltımızın bedensel farkındalıkla nasıl konuştuğunu gözler önüne sermektedir.`,
    (title, core, r) => {
      const part = r.subtheme ?? "beden unsuru";
      return `${part} imgesi, hem psikanalitik hem de geleneksel rüya yorumunda ayrıcalıklı bir yere sahiptir; bu rüya, o köklü anlam havzasından içgörüler sunmaktadır.`;
    },
    (title) =>
      `"${title}" rüyası, bilinçaltımızın bedensel deneyimleri nasıl sembolik dile çevirdiğini ve bu süreçte hangi mesajları ürettiğini anlamak açısından son derece kıymetli bir içgörü fırsatı sunmaktadır.`,
  ],

  spiritual: [
    (title, core, r) => {
      const spirit = r.subtheme ?? "manevi figür";
      return `"${title}" rüyası, ${spirit} sembolünü barındıran ve İslami rüya geleneğinde özel bir öneme sahip olan, manevi açıdan son derece derin bir rüya tecrübesidir.`;
    },
    (title, core, r) => {
      const spirit = r.subtheme ?? "manevi unsur";
      return `Rüyada ${spirit} görmek; İslam alimleri tarafından üzerinde en özenle durulan ve özel dikkat gerektiren rüya kategorileri arasında gösterilmektedir.`;
    },
    (title) =>
      `"${title}" rüyası, dini ve manevi boyutlarıyla son derece zengin bir içerik taşımakta; bu nedenle hem geleneksel hem de modern rüya yorumunun kesiştiği bir noktada değerlendirilmeyi hak etmektedir.`,
    (title, core, r) => {
      const spirit = r.subtheme ?? "manevi sembol";
      return `${spirit} figürü, rüya yorumunun Türk-İslam geleneğinde en köklü ve en itinalı biçimde ele alınan temalarından birini oluşturmakta; bu rüya da o zengin mirasın bir parçasına dahildir.`;
    },
    (title) =>
      `"${title}" gibi güçlü bir manevi rüya, Hz. Peygamber'in üç kısma ayırdığı salih rüyalar çerçevesinde dikkatle değerlendirilmeli ve hayra yorulmalıdır.`,
  ],

  emotion: [
    (title, core, r) => {
      const emo = r.subtheme ?? "duygu";
      return `"${title}" rüyası, ${emo} duygu deneyiminin bilinçaltına yansımalarını inceleyen, duygusal zeka açısından son derece içgörü dolu bir rüya tecrübesidir.`;
    },
    (title, core, r) => {
      const emo = r.subtheme ?? "duygu";
      return `Rüyada yoğun ${emo} hissi yaşamak, bilinçaltımızın duygusal yazışımını ve iç dünyamızdaki işlenmemiş deneyimleri dışa vurma biçimidir.`;
    },
    (title) =>
      `"${title}" rüyası, bilinçaltımızın bastırılmış ya da henüz tam olarak işlenmemiş duygusal içerikleri sembolik dille ifade etme çabasının canlı bir yansımasıdır.`,
    (title, core, r) => {
      const emo = r.subtheme ?? "duygu";
      return `${emo} temalı rüyalar, duygusal zeka araştırmacıları tarafından en bilgilendirici rüya kategorileri arasında sayılmakta ve bireyin duygusal işleme kapasitesi hakkında değerli ipuçları sunmaktadır.`;
    },
    (title) =>
      `"${title}" rüyası, duygusal iyileşme sürecinin bilinçaltı boyutunu anlamak için son derece kıymetli bir kapı aralamakta ve bu yolda önemli bir içgörü sunmaktadır.`,
  ],

  mixed: [
    (title) =>
      `"${title}" rüyası, farklı sembol katmanlarını bir arada barındıran ve bu çok boyutlu yapısıyla tekil kategorilere sığmayan, yorumlanması özellikle ilgi çekici bir rüya deneyimidir.`,
    (title, core) =>
      `Rüyada "${core}" temasının karşımıza çıkması, bilinçaltımızın birden fazla alanı aynı anda işlediğine ve içe dönük bir sentez sürecinde olduğuna işaret etmektedir.`,
    (title) =>
      `"${title}" rüyası, pek çok sembolü eş zamanlı barındıran yapısıyla bilincin ne denli çok katmanlı ve yaratıcı çalıştığına dair çarpıcı bir örnek oluşturmaktadır.`,
    (title, core) =>
      `"${core}" içerikli bu rüya, bilinçaltının farklı endişeleri, arzuları ve deneyimleri aynı anda nasıl harmanlayıp bütünleştirdiğini anlamamız bakımından son derece değerli bir çalışma malzemesidir.`,
    (title) =>
      `"${title}" rüyası; insanın iç dünyasındaki karmaşıklığın, zenginliğin ve eş zamanlı çatışmaların sembolik bir yansıması olarak rüya tabirinin büyüleyici örneklerinden birini teşkil etmektedir.`,
  ],
};

// ─── Ana fonksiyon ────────────────────────────────────────────────────────────

export function generateIntro(title: string): string {
  const result = classifyDreamTitle(title);
  const core = extractCore(title);
  const templates = introTemplates[result.type];

  // Seed: başlığın karakterlerine göre deterministik
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % templates.length;

  return templates[idx](title, core, result);
}

export default generateIntro;

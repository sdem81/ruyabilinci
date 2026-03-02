/**
 * contentBlocks.ts — TAM YENİDEN YAZIM (v2)
 *
 * Her DreamType için benzersiz anlatım sesi, metafor ve analiz çerçevesi.
 * İçerik doğal Türkçe olarak oluşturulur — {token} yer tutucusu KULLANILMAZ.
 *
 * Mimari:
 *   TypeProfile  → tip bazlı sözcük, metafor, çerçeve ve içgörü havuzları
 *   buildParagraph → profil + varlık ismi + bölüm bilgisinden paragraf oluşturur
 *   getBlock     → seed bazlı deterministik seçimle benzersiz ContentBlock döndürür
 *
 * Her bölüm × tip çifti için 4 yapısal kalıp × profil havuz çeşitliliği
 * = 24+ benzersiz paragraf kombinasyonu (>12 gereksinimi karşılar).
 */

import type { DreamType } from "./dreamClassifier";
import type { SemanticEntities } from "./semanticBuilder";
import type { DreamScene } from "./sceneExtractor";

// ─── Dışa Aktarılan Tipler ──────────────────────────────────────────────────

export type Section =
  | "positive"
  | "negative"
  | "psychological"
  | "religious"
  | "advice";

export interface ContentBlock {
  heading: string;
  body: string;
}

// ─── Hash Yardımcıları ──────────────────────────────────────────────────────

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], h: number, offset = 0): T {
  return arr[(h + offset) % arr.length];
}

// ─── TypeProfile Arabirimi ──────────────────────────────────────────────────

interface TypeProfile {
  label: string;
  adjectives: string[];   // min 8
  metaphors: string[];    // min 6
  frameworks: string[];   // min 4
  /** Tip'e özgü açılış cümleleri — hiçbirinde {token} slot yok */
  openings: string[];     // min 12
  positive: string[];     // min 12
  negative: string[];     // min 12
  psych: string[];        // min 12
  spiritual: string[];    // min 12
  advice: string[];       // min 12
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TİP PROFİLLERİ — her tip kendine özgü sözcük dağarına sahiptir
// ═══════════════════════════════════════════════════════════════════════════════

const PROFILES: Record<DreamType, TypeProfile> = {
  /* ── FAMILY ─────────────────────────────────────────────────────────── */
  family: {
    label: "aile",
    adjectives: [
      "şefkatli", "koruyucu", "sıcak", "güvenli",
      "samimi", "kucaklayıcı", "derin", "köklü",
    ],
    metaphors: [
      "aile bağlarının görünmez ama güçlü ağı",
      "koşulsuz sevginin bilinçaltındaki yansıması",
      "nesiller arası aktarılan duygusal miras",
      "yuvanın sıcaklığını taşıyan bir hatıra",
      "kök salmanızı sağlayan verimli toprak",
      "ruhunuzun en güvenli limanı",
    ],
    frameworks: [
      "bağlanma kuramı", "aile sistemleri yaklaşımı",
      "nesiller arası aktarım", "ilişkisel psikoanaliz",
    ],
    openings: [
      "Uyku sırasında aile bireyleriyle yaşanan imgeler, nesiller arası aktarılan duygusal örüntülerin en diri hâline dönüşür.",
      "Aile temalı rüyalar; bağlanma tarihimizi, sevgi dilimizi ve en köklü korku ile özlemlerimizi sembolik bir sahneye taşır.",
      "Bilinçaltının aile figürlerini bu denli canlı tutmasının ardında, hayatımızı şekillendiren ilk ilişki deneyimlerinin silinmez izi yatmaktadır.",
      "İlk güven deneyimlerimizi biçimlendiren ebeveyn ve kardeş ilişkileri, yetişkin rüyalarında da güçlü bir sembolik dil kullanmayı sürdürür.",
      "Aile ortamından taşınan duygusal miras; hem iyileştirici hem de dönüştürücü biçimlerde rüya sahnesine yansıyabilir.",
      "Güvenli bir liman olarak kodlanan ya da kırılgan dinamiklerle örülen aile deneyimi, rüyada farklı ama tanıdık yüzlerle karşımıza çıkar.",
      "Nesiller boyu aktarılan duygu kalıpları ve sessiz kurallar, aile temalı rüyaların temel dokusunu oluşturur.",
      "Koşulsuz sevgi veya çözülmemiş hayal kırıklıkları; her ikisi de aile temalı rüyaların içeriğini belirleyen başlıca etkenler arasındadır.",
      "Psikoloji, aile rüyalarını yetişkin dönem ilişki kalıplarını anlamlandırmak için eşsiz bir pencere olarak değerlendirir.",
      "Bir aile figürünün rüyada güçlü biçimde belirmesi, onunla ilgili tamamlanmamış bir duygu sürecinin hâlâ aktif olduğunun işaretidir.",
      "Aile figürleri bilinçaltında yalnızca birer insan olmaktan çıkıp ait olma, güvenlik ve kimlik gibi varoluşsal ihtiyaçların sembolüne dönüşür.",
      "Kişilik gelişimimizin en kritik dönemini atlattığımız zemin olan aile; rüyada çoğu zaman en ham ve en dürüst hissiyatlarımızla yeniden canlanır.",
    ],
    positive: [
      "Ailenizle aranızdaki bağın derinliğini ve sağlamlığını gözler önüne serer",
      "Yakınlarınızla paylaştığınız sevginin bilinçaltınızda onaylandığını gösterir",
      "Aile içi huzurun güçlü bir döneme girdiğine işaret eder",
      "İçsel güvenlik hissinizin sağlam temellere oturduğunu simgeler",
      "Sevdiklerinizin hayatınızdaki konumunun kıymetini hatırlatır",
      "Aile birliğinin yarattığı derin huzurun bir dışavurumudur",
      "Çocukluktan bu yana taşınan olumlu bağlanma deneyiminin bilinçaltı tarafından onaylandığını yansıtır",
      "Güvenli aile ilişkilerinin kişiyi zorlu dönemlerde ayakta tuttuğunu hatırlatan bir imgedir",
      "Aile içindeki sağlıklı sınırların ve sevginin dengeli biçimde kurulduğuna işaret eder",
      "Yakınlarınıza duyduğunuz minnetin bilinçaltı düzeyinde güçlü bir enerji olarak pekiştiğini gösterir",
      "Aile sistemindeki iyileşmenin ve olgunlaşmanın rüya diline yansımasıdır",
      "Nesiller arası aktarılan sevgi mirasının hayatınızı besleyen bir kaynak olduğunu simgeler",
    ],
    negative: [
      "Çözüme kavuşmamış aile dinamikleri bilinçaltınızda aktif kalıyor olabilir",
      "Geçmişten kalan ilişkisel yaralar iyileşmeye ihtiyaç duyuyor",
      "Yakınlarınızla aranızdaki duygusal mesafe sizi rahatsız ediyor olabilir",
      "Söylenmemiş sözlerin ağırlığı bilinçdışına taşmış görünmektedir",
      "Koruyuculuk güdünüz size aşırı sorumluluk yüklüyor olabilir",
      "Beklentiler ile bireysel sınırlar arasındaki denge sarsılmış olabilir",
      "Aile içinde aktarılan olumsuz kalıpların bilinçdışında tekrar ettiğine işaret edebilir",
      "Tamamlanmamış bir yas süreci veya kayıp acısı bu rüyayı tetikliyor olabilir",
      "Aile içindeki rol çatışmaları veya kimlik baskısı bilinçaltında derin izler bırakmıştır",
      "Çocukluktan taşınan duygusal yaralar, güvenilir bir destek olmadan iyileşmekte güçlük çekiyor",
      "Ailenin beklentileri ile özgün kimliğiniz arasındaki gerilim bilinçdışına sızmıştır",
      "Koşullu sevgi deneyimi, güvensiz bağlanma örüntülerini yetişkin dönemde de aktif tutmaktadır",
    ],
    psych: [
      "Bağlanma stiliniz rüyanın duygusal tonunu doğrudan belirlemektedir",
      "Aile figürleri iç dünyanızdaki güven-güvensizlik dengesini yansıtır",
      "Çocukluk döneminde oluşan ilişki kalıpları yetişkin rüyalarında sembolik tekrar eder",
      "Ebeveyn arketipleri kişinin kendine ebeveynlik yapma kapasitesini simgeler",
      "Aile üyeleri bilinçdışında arketipsel roller üstlenebilir",
      "İlişkisel şemalar rüya sahnesinin duygusal atmosferini biçimlendirir",
      "Nesiller arası aktarım kuramı, aileden miras alınan bilinçdışı örüntüleri rüya içeriklerinde izler",
      "Bowlby'nin bağlanma teorisi çerçevesinde bu rüya, birincil bakım vericilerle kurulan erken ilişkilerin izini taşır",
      "İç çocuk terapisi bu tür rüyaları tamamlanmamış gelişimsel ihtiyaçların sesi olarak değerlendirir",
      "Aile sistemleri yaklaşımında her üye bir role sahiptir; rüyadaki figürler bu rolleri sembolik olarak canlandırır",
      "Aktarım olgusuna göre erken ilişki deneyimleri, yetişkin dönemde başkalarına yansıtılır; rüyalar bu yansımanın sahnesine dönüşebilir",
      "Yetişkin bağlanma anketi bulgularıyla örtüşen biçimde bu rüya, yakın ilişkilerdeki güvenlik düzeyinin haritasını çizer",
    ],
    spiritual: [
      "İslami gelenekte aile rüyaları bereket ve rahmetin habercisi sayılır",
      "Ebeveyn rüyaları saygı ve şefkatin önemini vurgulayan manevi çağrılardır",
      "Aile birliğini simgeleyen imgeler manevi huzurun ve toplumsal ahengin izi olarak yorumlanır",
      "Peygamber sünnetinde aile bağları en kutsal emanetler arasında zikredilir",
      "Yakın akrabaları rüyada görmek dua ve bağışlanma ihtiyacının manevi bir çağrısı olabilir",
      "Aile fertleriyle buluşma sahneleri kavuşma umudunun sembolik ifadesi kabul edilir",
      "Sıla-i rahim emrini hatırlatan bu rüya, akrabalarla ilişkileri onarmaya yönelik manevi bir rehberlik taşır",
      "Vefat etmiş yakınları görmek onlar için dua edilmesi ve ruhlarına Fatiha okunması çağrısı olarak yorumlanır",
      "Aile içi sevgi ve saygının ihmal edildiği dönemlerde bilinçaltının manevi bir hatırlatma mekanizması devreye giriyor olabilir",
      "Tasavvufi gelenekte aile bağı, dünya ile ahiret arasındaki manevi köprülerin en somut olanıdır",
      "Anne veya baba görmek; onlara karşı yerine getirilmemiş bir sorumluluğun ve hakkın bilinçaltı çağrısı olabilir",
      "İslam ahlakında aile, toplumsal dokunun en temel birimi olarak kutsanmıştır; bu rüya o önemi hatırlatır",
    ],
    advice: [
      "Aile bireylerinizle açık ve samimi bir iletişim kurmayı yeniden gözden geçirebilirsiniz",
      "Çözülmemiş meseleleri güvenli bir ortamda konuşmaya açmak besleyici olabilir",
      "Bu rüyayı sevdiklerinize zaman ayırmanız için bir davet olarak görebilirsiniz",
      "Bağlanma kalıplarınızı profesyonel destek alarak keşfetmeyi düşünebilirsiniz",
      "Geçmişteki duygusal incelemeleri bugün iyileştirmek ilişkilerinizi güçlendirir",
      "Ailenizle paylaştığınız olumlu anıları bilinçli hatırlamak ruhen besleyicidir",
      "Sınır koyma pratiği, hem kendinizi hem de aile bireylerini daha sağlıklı bir ilişki dinamiğine taşır",
      "Çocukluğunuzdaki bir anıyı veya duyguyu şimdi daha olgun bir gözle yeniden değerlendirmeye çalışın",
      "Aile terapisi, bu tür yoğun rüyaların ardındaki sistem dinamiklerini keşfetmeye çok uygun bir araçtır",
      "Vefat etmiş yakınlar için dua etmek ve hayır yapmak bu rüyanın ardından manevi bir rahatlama sağlayabilir",
      "Aile içindeki diyalogu küçük ama anlamlı jestlerle yeniden canlandırmak uzun vadeli iyileşmeyi destekler",
      "Kendi ihtiyaçlarınızı da aile ihtiyaçları kadar önemsemeyi öğrenmek bu dönemi kolaylaştıracaktır",
    ],
  },

  /* ── ANIMAL ─────────────────────────────────────────────────────────── */
  animal: {
    label: "hayvan",
    adjectives: [
      "vahşi", "içgüdüsel", "kadim", "ilkel",
      "çevik", "gizemli", "doğal", "arketipsel",
    ],
    metaphors: [
      "bilinçaltının totemi",
      "içgüdüsel pusulanızın dile gelmiş hâli",
      "doğanın insana tuttuğu ayna",
      "ruhun vahşi ve özgür yanının sesi",
      "evrimsel belleğin derin izi",
      "doğal dünyanın sembolik elçisi",
    ],
    frameworks: [
      "Jungcu arketip analizi", "totemizm ve hayvan sembolizması",
      "etolojik yaklaşım", "kolektif bilinçdışı kuramı",
    ],
    openings: [
      "Jung'un kolektif bilinçdışı kavramının en çarpıcı biçimde somutlaştığı arketiplerden biri olan hayvan imgesi, rüyada güçlü bir anlam derinliği açar.",
      "İnsanlığın en kadim sembolik dilinin günümüze taşınan canlı temsilcisi olan hayvan figürü, uykuda egonun sansürüne takılmadan özgürce konuşur.",
      "Evrimsel belleğimizin derinlerinden yükselen hayvan sembolleri, farklı kültürlerin paylaştığı ortak bir psikolojik rezonans taşır.",
      "İçgüdülerin, güdülerin ve bastırılmış doğal enerjinin temsilcisi olarak hayvan; rüya sahnesinde ego sınırlarını zorlayan bir varlık sergiler.",
      "Totemizm geleneğinden Jungcu arketip analizine uzanan geniş bir yorumlama repertuarı, hayvan rüyalarını özellikle zengin kılar.",
      "Hayvanın doğası — saldırgan mı, uysal mı — rüyanın mesajını doğrudan biçimlendiren temel bir değişkendir; bu ayrımı dikkate almak yorumu derinleştirir.",
      "Pek çok kültürde totemik anlam taşıyan hayvan figürü, rüyada görüldüğünde kişisel dönüşümün ya da içgüdüsel bir uyarının habercisi olabilir.",
      "Bilinçdışının vahşi ve özgür yüzünü temsil eden hayvan imgesi; rüya sahnesinde hem korkutucu hem de özgürleştirici bir enerji taşıyabilir.",
      "Doğal yaşamdan kopuk modern insanın bilinçaltı, hayvan imgesini ata yadigârı içgüdüsel bilgeliğin ve korunma güdüsünün taşıyıcısı olarak kullanır.",
      "Hayvanla karşılaşma sahnesi, egonun kontrol edemediği güçlü bir içgüdüsel dinamiğin yüzeye çıkması anlamına gelebilir.",
      "Rüyadaki hayvanın türü ve davranışı; bilinçdışının mesajını kişiselleştiren, yorumun hassasiyetini belirleyen en önemli öğelerden biridir.",
      "Etolojik psikoloji hayvan davranışlarını gözlemleyerek insan içgüdülerine ayna tutar; rüyadaki hayvan da bu aynalamanın sembolik sahnesidir.",
    ],
    positive: [
      "İçgüdülerinizin sizi doğru yöne taşıdığının güçlü bir işaretidir",
      "Doğanızla uyum içinde olduğunuzu ve yaşam enerjinizin canlılığını gösterir",
      "Sezgisel zekânızın tercihleri doğru biçimde yönlendirdiğine işaret eder",
      "İçsel gücünüzün farkına varmanız için bilinçaltınızın verdiği bir mesajdır",
      "Hayatta kalma ve büyüme güdünüzün sağlıklı çalıştığını yansıtır",
      "Doğal potansiyelinizin ortaya çıkmaya hazır olduğunu simgeler",
      "Totemik anlayışta bu hayvan simgesi; koruma, rehberlik ve güç gibi nitelikleri size taşıyor olabilir",
      "İçgüdüsel bir uyum içinde olduğunuzu gösteren bu rüya, doğru kararları sezgisel olarak verme kapasitenizi doğrular",
      "Hayvanın dinamik enerjisi, hayatınızın bu döneminde bir atılım için bilinçaltı onayını simgeliyor olabilir",
      "Doğayla kurduğunuz derin ama bilinçsiz bağın güçlendiğini ve sizi besleyen bir dönemde olduğunuzu yansıtır",
      "Bilinçaltınız bu imgelem aracılığıyla sizi içgüdülerinize güvenmeye ve sezgisel bilgeliğinizi kullanmaya yönlendirmektedir",
      "Rüyadaki hayvanın olumlu enerjisi, kişisel güç alanlarınızı keşfetmeye hazır olduğunuzun kanıtıdır",
    ],
    negative: [
      "Bastırılmış içgüdüsel dürtüler bilinç yüzeyine çıkma çabasında olabilir",
      "Kontrol edilemeyen korkular sembolik bir tehdit algısı yaratmış olabilir",
      "Doğanızla barışık olmadığınız bir yön dikkat çekiyor",
      "Güdüleriniz ile toplumsal beklentiler arasında bir gerilim seziliyor",
      "Korunma mekanizmalarınız aşırı aktifleşmiş görünmektedir",
      "Hayatta kalma modunda uzun süre kalmanın yarattığı yorgunluk belirgindir",
      "Hayvanın saldırgan ya da tehditkar görünümü, hayatınızdaki bir baskı kaynağının sembolik yansıması olabilir",
      "Kaçılan ya da saldıran hayvan imgesi, bilinçaltınızda işlenmemiş bir öfke veya korku enerjisinin birikmesine işaret eder",
      "İçgüdüsel dürtüleri bastırma çabası uzun vadede psikolojik yorgunluğa zemin hazırlayabilir",
      "Doğal dürtülerinizin bastırılması; rüyada agresif ya da kontrol edilemeyen hayvan imgelerine dönüşebilir",
      "Bilinçdışının uyarısı olarak bu imgelem, hayatınızdaki belirli bir alanı yeniden değerlendirmeniz gerektiğini vurgular",
      "İçgüdüsel bilgeliğinizin görmezden gelindiği ve bunun bir bedel yarattığı dönemlerde bu tür imgeler sıklaşır",
    ],
    psych: [
      "Jung hayvan figürlerini gölge benin en doğal temsilcileri olarak tanımlamıştır",
      "Hayvan arketipleri bastırılmış dürtülerin sembolik dönüşümünü yansıtır",
      "Rüyadaki hayvanın davranışı bilinçdışı tepki kalıplarınızı aynalar",
      "Hayvanla karşılaşma kendinizin yabancılaştığınız yönleriyle yüzleşme anlamı taşır",
      "Evrimsel psikoloji bu rüyaları atalardan kalan adaptasyon kalıntıları olarak değerlendirir",
      "Hayvan sembolü ego ile id arasındaki dengeyi somutlaştırır",
      "Neuroetoloji araştırmaları, insanların hayvan saldırılarına karşı gelişmiş korkularını aktif hâlde taşıdığını; bu korkunun rüyalarda sembolik olarak yeniden işlendiğini gösterir",
      "Gölge entegrasyonu sürecinde hayvan figürüyle barışmak, reddedilen içgüdüsel yanların bütünleşmesidir",
      "Hayvan rüyaları bireyin dürtü yönetimi ve düzenlemesi hakkında değerli bilinçdışı veriler içerir",
      "Rüyadaki hayvan türü ve büyüklüğü, temsil ettiği psikolojik enerji miktarı hakkında önemli ipuçları sunar",
      "Kişinin hayvanla anlaştığı ya da savaştığı rüyalar, egonun bastırılmış dürtülerle müzakeresi sürecini sembolize eder",
      "Nesneye ilişkilerde hayvan, ilk bakım vericilerle ilgili derin dokunulmazlık imgelerini aktifleştiren güçlü bir arketipsel figürdür",
    ],
    spiritual: [
      "İslami gelenekte bazı hayvan rüyaları önemli manevi mesajlar barındırır",
      "Hayvan figürleri nefis ile ruh arasındaki mücadelenin sembolik sahnesidir",
      "Kuran-ı Kerim'de adı geçen hayvanlar rüyada özel yorumlara sahiptir",
      "Tasavvufta hayvan insanın nefsani boyutunun aynası olarak yorumlanır",
      "Bazı hayvan rüyaları hayırlı haberlerin veya uyarıların elçisi kabul edilir",
      "Manevi geleneğimizde hayvan sembolizması köklü bir yorum zenginliği taşır",
      "İbn Sirin'in kitabında arı, aslan ve güvercin gibi hayvanlar için ayrı ayrı manevi yorumlar bulunur; her hayvanın biricikliği bu geleneğin temel hassasiyetidir",
      "Tasavvufta nefsin dört mertebesiyle hayşiyetsel (hayvan ruhunun) nitelikleri eşleştirilerek bu tür rüyalar yorumlanır",
      "Kutlu hayvanlar (güvercin, arı) rüyada görüldüğünde bolluk ve hayır işaretleri olarak sevinçle karşılanır",
      "Tehlikeli hayvanlarla karşılaşma sahneleri, şeytanın tuzağını veya düşman varlığı sembolize ediyor olabilir; bu durumda sabah kalkar kalkmaz istiaze okunması tavsiye edilir",
      "Rüyadaki hayvanla barış içinde olmak, nefis muhasebesi sürecinde olumlu bir işaret kabul edilir",
      "İslami yorum geleneği hayvanı algılarken hayvanın rengi, boynuzları ve genel görünümü gibi detayları da yoruma dahil eder",
    ],
    advice: [
      "İçgüdülerinize kulak vermeyi ve sezgilerinize daha fazla güvenmeyi deneyebilirsiniz",
      "Doğada vakit geçirmek rüyanın mesajını daha iyi kavramanıza yardımcı olabilir",
      "Bastırılmış dürtüleri fark edip kabullenmek bütünleşme sürecini başlatır",
      "Hayvanın size ne hissettirdiğini not edin; bu duyguların günlük hayattaki karşılığını arayın",
      "Kendinizin vahşi veya özgür yanını yaratıcı faaliyetlerle keşfedebilirsiniz",
      "Bu rüyayı hayat enerjinizi yeniden keşfetmeniz için bir davet olarak değerlendirin",
      "Hayvanla ilgili bir sembolik davranış veya imgelem günlüğü tutmak, bilinçdışınızdaki örüntüleri zamanla anlamlandırmanızı kolaylaştırır",
      "Kendi içgüdüsel tepkilerinizi yargılamadan gözlemlemek, bu rüyanın mesajını pratiğe taşımanın ilk adımıdır",
      "Rüyadaki hayvanı bilinçli imgeleme egzersizlerinde bir rehber figür olarak kullanmayı deneyebilirsiniz",
      "Gölge entegrasyonu çalışmaları veya Jungcu psikoterapi, bu tür güçlü hayvan imgelerini deşifre etmekte etkili bir yol sunar",
      "Doğal ortamlarla daha fazla temas kurmak; bilinçaltındaki içgüdüsel gerilimleri dengelemenin yumuşak bir yoludur",
      "Bu rüyadaki enerjiyi bir yaratıcı projeye ya da bedensel aktiviteye dönüştürmek, bastırılmış dürtüler için sağlıklı bir çıkış yolu sağlar",
    ],
  },

  /* ── OBJECT ─────────────────────────────────────────────────────────── */
  object: {
    label: "nesne",
    adjectives: [
      "somut", "sembolik", "işlevsel", "belirleyici",
      "pragmatik", "anlamlı", "tanımlayıcı", "değerli",
    ],
    metaphors: [
      "maddi dünyanın sembolik dili",
      "değer pusulanızın somut yansıması",
      "sahiplik duygusunun bilinçaltındaki izi",
      "kimliğinizin nesneler aracılığıyla ifadesi",
      "yaşam önceliklerinizin somut aynası",
      "güvenlik arayışınızın maddi temsili",
    ],
    frameworks: [
      "nesne ilişkileri kuramı", "fenomenolojik yaklaşım",
      "sembolik etkileşimcilik", "materyalist psikanaliz",
    ],
    openings: [
      "Nesneler, bilinçaltının en somut semboller aracılığıyla konuştuğu anlarda rüya sahnesine girer.",
      "Maddi dünya ile kimlik arasındaki derin bağı araştıran nesne ilişkileri kuramı; eşyaların rüyada çok nadiren rastlantısal göründüğünü, çoğunlukla psikolojik iz taşıdığını vurgular.",
      "Fenomenolojik yaklaşıma göre bir nesneyi rüyada görmek; o nesnenin hayatınızdaki işlevsel değil, varoluşsal anlamıyla yüzleşme davetidir.",
      "Toplumsal kimliğin büyük ölçüde sahip olunan nesneler üzerinden kurulduğu günümüzde, nesne temalı rüyalar bu kimlik inşasının bilinçdışı sorgulaması niteliği taşır.",
      "Bilinçaltı, kayıp veya kazanım öngörüsünü çoğu zaman somut eşya imgeleri üzerinden iletir; bu imgeler gerçek anlamda maddi şeyleri değil psikolojik durumları temsil eder.",
      "Nesne rüyaları; güvenlik, kontrol, değer ve sahiplik kavramlarının bilinçdışındaki aktif dinamiklerini yüzeye taşır.",
      "Kişisel nesneler (anahtarlar, cüzdan, araç, ev) kişinin hayat alanını ve kimliğini sembolik düzeyde özetler; rüyada bu nesnelerin durumu iç dünyanızın bir haritası gibidir.",
      "Materyalist psikanalitik bakış, bireyin toplumsal konumunu ve arzusunu nesneleştirme biçimini inceler; rüyadaki eşyalar bu dinamiğin en ham ve dürüst görüntüsüdür.",
      "Yitirilen ya da kırılan bir nesne, gerçek yaşamda geçirilen kayıpların veya bitmekte olan bir dönemin bilinçdışı sembolik ifadesi olabilir.",
      "Çocukluk oyuncakları, aile yadigârı eşyalar ya da mesleğin simgesi olan nesneler; rüyada belirdiğinde yalnızca o eşyayı değil, ona yüklenen tüm duygusal anlamları da gündeme taşır.",
      "Bulunan ve değer taşıyan bir nesne, bilinçaltının size 'hayatınızda hâlâ kazanılacak şeyler var' mesajını iletme biçimlerinden biri olabilir.",
      "Nesnelerin rüyadaki parlaklığı, eskimişliği ya da hasar durumu; bilinçaltının o nesnenin sembolize ettiği psikolojik kaynak hakkındaki değerlendirmesini yansıtır.",
    ],
    positive: [
      "Hayatınızdaki değerlerin yerli yerine oturduğuna dair güçlü bir sinyal taşır",
      "Maddi ve manevi hedeflerinize doğru ilerlediğinizi gösteren olumlu bir imgedir",
      "Sahip olduklarınızın kıymetini hissettiğiniz huzurlu bir döneme işaret eder",
      "Güvenlik duygunuzun güçlendiğini ve temel ihtiyaçlarınızın karşılandığını yansıtır",
      "Pratik zekânızın ve çözüm odaklı yaklaşımınızın ödüllendirildiğini simgeler",
      "Yaşam standartlarınızı iyileştiren somut adımların meyvelerini topladığınızı gösterir",
      "Bir nesnenin rüyada parlak, sağlam ve kullanılabilir durumda görünmesi; o nesnenin simgelediği psikolojik kaynağın güçlü ve erişilebilir olduğunu işaret eder",
      "Yeni bir eşya edinme sahnesi; bilinçaltınızın hayatınıza yeni bir dönem veya kapasitenin girdiğini olumlu biçimde onayladığını yansıtır",
      "Değerli bir nesneyi güvenli bir yerde koruyor olmak; elde ettiklerinizi koruyabilecek olgunluğa ulaştığınızın sembolik karşılığıdır",
      "Rüyada bir nesnenin tam olarak aradığınız yerde olması; hayatınızdaki düzenin ve öz-kontrolün bilinçaltı tarafından tescillendiğini gösterir",
      "Pratik bir nesneyi ustalıkla kullanmak; hayatınızdaki pratik sorunları artık daha etkili çözme kapasitesine sahip olduğunuzun işaretidir",
      "Sevdiğiniz veya bir başkasının verdiği nesneyi görmek; duygusal bağ, minnettarlık ve güvenlik temalarının bilinçaltınızda güçlü ve olumlu bir yer tuttuğunu simgeler",
    ],
    negative: [
      "Maddi kaygılar veya kayıp korkusu bilinçaltınızda baskın hâle gelmiş olabilir",
      "Bir nesneye ya da duruma aşırı bağlanma iç huzurunuzu tehdit ediyor olabilir",
      "Sahip olmak ile olmak arasındaki dengenin bozulduğunu ima eder",
      "Kontrol ihtiyacınız nesneler üzerinden sembolik biçimde dışa vuruyor olabilir",
      "Yitirilen bir değerin yas sürecinin tamamlanmamış olduğuna işaret edebilir",
      "Statü kaygısının iç dünyanızda yarattığı gerginlik su yüzüne çıkmaktadır",
      "Kaybedilen ya da çalınan bir nesne; güvende hissetmediğiniz ve kontrol kaybı yaşadığınız dönemlerin bilinçdışı yansımasıdır",
      "Kırılan veya kullanılamaz hâle gelen bir eşya; hayatınızdaki belirli bir kaynağın ya da ilişkinin artık işlevini yitirdiğini sembolik olarak yansıtıyor olabilir",
      "Aynı nesneyi defalarca arayan ama bulamayan bir rüya dinamiği; hayatınızdaki ulaşılamaz bir hedef ya da karşılanmamış bir ihtiyacın bilinçdışı tezahürüdür",
      "Sahip olmak istediğiniz ama elinizde olmayan bir nesne; arzulanan ama elde edilemeyen bir şeyin yarattığı hayal kırıklığını sembolik düzeyde ifade eder",
      "Aşırı biriktirilmiş nesneler sahnesi; hayatınızdaki gereksiz yüklerden ve çözümsüz kalan meselelerden arınma ihtiyacını temsil edebilir",
      "Nesnenin başkasına verilmesi ya da elinden alınması sahnesi; özgüven, sınır koyma ve yetki devri konularında yoğun bir içsel çatışmanın işareti olabilir",
    ],
    psych: [
      "Nesne ilişkileri kuramına göre rüyadaki eşyalar erken dönem deneyimlerin izlerini taşır",
      "Bir nesne bilinçdışında güvenli ya da tehdit edici bir nesne temsilcisi olabilir",
      "Sahiplik duygusu kendinize atfettiğiniz değerin somut bir yansımasıdır",
      "Nesneler ego sınırlarını ve kişisel alanı sembolize eder",
      "Kaybedilen veya bulunan bir eşya geçiş dönemlerinin psikolojik belirtisidir",
      "Pragmatik düşünce yapınız rüya dilinde somut nesneler aracılığıyla konuşur",
      "Melanie Klein'ın iyi nesne / kötü nesne ikiliği; rüyada parlak ya da hasarlı görünen eşyaların neden bu kadar güçlü bir duygusal tepki uyandırdığını açıklar",
      "Transitional objects (geçiş nesneleri) kavramı; çocukluktan kalan güvenlik nesnelerine benzer rüya içerikleri, bağlanma ve ayrılık boyutlarını derinlemesine araştırır",
      "Nesne kaybı rüyaları; bilinçdışının gerçek ya da simgesel kayıplarla yüzleşme ve yas çalışmasını sürdürme biçimlerinden biridir",
      "Onarılan ya da yeniden işlev kazanan nesneler; bilinçaltında aktif olan bir iyileşme ve bütünleşme sürecini simgeleyen olumlu psikodrama sahneleridir",
      "Kişinin rüyada nesneye atfettiği duygusal anlam; bilinçaltındaki değerlendirme sistemleri hakkında terapisti yönlendirecek zengin malzeme içerir",
      "Bilinçdışı sembolik eşleştirme; rüyada belirli eşyaların belirli insanları, dönemleri ya da duygusal durumları temsil etmesine zemin hazırlar",
    ],
    spiritual: [
      "İslami gelenekte eşya rüyaları genellikle rızık ve bereketle ilişkilendirilir",
      "Değerli nesneler görmek nimetlere şükretme ihtiyacını hatırlatan manevi bir mesajdır",
      "Yitirilen bir eşya dünyevi bağlardan arınma çağrısı olarak yorumlanabilir",
      "Tasavvufta nesneler kalbin dünyaya olan meylini temsil eder",
      "Helal kazancın önemi rüyada değerli eşyalar aracılığıyla vurgulanır",
      "Nesnelerin parlak ya da karanlık görünümü kalbin nurunu veya pasını simgeler",
      "İslami yorumda altın ve gümüş gibi kıymetli madenlerin rüyada görülmesi; rızık, bereket ve dünya nimetine olan eğilim açısından özel yorumlara tabidir",
      "Bir mescidin kapısını veya anahtarını rüyada görmek, hayır kapılarının açıldığının ve şerefli bir hizmetin müjdesinin manevi ibareti olabilir",
      "Yırtık ya da pis elbise gibi giyim eşyası rüyaları; İslami yorumda kişinin ahval ve dini durumunun sembolik bir değerlendirmesini barındırabilir",
      "İbn Sirin başta olmak üzere klasik tabirciler, nesne rüyalarını yorumlarken nesnenin rüya sahibinin sosyal konumu ve niyetiyle birlikte değerlendirmiştir",
      "Tasavvufi zühd anlayışı nesnelere karşı duygusal bağımsızlığı öğütler; rüyada nesnelere aşırı bağlanma sahneleri bu bağımsızlaşma çalışmasına davet niteliği taşır",
      "Yitirilen değerli bir nesneyi geri bulmak; İslami yorumda elden çıkmış bir nimeti veya fırsatı yeniden kazanma müjdesi olarak okunabilir",
    ],
    advice: [
      "Hayatınızdaki maddi ve manevi öncelikleri yeniden sıralayabilirsiniz",
      "Sahip olduklarınızla olan ilişkinizi gözden geçirmek iç huzur sağlayabilir",
      "Minimalist bir yaklaşımla gerçekten neye ihtiyaç duyduğunuzu sorgulayın",
      "Maddi hedeflerinizi manevi değerlerinizle harmanlayan bir yol haritası çizin",
      "Kayıpların yeni kazanımların kapısını açtığını hatırlayın",
      "Nesnelere yüklediğiniz duygusal anlamları fark etmek öz-bilginizi artırır",
      "Rüyadaki nesneyi gerçek hayatta sembolik olarak temsil eden somut bir adım atmayı düşünün; örneğin eski bir eşyayı bağışlamak ya da uzun süredir ertelenen bir satın alma kararı",
      "Hayatınızdaki 'kırık nesneler' metaforunu inceleyin: Hangi ilişkiler, alışkanlıklar ya da planlar onarım bekliyor?",
      "Değer verdiğiniz ama bir kenara attığınız şeyleri gün yüzüne çıkarmak; bilinçaltının size iletmeye çalıştığı mesajı pratiğe dökmenin güçlü bir yolu olabilir",
      "Fiziksel ortamınızı düzenlemek ve gereksiz eşyalardan arınmak; nesne rüyalarının yarattığı duygusal yükü hafifletmenin en somut terapötik adımıdır",
      "Bu rüyayı tetikleyen nesnenin gerçek hayattaki karşılığını düşünün; o nesne hangi ihtiyacı, döngüyü ya da ilişkiyi sembolize ediyor olabilir?",
      "Sevdiklerinizden biri tarafından verilen ya da onlara ait nesnelerin rüyada belirmesi; bu ilişkiyle ilgili eksik kalmış bir konuşmanın zamanının geldiğinin işareti olabilir",
    ],
  },

  /* ── ACTION ─────────────────────────────────────────────────────────── */
  action: {
    label: "eylem",
    adjectives: [
      "dinamik", "dönüştürücü", "kararlı", "cesur",
      "atılgan", "özgürleştirici", "akışkan", "enerjik",
    ],
    metaphors: [
      "hayat yolculuğunun pusula iğnesi",
      "değişim rüzgârının taşıdığı mesaj",
      "iç motivasyonunuzun bedene bürünmüş hâli",
      "iradenizin sembolik sahneye çıkışı",
      "dönüşüm sürecinin canlı bir provası",
      "sınırları aşma arzusunun dışa vurumu",
    ],
    frameworks: [
      "varoluşçu psikoloji", "eylem odaklı terapi",
      "dönüşümsel öğrenme", "motivasyon kuramları",
    ],
    openings: [
      "Eylem içeren rüyalar; iradenin, motivasyonun ve hareket ihtiyacının en doğrudan sembolik sahnesidir.",
      "Bir şeyler yaparken ya da yapmaya çalışırken geçen rüyalar, bilinçaltının günlük yaşamdaki karar mekanizmalarına müdahil olduğunun göstergesidir.",
      "Varoluşçu psikoloji açısından eylem rüyaları, kişinin otantik seçim yapma ve sorumluluk üstlenme kapasitesini sınayan simgelerdir.",
      "Koşma, düşme, uçma ya da kavga etmek gibi köklü eylem motifleri; bilinçdışının zamansız sembolik dilini oluşturur.",
      "Eylemin biçimi — ağır koşulda mı ilerliyor, özgürce mi süzülüyor — rüyanın bilinçdışı mesajının yönünü ve tonunu doğrudan belirler.",
      "Dönüşümsel öğrenme kuramına göre bireyler, köklü bir değişimin eşiğinde farkında olmadan eylem dolu rüyalar görme eğilimine girer.",
      "Gerçek yaşamda harekete geçme fırsatı bula mayan duygular; rüya dilinde performatif sahnelere dönüşerek bilinçaltında sürecini tamamlar.",
      "Motorik imgeler ve beden aktivasyonu içeren bu tür rüyalar, amigdalanın gündüz sınırlandırdığı tepkileri uykuda yeniden işlediğini gösterir.",
      "Hareketsizlik ve tutuklanma sahneleri, gerçek yaşamdaki erteleme ve öğrenilmiş çaresizlik kalıplarının bilinçdışı düzeydeki yansımasıdır.",
      "Hedefine ulaşan bir eylem sahnesi ile engellenen bir eylem sahnesi; bilinçaltının çok farklı iki mesaj taşıdığını ve bu farkın yoruma katılması gerektiğini hatırlatır.",
      "Eylem temelli rüyalar çoğunlukla bir geçiş döneminin, atılmak üzere olunan büyük bir adımın veya uzun süredir ertelenen bir kararın eşiğinde yoğunlaşır.",
      "Hareketli rüya sahneleri, bireyin yaşam enerjisinin ne yöne aktığını ve onu neyin engellediğini açıklayan bilinçdışı bir harita işlevi görür.",
    ],
    positive: [
      "Harekete geçme cesaretinizin ve kararlılığınızın güçlendiğini gösterir",
      "Yaşamınızdaki değişimi kabul ettiğiniz ve ona liderlik ettiğiniz anlamına gelir",
      "İradenizin sizi doğru hedefe taşıyacak yeterlilikte olduğunu simgeler",
      "Dönüşüm sürecinizin olumlu bir ivmeyle ilerlediğine işaret eder",
      "Sınırlarınızı genişletme ve kendinizi aşma potansiyelinizin arttığını yansıtır",
      "Enerjinizin ve yaşam gücünüzün verimli bir dönemde olduğunu gösterir",
      "İçsel engelleri aşma ve öz-güveninizin derinleşmesi bu rüyada sembolik olarak onaylanmaktadır",
      "Amaçlı ve kararlı bir eylem sahnesi, hayatınızdaki önemli bir atılımın bilinçaltı provas ı olarak işlev görebilir",
      "Engelleri aşarak ilerleyebilme kapasitesinin güçlendiğini ve bunu yapabilirsiniz mesajının bilinçaltınızdan geldiğini gösterir",
      "Bu rüyanın verdiği öz-yeterlilik hissi, gerçek yaşamınızda da harekete geçmeniz için fırlatma enerjisi olarak kullanılabilir",
      "İçsel dürtüleriniz ile dış dünyanın gereksinimleri uyum içinde buluştuğunda, eylem rüyaları çoğu zaman bu uyumun sembolik onayı olarak ortaya çıkar",
      "Aktif eylem imgesi, hayatınızın bu evresinde motivasyon ve kararlılık ekseninin güçlü seyrettiğini ve sizi desteklediğini yansıtır",
    ],
    negative: [
      "Kontrol kaybı hissi veya belirsizlik bilinçaltınızda baskın olabilir",
      "Aşırı hareketlilik ya da sürekli koşturma tükenmişlik sinyali gönderebilir",
      "Kaçma veya kovalanma motifleri çözülmemiş çatışmalara işaret edebilir",
      "Eyleme geçememe durumu kararsızlık ve erteleme kalıplarını yansıtır",
      "Hız ve acelecilik önemli detayları gözden kaçırmanıza neden olabilir",
      "Zorunlu hareket hissi özgür iradenizin kısıtlandığı algısını barındırır",
      "Yavaşlayamayan bir koşu sahnesi, günlük yaşamdaki aşırı iş yükü ve sınırları koruyamadığınızın bilinçdışı yansıması olabilir",
      "Eylemde bulunma ya da bulunmama arasında sıkışan bir rüya sahnesi, hayatınızdaki çatışmalı bağlılıkları somutlaştırır",
      "Koştuğunuz hâlde hiç ilerleyememek; tükenmişlik sendromu veya öğrenilmiş çaresizlikle güçlü bir bilinçdışı rezonans oluşturur",
      "Kaçınılan bir eylem ya da ertelenen bir adım, bilinçaltınızda sembolik baskı oluşturmayı sürdürür",
      "Hatasız performans elde etme zorunluluğu yaşandığı hissini uyandıran sahneler, mükemmeliyetçilik baskısının bilinçdışına sızdığını gösterir",
      "Tehlikeli ya da zorunlu eylem sahneleri; tehdit algısının artmış olduğunu ve bu algının kronik stresin temel nedeni olabileceğini yansıtır",
    ],
    psych: [
      "Varoluşçu psikolojide eylem rüyaları bireyin otantik seçim yapma kapasitesini test eder",
      "Koşma veya uçma motifleri bilinçdışı kaçınma ya da özgürleşme dürtüsünü simgeler",
      "Engellerle karşılaşma sahneleri ego güçlülüğünü ve dayanıklılığı ölçen sembollerdir",
      "Hareketsiz kalma durumu öğrenilmiş çaresizlik kavramıyla açıklanabilir",
      "Eylem rüyaları genellikle uyanık yaşamdaki karar alma süreçlerini yansıtır",
      "Motor imgeler bedenin rüya sırasındaki hareket bastırma mekanizmasıyla bağlantılıdır",
      "Bandura'nın öz-yeterlilik kuramı çerçevesinde başarıyla tamamlanan eylem sahneleri, potansiyel öz-yeterlilik inançlarını güçlendirebilir",
      "Bilişsel-davranışçı terapi perspektifinden bakıldığında, tekrar eden eylem rüyaları uyumsuz düşünce şemalarının işaretçisi olabilir",
      "Psikomotor imgeler uyku sırasında gerekli motor deşarjı sağlamayı amaçlayan biyolojik bir işlev taşır",
      "Tamamlanmamış iş etkisi araştırmaları göstermektedir ki tamamlanmamış eylemler önce uykudan önce zihinde, ardından rüyada sembolik olarak yeniden canlanır",
      "Dönüşümsel öğrenme kuramı aksiyomlarına göre köklü bir paradigma değişiminin hemen öncesinde yoğun eylem içerikli rüyalar görme artış gösterir",
      "Bilinçdışındaki enerji yönelimi, eyleme hangi yönde hazır olduğunuzu ve hangi duygusal yatırımın eşikte beklediğini gösteren bir dönüşüm haritası gibi işlev görür",
    ],
    spiritual: [
      "İslami anlayışta eylem rüyaları kişinin niyetinin samimiyetini yansıtır",
      "Hicret ve yolculuk motifleri manevi bir geçiş döneminin habercisi olabilir",
      "Çaba ve gayret içeren sahneler tevekkülün dinamik yüzünü simgeler",
      "Koşma veya tırmanma Allah yolunda ilerleme arzusunun sembolik ifadesidir",
      "Düşme ve kalkma motifleri tövbe ve yenilenme sürecini temsil eder",
      "Aktif rüyalar ibadet ve zikir hayatına yeni bir canlılık getirme çağrısı taşıyabilir",
      "Güçlükle gerçekleştirilen bir eylem, Allah'ın rızasını kazanmaya çalışma çabasının bilinçaltında yansıması olarak yorumlanabilir",
      "Tasavvuf geleneğinde kadim yolculuk imgeleri, ruhun evrimsel yolculuğunu — nefisten ruha — sembolik olarak temsil eder",
      "Cihad kavramının en derin anlamı olan nefis ile mücadele; eylem içerikli zorlu rüyalarda öz-yükseltme çağrısı olarak kendini gösterebilir",
      "Manevi büyükler tarafından anlatılan seyir ve sefer metaforları; rüyadaki yolculuk ve eylem imgelerini ruhsal yükselişin sembolik anlatımı olarak okur",
      "Bir engeli aşmak ya da bir hedefe ulaşmak gibi motive edici eylem sahneleri; İslami yorumda hayra, başarıya ve berekete atfedilir",
      "Eziyetli bir süreçten geçerek amaca ulaşma imgesi, sabır, şükür ve tevekkül erdemlerinin rüya diline yansımasıdır",
    ],
    advice: [
      "Hayatınızda ertelediğiniz önemli bir adımı atma zamanının geldiğini düşünebilirsiniz",
      "Hız yerine yönü önemseyin; doğru istikamette yavaş ilerlemek de değerlidir",
      "Fiziksel aktiviteyi artırmak rüyanın yarattığı içsel gerilimi dengelemenize yardımcı olur",
      "Karar alma süreçlerinizde güvendiğiniz birinden görüş almayı deneyebilirsiniz",
      "Kontrolün her zaman sizde olması gerekmediğini hatırlamak rahatlatıcı olabilir",
      "Küçük ama tutarlı adımlarla ilerlemeyi tercih ederek kalıcı değişim sağlayabilirsiniz",
      "Ertelediğiniz eylem ne kadar küçük görünürse görünsün, bugün başlamak bilinçaltındaki o baskıyı azaltacaktır",
      "Eylem öncesi kendinize güvenli bir alan oluşturmak — provayla, araştırmayla veya küçük denemelerle — kaygıyı yönetmenin etkili bir yoludur",
      "Rüyadaki engelin hayatınızdaki hangi gerçek engeli temsil ettiğini yazmak, çözüme giden yolun haritasını görünür kılabilir",
      "Başarılı deneyimlerinizi ve kendi güçlü yanlarınızı listelemek; eylem öncesi bilinçdışı öz-yeterlilik inançlarını güçlendirir",
      "Kararlılık yeterli enerjisiyle ya da destekleyici bir ilişkiyle birleştiğinde en kalıcı değişimleri yaratır; bu iki kaynağa yatırım yapmayı düşünün",
      "Eğer tekrar eden eylem rüyaları yaşam kalitesini düşürüyorsa, bir psikoterapistle bu motifleri keşfetmek değerli bir adım olacaktır",
    ],
  },

  /* ── NATURE ─────────────────────────────────────────────────────────── */
  nature: {
    label: "doğa",
    adjectives: [
      "sonsuz", "döngüsel", "elementsel", "berrak",
      "mistik", "huzurlu", "yenileyici", "geniş",
    ],
    metaphors: [
      "evrenin nabız atışı",
      "mevsim döngüsünün bilinçaltındaki aynası",
      "doğanın şifreli ve kadim mesajı",
      "elementlerin ruhunuzla konuşma biçimi",
      "kozmik düzenin mikroskobik yansıması",
      "yeryüzünün derin hafızasından bir fısıltı",
    ],
    frameworks: [
      "ekolojik bilinç yaklaşımı", "elementsel psikoloji",
      "doğa felsefesi", "kozmik döngü kuramı",
    ],
    openings: [
      "Doğa unsurlarını içeren rüyalar, kolektif bilinçdışının en arkaik ve evrensel imgelerinden beslenir.",
      "Su, toprak, ateş ya da hava; elementsel güçlerin bilinçaltındaki sesi, binlerce yıllık kültürel birikimin de beslediği sembolik bir ağırlık taşır.",
      "Doğanın döngüsel yapısı ve mevsimler; bilinçaltının yaşam evrelerine ve psikolojik geçişlere baktığında kullandığı en temel sembolleri sağlar.",
      "Doğa imgelerinin bu denli güçlü sembolik ağırlık taşımasının ardında, insan psikolojisinin ekolojik çevreyle binlerce yıl boyunca sürdürdüğü derin bağ yatmaktadır.",
      "Ekoloji psikolojisi akımı; doğa ile insan arasında kopalı olmayan bir bağ olduğunu öne sürer ve rüyalardaki doğa imgelerini bu bağlılığın en derindeki çağrısı olarak okur.",
      "Berrak bir nehir, kasvetli bir gökyüzü ya da kurak bir çöl; her biri farklı bir psikolojik durum hakkında çarpıcı ve nesnel bir bilinçdışı verisi sunar.",
      "Gökyüzü, deniz ve orman gibi geniş doğa sahneleri, bilinç genişlemesi ve perspektif kazanma arzusunun sembolik karşılıkları olarak yorumlanır.",
      "Doğanın aynı anda hem tahrip edici hem yenileyici olduğunu hatırlamak; bu tür rüyaların anlamsal zenginliğine daha nesnel bir pencereden bakabilmenizi sağlar.",
      "Mevsim geçişleri ve doğal döngü; yaşamın evreleri, kaybın ve yenilenmenin ritmiyle birebir örtüşen metaforik bir çerçeve sunar.",
      "Jung'un organik sembolizm kavramında doğa imgeleri; kişinin özüne, köklerine ve kişisel mitosuna dönüşün çağrısı olarak yorumlanır.",
      "Doğa elementleri rüyada hangi koşullarda görünür — sakin mi çalkantılı mı, aydınlık mı karanlık mı — bu ayrım yorumun doğru katmanına ulaşmanın anahtarıdır.",
      "Çevresel rüyalar, kişinin o dönemde doğayla ve kendi doğasıyla ne kadar temas hâlinde olduğunun sessiz ama güçlü bir yansımasıdır.",
    ],
    positive: [
      "Doğanın döngüsel ritmiyle uyum içinde olduğunuzu müjdeler",
      "İçsel dengenizin evrensel düzenle senkronize olduğunu gösterir",
      "Yenilenme ve arınma sürecinin doğal akışında ilerlediğinize işaret eder",
      "Hayatın bereketli ve verimli bir evresine adım attığınızı simgeler",
      "Huzurun ve sakinliğin hayatınıza kalıcı biçimde yerleştiğini yansıtır",
      "Geniş perspektifler kazandığınız ferah bir dönemin başlangıcını gösterir",
      "Akar bir su gibi engelleri aşarak ilerlediğiniz, hayatınızdaki akışa teslim olmanın rahatlama yarattığı bir döneme girdiğinizi simgeler",
      "Berrak su ya da yeşillikle dolu bir doğa sahnesi, iç temizlik ve yenilenmeyle ilgili bastırılmış arzunun olumlu biçimde gün ışığına çıktığını gösterir",
      "Doğanın bol ve canlı görüntüsü; beslenme, büyüme ve bolluk temalarının bu dönemde bilinçaltınızda hâkim olduğunun müjdesidir",
      "Güneşli bir gökyüzü ya da açılma sahnesi, hayatınızdaki sıkışmışlığın ya da kısıtlılığın giderilmeye başladığını yansıtır",
      "Doğanın iyileştirici ve yenileyici döngüsü, bu rüyada bilinçaltınızın size ilettiği güç ve umudun metaforudur",
      "Mevsimle birlikte yenilenen bir doğa sahnesi; yaşamınızdaki olumsuz bir dönemin kapandığını ve yeninin başladığını sembolik olarak onaylar",
    ],
    negative: [
      "Kontrolü bırakma ve akışa teslim olma konusunda bir direnç mevcut olabilir",
      "Doğal kaos unsurları hayatınızdaki düzensizliğe ayna tutmaktadır",
      "Fırtına veya sel imgeleri bastırılmış duyguların taşma noktasına işaret eder",
      "Kurak veya çorak görüntüler duygusal tükenmişliğin sembolik karşılığıdır",
      "Doğa olayları karşısındaki çaresizlik hissi yaşamdaki belirsizliği yansıtır",
      "Karanlık veya kasvetli doğa sahneleri depresif eğilimlerin habercisi olabilir",
      "Sel veya taşan bir kaynak, uzun süre bastırılmış duygu yüklerinin taşma eşiğini yansıtır",
      "Yangın ya da tahrip eden bir doğa olayı, hayatınızdaki bir durumun kontrolünüz dışında gelişeceğinin bilinçdışı uyarısı olabilir",
      "Kararlı bir fırtına veya son derecede karanlık bir gök görüntüsü; stres yüklerinin üstesinden gelemeyen bir psikolojik durumu simgeliyor olabilir",
      "Bataklık ya da tükenen bir su kaynağı; yorgunluk, ilham eksikliği ve tükenmişlik temalarının bilinçaltındaki sembolik dilidir",
      "Doğayı tahrip eden ya da ondan kaçan bir sahne; evrensele karşı ayrışma ve kendinden kopma temasının bilinçdışında etkin olduğuna işaret eder",
      "Kaçması ya da yönlendirilmesi imkânsız doğa güçleri; hayatınızda üstesinden gelinemez gibi görünen bir yükü sembolik olarak dışa vurur",
    ],
    psych: [
      "Doğa imgeleri kolektif bilinçdışının en arkaik katmanlarından beslenir",
      "Su sembolizması duygusal derinliğin ve bilinçdışının evrensel metaforudur",
      "Ateş imgesi hem yıkım hem aydınlanma enerjisini aynı anda barındırır",
      "Ağaç arketipi kişisel gelişimi kök, gövde ve dallarıyla somutlaştırır",
      "Doğa döngüleri yaşam evrelerine paralel psikolojik geçişleri yansıtır",
      "Gökyüzü imgeleri bilinç genişlemesini ve transandantal deneyimi temsil eder",
      "Gaston Bachelard'ın 'su ve rüyalar' çalışması; su imgesi etrafında şekillenen rüyaları dış dünya ile iç dünya arasında gidip gelen bilinçdışı bir akış olarak tanımlar",
      "İnsan sinyalizasyonu üzerindeki doğa etkisini inceleyen nöropsikoloji araştırmaları; yeşil ve mavi doğa imgelerinin bilinç durumunu sakinleştirdiğini gösterir",
      "Doğa imgeleri genellikle sol hemisferin söylemsel analizini devre dışı bırakır; sağ hemisfer deneyiminin rüya dili bütünsel ve simgesel kalır",
      "Transandantal psikoloji doğa imgelerini; ego sınırlarının çözüldüğü ve evrenle bütünleşme deneyiminin sembolik uzantısı olarak okur",
      "Terapi pratiğinde doğa imgelerini bilinçli bedensel duyumlarla birleştirmek, derin bir bilinçdışı işleme kapısı açar",
      "Doğanın rüyada küçülmesi veya yok edici güçlü olarak algılanması; kişinin doğayla olan derin bağlılıktan kopuk veya çaresiz hissettiği dönemleri işaret edebilir",
    ],
    spiritual: [
      "İslami gelenekte doğa rüyaları Yaratıcığın kudretinin tezahürü olarak okunur",
      "Su görmek arınma ve tövbe ile ilişkilendirilir; berrak su hayırlıdır",
      "Yeşillik ve bahçe imgeleri cennet tasvirlerini ve ilahi vaadi hatırlatır",
      "Gök gürültüsü ve şimşek ilahi uyarı veya müjdenin sembolik sesi kabul edilir",
      "Ay ve güneş motifleri ilahi nurun farklı tecellilerini temsil eder",
      "Dört element tasavvufta nefsin makamlarıyla eşleştirilir",
      "Kuran'da 'yeryüzünde dolaşıp ibret alın' hitabı; doğa imgelerini manevi bir hatırlatma ve tesbihat makamına taşır",
      "Çiçek ya da ağaç görmek; İslami yorumda bolluk, nesl ve bereket anlamı taşıyan olumlu imgeler arasındadır",
      "Karanlık ve kasvetli doğa sahneleri; bedenin ve ruhun arınmaya, ibadete ve tefekkre ihtiyaç duyduğunu hissettiren manevi hatırlatmalar olarak değerlendirilebilir",
      "Tasavvuf geleneğinde hava 'ruh', su 'gönül', ateş 'nefis' ve toprak 'beden' ile özdeşleştirilir; rüyada baskın olan element bu sembolik kayrak üzerinden okunur",
      "Cennet betimlemelerinde geçen 'altından ırmaklar akan bahçeler' metaforu; bereketli bir doğa rüyasını ilahi bir müjdenin habercisi olarak yorumlamak için köklü bir referans noktası oluşturur",
      "Doğa felaketi içeren rüyalar; bazen toplumdaki veya kişinin kendi dünyasındaki belirli bir aksaklığa Allah'ın düzeltici iradesini hatırlatan bir biçimde sembolik olarak sunar",
    ],
    advice: [
      "Doğada zaman geçirmenin rüyanın mesajını içselleştirmenize yardımcı olacağını unutmayın",
      "Hayatınızdaki doğal döngüleri zorlamak yerine kabullenmek iç huzur getirir",
      "Sabahları açık havada kısa bir yürüyüş yaparak gününe başlamayı deneyebilirsiniz",
      "Evinize doğal unsurlar eklemek bilinçaltınızdaki huzur arayışını destekler",
      "Mevsimsel değişimlere uyum sağlamak gibi hayatınızdaki geçişlere de esneklikle yaklaşın",
      "Bu rüyanın elementleriyle ilgili farkındalık meditasyonu deneyimleyebilirsiniz",
      "Rüyadaki doğa sahnesini bir günlüğe çizerek ya da yazarak betimlemeniz, bilinçaltındaki ilerleme sürecini derinleştirir",
      "Naturalistik nefes egzersizleri — ör: rüzgârla birlikte nefes alıp verme imgesi — bu tür rüyaların ardından sinir sistemini sakinleştiren etkili bir uygulama olarak denenebilir",
      "Hafta sonu bir orman ya da deniz yürüyüşü planlamak, bilinçaltınızdaki doğayla yeniden bağ kurma isteğine çok somut bir yanıt sunar",
      "Ağaç dikmek, bitki bakmak ya da bahçeyle ilgilenmek; toprakla kurulan bu sembolik bağ hem terapötik hem de pratik bir anlam taşır",
      "Rüyanızdaki doğa elementinin (su, ateş ya da toprak) simgelediği duyguyu belirleyin ve o duyguya günlük yaşamda nasıl alan açabileceğinizi düşünün",
      "Bu rüyayı, kendinizi doğadan kopuk ya da tükenmiş hissediyorsanız bir işaret olarak değerlendirin ve yeniden bağlanmak için küçük ama tutarlı adımlar atın",
    ],
  },

  /* ── BODY ───────────────────────────────────────────────────────────── */
  body: {
    label: "beden",
    adjectives: [
      "somatik", "fiziksel", "duyusal", "sezgisel",
      "uyarıcı", "organik", "bütünsel", "somutlaşan",
    ],
    metaphors: [
      "bedenin gizli ve kadim dili",
      "hücrelerin hafızasında saklı bir mesaj",
      "zihin ile beden arasındaki köprü",
      "organizmanın sembolik sağlık raporu",
      "fiziksel varlığın rüya sahnesindeki temsili",
      "somatik deneyimin bilinçdışı çevirisi",
    ],
    frameworks: [
      "psikosomatik tıp", "bedensel farkındalık terapisi",
      "somatik deneyimleme", "biyopsikososyal model",
    ],
    openings: [
      "Beden, rüya sahnesinde hem kendinizin hem de kendinizle kurduğunuz sessiz diyaloğun en somut arenasıdır.",
      "Psikosomatik tıbbın uzun süredir vurguladığı gibi; belirli beden bölgelerini ön plana çıkaran rüyalar, bilinçli olarak fark edilemeyen sinyalleri aktarabilir.",
      "Beden imgeleri rüya dilinde yalnızca hastalık ya da sağlık değil; kimlik, öz-değer ve kendinize bakış açısının en doğrudan sembolik temsilleridir.",
      "Somatik deneyimleme terapisi, bedensel rüyaları bilinçaltının tamamlanmış ile tamamlanmamış fiziksel süreçler arasındaki diyalogu olarak okur.",
      "Günümüz araştırmaları, beynin uyku sırasında bedenle ilgili fiziksel bilgileri de işlediğini göstermektedir; bedensel rüyalar bu işlemin en görünür ifadesidir.",
      "Beden sembolizması çoğu gelenekte sağlık, güç veya zaafiyetin habercisi olarak okunmuştur; bu birikimli yorum mirası rüyanızın anlamını zenginleştirir.",
      "Bedenin bir organı ya da bölgesi rüyada özellikle dikkat çekiyorsa, bilinçaltının o bölgeyle ilgili gündelik farkındalığın ötesinde bir mesaj ilettiğini düşünmek anlamsız değildir.",
      "Beden imgesi kavramı psikolojide çok katmanlı bir yere sahiptir; rüyadaki bedensel imgeler bu kavramın bilinçdışı düzeyde nasıl işlendiğini gözler önüne serer.",
      "Beden-zihin bütünlüğü perspektifinden bakıldığında, bedensel rüyalar duygusal ve fiziksel sağlığın kesişme noktasındaki en hassas bilinçdışı mesajlaşma kanalıdır.",
      "Kronik stres ve baskı altındaki dönemlerde bilinçaltı, bedensel imgeler aracılığıyla aciliyet ve alarm mesajlarını en yoğun biçimde iletir.",
      "Rüyadaki bedensel dönüşüm sahneleri çoğu zaman kimlik krizlerinin, büyüme evrelerinin ya da derin bir benlik yenilenmesinin sembolik karşılıklarıdır.",
      "Bedene dair bir rüya görmek; sadece fiziksel sağlığın değil, kendinize olan saygınızın ve bedeninize verdiğiniz özenin bilinçdışı tarafından değerlendirildiği anlamına da gelebilir.",
    ],
    positive: [
      "Bedeninizle kurduğunuz barışın ve uyumun bilinçdışında onaylandığını gösterir",
      "Fiziksel iyileşme veya güçlenme sürecinin olumlu seyrettiğine işaret eder",
      "Beden farkındalığınızın arttığını ve kendinize iyi baktığınızı simgeler",
      "Sağlıklı alışkanlıkların meyvelerini toplamaya başladığınızı yansıtır",
      "Bedensel enerjinizin yüksek ve canlı bir dönemde olduğunu gösterir",
      "Fiziksel kapasitenize olan güveninizin güçlendiğini müjdeler",
      "Beden-zihin bütünlüğünüzün güçlü bir döneminde olduğunuzu ve bu uyumun bilinçaltı tarafından onaylandığını yansıtır",
      "Fiziksel sınırlarınızı sağlıklı biçimde tanıyıp kabul ettiğiniz, kendinize ihtimam gösterdiğiniz bir evreye girdiğinizi simgeler",
      "Bedensel enerjinizin yenilendiği veya iyileşmenin sürdüğü bu dönem; rüyanın olumlu tonu aracılığıyla bilinçaltınızdan gelen teşvik mesajıdır",
      "Sağlığa yönelik attığınız proaktif adımların meyvelerini toplamaya başladığınızı ve bu sürecin kalıcı hâle geldiğini gösterir",
      "Öz-bakım alışkanlıklarınızın yerleşmesi ve bedeninizi bir yük değil bir kaynak olarak görmeniz; bu rüyayla bilinçdışı onay almaktadır",
      "Biyopsikososyal açıdan değerlendirildiğinde bu rüya; fiziksel, duygusal ve sosyal düzlemlerin uyumlu bir ritme oturduğunu gösteren bütünsel bir iyi oluş işaretidir",
    ],
    negative: [
      "Bedeninizin size gönderdiği bir uyarı sinyalini göz ardı ediyor olabilirsiniz",
      "Fiziksel stres veya ihmal bilinçaltınızda sembolik bir acı olarak yansımaktadır",
      "Bedensel kaygı veya sağlık endişesi rüya diline dönüşmüş olabilir",
      "Kronik yorgunluk ya da ağrı kalıpları rüya senaryolarını biçimlendiriyor olabilir",
      "Bedeninizle kopuk bir ilişki yaşadığınızın sembolik işaretidir",
      "Fiziksel sınırlarınızı zorlama eğilimi bilinçdışında uyarı üretmektedir",
      "Bedenle ilgili utanç ya da öz-imge sorunları bilinçdışında aktif hâldedir ve şefkatli bir bakış açısına ihtiyaç duymaktadır",
      "Ağrı veya yaralanma imgesi; bedensel bir kaygıyı bilinçdışı düzeyde abartarak aciliyetini vurgulayan bir alarm mekanizmasının sesi olabilir",
      "Bedensel değişim veya deformasyon sahneleri, kimlik ve öz-imge üzerindeki baskının bilinçdışına taşınmış yoğun bir yansımasıdır",
      "Bilinçaltı, bastırılan somatik deneyimleri (ağrı, gerginlik, yorgunluk) sembolik imgeler aracılığıyla yüzeye taşımaya devam eder",
      "Hastalık ya da yetersizlik içeren beden sahneleri; öz-bakıma ayrılan zamanın ciddi biçimde azaldığını ve yeniden yapılandırma gerektirdiğini işaret eder",
      "Beden değişimini kontrol edememe imgesi; varoluş kaygısının ve ölümlülük farkındalığının bilinçdışı düzeyde aktif olduğunu gösteriyor olabilir",
    ],
    psych: [
      "Psikosomatik yaklaşım rüyadaki bedensel sembolleri duygusal gerilimin somatik çevirisi olarak okur",
      "Beden imgeleri benlik algısı ve öz-imge kavramlarıyla doğrudan bağlantılıdır",
      "Somatik deneyimleme terapisi bu tür rüyaları bedenin tamamlanmamış süreçleri olarak değerlendirir",
      "Organların rüyada görünmesi bilinçdışı sağlık farkındalığının dışa yansımasıdır",
      "Bedensel dönüşüm sahneleri kimlik ve kendilik algısındaki değişimleri sembolize eder",
      "Ağrı veya haz rüyaları duyusal hafızanın gece boyunca yeniden işlenmesiyle açıklanır",
      "Biyopsikososyal model; bedensel rüyaları fiziksel, psikolojik ve sosyal katmanların eş zamanlı etkileşiminin yansıması olarak inceler",
      "Beden imgesi araştırmaları, rüyadaki beden temsilleriyle bireyin uyanık hâldeki öz-imgesi arasında güçlü bir paralellik olduğunu ortaya koymuştur",
      "Beyin-beden bütünleşme araştırmaları; REM uykusunda bedenle ilgili motor ve duyusal kortekslerin yeniden aktifleştiğini ve bu sürecin rüya içeriklerini doğrudan etkilediğini gösterir",
      "Bedensel somatizasyon eğilimi yüksek bireylerde rüyalar; çözüme kavuşturulmamış fiziksel gerginliklerin sembolik anlatımları olarak işlev görür",
      "Travma odaklı bedensel terapi yaklaşımları, rüyadaki beden imgelerini travmanın işlenmemiş somatik izlerinin haritası olarak kullanır",
      "İnteroception (iç duyum) araştırmaları göstermektedir ki bedenden bilinçdışına ulaşan sinyaller, rüya içeriklerinin şekillenmesinde doğrudan rol oynar",
    ],
    spiritual: [
      "İslami anlayışta beden emanettir; bedenle ilgili rüyalar bu emanete dikkat çağrısı olabilir",
      "Abdest veya gusül imgeleri manevi arınma ihtiyacının sembolik ifadesidir",
      "Hastalık rüyaları bazen günahlardan dönüş ve tövbe çağrısı olarak yorumlanır",
      "Şifa sahneleri ilahi merhametin ve Şafi isminin tecellisi kabul edilir",
      "Bedenin nuru veya ışığı kalp temizliğinin dışa yansıması olarak değerlendirilir",
      "Tasavvufta beden nefsin mekânıdır; bedensel rüyalar nefis muhasebesi çağrısı taşır",
      "İslami tıp geleneğinde beden sağlığı ile ruhsal denge birbirini doğrudan etkiler; bedensel rüyalar bu bütünlüğün bir hatırlatıcısıdır",
      "Abdest, namaz veya gusül gibi temizlik imgelerini içeren rüyalar; manevi bir arınma ihtiyacının ve yeniden Allah'a yönelme çağrısının sembolik sesidir",
      "Hz. Peygamber'in tavsiyesine göre rahatsız edici beden imgelerinden uyandığınızda istiaze okuyup sol tarafa tükürmek ve ardından bu rüya üzerine düşünmemek önerilir",
      "Organlardan birinin zarar gördüğü sahneler; İslami yorumda genellikle o organın işleviyle ilgili bir uyarı veya yönlendirme mesajı içerir",
      "Tasavvuf geleneğinde bedeni arındırmak (oruç, riyazet, az uyku) manevi yolculuğun temeli olarak öğretilir; bedensel rüyalar bu yolculuktaki konumu yansıtır",
      "Şifa ve iyileşme içeren rüyalar, Allah'ın kuluna olan merhametinin ve dua ile tevazunun güçlü bir karşılık bulduğunun manevi işareti olabilir",
    ],
    advice: [
      "Rüyanın uyarısını dikkate alarak ertelediğiniz sağlık kontrolünü yaptırabilirsiniz",
      "Bedeninizle iletişimi güçlendirmek için yoga veya tai chi gibi uygulamaları deneyebilirsiniz",
      "Uyku kalitesini artırmak rüyaların sağlık mesajlarını daha doğru iletmesini sağlar",
      "Fiziksel aktiviteyi keyif aldığınız bir forma dönüştürmek beden-zihin bütünlüğünü destekler",
      "Bedensel belirtileri göz ardı etmeden fakat abartmadan değerlendirmeyi hedefleyin",
      "Nefes farkındalığı pratiği bedeninizle yeniden bağ kurmanın en doğrudan yoludur",
      "Bir beslenme uzmanı ya da fizyoterapist ile görüşmek; bedensel rüyaların tetiklediği proaktif sağlık adımının en somut biçimi olabilir",
      "Beden taraması meditasyonu (body scan) uygulamak; bedenin sessiz sinyallerini fark etme ve onları kabul etme kapasitesini güçlendirir",
      "Bedeninize karşı konuştuğunuz dili gözlemleyin: eleştirel bir iç ses beden imgesini olumsuz etkiler; öz-şefkat pratiği bu dili dönüştürmenin en etkili yoludur",
      "Bu tür rüyaların sürekliliği varsa, bir psikolog ya da psikosomatik alanda deneyimli bir hekim ile paylaşmak değerli bilgiler ortaya çıkarabilir",
      "Düzenli fiziksel temas — masaj, yoga, doğa yürüyüşü — bedenin bilinçdışına gönderdiği güvenlik sinyallerini güçlendirir ve kaygıyı azaltır",
      "Rüyadaki beden imgesiyle ilgili his ve düşünceleri bir günlüğe yazmak; bilinçdışındaki bu somatik mesajları daha kolay deşifre etmenize yardımcı olur",
    ],
  },

  /* ── SPIRITUAL ──────────────────────────────────────────────────────── */
  spiritual: {
    label: "manevi",
    adjectives: [
      "kutsal", "nurlu", "derin", "arındırıcı",
      "yüce", "huzur verici", "ilahi", "işaretsel",
    ],
    metaphors: [
      "ruhun öteler ötesine uzanan eli",
      "ilahi bir fısıltının bilinçaltındaki yankısı",
      "görünmeyene açılan gizemli kapı",
      "manevi yolculuğun sembolik bir durağı",
      "kalbin derinliklerinden yükselen bir niyaz",
      "ruhsal olgunlaşmanın sessiz tanığı",
    ],
    frameworks: [
      "İslami rüya tabiri geleneği", "tasavvufi sembolizm",
      "spiritüel psikoloji", "transpersonel yaklaşım",
    ],
    openings: [
      "Manevi içerikli rüyalar, İslam geleneğinde sıradan uykudan ayrılan ve özel bir dikkatle ele alınması gereken deneyimler olarak konumlanır.",
      "Allah ile kul arasındaki görünmez ipliğin rüya sahnesinde sembolik biçimde belirlebileceği inancı, pek çok geleneğin paylaştığı kadim bir anlayıştır.",
      "Manevi rüyalar; nefsin mevcut durumunu, kalbin yönelimini ve ruhun ihtiyaçlarını en dolaylı ama aynı zamanda en derin biçimde kodlayan bilinçdışı mesajları taşır.",
      "Transpersonel psikoloji manevi rüyaları; ego sınırlarının aşıldığı ve bireyüstü bir anlam örgüsüne dokunulduğu özel bilinç halleri olarak tanımlar.",
      "Ruhsal olgunlaşma sürecinin belirli evrelerinde manevi temaların yoğunlaştığı rüyalar sıklaşma eğilimi gösterir; bu eğilim çeşitli manevi geleneklerin raporlarında yinelemeli olarak karşımıza çıkar.",
      "Numinöz deneyimler; rüya sırasında aşkın bir varlıkla karşılaşıldığında Carl Jung'un tanımladığı derin haşyet ve anlam duygusunu üretir.",
      "İslami rüya yorumu geleneği üç rüya türünü birbirinden ayırır; manevi içerikli rüyaların hangi kategoriye girdiğini saptamak, yorumun sorumluluğunu ve derinliğini belirler.",
      "Kabe, cami, peygamber ya da veli görmek gibi kutsal imgeler; İslami gelenek tarafından ayrıcalıklı bir anlam taşıdığı kabul edilen manevi rüya içerikleri arasında sayılır.",
      "Kişisel mitoloji teorisyeni Joseph Campbell'ın hero's journey (kahraman yolculuğu) metaforu; manevi sınavları, karanlıkları ve aydınlanmaları barındıran bu tür rüyaları en iyi anlatan çerçevelerden birini sunar.",
      "Ruhsal temizlik, arınma ve aydınlanma ihtiyacı; bilinçdışının manevi rüya imgeleri üretmesinin en temel psiko-spiritüel sebepleri arasında yer alır.",
      "Spiritüel rüyalar, bireyin anlam arayışının en yoğun olduğu dönemlerde çoğunlukla daha sık ve daha canlı biçimde ortaya çıkar.",
      "Tasavvuf geleneğindeki seyr-ü sülûk haritası; manevi rüyaları derecelendirmek ve yorumlamak için çok katmanlı bir çerçeve sunar.",
    ],
    positive: [
      "Manevi yolculuğunuzda anlamlı bir ilerleme kaydettiğinizin habercisidir",
      "Kalp huzuru ve ruhsal doyumun güçlü bir dönemde olduğuna işaret eder",
      "İlahi rahmetin ve merhametin size ulaştığının sembolik ifadesidir",
      "İbadet hayatınızın ve niyetlerinizin kabul görebildiğini ima eder",
      "Ruhsal arınma sürecinizin meyvelerini vermeye başladığını gösterir",
      "İç huzur ve teslimiyetin sağladığı derin dinginliğin yansımasıdır",
      "Manevi farkındalığınızın arttığını ve kalbinizin daha derin bir dinginliğe kavuştuğunu gösteren bu rüya, ruhsal yolculuğunuzda güçlü bir adım atıldığını müjdeler",
      "Allah'a yakınlaşma ve ibadet hayatını derinleştirme arzusunun bilinçaltı tarafından onaylandığını simgeler",
      "Manevi bir bağlantının ve feyz almanın kapısını aralayan bu rüya, gönlünüzün huzur limanına yaklaştığı işaretidir",
      "Dua ve zikir ile geçirilen vaktin ruhsal derinlik üretmeye başladığını; manevi pratiklerinizin kalpte gerçekten iz bıraktığını yansıtır",
      "Manevi rehberlikle veya güvendiğiniz birinin duasıyla desteklendiğiniz hissini bilinçaltınızın onayladığını gösterir",
      "Bu rüyanın içeriğindeki huzur ve aydınlık hissi; hayatınızdaki yükün hafiflemekte olduğunun ve kalbinizin genişlediğinin işaretidir",
    ],
    negative: [
      "Manevi hayatınızda bir boşluk veya uzaklaşma hissi olabilir",
      "Vicdani bir rahatsızlık bilinçdışında sembolik sahnelere dönüşmüş olabilir",
      "İnanç sorgulaması veya şüphe dönemi rüyalara yansıyan bir gerilim yaratabilir",
      "Ruhsal tembellik veya ihmalkârlık bilinçaltınızda uyarı üretmektedir",
      "Dünyevi meşguliyetlerin manevi hayatı geri plana ittiğini hissedebilirsiniz",
      "Tamamlanmamış manevi sorumluluklar bilinçaltında huzursuzluk kaynağı olabilir",
      "Manevi yalnızlık ve destek eksikliği duygusu; bu tür rüyalarda sıklıkla merkezi bir yer işgal eder",
      "Kalbin katılaşması ya da duaların mekanik bir ritüele dönüştüğü dönemlerde bilinçaltı aciliyet sinyalleri vermektedir",
      "Terk edilmişlik veya Allah'tan uzaklaşma hissi; kişisel bir kriz ya da manevi boşluk döneminin bilinçdışı yansıması olabilir",
      "Günah veya hata duygusu ile baş etme güçlüğü; bilinçdışında manevi temizlik ve tövbe arzusunu uyandıran sembolik sahneler üretir",
      "Manevi bir figür ya da kutsal mekânın tehdit altında görüldüğü sahneler; şeytanın kışkırtması ya da yoğun bir nefis mücadelesi döneminin habercisi olabilir",
      "Manevi hayatınızdaki düzensizliğin ve tutarsızlığın ruha yüklediği vicdan sıkıntısının sembolik ifadesidir",
    ],
    psych: [
      "Transpersonel psikoloji manevi rüyaları bilincin genişlemesi ve aşkınlık deneyimi olarak inceler",
      "Maslow ihtiyaçlar hiyerarşisinin zirvesi olan kendini gerçekleştirme bu rüyalarla rezonansa girer",
      "Manevi imgeler bireysel anlamlandırma sürecinin en derin katmanından beslenir",
      "Numinöz deneyimler rüya sırasında yoğun bir anlam ve haşyet duygusu üretir",
      "Spiritüel rüyalar ego sınırlarının geçici olarak çözüldüğü özel bilinç halleridir",
      "Bu tür rüyalar kişisel mitolojinin ve varoluşsal sorgulamanın sembolik sahnesidir",
      "Victor Frankl'ın anlam merkezli terapi yaklaşımı; manevi rüyaları varoluşsal anlam açlığının yoğun hissettirdiği dönemlerdeki bilinçdışı ifade biçimi olarak okur",
      "William James'in mistik deneyim araştırmaları; kontrollü uyarım olmaksızın spontane gerçekleşen manevi rüya içeriklerini gerçek anlamda dönüştürücü deneyimler kategorisinde değerlendirir",
      "Manevi temalar içeren rüyaları sabah uyandığınızda not etmek ve anlam katmanlarını keşfetmeye çalışmak; dini psikoloji araştırmacılarının önerdiği bir bilinç genişletme pratiğidir",
      "Pozitif psikoloji perspektifinden bakıldığında manevi rüyalar; anlam, bağ ve aşkınlık gibi eudaimonik iyi oluş boyutlarını besleyen nadir deneyimler arasındadır",
      "Nöropsikoloji araştırmaları; derin meditasyon, yas süreci ve yaratıcı atılım dönemlerinde manevi rüya içeriklerinin belirgin biçimde arttığını ortaya koymuştur",
      "Dini spiritüellik ile psikolojik sağlık arasındaki ilişkiyi inceleyen meta-analizler; manevi deneyimleri düzenli işleyen bireylerin daha düşük kaygı ve daha yüksek dayanıklılık sergilediğini göstermektedir",
    ],
    spiritual: [
      "Peygamber Efendimiz sadık rüyayı nübüvvetin kırk altı parçasından biri olarak nitelemiştir",
      "Cami namaz veya Kabe gibi kutsal mekân rüyaları manevi yükselişin müjdecisidir",
      "Nur veya ışık görüntüleri kalp gözünün açılmasıyla ilişkilendirilir",
      "Manevi büyükleri rüyada görmek feyz ve himmet almanın işareti sayılır",
      "İstiğfar ve tesbih sahneleri nefsin arınma talebini sembolize eder",
      "Bu rüya türü genellikle istihare sonrasında görüldüğünde en güçlü mesajı taşır",
      "Hz. Peygamber'in hadisleri, rüyada peygamber görmek ile ilgili çok kapsamlı ve özel bir anlam çerçevesi sunar; bu rüyayı sıradan kabul etmek doğru olmaz",
      "Allah'ın 99 isminden birinin rüyada belirgin biçimde hissedilmesi; o ismin tecellisine muhtaç olduğunuz bir döneme girdiğinizin işareti olabilir",
      "İstihare namazı sonrasında görülen bu tür güçlü manevi içerikli rüyalar; alınan kararın doğruluğunun ya da yanlışlığının bir işareti olarak değerlendirilebilir",
      "Tasavvufi miracname geleneğinde rüyalar; ruhun bedenin zincirleri dışındayken ilahi âleme yaptığı kısa gezintilerin kalıntıları olarak yorumlanır",
      "Rüyada okunan sureler, dualar veya zikir ifadeleri; uyanıkta da bu kimseleri ve bu anları hatırlamak için manevi bir davet niteliği taşır",
      "Cennet ya da cehennem imgelerine dair bir rüya; ahiret bilincini güçlendirmek için bilinçaltının ya da ilahi iradenin kullandığı güçlü bir uyarıcıdır",
    ],
    advice: [
      "Rüyanın ardından şükür namazı kılmayı veya içtenlikle dua etmeyi düşünebilirsiniz",
      "Manevi pratiğinizi düzenli kılmak bu rüyaların sıklığını ve berraklığını artırır",
      "Güvendiğiniz bir hoca veya manevi rehbere danışarak rüyanızı yorumlatabilirsiniz",
      "Rüya günlüğünüze manevi rüyalarınızı ayrı bir bölümde kaydedebilirsiniz",
      "Zikir ve tefekkür alışkanlığını pekiştirmek ruhsal hassasiyetinizi güçlendirir",
      "Bu rüyayı bir dönüm noktası kabul ederek manevi hedefinizi yeniden tanımlayabilirsiniz",
      "Manevi rüyayı güvendiğiniz dini bir otoriteyle paylaşmak, yorumun kalitesini ve kişiselliğini artırır",
      "Rüyadan ilham alarak Kur'an'dan belirli bir sure veya ayet okumak ya da o konuda derinleştirici bir çalışma yapmak; manevi mesajı pratiğe taşımanın yoludur",
      "Manevi ihmal döneminin farkındalığıyla şevk ve niyet tazelemek; bu tür rüyaları bir dua çağrısı olarak karşılamanın güzel bir biçimidir",
      "Ardından hayır, sadaka veya sevap kapısı açmak; manevi içerikli rüyaların verdiği motivasyonu en anlam yüklü şekilde eyleme dönüştürür",
      "Bu rüyayı kaleme almak ve ne hissettirdiğini ayrıntılı aktarmak; ruhsal büyüme yolculuğunuzdaki kritik bir mihenk taşını koruma altına almanızı sağlar",
      "Rüyada aldığınız derin huzur ya da sarsıcı bir uyarı hissini; namaz, dua ve zikir gibi manevi pratiklerle günlük hayata taşımak en değerli adımdır",
    ],
  },

  /* ── EMOTION ────────────────────────────────────────────────────────── */
  emotion: {
    label: "duygu",
    adjectives: [
      "yoğun", "katmanlı", "derinden hissedilen", "bastırılmış",
      "sarmalayıcı", "dönüştürücü", "kucaklayıcı", "özgürleştiren",
    ],
    metaphors: [
      "duygu denizinin derinlerinden yükselen bir dalga",
      "içsel barometrenin hassas titreşimi",
      "psikolojik arınmanın katartik anı",
      "ruhun en samimi ve çıplak ifadesi",
      "duygusal paletinizdeki gizli renklerin ortaya çıkışı",
      "kalbin bilinçdışındaki ses kaydı",
    ],
    frameworks: [
      "duygu odaklı terapi", "duygusal zekâ modeli",
      "psikodinamik yaklaşım", "duygu düzenleme kuramı",
    ],
    openings: [
      "Duygular, rüya dilinin altın standardıdır; mantıksal filtrenin devre dışı kaldığı uyku anında bilinçaltına en doğrudan erişim yolu duygu imgelerinden geçer.",
      "Duygu odaklı terapi, rüyadaki duygusal sahnelerin bilinçli yaşamda henüz yeterince işlenmemiş deneyimlerin ham ve sansürsüz yansımaları olduğunu savunur.",
      "Duygusal zekâ araştırmacıları; duygu temalı rüyaları bireyin kendi iç dünyasını fark etme ve düzenleme kapasitesinin gece saatlerindeki en dürüst değerlendirmesi olarak konumlandırır.",
      "Psikodinamik yaklaşıma göre, bir duyguyu rüyada yaşamak o duygunun işlenmiş ya da bastırılmış olup olmadığına dair bilinçdışının en net ipucunu taşır.",
      "Duygu düzenleme kuramı; uyku sırasında yaşanan yoğun duygusal sahnelerin, sinir sisteminin gündüz yüklediği duygusal bilgiyi aktif biçimde sıralama ve işleme sürecinde var olduğunu ileri sürer.",
      "Beyin görüntüleme araştırmaları, REM uykusu sırasında amigdalanın baskı kaldırıcı prefrontal kortikal devrelerden bağımsız şekilde aktif çalıştığını ortaya koyar; bu durum rüyalardaki duygusal yoğunluğun neden bu denli ham hissettirdiğini açıklar.",
      "Duygusal bellek konsolidasyonu, yani gün içindeki duygu yüklü anların uyku sırasında pekiştirilmesi; rüyalarda bu anların simgesel biçimde yeniden canlanmasına zemin hazırlar.",
      "Bir duyguyu rüyada yoğun yaşamak, o duygunun uyanıkken bastırıldığının değil; bilinçdışı tarafından fark edilip işlenmeye başlandığının işareti olabilir.",
      "Alexitimi eğilimi olan bireyler, kendi duygularını sözel olarak ifade etmede güçlük çeker; bu kişilerde duygusal rüyalar hayati bir telafi işlevi görür.",
      "Katarsis kavramı; yüzyıllardır birçok kültürün rüyaları duygusal arınmanın meşru ve doğal bir alanı olarak gördüğünü, bu sezginin modern nörobilimle desteklendiğini hatırlatır.",
      "Duygusal rüyaların arkasında çoğu zaman bastırılmış değil fark edilmemiş veya adlandırılmamış duygular yatar; bu farkı anlamak, yorumun hem derinliğini hem de rahatlık potansiyelini artırır.",
      "Duygu yoğunluğu yüksek rüyalar; uyku kalitesinin düştüğü kriz dönemlerinde değil tam tersine bilinçaltının aktif çalışma ve iyileşme süreçlerinde daha sık görülme eğilimindedir.",
    ],
    positive: [
      "Duygusal farkındalığınızın ve empati kapasitenizin güçlendiğini yansıtır",
      "Hislerinizi bastırmak yerine kabullendiğiniz sağlıklı bir döneme işaret eder",
      "İçsel barışınızın ve duygusal olgunluğunuzun arttığını müjdeler",
      "Bilinçdışınızın duygusal bir arınma sürecini başarıyla tamamladığını gösterir",
      "Sevinç ve minnettarlık gibi pozitif duyguların hayatınıza hâkim olduğunu simgeler",
      "Duygusal zekânızın kişisel ilişkilerinizi zenginleştirdiğini yansıtır",
      "Uzun süredir baskı altında tutulan bir duygunun sağlıklı biçimde yüzeye çıkması; bilinçaltınızın işleme kapasitesinin güçlü olduğunu gösterir",
      "Rüyada yoğun ama olumlu bir duygu yaşamak; duygusal ihtiyaçlarınızın farkında olduğunuzu ve onlara alan açmaya başladığınızı yansıtır",
      "Duygu yoğunluğunun eşliğinde bir çözüm ya da barışma sahnesi; bilinçaltının sizi hem hazırladığı hem de iyileştirdiği bir katarsis anıdır",
      "Duygusal bağlantı ve paylaşım içeren rüya sahneleri; ilişkilerinizde daha derin bir açıklık ve güvene hazır olduğunuzu simgeleyen olumlu bir süreçtir",
      "Korku ya da üzüntünün yerini rahatlama veya umut duygusuna bıraktığı rüya sahneleri; bilinçaltının sizi duygusal bir dönüşüme hazırladığının işaretleridir",
      "Duygusal rüyalar aracılığıyla geçmiş bir yarayı sembolik olarak iyileştirmek; psikolojik dayan_ıkl_ılığın doğal ve sağlıklı bir parçasıdır",
    ],
    negative: [
      "Bastırılmış duygular bilinçaltında yoğun bir baskı oluşturmuş olabilir",
      "Kaygı veya hüzün döngüleri rüya dilinde sembolik sahnelere dönüşmüştür",
      "Öfke veya kırgınlık gibi işlenmemiş duygular çözüm bekliyor olabilir",
      "Duygusal aşırı yüklenme tükenmişlik sinyali veriyor olabilir",
      "Yalnızlık veya aidiyet eksikliği bilinçaltında güçlü izler bırakmaktadır",
      "Duygusal savunma mekanizmalarınız aşırı aktif hâle gelmiş görünmektedir",
      "Kronik kaygı veya kontrol edilemeyen öfke; bilinçaltında sembolik olarak dışa vurulmaya devam ettiği sürece günlük işlevselliğinizi etkilemeye devam eder",
      "Uzun süre fark edilmeden taşınan bir yalnızlık ya da görülmeme hissi, rüya sahnelerinde sıklıkla terk edilme veya kaybolma temaları olarak belirir",
      "Tamamlanmamış yas süreçlerinin bilinçdışında tetiklediği üzüntü patlamaları; rüya dilinde kayıp, ayrılık ya da bitişlerin imgelemine dönüşür",
      "Duygusal kendini sabote etme kalıplarının aktif olduğu dönemlerde; rüyalar çoğu zaman bu döngüyü açık ve sert bir dille yüze çarpar",
      "Utanç ya da suçluluk duygusunun bastırılması; öz-değer imgesi üzerinde ağır ve yıpratıcı etkiler bırakır ve bu etkiler rüya sahnelerinde tehdit, kaçış ya da yetersizlik biçiminde kendini gösterir",
      "Duygusal tükenmişlik dönemlerinde bilinçaltı sıklıkla gri, donuk veya anlamsız rüya imgelemleri üretir; bu imgeler duygusal kaynak rezervinin kritik düzeye indiğinin ilk sessiz habercileridir",
    ],
    psych: [
      "Duygu odaklı terapi bu rüyaları işlenmemiş duygusal deneyimlerin geri dönüşü olarak okur",
      "Duygusal şemalar rüya senaryolarının temel yapı taşlarını oluşturur",
      "Bilinçdışı duygusal işleme uyku sırasında en verimli döneminde çalışır",
      "Rüyadaki duygusal yoğunluk günlük yaşamdaki duygusal düzenleme kapasitesiyle ters orantılı olabilir",
      "Alexitimi eğilimi olan bireylerde duygusal rüyalar özel bir telafi işlevi görür",
      "Afektif nörobilim rüyadaki duyguların amigdala konsolidasyonuyla bağlantılı olduğunu gösterir",
      "Duygu şemaları kuramı; erken yaşantılardan gelen duygusal kalıpların rüya sahnelerinde yeniden sahnelenmesini bireyin o kalıplarla derinlemesine yüzleşme fırsatı olarak değerlendirir",
      "Duygu düzenleme stratejileri araştırmaları; bastırma yerine yeniden değerlendirme kullanan bireylerin daha az kaygı yüklü ve daha çok çözüm odaklı rüyalar yaşadığını gösteriyor",
      "REM uykusunun duyguları dönüştürücü işlevi; günün duygusal yükünü farklı bir bağlamda analiz ederek sabaha daha nötr ve sakin bir zihinsel tablo sunmaya yardımcı olur",
      "Psikodinamik terapi sürecinde gelişen duygusal farkındalık genellikle rüya içeriklerini de zengin ve nüanslı hâle getirir",
      "Sahte pozitiflik ya da duygusal kaçınma eğilimi; bu tür rüyaların örtülü mesajlarını anlamayı güçleştiren en yaygın engeldir",
      "Duygusal etiketleme nörobilimi; bir duyguya isim vermek amigdala tepkisini azaltır ve bu süreç rüya içeriklerinin bilinçli işlenmesini kolaylaştırır",
    ],
    spiritual: [
      "İslami gelenekte sevinç ve huzur veren rüyalar rahmani kabul edilir",
      "Korku ve kaygı barındıran rüyalarda istiaze okunması tavsiye edilir",
      "Ağlama sahneleri bazen günahların affedildiğinin müjdecisi olarak yorumlanır",
      "Manevi neşe ve vecd halleri rüyada kalbin zikre olan hasretini yansıtır",
      "Duygusal yoğunluk taşıyan rüyalar istihare sonucunu değerlendirmede önem kazanır",
      "Tasavvufta gözyaşı kalbin yumuşamasının ve manevi açılımın alameti sayılır",
      "İslami yorumda üzüntü rüyasının ardından uyanmak; dua ve istiğfar için güçlü bir fırsat olarak değerlendirilebilir",
      "Manevi bir rahatlama ya da ferahlama hissiyle biten rüyalar; Allah'ın rahmeti ve lütfunun şimşek gibi kalpte parlayıp geçtiğinin sembolik ifadesi olabilir",
      "Korku ya da dehşet içeren rüyalar; İslami yorumda şeytanın vesvesesi veya bedenin yorgunluğuna bağlanır; bu tür rüyalar için kalıp duaların okunması yeterlidir",
      "Tasavvufi vedaya (cennet özlemi, ezeli vatan hasreti) ilişkin duygusal rüyalar; kalbin ilahi kökenine ve gerçek vatanına duyduğu hasretin bilinçdışı yansımaları olarak özel bir derinlik taşır",
      "Duygu yoğun rüyalarda uyanıp namaza kalkmak ve hâlâ taşınan o duygu ile dua etmek; birçok manevi geleneğin içgüdüsel olarak onayladığı bir arınma ritüelidir",
      "Sevinç ya da şükranla donanmış bir rüyadan kalkmak; o günü Allah'a müteveccih ve minnettar geçirmek için güçlü manevi bir zemin oluşturur",
    ],
    advice: [
      "Duygularınızı yargılamadan gözlemleme pratiği yaparak farkındalığınızı artırabilirsiniz",
      "Rüyanızdaki duyguyu bir günlüğe yazmak bilinçdışı mesajı deşifre etmenize yardımcı olur",
      "Güvendiğiniz biriyle rüyanızı paylaşmak duygusal yükü hafifletebilir",
      "Sanat veya müzik gibi yaratıcı ifade yolları duygusal işlemeyi destekler",
      "Profesyonel destek almak tekrarlayan yoğun duygusal rüyalarda değerli bir adımdır",
      "Nefes farkındalığı ve meditasyon pratiği duygusal düzenleme kapasitenizi güçlendirir",
      "Rüyadaki duyguya bir isim verin ve o duygunun günlük hayatınızda tam olarak nerede aktif olduğunu araştırın; bu eşleştirme çoğu zaman beklenmedik bir farkındalık kapısı açar",
      "Duygusal günlük tutmak; rüyalar ile günlük deneyimler arasındaki örüntüleri görünür kılar ve bilinçdışı işleme sürecinizi hızlandırır",
      "Duygu odaklı terapi veya EMDR gibi psikolojik yaklaşımlar; rüyalarda tekrarlayan yoğun duygu sahnelerini çözüme kavuşturmada özellikle etkilidir",
      "Rüyadaki duyguyu bastırmaya ya da mantıkla geçiştirmeye çalışmak yerine; ona meraklı ve şefkatli bir gözle yaklaşmak, bilinçaltının mesajını anlamanın en kısa yoludur",
      "Bilinçli imgeleme egzersizleri (guided imagery) ile rüyadaki sahneyi yeniden canlandırmak; bastırılmış duygu deneyimlerinin güvenli bir ortamda işlenmesine yardımcı olabilir",
      "Bu rüyayı sizinle paylaşmak isteyen bilinçaltınıza teşekkür edin; kendi iç sesinize göstereceğiniz bu saygı, ilerleyen rüyaların daha berrak ve destekleyici olmasına zemin hazırlar",
    ],
  },

  /* ── MIXED ──────────────────────────────────────────────────────────── */
  mixed: {
    label: "karmaşık",
    adjectives: [
      "çok boyutlu", "katmanlı", "sentezleyici", "bütüncül",
      "karmaşık", "zengin", "derinlikli", "kapsayıcı",
    ],
    metaphors: [
      "bilinçaltının çok sesli bir senfonisi",
      "anlamların kesiştiği sembolik kavşak",
      "birden fazla psikolojik katmanın aynı anda seslenmesi",
      "ruhun mozaiğindeki farklı renklerin buluşması",
      "içsel dünyanızın panoramik bir fotoğrafı",
      "bilinçdışının geniş bir tuvale yayılmış tablosu",
    ],
    frameworks: [
      "bütüncül yorum geleneği", "eklektik psikoloji",
      "çok boyutlu analiz", "entegratif yaklaşım",
    ],
    openings: [
      "Rüya sahnesi bazen tek bir sembol değil, çok sayıda temanın eş zamanlı yankılandığı zengin bir anlatı sunar; bu karmaşıklık bir sorun değil, bilinçaltınızın kapsamlı ve dürüst sesidir.",
      "Çok katmanlı rüyalar, yüksek düzeyde sembolik işleme kapasitesine sahip bireylerin karakteristik uyku deneyimidir; bilinçaltınızın bu derinlikte çalıştığı bir dönemi yaşıyorsunuz.",
      "Eklektik psikoloji perspektifinden bakıldığında, birden fazla temayla dolu bir rüya; kişiliğin farklı yüzlerinin bilinçdışında aynı anda diyalog kurduğunu yansıtır.",
      "Entegratif bir okuma; rüyadaki farklı temaların çelişkili değil tamamlayıcı olduğunu kabul ederek her katmanın kendi doğrusunu ilettiğini öngörür.",
      "Hayatınızdaki birden fazla alanda eş zamanlı yaşanan değişimler ve geçişler; bilinçaltınızın bunları tek bir semfonik anlatı olarak rüyaya taşımasına zemin hazırlar.",
      "Bütüncül yorum geleneği, karmaşık rüyaları tek bir perspektiften okumak yerine farklı anlam katmanlarını yan yana tutarak zengin bir anlam haritası ortaya çıkarmayı önerir.",
      "Çok temalı bir rüya, yoğun ve hızlı değişimlerin yaşandığı dönemlerde bilinçaltının söylemek istediklerini arka arkaya sıralayarak sunmasıyla oluşur.",
      "Gestalt psikolojisinin bütün, parçaların toplamından büyüktür ilkesi; karma temalı bu rüyanın ayrı ayrı incelenen unsurlarının ötesinde bir mesaj taşıdığını kavramak için güçlü bir rehber sunar.",
      "Rüyada birden fazla figürün, mekânın ya da duygunun bir arada yer alması; bilinçaltınızın hayatınızın panoramik tasviri ürettiği ve sizi büyük resme davet ettiği anlardandır.",
      "Karmaşık rüyaları not alarak zaman içinde incelemek; bu katmanların birbirleriyle nasıl ilişkilendiğini ve hangi daha derin temayı işaret ettiğini anlamak için en güvenilir yoldur.",
      "Farklı yaşam alanlarının (ilişki, kariyer, kimlik, manevi boyut) aynı rüyada bir araya gelmesi; bilinçaltının o alanların birbirinden bağımsız olmadığını, aksine derinden bağlı olduğunu vurgulamasıdır.",
      "Karma temalı rüyalar; bireyin kişisel büyüme ve entegrasyon sürecinin en derin evresinde — yani farklı benlik yönlerinin barışmaya başladığı dönemlerde — zirveye çıkma eğilimi gösterir.",
    ],
    positive: [
      "Zengin bir iç dünyanın ve derin bir farkındalığın göstergesidir",
      "Birden fazla yaşam alanında eş zamanlı olumlu gelişmelere kapı aralandığını gösterir",
      "Karmaşıklığı anlamlandırma ve bütüncül düşünme kapasitenizin güçlülüğünü simgeler",
      "Yaşamınızdaki farklı parçaların uyum içinde bütünleşmeye başladığına işaret eder",
      "Çok katmanlı rüyalar genellikle kişisel gelişimin en verimli dönemlerinde görülür",
      "Farklı temaların bir araya gelmesi yaratıcı potansiyelinizin zirveye yaklaştığını yansıtır",
      "Birden fazla kimlik boyutunuzun (ebeveyn, profesyonel, bireysel) aynı rüyada sağlıklı biçimde yer bulması bütünleşme ve olgunlaşmanın güçlü bir göstergesidir",
      "Karma temalı ama huzurlu bir atmosfere sahip bu rüya; bilinçaltınızın farklı ihtiyaçlarınızı aynı anda fark ettiğini ve onları dengeleme kapasitesine güvendiğini yansıtır",
      "Farklı sembollerin rüyada birbiriyle uyum içinde görünmesi; hayatınızdaki ayrışık gibi görünen parçaların aslında derin bir uyum içinde olduğunun bilinçdışı onayıdır",
      "Karmaşık yaşam dönemlerinde çok katmanlı rüyalar görmek olağandır; ancak bu rüyanın bıraktığı genel iyi hissi dikkat çekicidir ve büyüme sürecinizin hızlandığını gösterir",
      "Birden fazla çözüm ya da fırsat içeren rüya sahnesi; bilinçaltınızın bu dönemdeki zenginliklerini sizinle paylaşmak için kollarını açtığının ibaresidir",
      "Yoğun ama anlam dolu bu rüya; kendinizin daha bütüncül ve derinlikli bir versiyonuna doğru ilerlediğinizin sembolik haberini taşır",
    ],
    negative: [
      "Birden fazla alanda aynı anda yaşanan stres bilinçaltında karmaşık senaryolar üretebilir",
      "Çelişkili duygular ve talepler arasında sıkışma hissinin sembolik dışavurumudur",
      "Yaşamınızdaki belirsizliklerin birbiriyle etkileşerek büyüdüğünü yansıtabilir",
      "Önceliklerin netleştirilmemesi bilişsel aşırı yüklenmeye neden olmuş olabilir",
      "Çok fazla rol ve sorumluluğun yarattığı dağınıklık hissi bilinçdışına taşmaktadır",
      "Tamamlanmamış birden fazla süreç aynı anda çözüm bekliyor olabilir",
      "Birden fazla kimliği ya da rolü dengeleme güçlüğü; rüyada çelişkili figürler veya mekânlar aracılığıyla açık bir çatışma sahnesine dönüşmüş olabilir",
      "Hayatınızın farklı alanlarındaki çözümsüz meselelerin bilinçdışında üst üste yığılması; kaotik ve anlamsız hissettiren karma rüya sahnelerinin en yaygın kaynağıdır",
      "Karar süreçlerindeki belirsizlik ve erteleme eğilimi; karma temalı rüyalarda sıklıkla yol çatalları, kapılar ya da kalabalık mekânlar biçiminde belirginleşir",
      "Kontrol etmek istediğiniz ama yönetemediğiniz birden fazla alanın aynı rüyada yüzeye çıkması; tükenmişlik ve aşırı yüklenme eşiğinin tehlikeli biçimde yaklaştığının sinyalidir",
      "Bu tür karmaşık rüyaların sıklaşması; hayatınızdaki bütüncül bir yeniden yapılandırmanın artık ertelenemeyen ve gerçek bir ihtiyaç olarak olgunlaştığının göstergesi olabilir",
      "Birbiriyle çelişen semboller içeren bu rüya; henüz bir senteze ulaşmamış değerler, kimlikler veya ilişkilerin aynı bilinçdışı sahnede yan yana var olmasının yarattığı gerilimi dışa vurur",
    ],
    psych: [
      "Çok katmanlı rüyalar yüksek düzeyde sembolik düşünme kapasitesine sahip bireylerde sıktır",
      "Entegratif psikoloji bu rüyaları kişiliğin farklı yüzlerinin diyalogu olarak değerlendirir",
      "Karmaşık rüya senaryoları bilişsel esnekliğin ve yaratıcılığın psikolojik göstergesidir",
      "Dissosiyatif değil bütünleştirici bir süreçse bu karmaşıklık olumlu bir işarettir",
      "Rüyanın farklı katmanları Gestalt terapide ayrı ayrı keşfedilerek bütünleştirilir",
      "Çoklu semboller bilinçdışında eş zamanlı işlenen birden fazla konunun varlığına işaret eder",
      "Bilişsel yük araştırmaları; aşırı yüklenmiş bellek sistemlerinin rüya sahnelerini parçalı ve tutarsız ürettiğini gösterir — bu karmaşıklık bir hastalık değil, sistemin kapasitesinin zorlandığının sinyalidir",
      "Jungcu analitik psikoloji bu tür rüyalarda individuasyon sürecinin — kendini bütüncül kılma yolculuğunun — yoğun çalıştığını okur",
      "Polyvagal teori; karmaşık rüya içeriklerinin otonom sinir sisteminin farklı düzenleyici durumlarının eş zamanlı aktif olduğu dönemlerle örtüştüğünü ileri sürer",
      "Bilinçdışında eş zamanlı işlenen farklı bağlamlı anılar, kaygılar ve arzular; rüya sahnesinde çok figürlü ve çok mekânlı tablolar olarak anlam kazanır",
      "Rüyadaki farklı sembollerin her birini ayrı bir 'iç ses' olarak okumak ve bu seslerin birbiriyle ilişkisini haritalamak; psikoterapi sürecinde çok değerli materyaller ortaya çıkarır",
      "Bütüncül bir anlayışla yaklaşıldığında; karma temalı rüyalar bireyin o dönemde hem en çok zorlanan hem de en güçlü büyüme potansiyeli taşıyan alanlarına içgörü sunabilir",
    ],
    spiritual: [
      "İslami gelenekte çok katmanlı rüyalar derinlikli yorum gerektiren özel mesajlar taşır",
      "Farklı manevi temaların bir arada görülmesi kapsamlı bir ruhsal muhasebe çağrısı olabilir",
      "Tasavvufi yorum geleneği bu rüyaları zahir ve batın katmanlarıyla ayrı ayrı inceler",
      "Karmaşık rüyalar bazen istiharenin birden fazla boyutuna cevap taşıyan işaretlerdir",
      "Bu tür rüyaları yalnızca bir boyutuyla değil bütüncül manevi perspektifle okumak gerekir",
      "Manevi büyüklerin rüya yorumlarında katman katman analiz yöntemi özellikle bu tür için kullanılır",
      "İslami kaynaklarda çok temali rüyaların yorumu; rüya sahibinin o dönemdeki ruhsal durumu, niyeti ve yaşam koşullarıyla birlikte değerlendirilmeden sağlıklı bir sonuca ulaşmaz",
      "Tasavvufi sembolizm açısından bir rüyada hem dünyevi hem manevi unsurların bir arada yer alması; kişinin berzah hâlini — iki âlem arasındaki geçiş noktasındaki ruhani durumunu — yansıtıyor olabilir",
      "Farklı manevi figürlerin aynı rüyada yer aldığı senaryolar; İslami yorum geleneğinde büyük bir dikkatle ve o figürlerin manevi makamlarına saygı gösterilerek analiz edilir",
      "Bu tür karma rüyaları bilinçli niyetle tekrar geçirmek ve her sembolün üzerinde ayrıca durmak; manevi bir meşguliyet ve zikir hâline dönüşerek tefekküre kapı aralar",
      "Sadık rüyayla şeytan rüyası arasındaki ayrımı yaparken karma bir rüyanın bıraktığı genel his çok belirleyicidir; huzur ve anlam yoğunluğu rahmani etkiye, kaygı ve anlamsızlık ise şeytana ya da nefse işaret edebilir",
      "Rüyadaki karmaşıklığı bir kaos değil çok sesli bir ilahi hikmet daveti olarak okumak; manevi olgunluğun ve derin tefekküre hazır olmanın güzel bir göstergesidir",
    ],
    advice: [
      "Rüyanızın her katmanını ayrı ayrı not alarak hangi temanın en güçlü hissettirdiğini belirleyin",
      "Hayatınızdaki öncelikleri netleştirmek karmaşıklık hissini azaltacaktır",
      "Bütüncül bir bakış açısı geliştirmek için mindfulness pratiğini deneyebilirsiniz",
      "Her bir temayı ayrı ayrı değerlendirdikten sonra aralarındaki bağlantıyı keşfedin",
      "Profesyonel destek almak bu tür çok boyutlu rüyaların deşifresinde çok faydalı olabilir",
      "Karmaşıklığı kabullenmek ve her yanıtı hemen bulmaya çalışmamak bilgeliğin bir parçasıdır",
      "Rüyadaki her sembolü ayrı bir not kartına yazmak, ardından bu kartlar arasındaki bağlantıları iplikle ya da oklarla görselleştirmek; bilinçdışındaki büyük resmi görmek için güçlü ve eğlenceli bir araçtır",
      "Bu rüyayı birkaç gün boyunca kendinizle taşıyın; aceleci bir anlam arayışı yerine ilk dikkat çekici öğeyle başlayıp zamanla katmanları açın",
      "Farklı yorum çerçevelerini — psikolojik, manevi, pratik — birbirini dışlamadan, eklektik bir yaklaşımla arka arkaya deneyin",
      "Bu tür rüyaları sizi zorlayan dönemlerin değil, bilinçaltınızın büyük resmi sezdiği ve size sunmak istediği özel anların ürünü olarak görmek; yorumlama sürecini daha az bunaltıcı kılar",
      "Karma semboller içeren bu rüyayı bir entegrasyon daveti olarak kabul edin: Hayatınızda birbirinden kopuk gibi görünen hangi parçaları birleştirme zamanı geldi?",
      "Bir terapistle bu rüyayı incelemek; hem bireysel hem de ilişkisel katmanları aynı anda görünür kılma fırsatı sunar ve beklenmedik içgörüler ortaya çıkarabilir",
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  BAŞLIK HAVUZLARI — her bölüm × tip için benzersiz H3 başlıkları
// ═══════════════════════════════════════════════════════════════════════════════

function generateHeading(
  section: Section,
  type: DreamType,
  entity: string,
  h: number
): string {
  const E = entity.charAt(0).toUpperCase() + entity.slice(1);
  const label = PROFILES[type].label;

  const pools: Record<Section, string[]> = {
    positive: [
      `${E} Rüyasının Olumlu Mesajları`,
      `${E} ve ${label[0].toUpperCase() + label.slice(1)} Temasında Hayırlı İşaretler`,
      `${E} Görmek: Umut Veren Yorumlar`,
      `Bu Rüyanın Taşıdığı Pozitif Enerji`,
    ],
    negative: [
      `${E} Rüyasında Dikkat Edilmesi Gerekenler`,
      `Uyarı Niteliği Taşıyan Sembolik İpuçları`,
      `${E} ile İlgili Endişe Veren Yorumlar`,
      `Bu Rüyanın Gölge Tarafı`,
    ],
    psychological: [
      `${E} Rüyasının Psikolojik Arka Planı`,
      `Bilinçaltının ${E} Aracılığıyla Konuşması`,
      `${E} ve ${label[0].toUpperCase() + label.slice(1)} Psikolojisi`,
      `Derinlemesine Zihinsel Analiz`,
    ],
    religious: [
      `${E} Rüyasının İslami Yorumu`,
      `Manevi Perspektiften ${E} Görmek`,
      `Dini Kaynaklarda ${E} Sembolizması`,
      `${E} ve Ruhani Anlamlar`,
    ],
    advice: [
      `${E} Rüyası Sonrası Pratik Öneriler`,
      `Bu Rüyadan Sonra Ne Yapmalısınız?`,
      `${E} Rüyası İçin Uzman Tavsiyeleri`,
      `Günlük Hayata Yansıtılacak Adımlar`,
    ],
  };

  return pick(pools[section], h, 0);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PARAGRAF OLUŞTURUCULAR — her bölüm için 4 farklı yapısal kalıp
// ═══════════════════════════════════════════════════════════════════════════════

type InsightKey = "positive" | "negative" | "psych" | "spiritual" | "advice";

const SECTION_TO_INSIGHT: Record<Section, InsightKey> = {
  positive: "positive",
  negative: "negative",
  psychological: "psych",
  religious: "spiritual",
  advice: "advice",
};

/**
 * 6 yapısal kalıp × profil havuzu × tip-bazlı açılış ile doğal paragraflar üretir.
 * Her kalıp farklı bir açılış stili ve argüman akışı kullanır.
 * Seed çift ise kısa (90-110 kelime), tek ise uzun (130-170 kelime) paragraf.
 *
 * Açılış cümleleri kalıp × tip kombinasyonuna göre değişir — yapısal parmak izi riski azaltılmıştır.
 */

/**
 * Oluşturulan cümleleri birleştiren yardımcı fonksiyon.
 * Boş ve yalnızca boşluk içeren parçaları filtreler.
 */
function sentences(parts: string[]): string {
  return parts.filter((s) => s.trim()).join(" ").replace(/\s+/g, " ").trim();
}

function buildParagraph(
  section: Section,
  profile: TypeProfile,
  entity: string,
  secondary: string,
  h: number
): string {
  const insightKey = SECTION_TO_INSIGHT[section];
  const insights = profile[insightKey];
  const isLong = h % 2 === 1;
  const pattern = h % 8; // 8 yapısal kalıp

  const adj1 = pick(profile.adjectives, h, 0);
  const adj2 = pick(profile.adjectives, h, 3);
  const met = pick(profile.metaphors, h, 1);
  const fw = pick(profile.frameworks, h, 0);
  const ins1 = pick(insights, h, 0);
  const ins2 = pick(insights, h, 4);
  const ins3 = pick(insights, h, 8);
  const ins4 = pick(insights, h, 2);
  const opener = pick(profile.openings, h, pattern % profile.openings.length);

  const secondaryNote = secondary
    ? `Bu bağlamda ${secondary.toLowerCase()} detayı mesajı özelleştirmektedir.`
    : "";

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  switch (pattern) {
    case 0:
      return sentences([
        opener,
        `${cap(fw)} perspektifinden değerlendirildiğinde, ${ins1.toLowerCase()}.`,
        `${cap(adj1)} bir anlam katmanı olarak, ${ins2.toLowerCase()}.`,
        isLong ? `${cap(ins3)}. ${secondaryNote}` : secondaryNote,
      ]);
    case 1:
      return sentences([
        `${ins1}.`,
        opener,
        `${cap(met)} olarak da değerlendirilebilir.`,
        isLong ? `${cap(ins2)}. ${secondaryNote}` : secondaryNote,
      ]);
    case 2:
      return sentences([
        `${cap(fw)} bu tür rüyalara özel bir anlam yükler.`,
        opener,
        `${ins1}.`,
        isLong
          ? `${cap(adj2)} boyutuyla incelendiğinde, ${ins2.toLowerCase()}. ${secondaryNote}`
          : secondaryNote || `${cap(ins3)}.`,
      ]);
    case 3:
      return sentences([
        `${opener} Bu imgelemin rüya dili açısından taşıdığı anlam nedir?`,
        `${cap(fw)} çerçevesinde: ${ins1.toLowerCase()}.`,
        `Bununla birlikte ${ins2.toLowerCase()}.`,
        isLong
          ? `${cap(met)} — bu perspektiften bakıldığında ${ins3.toLowerCase()}. ${secondaryNote}`
          : secondaryNote,
      ]);
    case 4:
      return sentences([
        `${cap(met)}.`,
        opener,
        `${ins1}. Öte yandan ${ins4.toLowerCase()}.`,
        isLong
          ? `${cap(adj1)} nüansıyla ele alındığında, ${ins2.toLowerCase()}. ${secondaryNote}`
          : secondaryNote || `${cap(ins3)}.`,
      ]);
    case 5:
      return sentences([
        opener,
        `${ins1}.`,
        `${cap(fw)} bunu şöyle açıklar: ${ins2.toLowerCase()}.`,
        isLong
          ? `${cap(ins3)}, bu yorumu pekiştiren önemli bir katmandır. ${secondaryNote}`
          : secondaryNote,
      ]);
    case 6:
      return sentences([
        `${ins1}.`,
        `${cap(ins2)}.`,
        opener,
        isLong
          ? `${cap(fw)} perspektifinden bakıldığında, ${ins3.toLowerCase()}. ${secondaryNote}`
          : secondaryNote || "",
      ]);
    default:
      return sentences([
        opener,
        `${cap(adj1)} ve ${adj2} bir anlam barındıran bu rüya, ${ins1.toLowerCase()}.`,
        isLong
          ? `${cap(ins2)}. ${cap(fw)} bağlamında ise ${ins3.toLowerCase()}. ${secondaryNote}`
          : secondaryNote || `${cap(ins3)}.`,
      ]);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SAHNE BAZLI CÜMLE HAVUZLARI — eylem, ton, sosyal bağlam, yoğunluk, risk
// ═══════════════════════════════════════════════════════════════════════════════

const SCENE_ACTION_POOLS: Record<string, string[]> = {
  kaçmak: [
    "Rüyadaki kaçış motifi, bilinçaltınızda biriken baskıdan uzaklaşma arzusunun ve kaçınma eğiliminin doğrudan bir dışavurumudur.",
    "Bu rüyadaki kaçma eylemi, çözümsüz bırakılmış bir gerginliğin veya yüzleşilmekten kaçınılan bir meselenin sembolik ifadesidir.",
    "Kaçma sahnesi, hayatınızda bastırılmış bir tehdit algısının bilinçdışı düzeyde aktif kaldığını göstermektedir.",
  ],
  kovalamak: [
    "Kovalama motifi, ulaşılmak istenen ama henüz elde edilememiş hedeflerin bilinçaltındaki ısrarcı izini yansıtır.",
    "Bu rüyadaki takip sahnesi, ertelenen kararlar ile çözülmemiş arzular arasındaki gerilimi sembolik olarak ortaya koyar.",
    "Rüyadaki kovalama eylemi, kararlılık ile erişilemeyen hedefler arasında süregelen bilinçdışı bir mücadeleyi temsil eder.",
  ],
  konuşmak: [
    "Rüyadaki konuşma sahnesi, dile getirilememiş duyguların ve paylaşılmak istenen düşüncelerin bilinçaltına yansımasıdır.",
    "İletişim motifi, bastırılmış ifade ihtiyacını ve gerçek yaşamda kurulmak istenen bağlantıların içsel bir çağrısıdır.",
    "Bu rüyadaki diyalog unsuru, iç dünyanız ile dış gerçeklik arasında köprü kurma arzusunun sembolik dilidir.",
  ],
  kaybetmek: [
    "Kaybetme motifi, kontrol dışına çıkan bir durumun veya elden kaçırılan bir fırsatın bilinçaltındaki yansımasıdır.",
    "Rüyadaki kayıp sahnesi, güvensizlik duygusunun ve koruma ihtiyacının derinlerde kök salmış sembolik ifadesidir.",
    "Kayıp teması, değer verdiğiniz bir şeyin tehdit altında olduğu algısının bilinçdışı düzeyde işlenmesini gösterir.",
  ],
  saldırmak: [
    "Rüyadaki saldırı sahnesi, bastırılmış öfkenin veya savunma güdüsünün bilinçaltındaki yoğun bir dışavurumudur.",
    "Saldırma motifi, çözümsüz çatışmaların ve içsel gerilimin rüyada sembolik bir patlama biçiminde kendini göstermesidir.",
    "Bu rüyadaki agresif eylem, kontrol altına alınmaya çalışılan duygusal enerjinin bilinçdışından fışkırmasını temsil eder.",
  ],
  düşmek: [
    "Rüyadaki düşme deneyimi, kontrol kaybı korkusunun ve güvensizlik hissinin en yaygın sembolik ifadelerinden biridir.",
    "Düşme motifi, hayatınızda sarsılan dengenin veya bir geçiş döneminin yarattığı kaygının bilinçaltındaki yansımasıdır.",
    "Bu rüyadaki düşüş sahnesi, aidiyet ve tutunma duygusunun zayıfladığı bir dönemin habercisi olabilir.",
  ],
  sarılmak: [
    "Rüyadaki kucaklaşma sahnesi, iç dünyanızdaki güven ve yakınlık ihtiyacının karşılandığını gösterir.",
    "Sarılma motifi, duygusal bağlarınızın güçlendiğini ve kabul görme arzusunun doyuma ulaştığını sembolize eder.",
  ],
  evlenmek: [
    "Rüyadaki evlilik sahnesi, birleşme arzusunu, bağlanma kapasitesini ve hayatınızda yeni bir dönemin başlangıcını temsil eder.",
    "Evlenme motifi, bilinçaltınızdaki tamamlanma ihtiyacının ve duygusal olgunluğun güçlü bir yansımasıdır.",
  ],
  bulmak: [
    "Rüyada bir şeyi bulma sahnesi, uzun süredir aranan bir cevabın ya da çözümün yakınlaştığını sembolize eder.",
    "Bulma motifi, keşif kapasitesinin ve iç kaynaklara ulaşma gücünün bilinçaltı tarafından onaylanmasıdır.",
  ],
  ölmek: [
    "Rüyadaki ölüm motifi, genellikle bir dönemin kapanışını ve köklü bir dönüşümün başlangıcını sembolize eden güçlü bir arketiptir.",
    "Ölüm sahnesi, bilinçaltının eski kalıplardan arınma ve yenilenme sürecini en çarpıcı biçimde ifade etme yoludur.",
  ],
  ağlamak: [
    "Rüyadaki ağlama sahnesi, bastırılmış duyguların yüzeye çıkmasının ve duygusal arınma sürecinin sembolik karşılığıdır.",
    "Ağlama motifi, bilinçaltınızdaki birikmiş acının veya rahatlamanın serbest bırakıldığı bir katarsis anını temsil eder.",
  ],
  gülmek: [
    "Rüyadaki gülme sahnesi, bilinçaltınızdaki rahatlama ve huzur duygusunun güçlü bir dışavurumudur.",
    "Gülme motifi, iç dünyanızdaki olumlu enerjinin doyuma ulaştığını ve iyimserliğin kök saldığını gösterir.",
  ],
  koşmak: [
    "Rüyadaki koşma sahnesi, bir hedefe doğru güçlü bir motivasyonun veya bir durumdan uzaklaşma dürtüsünün yansımasıdır.",
    "Koşma motifi, aciliyet hissinin ve içsel enerjinin yoğunlaştığı bir dönemin sembolik ifadesidir.",
  ],
  uçmak: [
    "Rüyadaki uçma deneyimi, sınırları aşma arzusunun ve özgürleşme dürtüsünün en evrensel sembollerinden biridir.",
    "Uçma motifi, perspektif kazanma, yükselme ve kısıtlamalardan kurtulma ihtiyacının bilinçaltındaki güçlü yansımasıdır.",
  ],
  yüzmek: [
    "Rüyadaki yüzme sahnesi, duygusal derinliklerle başa çıkma kapasitesinin ve iç huzura ulaşma çabasının sembolik ifadesidir.",
    "Yüzme motifi, bilinçdışının duygusal akışa uyum sağlama ve esnek kalma mesajını ilettiğini gösterir.",
  ],
  "kavga etmek": [
    "Rüyadaki kavga sahnesi, bastırılmış çatışma ve çözülmemiş gerilimin bilinçaltından yoğun bir şekilde dışa vurmasıdır.",
    "Kavga motifi, iç dünyanızdaki karşıt güçlerin denge arayışında olduğunu ve bir çözüm beklediğini gösterir.",
  ],
  tartışmak: [
    "Rüyadaki tartışma sahnesi, farklı bakış açılarının iç dünyanızda çatıştığını ve bir uzlaşmaya ihtiyaç duyulduğunu gösterir.",
    "Tartışma motifi, ifade edilmemiş görüş ayrılıklarının bilinçaltında aktif bir şekilde işlendiğinin kanıtıdır.",
  ],
  görmek: [],
};

// ─── Duygusal ton bindirme cümleleri ─────────────────────────────────────────

const SCENE_NEGATIVE_TONE: string[] = [
  "Bu rüyanın uyandırdığı olumsuz duyguları abartmadan, bilinçaltınızın sizi uyarma ve hazırlama çabası olarak değerlendirmek daha sağlıklıdır.",
  "Olumsuz duygu yükü taşıyan bu imgelem, aslında düzeltilmek istenen bir iç dengesizliğe farkındalık yaratma amacı güder.",
  "Rüyanın yarattığı kaygı geçici olup; bilinçaltınızın koruyucu bir refleksle dikkatinizi belirli bir alana çekmesidir.",
];

const SCENE_POSITIVE_TONE: string[] = [
  "Rüyanızın taşıdığı olumlu enerji, bilinçaltınızdaki umut ve güven duygusunun pekiştiğini doğrulayan bir işarettir.",
  "Bu pozitif imgelem, yaşam enerjinizin güçlü bir dönemden geçtiğinin bilinçaltı onayı olarak yorumlanabilir.",
];

// ─── Risk uyarısı ────────────────────────────────────────────────────────────

const SCENE_DANGER_CAUTION: string[] = [
  "Bu tür yoğun imgeler karşısında sakin kalmak, rüyanın mesajını doğru yorumlamanın ön koşuludur; gerekirse profesyonel bir destekten faydalanabilirsiniz.",
  "Rüyanın taşıdığı güçlü uyarı sinyalini bir tehdit olarak değil, bilinçaltınızın önemli bir konuya dikkat çekme biçimi olarak değerlendirmeniz önerilir.",
];

// ─── Yoğunluk ek cümlesi (high → paragraf +%20) ────────────────────────────

const SCENE_INTENSITY_EXTRA: string[] = [
  "Sembolün bu denli güçlü bir biçimde ortaya çıkması, bilinçaltının mesajı acil ve öncelikli olarak iletme ihtiyacı duyduğunu göstermektedir.",
  "Rüyanın yoğun enerjisi, iç dünyanızda aktif ve süregelen bir işleme sürecinin açık kanıtıdır.",
  "Bu güçlü imgelemin varlığı, konunun bilinçaltı gündeminizdeki öncelik sırasını doğrudan yansıtmaktadır.",
];

// ─── Sosyal bağlam cümleleri ─────────────────────────────────────────────────

const SCENE_SOCIAL_FAMILY: string[] = [
  "Rüyanın aile bağlamında şekillenmesi, yakın ilişkilerinizin bu dönemde bilinçaltınızda etkin bir yer tuttuğunu gösterir.",
  "Aile figürlerinin sahneye dahil olması, ait olma ve güvenlik duygusunun iç dünyanızdaki ağırlığını ortaya koyar.",
];

const SCENE_SOCIAL_CROWD: string[] = [
  "Kalabalık ortamda geçen bu sahne, sosyal baskının veya toplumsal beklentilerin bilinçaltınızdaki yansımasını temsil eder.",
  "Topluluk içinde yaşanan bu rüya, başkalarının gözünde kendinizi nasıl konumlandırdığınıza dair bilinçaltı mesajı taşır.",
];

const SCENE_SOCIAL_ALONE: string[] = [
  "Rüyadaki yalnızlık motifi, bireysel farkındalık ve içe dönük keşif sürecinizin bilinçaltındaki doğal karşılığıdır.",
  "Tek başına olma sahnesi, özerklik ihtiyacınızın veya izolasyon kaygınızın sembolik bir ifadesidir.",
];

// ─── Sahne bazlı cümle seçici ────────────────────────────────────────────────

function buildSceneClauses(
  scene: DreamScene,
  section: Section,
  h: number
): string[] {
  const clauses: string[] = [];

  // 1. Eylem cümlesi (en spesifik — max 1)
  for (const action of scene.actions) {
    const pool = SCENE_ACTION_POOLS[action];
    if (pool && pool.length > 0) {
      clauses.push(pick(pool, h, 0));
      break;
    }
  }

  // 2. Yoğunluk (high → ek cümle → paragraf ~%20 uzar)
  if (scene.intensity === "high") {
    clauses.push(pick(SCENE_INTENSITY_EXTRA, h, 1));
  }

  // 3. Duygusal ton (bölüm koşullu)
  if (
    scene.emotionalTone === "negative" &&
    (section === "negative" || section === "psychological")
  ) {
    clauses.push(pick(SCENE_NEGATIVE_TONE, h, 2));
  } else if (
    scene.emotionalTone === "positive" &&
    section === "positive"
  ) {
    clauses.push(pick(SCENE_POSITIVE_TONE, h, 2));
  }

  // 4. Sosyal bağlam (psikoloji + tavsiye bölümlerinde)
  if (section === "psychological" || section === "advice") {
    switch (scene.socialContext) {
      case "family":
        clauses.push(pick(SCENE_SOCIAL_FAMILY, h, 3));
        break;
      case "crowd":
        clauses.push(pick(SCENE_SOCIAL_CROWD, h, 3));
        break;
      case "alone":
        clauses.push(pick(SCENE_SOCIAL_ALONE, h, 3));
        break;
    }
  }

  // 5. Danger uyarısı (tavsiye bölümünde)
  if (scene.riskLevel === "danger" && section === "advice") {
    clauses.push(pick(SCENE_DANGER_CAUTION, h, 4));
  }

  // Paragrafı aşırı şişirmemek için max 2 cümle
  return clauses.slice(0, 2);
}

// ─── Sahne cümlelerini paragrafa enjekte et ─────────────────────────────────

/**
 * Mevcut paragraf metnine sahne-bazlı cümleleri deterministik bir pozisyona
 * enjekte eder. Pozisyon seed'e göre değişir — her zaman sona eklenmez.
 */
function injectSceneSentences(
  baseParagraph: string,
  scene: DreamScene | undefined,
  section: Section,
  h: number
): string {
  if (!scene) return baseParagraph;

  const clauses = buildSceneClauses(scene, section, h);
  if (clauses.length === 0) return baseParagraph;

  const sceneBlock = clauses.join(" ");

  // Cümle sınırlarında böl (". " — Türkçe paragraflar için güvenli)
  const segments = baseParagraph.split(/(?<=\.) /);

  if (segments.length <= 1) {
    return baseParagraph + " " + sceneBlock;
  }

  // Deterministik pozisyon: asla ilk cümle öncesinde değil, seed-bazlı değişir
  const insertPos = 1 + (h % (segments.length - 1));
  segments.splice(insertPos, 0, sceneBlock);

  return segments.join(" ");
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ANA FONKSİYON — getBlock
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Belirli bir bölüm, tip ve seed için benzersiz bir ContentBlock döndürür.
 *
 * @param section  İçerik bölümü (positive | negative | psychological | religious | advice)
 * @param type     Rüya tipi (DreamType)
 * @param seed     Deterministik seçim için tohum değeri (genellikle rüya başlığı)
 * @param entities SemanticEntities — enrichWithEntities() çıktısı
 */
export function getBlock(
  section: Section,
  type: DreamType,
  seed: string,
  entities: SemanticEntities
): ContentBlock {
  const h = hash(`${section}:${type}:${seed}`);
  const profile = PROFILES[type];

  const heading = generateHeading(
    section,
    type,
    entities.primaryEntity,
    h
  );

  const rawBody = buildParagraph(
    section,
    profile,
    entities.primaryEntity,
    entities.secondaryEntity,
    h
  );

  // Sahne-bazlı cümle enjeksiyonu — eylem, ton, yoğunluk, sosyal bağlam, risk
  const body = injectSceneSentences(rawBody, entities.scene, section, h);

  return { heading, body };
}

export default getBlock;

/**
 * Rüya içerik üreticisi.
 * Template tabanlı, Türkçe, SEO uyumlu ve AdSense dostu içerik üretir.
 * OpenAI entegrasyonu opsiyoneldir — API key yoksa template sistemi devreye girer.
 *
 * NOT: Statik "Benzer Rüya Tabirleri" bölümü kaldırıldı.
 * İlgili rüyalar artık sayfa render zamanında DB'den (findRelatedDreams)
 * çekilerek kırık link riski sıfırlanmıştır.
 */

// ─── Yardımcı: Başlıktan konu çıkar ────────────────────────────────────────
export function extractSubject(title: string): string {
  return title
    .replace(/^rüyada\s+/i, "")
    .replace(/^rüyasında\s+/i, "")
    .trim();
}

// ─── Random seçici ───────────────────────────────────────────────────────────
function pick<T>(arr: T[], seed: number = 0): T {
  return arr[(seed + arr.length) % arr.length];
}
function pickRandom<T>(arr: T[], title: string): T {
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return arr[hash % arr.length];
}

// ─── Giriş paragraf şablonları ───────────────────────────────────────────────
const introTemplates = [
  (subject: string, title: string) =>
    `${title} rüyası, gören kişide derin izler bırakabilen ve uyanıştan sonra da zihinde yankılanan güçlü bir deneyimdir. Rüyalar, bilinçaltımızın sembolik diliyle bize mesajlar iletir; bu mesajları doğru yorumlamak, hem ruhsal dengemizi hem de günlük yaşamımızı anlamlandırmamıza katkı sağlar.\n\nBu içerikte ${subject} ile ilgili rüyanın olası anlamlarını, psikolojik arka planını ve İslami yorumlarını detaylı biçimde ele alacağız.`,

  (subject: string, title: string) =>
    `Uyku sırasında ${subject} görmek, birçok kişinin hayatında en az bir kez yaşadığı ve sabah uyandığında aklından çıkaramadığı türden rüyalar arasındadır. ${title} rüyası; bilinçaltı kaygıların, bastırılmış duyguların ya da yakın geleceğe dair sinyallerin bir yansıması olabilir.\n\nRüya araştırmacıları ve yorumcular bu tür sembolleri farklı açılardan inceler. Aşağıda bu rüyanın olası anlamlarını kapsamlı şekilde ele alıyoruz.`,

  (subject: string, title: string) =>
    `${title}, rüya yaşantıları arasında dikkat çekici bir yere sahiptir. Pek çok kültürde rüyaların geleceğe işaret ettiğine ya da ruhsal bir mesaj taşıdığına inanılır. Bu nedenle ${subject} içeren rüyaları doğru yorumlamak büyük önem taşır.\n\nBu rehberde ${subject} rüyasının farklı boyutlarını — duygusal, ruhsal ve sembolik — tüm ayrıntılarıyla inceleyeceğiz.`,

  (subject: string, title: string) =>
    `Rüyalar, günlük yaşamda baskı altında tutulan duygu ve düşüncelerin en özgür biçimde dışa vurulduğu alan olarak kabul edilir. ${title} rüyası da bu anlamda yorumlanmaya değer güçlü semboller barındırır.\n\n${subject} ile ilgili görülen rüyalar; kişinin iç dünyasındaki çatışmaları, arzuları ya da çevresindeki değişimlere verdiği tepkileri ortaya koyabilir.`,

  (subject: string, title: string) =>
    `Geceleri gördüğümüz rüyalar çoğu zaman anlamsız gibi görünse de bilinçaltı psikolojisi açısından son derece işlevsel veriler içerir. ${title} rüyası, özellikle sıklıkla tekrar ediyorsa, üzerinde durulması gereken güçlü bir sinyal niteliği taşıyabilir.\n\nAşağıda bu rüyanın hem gündelik yaşam hem de ruhsal boyutlarını kapsamlı biçimde ele alıyoruz.`,
];

// ─── Olumlu yorumlar ────────────────────────────────────────────────────────
const positiveInterpretations = [
  (subject: string) =>
    `**Yenilenme ve taze başlangıçlar:** ${subject} görmek, hayatınızda yeni bir sayfanın açılmak üzere olduğuna işaret edebilir. Önünüzdeki dönemde beklenmedik fırsatlarla karşılaşabilirsiniz.\n\n**Maddi ve manevi kazanım:** Bazı yorumcuya göre bu rüya, yakın gelecekte maddi bir kazanç ya da manevi bir huzur dönemine girildiğinin müjdecisidir.\n\n**Güçlü ilişkiler:** ${subject} içeren rüyalar; sevdiklerinizle aranızdaki bağın güçlendiğini, iletişimin olumlu bir seyir aldığını da simgeleyebilir.`,

  (subject: string) =>
    `**Engellerin aşılması:** Rüyada ${subject} görmek, hayatınızda karşılaştığınız bir engeli ya da güçlüğü aşacağınızın habercisi olabilir.\n\n**Özgüven ve güç:** Bu sembol, kendi iç kaynaklarınıza ulaşmanızı, içinizdeki gücü keşfetmenizi temsil edebilir.\n\n**Bereket ve bolluk:** Hem geleneksel hem de çağdaş rüya yorumcuları ${subject} sembolünü zaman zaman bolluk ve berekete bağlamaktadır.`,

  (subject: string) =>
    `**Ruhsal ilerleme:** ${subject} rüyası, bilinçaltınızın manevi bir dönüşüm ya da kişisel gelişim sürecini işaret ettiği şeklinde yorumlanabilir.\n\n**Beklenen haber:** Geleneksel tabir kitaplarına göre bu tür rüyalar, uzun süredir beklenen olumlu bir haberin yakında geleceğine işaret eder.\n\n**Sağlık ve denge:** Bu rüya, bedensel ya da duygusal açıdan bir iyileşme döneminin başladığının sembolü olabilir.`,
];

// ─── Olumsuz yorumlar ───────────────────────────────────────────────────────
const negativeInterpretations = [
  (subject: string) =>
    `**Kayıp ve hayal kırıklığı:** ${subject} görmek; kimi zaman yaşanmış ya da yaşanacak olan bir kayıp duygusunun yansıması olabilir. Bu kayıp maddi bir şey olabileceği gibi duygusal bir kopukluk da içerebilir.\n\n**Stres ve endişe:** Bilinçaltı, yüksek stres dönemlerinde sıklıkla bu tür semboller üretir. Yorgunluk, iş baskısı ya da ilişki sorunları bu rüyayı tetikleyebilir.\n\n**Karar güçlüğü:** ${subject} rüyası, önemli bir karar aşamasında yaşanan içsel çatışmanın dışavurumu olarak da okunabilir.`,

  (subject: string) =>
    `**Kontrol kaybı korkusu:** ${subject} görmek; kişinin hayatının bir alanında kontrolü kaybettiğini ya da kaybetme korkusu yaşadığını sembolize edebilir.\n\n**Gizli kaygılar:** Gündelik yaşamda bastırılan endişeler, rüyalarda bu tür güçlü imgelerle yüzeye çıkabilir.\n\n**İlişkilerde gerilim:** Kimi durumlarda bu sembol, yakın çevredeki biriyle yaşanan anlaşmazlığı ya da güven krizini yansıtır.`,

  (subject: string) =>
    `**Geçmişin yükü:** ${subject} rüyası, geride bırakılamayan anılar ya da çözüme kavuşturulamamış duygusal meselelerle bağlantılı olabilir.\n\n**Değişime direnç:** Hayatınızda kaçınılmaz bir değişimin eşiğinde durduğunuzu ancak buna hazır hissetmediğinizi de simgeler.\n\n**Sağlık uyarısı:** Bazı geleneksel yorumcular, tekrar eden bu tür rüyaları beden ve ruh sağlığına daha fazla önem verilmesi gerektiğinin bir hatırlatıcısı olarak değerlendirir.`,
];

// ─── Psikolojik yorumlar ────────────────────────────────────────────────────
const psychologicalInterpretations = [
  (subject: string) =>
    `Carl Gustav Jung'un arketip teorisine göre rüya sembolleri, kolektif bilinçdışının evrensel imgelerini barındırır. ${subject} sembolü, bireysel psikolojide hem korkunun hem de arzunun aynı anda yansıtıldığı bir alan olabilir. Kendinizi hayatın hangi cephesinde yetersiz ya da sıkışmış hissediyorsanız bu rüya büyük ihtimalle o alanı işaret ediyor.\n\nFreud'un psikanalitik yorumuna göre ise tekrar eden rüyalar, bastırılmış arzuların ya da çözüme kavuşturulamamış çatışmaların sembolik ifadesidir. Rüyanın ardından yaşanan duygusal durumu (korku, sevinç, hüzün) not etmek, yorumun kalitesini artırır.`,

  (subject: string) =>
    `Modern psikoloji, ${subject} içeren rüyaları çoğunlukla kişinin kimliğini ve öz imgesini nasıl algıladığıyla ilişkilendirir. Kendinize duyduğunuz güven ya da güvensizlik, bu rüyanın temel duygusal tonunu belirleyen en önemli etkenler arasındadır.\n\nBilişsel-davranışçı terapi perspektifinden bakıldığında, bu tür rüyalar genellikle gündelik stres yükünün yüksek olduğu dönemlerde yoğunlaşır. Rüya sıklıkla tekrar ediyorsa, ruh sağlığı uzmanıyla görüşmek faydalı olabilir.`,

  (subject: string) =>
    `Gestalt psikolojisi yaklaşımına göre rüyadaki her unsur, rüyayı görenin bir parçasıdır. ${subject} sembolü; kabul edilmeyen ya da dışlanan bir iç sesin temsili olabilir. Bu sesi dinlemek ve onunla diyalog kurmak, kişisel bütünleşme sürecine katkı sağlar.\n\nKısaca: bu rüyayı bir tehdit olarak değil, kendinizi daha iyi anlamanızı sağlayan bir rehber olarak değerlendirmeniz önerilir. Rüya günlüğü tutmak, bu sembollerin zaman içindeki evrimini izlemenize yardımcı olacaktır.`,
];

// ─── Dini yorumlar ──────────────────────────────────────────────────────────
const religiousInterpretations = [
  (subject: string) =>
    `İslam alimleri rüyaları üç ana kategoride inceler: rahmani (Allah'tan gelen), nefsani (kişinin kendi iç dünyasından kaynaklanan) ve şeytani rüyalar. ${subject} içeren rüyalar genel itibarıyla nefsani kategoride değerlendirilir; ancak içerikteki sembollerin bütünü gözetilerek şükran ya da tevekkül gerektiren bir mesaj da çıkarılabilir.\n\nİbn Sirin başta olmak üzere klasik İslam rüya tabircileri, bu tür sembolleri yorumlarken rüyayı görenin ruh halini, hayatındaki dönemsel koşulları ve niyetini esas almıştır. Bu nedenle her rüyanın yorumu kişiden kişiye farklılık gösterebilir.`,

  (subject: string) =>
    `Diyanet İşleri Başkanlığı'nın yayımladığı kaynaklara göre rüyalar, doğrudan kehanet ya da kader habercisi olarak değil; kişinin iç dünyasına dair bir ayna olarak okunmalıdır. ${subject} içeren rüya görüldükten sonra, endişe duymak yerine sabah namazı kılınması, dua edilmesi ve günü hayırlı bir niyetle başlatılması tavsiye edilir.\n\nBu rüyanın ardından Euzübillah (kovulmuş şeytandan Allah'a sığınma) duasını okumak, İslami geleneğin öne sürdüğü bir koruyucu uygulamadır.`,

  (subject: string) =>
    `Tasavvuf geleneğinde rüya; ruhun beden tarafından kısıtlanmadan serbest dolaştığı, manevi gerçeklikleri deneyimlediği özel bir bilinç hali olarak kabul edilir. ${subject} sembolünün bu perspektiften yorumu, kişinin maneviyat yolculuğundaki aşamasını gösteriyor olabilir.\n\nGenel İslami tavsiye şu yöndedir: rüyayı başkalarına anlatırken dikkatli olun, güvendiğiniz birine ya da bu konuda bilgili bir kişiye danışın. Rahatsız edici gelen bir rüyanın üzerine düşünmek yerine zikir ve şükürle güne devam etmek önerilir.`,
];

// ─── Öneriler ───────────────────────────────────────────────────────────────
const recommendationSections = [
  (subject: string) =>
    `- **Rüya günlüğü tutun:** ${subject} rüyasını gördükten hemen sonra duygu ve detayları not alın. Zaman içinde tekrar eden örüntüler dikkat çekici ipuçları verebilir.\n- **Stres kaynaklarını gözden geçirin:** Bu rüya stres yükünüzün yüksek olduğu dönemlerde sıklaşıyorsa; uyku düzeni, beslenme ve sosyal bağlarınıza odaklanın.\n- **Kendinize karşı nazik olun:** Rüyayı bir uyarı olarak değil, iç dünyanızdan gelen bir mesaj olarak değerlendirin.\n- **Gerekirse uzman desteği alın:** Tekrar eden rahatsız edici rüyalar için bir psikolog ya da psikiyatrist ile görüşmekten çekinmeyin.`,

  (subject: string) =>
    `- **Sabah rutini oluşturun:** ${subject} rüyasından uyandıktan sonra birkaç dakika sessizce oturmak, duyguların yatışmasına yardımcı olur.\n- **Bedensel aktivite:** Düzenli egzersiz, bilinçaltı birikimin rüyalara yansımasını azaltır.\n- **İlişkilerinizi değerlendirin:** Rüyada belirgin bir figür ya da yer varsa, gerçek hayatta o ilişkiyle ilgili bir adım atmayı düşünün.\n- **Meditasyon ve farkındalık:** Günde 10 dakikalık nefes egzersizi, rüyaların neden olduğu kaygıyı önemli ölçüde hafifletir.`,

  (subject: string) =>
    `- **Anlamı abartmayın:** Tek bir rüya üzerinden hayat kararları vermekten kaçının; rüyalar bir referans noktasıdır, mutlak kılavuz değil.\n- **Olumlu pekiştirme:** ${subject} rüyası olumlu duygularla geldiyse; bu duyguyu gün içinde bir affirmasyonla güçlendirin.\n- **Sosyal destek:** Yakın çevrenizle kaliteli zaman geçirmek, hem rüya kaynaklı stresi azaltır hem de genel refahı artırır.\n- **Sağlık kontrolü:** Rüya sağlıkla bağlantılıysa, önleyici bir doktor ziyareti sizi rahatlatacaktır.`,
];

// ─── Benzer rüya önerileri (statik gruplar kaldırıldı — yalnızca DB tabanlı) ─

// ─── Meta description üreticisi ──────────────────────────────────────────────
export function generateMetaDescription(title: string): string {
  const subject = extractSubject(title);
  const templates = [
    `${title} ne anlama gelir? ${subject} rüyasının İslami, psikolojik ve sembolik yorumu. Olumlu ve olumsuz anlamları ile uzman tavsiyeler.`,
    `${subject} rüyası gördünüz mü? ${title} tabirini, rüyanın dini ve psikolojik anlamlarını detaylı öğrenin.`,
    `${title} rüya tabiri: ${subject} görmek neye işaret eder? Kapsamlı rüya yorumu, İslami tabir ve uzman önerileri.`,
    `Rüyada ${subject} ne demek? ${title} rüyasının tüm yorumları, olumlu-olumsuz anlamları ve önerileri bu sayfada.`,
  ];
  const meta = pickRandom(templates, title);
  // Truncate to 160 chars max
  return meta.length > 160 ? meta.substring(0, 157) + "..." : meta;
}

// ─── Ana içerik üretici ───────────────────────────────────────────────────────
export interface GeneratedContent {
  markdown: string;
  metaDescription: string;
  wordCount: number;
  relatedSlugs: string[];
}

export function generateDreamContent(title: string): GeneratedContent {
  const subject = extractSubject(title);
  const metaDescription = generateMetaDescription(title);

  // Seeded picks for consistency per title
  const hash = title.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

  const intro = introTemplates[hash % introTemplates.length](subject, title);
  const positive =
    positiveInterpretations[hash % positiveInterpretations.length](subject);
  const negative =
    negativeInterpretations[(hash + 1) % negativeInterpretations.length](
      subject
    );
  const psych =
    psychologicalInterpretations[
      (hash + 2) % psychologicalInterpretations.length
    ](subject);
  const religion =
    religiousInterpretations[(hash + 3) % religiousInterpretations.length](
      subject
    );
  const recs =
    recommendationSections[(hash + 4) % recommendationSections.length](
      subject
    );

  // NOT: "Benzer Rüya Tabirleri" bölümü kaldırıldı.
  // İlgili rüyalar artık sayfa render zamanında DB'den çekilmektedir.
  // Statik slug oluşturma ile kırık link riski ortadan kalkmıştır.

  const markdown = `## ${title} Rüyası Ne Anlama Gelir?

${intro}

---

## Rüya Yorumu: Olumlu ve Olumsuz Anlamlar

Rüya yorumcuları ${title} rüyasını farklı bağlamlarda değerlendirmektedir. Aynı sembol, rüyayı görenin o dönemdeki ruh hali ve yaşam koşullarına göre tamamen farklı anlamlar taşıyabilir.

### ✅ Olumlu Anlamlar

${positive}

### ⚠️ Olumsuz Anlamlar

${negative}

---

## Psikolojik Yorum

### Bilinçaltının Dili

${psych}

---

## Dini Yorum

### İslami Perspektiften ${title}

${religion}

---

## Öneriler ve Tavsiyeler

${title} rüyasını gördükten sonra ne yapmalısınız? Uzman önerileri:

${recs}

---

## Sıkça Sorulan Sorular

**${title} rüyası şans mı getirir?**  
Rüya tabircileri bu soruya net bir yanıt vermez; zira rüyaların anlamı kişinin o dönemdeki duygusal durumuna ve rüyanın diğer detaylarına göre değişir. Genel olarak olumlu duygularla geçen ${subject} rüyaları hayıra yorulurken, korku ya da kaygıyla geçenler bir uyarı olarak değerlendirilebilir.

**${title} rüyası tekrar ediyorsa ne yapmalıyım?**  
Tekrar eden rüyalar, bilinçaltının çözüme kavuşturulmamış bir konuya dikkat çekme girişimi olabilir. Bu konuyu bir ruh sağlığı uzmanıyla paylaşmanız, altta yatan kaygıları anlamlandırmada faydalı olacaktır.

**${title} rüyasını gördükten sonra dua etmeli miyim?**  
İslami gelenekte rahatsız edici bir rüya görüldüğünde "Euzübillahimineşşeytanirracim" duası okunması ve sol tarafa tükürmek sembolik bir koruyucu uygulama olarak önerilir. Rüyanın iyi geldiği durumlarda şükür duası yapılabilir.
`;

  const wordCount = markdown.split(/\s+/).length;

  return {
    markdown,
    metaDescription,
    wordCount,
    relatedSlugs: [], // İlgili rüyalar artık DB'den çekiliyor
  };
}

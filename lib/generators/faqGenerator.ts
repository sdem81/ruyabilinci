/**
 * FAQ Generator
 * Başlığa ve DreamType'a özgü, her sayfada farklı sorular üretir.
 * Soru havuzu her tip için en az 10 adet; her sayfada 3-5 benzersiz soru seçilir.
 */

import type { DreamType } from "../dreamClassifier";
import { classifyDreamTitle, extractCore } from "../dreamClassifier";

export interface FAQItem {
  question: string;
  answer: string;
}

// ─── Tip başına soru havuzları ────────────────────────────────────────────────
// Her şablon (title, core) parametresi alır.

type FAQTemplate = (title: string, core: string) => FAQItem;

const familyFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `Rüyada ${c} görmek ne anlama gelir?`,
    answer: `Rüyada ${c} görmek, bilinçaltınızın bu kişiyle olan duygusal bağınızı ve ilişki dinamiklerini işlediğinin göstergesidir. Bu rüya; sevgi, çatışma ya da özlem gibi çözüme kavuşmamış duyguları yüzeye taşıyor olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası olumlu bir işaret midir?`,
    answer: `Bu rüyanın anlamı, rüyadaki sahnenin genel tonuna ve hissettirdiği duygulara bağlıdır. Huzurlu geçen aile sahneleri genellikle olumlu, çatışmalı sahneler ise çözüme kavuşturulması gereken bir konunun işareti olarak değerlendirilir.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} ile kavga etmek ne anlama gelir?`,
    answer: `Bir aile üyesiyle rüyada kavga etmek, gerçek hayatta yaşanan ya da bastırılan bir iletişim sorununu ve duygusal gerilimi yansıtıyor olabilir. Bu rüya, söz konusu kişiyle açık bir konuşma yapma zamanının geldiğine işaret edebilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyasını görmek ne zaman yaygınlaşır?`,
    answer: `Aile üyelerine ilişkin rüyalar özellikle stresli dönemlerde, aile içi önemli kararların eşiğinde ya da o kişiyle ilgili çözümsüz bir durumun yaşandığı zamanlarda sıklaşır.`,
  }),
  (t, c) => ({
    question: `İslam'a göre ${c} görmek nasıl yorumlanır?`,
    answer: `İslami rüya yorumunda aile üyelerini rüyada görmek, genel itibarıyla sıla-i rahm görevini ve aile bağlarını güçlendirme çağrısı olarak yorumlanır. Özellikle hayatta olmayan bir yakını görmek ise dua ve istiğfara işaret eder.`,
  }),
  (t, c) => ({
    question: `${t} rüyası psikolojik olarak ne ifade eder?`,
    answer: `Psikolojik açıdan ${c} figürü, erken dönem bağlanma örüntülerini ve ilişki dinamiklerini temsil eder. Bu rüya; güvenlik, otorite ya da bağlılık ihtiyacınızı işaret ediyor olabilir.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} ile barışmak iyi midir?`,
    answer: `Evet, rüyada bir aile üyesiyle barışmak ya da huzurlu bir şekilde birlikte olmak oldukça olumlu bir işarettir. Bu rüya, bilinçaltında bir iyileşme ve bütünleşme sürecinin yaşandığını gösterir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası tekrar tekrar görülüyorsa ne yapmalıyım?`,
    answer: `Tekrar eden rüyalar, bilinçaltınızın çözüme kavuşturulmayı bekleyen güçlü bir mesaj verdiğinin işaretidir. Bu kişiyle ilgili işlenmemiş duygular ya da yaşanmamış konuşmalar olup olmadığını düşünmek faydalı olacaktır.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} görmek ile gerçek hayat arasında bir bağ var mıdır?`,
    answer: `Rüyalar gerçek hayatı doğrudan yansıtmaz; ancak gerçek hayattaki ilişki dinamiklerinden, yaşanmış duygulardan ve bilinçdışı beklentilerden güçlü biçimde beslenir. Bu rüya, söz konusu ilişkiye dair önemli bir iç sesi duyuruyor olabilir.`,
  }),
  (t, c) => ({
    question: `Vefat etmiş ${c} görmek nasıl yorumlanır?`,
    answer: `Hayatını kaybetmiş sevdiklerimizi rüyada görmek oldukça yaygındır ve çoğunlukla yas sürecinin sağlıklı bir parçası olarak değerlendirilir. İslami gelenekte bu kişiler için dua etmek ve Kur'an okumak tavsiye edilir.`,
  }),
];

const animalFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `Rüyada ${c} görmek ne anlama gelir?`,
    answer: `Rüyada ${c} görmek, hem kültürel hem de psikolojik açıdan zengin sembolik anlamlar taşır. Bu hayvanın rüyada size karşı nasıl bir tavır sergilediği ve genel rüya tonu, yorumun doğrultusunu belirleyen en önemli unsurlardır.`,
  }),
  (t, c) => ({
    question: `${t} rüyası İslam'da nasıl yorumlanır?`,
    answer: `İslami rüya yorumunda hayvan figürleri köklü sembolik çağrışımlara sahiptir. Hayvanın türü, rengi ve davranışı İslami yorumda belirleyici unsurlardır; bu hayvanın İbn Sirin geleneğindeki yorumunu araştırmak faydalı olacaktır.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} saldırırsa ne anlama gelir?`,
    answer: `Hayvanın saldırması; bilinçaltında bastırılan bir korku, tehdit algısı ya da içsel çatışmanın sembolik ifadesi olabilir. Bu rüya, gerçek hayatta tehlikeli ya da zorlu hissettiren durumları değerlendirmenizi gerektirebilir.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} beslemek ne anlama gelir?`,
    answer: `Hayvan beslemek, bu hayvanın sembolize ettiği özellikleri besleyip geliştirdiğinizin ifadesi olabilir. Aynı zamanda başkalarına ilgi gösterme dürtüsünü ya da bir sorumluluğu üstlenme isteğini simgeler.`,
  }),
  (t, c) => ({
    question: `${t} rüyası korkuyla görülürse ne anlama gelir?`,
    answer: `Korku eşliğinde görülen hayvan rüyaları, genellikle bilinçaltında bastırılmış bir kaygı ya da henüz yüzleşilmemiş bir durumun sembolik dışavurumudur. Bu durumların farkına varıp adreslemek rahatlatıcı olacaktır.`,
  }),
  (t, c) => ({
    question: `${t} rüyası tekrar görülüyorsa ne anlama gelir?`,
    answer: `Tekrar eden hayvan rüyaları, bilinçaltının güçlü bir yüzleşme ya da dönüşüm mesajını ileteceği ana kadar sürdüreceğini gösterir. Bu hayvanın sizin için neyi sembolize ettiğini düşünmek anlamlı olabilir.`,
  }),
  (t, c) => ({
    question: `Psikolojik açıdan ${t} rüyası ne ifade eder?`,
    answer: `Jung'un analitik psikolojisine göre hayvanlar 'gölge benliği', yani bilinçaltındaki bastırılmış dürtüleri temsil eder. Bu hayvanın özelliklerini düşündüğünüzde içinizde hangi duygu ya da nitelik akla geliyor?`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} öldürmek ne anlama gelir?`,
    answer: `Hayvanı öldürmek; bu hayvanın simgelediği korkuyu ya da dürtüyü aşma ve kontrol altına alma arzusunu sembolik biçimde ifade eder. Bağlam ve ardından hissedilen duygu, yorumu köklü biçimde değiştirir.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} görmek hayat değişikliğine işaret eder mi?`,
    answer: `Birçok gelenekte hayvan rüyaları, önemli bir geçiş döneminin habercisi olarak yorumlanır. Hayatınızda köklü bir değişim ya da karar arifesindeyseniz, bu rüya o süreci bilinçaltı düzeyinde işlediğinizi gösteriyor olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası bereket habercisi midir?`,
    answer: `Çeşitli kültürel geleneklerde bazı hayvanlar bereket ve bolluğun simgesi sayılır. Bu hayvanın rüyada sağlıklı ve canlı görünmesi, olumlu yorumlar için önemli bir ipucudur.`,
  }),
];

const objectFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `Rüyada ${c} görmek ne anlama gelir?`,
    answer: `${c} görmek, bu nesnenin bilinçaltınızda sembolik olarak temsil ettiği değer, hedef ya da kaygıyla doğrudan ilişkilidir. Nesnenin rüyadaki durumu ve sizinle ilişkisi, yorumun yönünü belirleyen temel ipuçlarıdır.`,
  }),
  (t, c) => ({
    question: `${t} rüyası maddi açıdan ne anlama gelir?`,
    answer: `Nesneler rüyalarda sıklıkla maddi değerlerin, güvenlik ihtiyacının ve ekonomik kaygıların sembolüdür. Bu rüya, maddi konulardaki bilinçaltı değerlendirmenizi veya beklentilerini yansıtıyor olabilir.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} bulmak iyi bir işaret midir?`,
    answer: `Genel yorumda değerli bir nesneyi bulmak olumlu bir işaret sayılır; yeni fırsatların kapınızı çalacağına ya da uzun süredir aradığınız bir cevabın gün yüzüne çıkacağına işaret edebilir.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} kaybetmek ne anlama gelir?`,
    answer: `Nesne kaybetmek; bu nesnenin temsil ettiği bir değeri, ilişkiyi ya da fırsatı yitirme korkusunu ifade ediyor olabilir. Ayrıca kontrolü kaybetme hissi ya da bir şeyi bırakma zamanının geldiğinin sembolik habercisi de olabilir.`,
  }),
  (t, c) => ({
    question: `İslam'a göre ${t} rüyası nasıl yorumlanır?`,
    answer: `İbn Sirin geleneğinde her nesne özgün sembolik bir anlam taşır. Bu nesnenin İslami rüya yorumundaki karşılığını araştırmak, rüyanızı geleneksel perspektiften daha derinlikli değerlendirmenizi sağlayacaktır.`,
  }),
  (t, c) => ({
    question: `${t} rüyası psikolojik olarak ne ifade eder?`,
    answer: `Nesne ilişkileri teorisine göre rüyadaki nesneler, gerçek hayattaki önemli ilişkilerin veya kişilerin yerini alabilir. Bu nesne, bilinçaltınızda kime ya da neye karşılık geliyor olabilir?`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} hediye etmek ne anlama gelir?`,
    answer: `Bir nesneyi hediye etmek, bu nesnenin sembolize ettiği değerleri ya da duyguları başkasına aktarma ya da paylaşma arzusunu ifade edebilir. Cömertlik ve paylaşım temasını ön plana çıkaran bir rüyadır.`,
  }),
  (t, c) => ({
    question: `Rüyada kırık ya da hasar görmüş ${c} görmek ne anlama gelir?`,
    answer: `Hasar görmüş nesne; kırılganlık, tükenmişlik ya da bir değerin ya da ilişkinin çözülme noktasına geldiğinin sembolik ifadesi olabilir. Bu rüyanın ardından öz bakım ve destekten yararlanmak değerlendirilebilir.`,
  }),
];

const actionFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `Rüyada ${c} görmek ne anlama gelir?`,
    answer: `Rüyada ${c} deneyimlemek, bilinçaltının bu eyleme dair güçlü bir mesaj ilettiğinin göstergesidir. Eylemin nasıl sonuçlandığı, nasıl hissettirdiği ve kiminle gerçekleştiği, yorumun doğrultusunu belirler.`,
  }),
  (t, c) => ({
    question: `${t} rüyası olumlu bir işaret midir?`,
    answer: `Bu sorunun yanıtı, rüyanın genel duygusal tonuna bağlıdır. Eylem özgürlük verici ve olumlu hissettiriyorsa olumlu, zorlamaya ya da korku eşliğinde gerçekleşiyorsa daha karmaşık bir anlam barındırıyor olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası psikolojik olarak ne anlama gelir?`,
    answer: `Psikolojik açıdan eylem rüyaları; bastırılmış arzuların, çözüme kavuşturulmamış çatışmaların ya da içsel özgürleşme ihtiyacının sembolik dita vurumu olarak yorumlanır. Beynin de bu eylemi gerçek zamanlı simüle ettiği düşünülmektedir.`,
  }),
  (t, c) => ({
    question: `İslam'a göre ${t} rüyası nasıl yorumlanır?`,
    answer: `İslami rüya yorumunda eylem rüyaları, eylemin niteliğine göre farklı anlamlar kazanır. Hayırlı eylemler müjde taşırken, zararlı eylemler tövbe ve istiğfara teşvik eden uyarı rüyaları olarak değerlendirilebilir.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} deneyimlemek ne tür duygulara yol açar?`,
    answer: `Bu tür rüyalar uyandıktan sonra genellikle güçlü bir etki bırakır. Yoğun hisler yaşıyorsanız bu duyguları bir günlüğe not etmek, bilinçaltı mesajını daha berrak hale getirebilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası tekrar görülüyorsa ne yapılmalıdır?`,
    answer: `Tekrar eden eylem rüyaları, bilinçaltının çözülmeyi ya da harekete geçirilmeyi bekleyen bir konuyu ısrarla gündeme taşıdığına işaret eder. Bu dürtünün sağlıklı bir kanal aracılığıyla ifade edilmesi rahatlatıcı olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası gerçek hayatı etkiler mi?`,
    answer: `Rüyalar doğrudan geleceği etkilemez; ancak bilinçaltınızın güçlü mesajları bazen karar alma süreçlerinizi ve davranışlarınızı dolaylı olarak şekillendirebilir. Bu rüyanın size ne söylediğini düşünmek aydınlatıcı olabilir.`,
  }),
];

const natureFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `Rüyada ${c} görmek ne anlama gelir?`,
    answer: `Rüyada ${c} görmek, doğa unsurlarının bilinçaltında yüklü sembolik işlevler üstlendiğini ortaya koyan çok katmanlı bir deneyimdir. Bu unsura yüklenen anlam, rüyanın genel bağlamıyla birlikte değerlendirilmelidir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası duygusal olarak ne anlama gelir?`,
    answer: `Doğa unsurları rüyalarda sıklıkla duygusal durumların güçlü metaforlarıdır. ${c} imgesi, içinde bulunduğunuz duygusal iklimi—sakinlik mi, fırtına mı, yenilenme mi—sembolik dille yansıtıyor olabilir.`,
  }),
  (t, c) => ({
    question: `İslam'a göre ${t} rüyası nasıl yorumlanır?`,
    answer: `İslami rüya yorumunda su bereket ve arınmayı, ateş hem tehlikeyi hem de ilahi nuru, dağ yücelik ve mertebeyi simgeler. Bu doğa unsurunun geleneksel yorumdaki karşılığını araştırmak faydalı olacaktır.`,
  }),
  (t, c) => ({
    question: `${t} rüyası bir değişimin habercisi midir?`,
    answer: `Doğa rüyaları, özellikle dramatik doğa olayları içerenler, hayatınızda köklü bir değişim ya da dönüşüm döneminin habercisi olarak yorumlanır. Hangi alanda değişim yaşıyor olabileceğinizi düşünmek faydalıdır.`,
  }),
  (t, c) => ({
    question: `Psikolojik açıdan ${t} rüyası ne ifade eder?`,
    answer: `Transpersonel ve Jungcu psikoloji açısından ${c} imgesi, bilinçdışının derinliklerine ve kolektif bilinçdışı arketiplere kapı açar. Bu unsur, kendinizin size yabancı kalan yönlerini temsil ediyor olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyasından sonra ne yapılmalı?`,
    answer: `Güçlü doğa imgeleri barındıran rüyalar gördükten sonra doğa ortamlarında zaman geçirmek, meditasyon uygulamak ya da rüyayı bir günlüğe aktarmak, bu içgörüden en yüksek biçimde yararlanmanın yollarından biridir.`,
  }),
];

const bodyFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `Rüyada ${c} görmek ne anlama gelir?`,
    answer: `Rüyada ${c} görmek; bu beden bölgesinin bilinçaltında taşıdığı sembolik değeri ve bedensel–duygusal farkındalıklarınızı yansıtıyor olabilir. Beden rüyaları, bilinçaltının en yoğun iletişim kanallarından biri olarak kabul edilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası sağlıkla ilgili midir?`,
    answer: `Her beden rüyası zorunlu olarak bir hastalık belirtisi değildir; ancak kronik ağrılar ya da güçlü bir kaygı eşlik ediyorsa bir sağlık uzmanına danışmak sağlıklı bir adım olacaktır. Rüyalar çoğunlukla psikolojik içerikleri sembolik dille ifade eder.`,
  }),
  (t, c) => ({
    question: `İslam'a göre ${t} rüyası nasıl yorumlanır?`,
    answer: `İslami rüya yorumunda beden uzuvları aile üyeleri veya sosyal ilişkilerle ilişkilendirilir. İbn Sirin'e göre dişler aile fertlerini, eller güç ve emeği, göz ise nuru ve idrak yetisini simgeler.`,
  }),
  (t, c) => ({
    question: `${t} rüyası psikolojik olarak ne ifade eder?`,
    answer: `Beden odaklı rüyalar psikosomatik bir bağlantı taşıyabilir; yani zihnin bedenle konuşma biçimini yansıtıyor olabilir. Bu uzuv ya da beden bölgesiyle ilgili duygu ve düşüncelerinizi göz önünde bulundurmak faydalıdır.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} kaybetmek ne anlama gelir?`,
    answer: `Beden uzvu ya da organ kaybetmek; bu uzvun sembolize ettiği işlev ya da yetenekte ciddi bir değişim, kayıp ya da dönüşüm dönemi geçirdiğinizi ima edebilir. Bu endişeleri günlük kaygılardan ayırt etmek için rüyanızın genel bağlamını değerlendirin.`,
  }),
  (t, c) => ({
    question: `${t} rüyası tekrar görülürse ne yapılmalıdır?`,
    answer: `Tekrar eden beden rüyaları, bilinçaltının beden–zihin entegrasyonu konusunda güçlü bir mesaj iletmeye çalıştığını gösterir. Bu deneyimi bir uzmanla paylaşmak, hem tıbbi hem de psikolojik boyuttaki değerlendirmenizi derinleştirecektir.`,
  }),
];

const spiritualFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `Rüyada ${c} görmek ne anlama gelir?`,
    answer: `İslami gelenekte ${c} görmek, manevi açıdan son derece önem taşıyan bir rüya tecrübesi olarak değerlendirilir. Bu tür rüyalar dikkatle yorumlanmalı ve gerekirse bir alim ya da rehberle paylaşılmalıdır.`,
  }),
  (t, c) => ({
    question: `${t} rüyası gerçek bir mesaj mıdır?`,
    answer: `Hz. Peygamber rüyayı üç kategoriye ayırmıştır: ilahi kaynaklı salih rüya, nefsten gelen rüya ve şeytandan gelen karmaşık rüya. Bu rüyanın hangi kategoriye girebileceğini bir alimle değerlendirmek en güvenilir yaklaşımdır.`,
  }),
  (t, c) => ({
    question: `${t} rüyasından sonra ne yapılmalıdır?`,
    answer: `Manevi figürler içeren güçlü rüyaların ardından sabah namazını kılmak, Allah'a dua etmek ve güvendiğiniz biriyle paylaşmak tavsiye edilir. Korkutucu ise Eûzü–Besmele ile sola karşı üç kez üflenmesi sünnet olarak nakledilmiştir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası psikolojik olarak ne anlama gelir?`,
    answer: `Transpersonel psikoloji açısından dini içerikli rüyalar, derin anlam ve aşkınlık arayışını temsil eder. Bu rüya, bilinçaltının varoluşsal sorulara ve manevi ihtiyaçlara verdiği güçlü bir yanıt olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası kötüye yorum alır mı?`,
    answer: `Korkutucu manevi içerikli rüyalar, İslami açıdan şeytandan gelebileceği için hemen yorumlanmaması ve anlatılmaması tavsiye edilir. Bunun yerine Allah'a sığınmak ve iyilik yapmak tavsiye edilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyasını kiminle paylaşmalıyım?`,
    answer: `İslam peygamberi (sav), rüyayı yalnızca sevdiğiniz ya da güvendiğiniz birine anlamamızı, düşman ya da kıskanç kimselere anlatmamamızı tavsiye etmiştir. Manevi rüyalar için güvenilir bir alim ya da rehber idealdir.`,
  }),
];

const emotionFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `Rüyada ${c} hissi yaşamak ne anlama gelir?`,
    answer: `Rüyada derin duygusal deneyimler yaşamak, bilinçaltının bastırılmış ya da işlenmemiş duyguları yüzeye taşımasının bir yoludur. Bu, aktif bir duygusal iyileşme ve bütünleşme sürecinin parçası olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası psikolojik olarak ne anlama gelir?`,
    answer: `Duygu odaklı rüyalar, günlük hayatta tam olarak işlenemeyen ya da ifade edilemeyen duyguların sembolik dile çevrilme çabasıdır. Bu rüya, duygusal sağlığınıza özen göstermenizi davet ediyor olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyasından sonra ne yapılmalıdır?`,
    answer: `Yoğun duygusal rüyaların ardından bunu bir günlüğe yazmak ya da güvendiğiniz biriyle paylaşmak, bu içerikleri entegre etmede son derece faydalıdır. Gerektiğinde profesyonel destek almak, süreci kolaylaştıracaktır.`,
  }),
  (t, c) => ({
    question: `${t} rüyası gerçek hayatla ilgili midir?`,
    answer: `Kesin bir bağlantı kurmak güç olsa da bu rüyada hissedilen duygu, gerçek hayatta deneyimlediğiniz ve tam olarak ifade edilmemiş duygularla örtüşüyor olabilir. Hangi duygusal konuların şu an sizin için aktif olduğunu düşünmek aydınlatıcı olacaktır.`,
  }),
  (t, c) => ({
    question: `Rüyada ${c} hissi olumlu bir işaret midir?`,
    answer: `Duygusal rüyalar, olumlu ya da olumsuz hissettirsin, her iki durumda da değerli bilgiler taşır. Önemli olan, bu duygunun hayatınızda neyi simgelediğini anlamak ve bu mesajı bilinçli bir içgörüye dönüştürmektir.`,
  }),
];

const mixedFAQs: FAQTemplate[] = [
  (t, c) => ({
    question: `"${t}" rüyası ne anlama gelir?`,
    answer: `Bu rüya, birbiriyle bağlantılı pek çok sembol ve deneyimi aynı anda barındıran çok katmanlı bir yapıya sahiptir. Yorumun odağı; rüyada öne çıkan en baskın duygu ve sembol üzerine kurulmalıdır.`,
  }),
  (t, c) => ({
    question: `${t} rüyasındaki sembolleri nasıl yorumlamalıyım?`,
    answer: `Birbiriyle iç içe geçmiş karma rüyalarda, öne çıkan tek bir sembole ya da rüyanın genel duygusal tonu üzerine yoğunlaşmak en güvenilir yaklaşımdır. Her sembolü ayrı ayrı analiz etmeye çalışmak bazen kafa karıştırıcı olabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası kişiden kişiye farklı mı yorumlanır?`,
    answer: `Evet, rüya yorumu son derece kişiseldir. Aynı sembol, farklı yaşam hikayelerine, deneyimlere ve duygusal durumlara sahip iki farklı kişi için bambaşka mesajlar barındırabilir.`,
  }),
  (t, c) => ({
    question: `${t} rüyası önemli bir mesaj mı taşıyor?`,
    answer: `Rüyanızla ilgili güçlü bir anlam ya da kaçırılmaması gereken bir şey hissi yaşıyorsanız, bu sezgisel hisse dikkat etmek faydalıdır. Bilinçaltı bazen en önemli mesajları en karmaşık rüyalar aracılığıyla iletir.`,
  }),
  (t, c) => ({
    question: `${t} rüyasını bir uzmana danışmalı mıyım?`,
    answer: `Çok kez tekrar eden, güçlü duygusal izler bırakan ya da uyku kalitenizi bozan rüyalar için bir terapist ya da psikoloji uzmanına danışmak son derece yararlı olacaktır. Bu, kendinize yapabileceğiniz en değerli yatırımlardan biridir.`,
  }),
  (t, c) => ({
    question: `${t} rüyasından sonra ne yapmalıyım?`,
    answer: `Rüyayı detaylarıyla birlikte bir yere not etmek, hissettiklerinizi yazmak ve birkaç gün gözlemlemek faydalıdır. Kalıplar oluşmaya başladığında bilinçaltınızdaki gerçek mesaj daha anlaşılır hale gelecektir.`,
  }),
];

// ─── Ana fonksiyon ────────────────────────────────────────────────────────────

const faqMap: Record<DreamType, FAQTemplate[]> = {
  family:   familyFAQs,
  animal:   animalFAQs,
  object:   objectFAQs,
  action:   actionFAQs,
  nature:   natureFAQs,
  body:     bodyFAQs,
  spiritual: spiritualFAQs,
  emotion:  emotionFAQs,
  mixed:    mixedFAQs,
};

export function generateFaq(title: string, count = 4): FAQItem[] {
  const result = classifyDreamTitle(title);
  const core = extractCore(title);
  const pool = faqMap[result.type] ?? mixedFAQs;

  // Deterministik ama başlığa özgü karıştırma
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
  }
  const startIdx = Math.abs(hash) % pool.length;

  const selected: FAQItem[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = (startIdx + i) % pool.length;
    selected.push(pool[idx](title, core));
  }

  return selected;
}

export default generateFaq;

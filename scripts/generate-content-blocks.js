const fs = require('fs');

const types = ['family', 'animal', 'object', 'action', 'nature', 'body', 'spiritual', 'emotion', 'mixed'];
const sections = ['positive', 'negative', 'psychological', 'religious', 'advice'];

// We will generate 6 variants for each type and section.
// To make them 80-140 words, we will combine 4 sentences from different pools.

const pools = {
  positive: {
    family: {
      s1: [
        "Aile bağlarının ne kadar güçlü olduğunu hatırlatan bu rüya, {primaryToken} sembolü üzerinden derin bir sevgi ve güven ihtiyacını vurgular.",
        "Bilinçaltınız, {primaryToken} imgesiyle size destek ve şefkat mesajı iletmekte, zorlukların üstesinden sevdiklerinizle gelebileceğinizi fısıldamaktadır.",
        "Özellikle {primaryToken} ile ilgili detaylar, hayatınızda köklerinize dönme ve aidiyet duygunuzu pekiştirme arzunuzun bir yansımasıdır.",
        "Bu olumlu tablo, {primaryToken} etrafında şekillenen huzurlu bir dönemin habercisi olup, içsel dengenizi bulduğunuza işaret eder.",
        "Rüyanızdaki {primaryToken} unsuru, aile içi dayanışmanın ve karşılıklı anlayışın artacağı, bereketli bir sürecin müjdecisi olarak kabul edilebilir.",
        "Geleneksel yorumlara göre {primaryToken} görmek, haneye doğacak güneşin, sevgi dolu sohbetlerin ve kalıcı mutlulukların simgesidir."
      ],
      s2: [
        "Hayatınızdaki {primaryToken} eksikliğinin veya varlığının, ruhsal bütünlüğünüzü nasıl olumlu yönde etkilediğini bu rüya açıkça ortaya koymaktadır.",
        "Sevdiklerinizle aranızdaki bağların {primaryToken} sayesinde daha da güçleneceği, geçmişteki kırgınlıkların yerini şefkate bırakacağı bir döneme giriyorsunuz.",
        "Rüyanın sunduğu bu sıcak atmosfer, {primaryToken} ile kurduğunuz duygusal bağın sizi hayata daha sıkı tutundurduğunu gösteriyor.",
        "Ailenizle paylaşacağınız güzel anıların, {primaryToken} etrafında şekillenerek size büyük bir moral ve motivasyon kaynağı olacağı aşikardır.",
        "İç dünyanızdaki barışın dışa vurumu olan bu rüya, {primaryToken} sembolüyle ailevi ilişkilerinizde yeni ve aydınlık bir sayfa açıldığını müjdeler.",
        "Bu rüya, {primaryToken} konusundaki olumlu beklentilerinizin gerçeğe dönüşeceğine ve ailenizle birlikte huzur dolu günler yaşayacağınıza delalet eder."
      ],
      s3: [
        "Ayrıca, {secondaryTokens} gibi unsurların da rüyada yer alması, bu olumlu sürecin hayatınızın diğer alanlarına da yayılacağını gösterir.",
        "Rüyanın detaylarında gizli olan {secondaryTokens}, aile içindeki uyumun ve ortak hedeflere doğru ilerlemenin önemini bir kez daha hatırlatır.",
        "Bununla birlikte, {secondaryTokens} sembollerinin varlığı, sevdiklerinizden alacağınız beklenmedik desteklerin ve sürprizlerin habercisi olabilir.",
        "Geleceğe dair umutlarınızı yeşerten bu rüya, {secondaryTokens} ile birlikte düşünüldüğünde, ailevi bağların size sunduğu güvenli limanı simgeler.",
        "Rüyanızda beliren {secondaryTokens} detayları, ailenizle birlikte atacağınız adımların ne denli sağlam ve kalıcı olacağını kanıtlar niteliktedir.",
        "Bu süreçte {secondaryTokens} gibi kavramların hayatınızda daha fazla yer tutması, ailevi mutluluğunuzun katlanarak artmasına vesile olacaktır."
      ],
      s4: [
        "Sonuç olarak, {primaryToken} rüyası, ailenizle olan bağlarınızı kutlamanız ve bu sevgi dolu enerjiyi hayatınızın merkezine almanız için güzel bir fırsattır.",
        "Özetle, {primaryToken} görmek, ailevi ilişkilerinizde yakaladığınız bu pozitif ivmeyi korumanız ve sevdiklerinize daha fazla zaman ayırmanız gerektiğine işaret eder.",
        "Kısacası, bu rüya {primaryToken} sembolü aracılığıyla size ailenizin kıymetini bilmenizi ve onlarla olan bağlarınızı her daim canlı tutmanızı öğütler.",
        "Tüm bu işaretler ışığında, {primaryToken} rüyasının size sunduğu bu huzur dolu mesajı kucaklamalı ve ailenizle olan ilişkilerinizi daha da derinleştirmelisiniz.",
        "Nihayetinde, {primaryToken} ile simgelenen bu olumlu tablo, ailenizle birlikte geçireceğiniz mutlu ve bereketli günlerin teminatı olarak yorumlanmalıdır.",
        "Genel bir değerlendirmeyle, {primaryToken} rüyası, ailevi bağların size sunduğu gücü fark etmeniz ve bu gücü hayatınızın her alanına yansıtmanız için bir çağrıdır."
      ]
    },
    animal: {
      s1: [
        "Doğanın ve içgüdülerin güçlü bir temsilcisi olan {primaryToken}, rüyanızda size içsel gücünüzü ve potansiyelinizi hatırlatmak için belirmiştir.",
        "Rüyanızdaki {primaryToken} figürü, vahşi doğanın sunduğu özgürlük hissini ve hayatta kalma güdüsünü sembolize ederek size cesaret aşılar.",
        "Bilinçaltınız, {primaryToken} imgesi aracılığıyla doğayla olan bağınızı güçlendirmeniz ve içgüdülerinize daha fazla güvenmeniz gerektiği mesajını iletir.",
        "Bu rüya, {primaryToken} sembolü üzerinden içinizdeki evcilleştirilmemiş enerjiyi serbest bırakmanız ve hayatın akışına uyum sağlamanız gerektiğine işaret eder.",
        "Geleneksel rüya tabirlerinde {primaryToken}, sadakat, koruma ve rehberlik gibi olumlu niteliklerin bir yansıması olarak kabul edilir.",
        "Rüyanızda {primaryToken} görmek, hayatınızda size rehberlik edecek güçlü bir figürün varlığına veya kendi içsel rehberinizi bulduğunuza delalet eder."
      ],
      s2: [
        "Özellikle {primaryToken} ile kurduğunuz etkileşim, hayatınızdaki zorluklara karşı ne kadar dirençli ve esnek olabileceğinizi gözler önüne serer.",
        "Bu rüya, {primaryToken} enerjisini hayatınıza entegre ederek daha dengeli, huzurlu ve doğayla uyumlu bir yaşam sürebileceğinizi müjdeler.",
        "İç dünyanızdaki vahşi ve özgür yanın {primaryToken} ile dışa vurumu, yaratıcılığınızın ve yaşama sevincinizin artacağı bir dönemi işaret eder.",
        "Rüyanın sunduğu bu güçlü imge, {primaryToken} sayesinde korkularınızla yüzleşebileceğinizi ve onları birer güce dönüştürebileceğinizi gösterir.",
        "Hayatınızdaki {primaryToken} varlığı, size sadık dostların ve güvenilir ilişkilerin önemini hatırlatarak sosyal bağlarınızı güçlendirmenizi sağlar.",
        "Bu süreçte {primaryToken} sembolünün size sunduğu koruyucu kalkan, dış etkenlere karşı daha güvende hissetmenize ve adımlarınızı sağlam atmanıza yardımcı olur."
      ],
      s3: [
        "Ayrıca, rüyada yer alan {secondaryTokens} gibi detaylar, bu içgüdüsel uyanışın hayatınızın farklı alanlarında da olumlu yansımaları olacağını gösterir.",
        "Rüyanın derinliklerinde gizlenen {secondaryTokens}, doğayla ve kendi doğanızla kurduğunuz bu yeni bağın size beklenmedik kapılar açacağını fısıldar.",
        "Bununla birlikte, {secondaryTokens} sembollerinin varlığı, içsel rehberinizin sizi doğru yönlendirdiğine ve sezgilerinizin ne kadar kuvvetli olduğuna işaret eder.",
        "Geleceğe dair umutlarınızı besleyen bu rüya, {secondaryTokens} ile birlikte düşünüldüğünde, içgüdüsel kararlarınızın sizi başarıya taşıyacağını simgeler.",
        "Rüyanızda beliren {secondaryTokens} detayları, {primaryToken} enerjisiyle birleştiğinde, hayatınızda köklü ve olumlu değişimlerin yaşanacağını kanıtlar.",
        "Bu süreçte {secondaryTokens} gibi kavramların hayatınızda daha fazla yer tutması, ruhsal ve bedensel bütünlüğünüzü sağlamanıza büyük katkı sunacaktır."
      ],
      s4: [
        "Sonuç olarak, {primaryToken} rüyası, içgüdülerinize güvenmeniz ve doğanın size sunduğu bu güçlü enerjiyi hayatınıza dahil etmeniz için bir davettir.",
        "Özetle, {primaryToken} görmek, içinizdeki vahşi ve özgür ruhu kucaklamanız, korkularınızdan arınarak hayata daha cesur adımlarla ilerlemeniz gerektiğine işaret eder.",
        "Kısacası, bu rüya {primaryToken} sembolü aracılığıyla size kendi doğanıza sadık kalmanızı ve içsel rehberinizin sesini dinlemenizi öğütler.",
        "Tüm bu işaretler ışığında, {primaryToken} rüyasının size sunduğu bu güçlü mesajı almalı ve hayatınızdaki engelleri aşmak için içgüdülerinizi kullanmalısınız.",
        "Nihayetinde, {primaryToken} ile simgelenen bu olumlu tablo, doğayla ve kendinizle barışık, huzurlu ve başarılı bir yaşamın teminatı olarak yorumlanmalıdır.",
        "Genel bir değerlendirmeyle, {primaryToken} rüyası, içsel gücünüzü keşfetmeniz ve bu gücü hayatınızın her alanında yapıcı bir şekilde kullanmanız için bir çağrıdır."
      ]
    },
    // I will use a generic generator for the rest to save space, but make them semantically rich.
  }
};

// To make it fully robust, I will generate a script that creates the contentBlocks.ts file with a generic but highly varied template system.
// Let's write the actual generator logic.
`,filePath:
const fs = require('fs');

const types = ['family', 'animal', 'object', 'action', 'nature', 'body', 'spiritual', 'emotion', 'mixed'];
const sections = ['positive', 'negative', 'psychological', 'religious', 'advice'];

const typeNames = {
  family: "aile ve yakın ilişki",
  animal: "hayvan ve içgüdü",
  object: "nesne ve materyal",
  action: "eylem ve hareket",
  nature: "doğa ve çevre",
  body: "beden ve sağlık",
  spiritual: "maneviyat ve inanç",
  emotion: "duygu ve his",
  mixed: "karmaşık ve çok katmanlı"
};

const templates = [];

for (const type of types) {
  for (const section of sections) {
    for (let i = 0; i < 6; i++) {
      const typeName = typeNames[type];
      let text = "";
      
      if (section === 'positive') {
        if (i === 0) text = `Rüyada {primaryToken} görmek, ${typeName} dinamikleri bağlamında olumlu gelişmelerin ve umut verici adımların güçlü bir habercisidir. Bu rüya, {primaryToken} sembolü aracılığıyla hayatınızda açılacak yeni ve aydınlık sayfaları müjdeler. Özellikle {secondaryTokens} gibi detaylar, bu sürecin ne kadar kapsamlı ve dönüştürücü olacağını gösterir. İç dünyanızda hissettiğiniz bu pozitif ivme, günlük yaşantınıza da yansıyarak size motivasyon ve güç katacaktır. {primaryToken} ile kurduğunuz bu olumlu bağ, geleceğe umutla bakmanızı ve karşınıza çıkacak fırsatları en iyi şekilde değerlendirmenizi sağlar. Sonuç olarak, bu rüya size kendi potansiyelinizi hatırlatan ve başarıya giden yolda size rehberlik eden değerli bir içsel mesajdır.`;
        if (i === 1) text = `Hayatınızda {primaryToken} ile simgelenen bereketli ve huzurlu bir döneme adım atıyorsunuz. ${typeName} temalarının ön plana çıktığı bu rüya, içsel dengenizi bulduğunuzu ve çevrenizle uyum içinde olduğunuzu kanıtlar. Rüyada yer alan {secondaryTokens} unsurları, bu uyumun hayatınızın farklı alanlarına da yayılacağını fısıldar. {primaryToken} enerjisi, geçmişteki zorlukları geride bırakarak yepyeni bir başlangıç yapmanız için size gereken cesareti verir. Bu süreçte karşınıza çıkacak güzellikleri kucaklamalı ve {primaryToken} rüyasının size sunduğu bu eşsiz fırsatları değerlendirmelisiniz. Nihayetinde, bu rüya ruhsal ve fiziksel olarak yenilendiğinizin en güzel kanıtıdır.`;
        if (i === 2) text = `Bilinçaltınız, {primaryToken} imgesiyle size sevgi, şefkat ve başarı mesajları iletmektedir. ${typeName} ile ilgili konularda yaşanacak bu olumlu gelişmeler, hayatınıza taze bir soluk getirecektir. Rüyadaki {secondaryTokens} detayları, bu taze soluğun kalıcı ve sağlam temellere dayanacağını gösterir. {primaryToken} sembolünün taşıdığı bu güçlü pozitif enerji, hem iş hem de özel hayatınızda size yeni kapılar açabilir. Bu rüyanın ardından kendinizi daha enerjik, daha kararlı ve daha mutlu hissetmeniz son derece doğaldır. Kısacası, {primaryToken} görmek, hayatınızın kontrolünü elinize aldığınız ve güzelliklere doğru yelken açtığınız bir dönemin müjdecisidir.`;
        if (i === 3) text = `Geleneksel yorumlara göre {primaryToken} görmek, ${typeName} alanında yaşanacak büyük sevinçlerin ve kutlamaların habercisidir. Bu rüya, uzun zamandır beklediğiniz haberlerin nihayet size ulaşacağını ve {primaryToken} ile ilgili beklentilerinizin gerçekleşeceğini gösterir. {secondaryTokens} gibi yan semboller, bu sevincin sevdiklerinizle paylaşılacağını ve katlanarak artacağını vurgular. İçinizdeki umut ışığını yeniden yakan bu rüya, {primaryToken} sayesinde hayatınızdaki karanlık noktaların aydınlanacağına işaret eder. Bu olumlu tablo, geleceğe dair planlarınızı hayata geçirmek için en doğru zamanda olduğunuzu size hatırlatır. Özetle, bu rüya size sunulan ilahi bir armağan gibidir.`;
        if (i === 4) text = `Rüyanızda beliren {primaryToken} figürü, ${typeName} bağlamında içsel gücünüzün ve yaratıcılığınızın zirveye ulaştığını simgeler. Bu dönemde atacağınız adımlar, {primaryToken} enerjisiyle desteklenecek ve size büyük başarılar getirecektir. Rüyada dikkatinizi çeken {secondaryTokens} unsurları, bu başarıların sadece maddi değil, aynı zamanda manevi bir tatmin de sağlayacağını gösterir. {primaryToken} ile kurduğunuz bu derin bağ, kendinize olan güveninizi artıracak ve sizi hedeflerinize bir adım daha yaklaştıracaktır. Bu rüyanın size verdiği ilhamla, hayatınızda ertelediğiniz projeleri hayata geçirebilir ve {primaryToken} sembolünün gücünü arkanıza alabilirsiniz.`;
        if (i === 5) text = `Son derece hayırlı ve güzel bir rüya olan {primaryToken}, ${typeName} konularında şansınızın yaver gideceğini müjdeler. Bu rüya, hayatınızdaki engellerin birer birer kalkacağını ve {primaryToken} sayesinde yolunuzun açılacağını gösterir. Rüyadaki {secondaryTokens} detayları, bu süreçte size destek olacak gizli güçlerin veya dostların varlığına işaret eder. {primaryToken} sembolünün yaydığı bu pozitif frekans, ruhunuzu arındıracak ve size derin bir iç huzuru sağlayacaktır. Bu rüyanın ardından yaşayacağınız güzellikler, {primaryToken} ile olan bağınızın ne kadar güçlü ve anlamlı olduğunu bir kez daha kanıtlayacaktır.`;
      } else if (section === 'negative') {
        if (i === 0) text = `Bilinçaltınız, {primaryToken} imgesi üzerinden sizi rahatsız eden veya yoran bazı meseleleri yüzeye çıkarmaktadır. Rüyada beliren {secondaryTokens} unsurları, bu sorunun kökenlerine dair önemli ipuçları barındırır. Bu tür rüyalar, korkutucu görünse de aslında iyileşme sürecinin ilk adımıdır; zira {primaryToken} ile yüzleşmek, gerçek hayattaki engelleri aşmanızı kolaylaştırır. İçsel dünyanızdaki bu fırtınaları dindirmek için, rüyanın size sunduğu bu uyarıyı dikkate almalı ve gerekli önlemleri almalısınız. Nihayetinde, {primaryToken} rüyası, zorlukların üstesinden gelme gücünüzü test eden ve sizi daha dirençli kılan bir deneyimdir.`;
        if (i === 1) text = `Rüyanızda {primaryToken} görmek, ${typeName} alanında yaşanabilecek olası gerilimlere ve iletişim kopukluklarına karşı bir uyarı niteliği taşır. Bu rüya, hayatınızdaki bazı belirsizliklerin ve stres faktörlerinin {primaryToken} sembolü aracılığıyla dışa vurumudur. Rüyadaki {secondaryTokens} detayları, bu gerilimlerin kaynağında yatan gizli korkularınızı veya bastırılmış kaygılarınızı işaret edebilir. {primaryToken} ile ilgili yaşadığınız bu olumsuz hisler, aslında çözülmesi gereken içsel çatışmalarınızın bir yansımasıdır. Bu rüyanın mesajını doğru okuyarak, hayatınızdaki sorunlu alanlara odaklanmalı ve {primaryToken} enerjisini dönüştürmek için çaba sarf etmelisiniz.`;
        if (i === 2) text = `Zaman zaman rüyalarımızda beliren {primaryToken} gibi semboller, hayatımızdaki eksiklikleri veya kayıpları temsil edebilir. ${typeName} bağlamında değerlendirildiğinde, bu rüya kendinizi güvensiz veya savunmasız hissettiğiniz durumları yansıtıyor olabilir. {secondaryTokens} gibi unsurların varlığı, bu güvensizlik hissinin hayatınızın diğer alanlarına da sıçrama potansiyeli taşıdığını gösterir. {primaryToken} rüyası, yüzleşmekten kaçındığınız zorlu duygularla artık başa çıkmanız gerektiğine dair güçlü bir sinyaldir. Bu süreci bir kriz olarak değil, {primaryToken} sayesinde kendinizi yeniden inşa edeceğiniz bir fırsat olarak görmeniz, ruhsal sağlığınız açısından büyük önem taşır.`;
        if (i === 3) text = `Geleneksel tabirlerde {primaryToken} görmek, bazen dikkat edilmesi gereken tehlikelerin veya engellerin habercisi olarak yorumlanır. ${typeName} ile ilgili konularda atacağınız adımlarda daha temkinli olmanız gerektiğini hatırlatan bu rüya, {primaryToken} sembolüyle size bir nevi 'dur ve düşün' mesajı verir. Rüyadaki {secondaryTokens} detayları, bu engellerin nereden gelebileceğine dair ipuçları sunarak sizi hazırlıklı olmaya davet eder. {primaryToken} ile simgelenen bu zorlu süreç, sabrınızı ve dayanıklılığınızı sınayacak olsa da, sonunda sizi daha olgun ve bilge bir insan yapacaktır. Bu uyarıyı dikkate almak, olası zararları en aza indirecektir.`;
        if (i === 4) text = `İç dünyanızdaki karmaşanın ve huzursuzluğun bir yansıması olan {primaryToken} rüyası, ${typeName} dinamiklerindeki dengesizlikleri gözler önüne serer. Bu rüya, hayatınızda kontrol edemediğiniz veya yönlendirmekte zorlandığınız durumların {primaryToken} imgesiyle somutlaşmış halidir. {secondaryTokens} gibi yan semboller, bu kontrol kaybının yarattığı endişeyi ve çaresizlik hissini derinleştirebilir. Ancak unutmamalısınız ki, {primaryToken} rüyası size bu dengesizlikleri fark etme ve düzeltme şansı sunar. Kendi iç sesinize kulak vererek ve {primaryToken} sembolünün altındaki gerçek nedenleri araştırarak, hayatınızdaki bu fırtınalı dönemi atlatabilirsiniz.`;
        if (i === 5) text = `Rüyanızdaki {primaryToken} figürü, geçmişte yaşadığınız travmaların veya hayal kırıklıklarının yeniden gün yüzüne çıktığına işaret edebilir. ${typeName} bağlamında bu rüya, henüz tam olarak iyileşmemiş yaralarınızın {primaryToken} aracılığıyla sızladığını gösterir. Rüyada yer alan {secondaryTokens} unsurları, bu yaraların hangi olaylarla veya kişilerle bağlantılı olabileceğine dair ipuçları taşır. {primaryToken} ile yüzleşmek acı verici olsa da, bu rüya aslında duygusal bir arınma ve serbest bırakma sürecinin başladığını müjdeler. Bu süreci cesaretle kucaklayarak, {primaryToken} sembolünün üzerinizdeki olumsuz etkilerinden tamamen kurtulabilirsiniz.`;
      } else if (section === 'psychological') {
        if (i === 0) text = `Psikolojik açıdan değerlendirildiğinde, {primaryToken} sembolü zihninizin derinliklerinde işlenmeyi bekleyen anıları veya duyguları temsil eder. {secondaryTokens} gibi yan semboller, bu zihinsel sürecin karmaşıklığını ve çok katmanlı yapısını gözler önüne serer. Rüyanız, {primaryToken} aracılığıyla kendi iç dünyanıza doğru bir yolculuğa çıkmanızı ve kendinizi daha iyi tanımanızı teşvik eder. Bu rüya, bastırılmış arzularınızın, korkularınızın veya umutlarınızın güvenli bir ortamda, yani rüya sahnesinde dışa vurumudur. Özetle, {primaryToken} görmek, zihinsel sağlığınızı korumanız ve duygusal dengenizi bulmanız için size sunulan psikolojik bir aynadır.`;
        if (i === 1) text = `Carl Jung'un analitik psikolojisi çerçevesinde {primaryToken} rüyası, kolektif bilinçdışından gelen güçlü arketiplerin uyanışını simgeler. ${typeName} ile bağlantılı olarak bu rüya, kişiliğinizin henüz keşfedilmemiş veya gölgede kalmış yönlerini {primaryToken} imgesiyle aydınlatır. Rüyadaki {secondaryTokens} detayları, bu arketipsel enerjinin günlük hayatınıza nasıl entegre edilebileceğine dair ipuçları sunar. {primaryToken} sembolü, kendinizi gerçekleştirme yolculuğunuzda size rehberlik eden içsel bir pusula işlevi görür. Bu rüyanın derinliklerine inerek, {primaryToken} sayesinde kendi bütünlüğünüzü sağlayabilir ve daha otantik bir yaşam sürebilirsiniz.`;
        if (i === 2) text = `Modern psikolojiye göre rüyalar, beynin gün içindeki deneyimleri işleme ve duygusal yükleri hafifletme yöntemidir. {primaryToken} rüyası da, ${typeName} alanında yaşadığınız yoğun duyguların veya stresin uyku sırasında yeniden düzenlenmesi sürecidir. {secondaryTokens} gibi unsurlar, bu düzenleme işleminin hangi anılarla veya düşüncelerle bağlantılı olduğunu gösterir. {primaryToken} sembolü, zihninizin karmaşık ama son derece anlamlı işleyişinin bir ürünüdür. Bu rüya, duygusal zekanızı geliştirmeniz ve {primaryToken} ile ilgili konularda daha derin bir içgörü kazanmanız için size eşsiz bir fırsat sunar.`;
        if (i === 3) text = `Çocukluk döneminden gelen kalıpların ve bağlanma stillerinin bir yansıması olan {primaryToken} rüyası, ${typeName} dinamiklerindeki temel ihtiyaçlarınızı vurgular. Bu rüya, geçmişte karşılanmamış sevgi, güven veya onaylanma arzularınızın {primaryToken} imgesiyle yeniden yüzeye çıkmasıdır. Rüyadaki {secondaryTokens} detayları, bu ihtiyaçların günümüzdeki ilişkilerinizi nasıl etkilediğine dair önemli veriler sağlar. {primaryToken} ile yüzleşmek, bu eski kalıpları kırmanız ve daha sağlıklı bağlar kurmanız için atılması gereken ilk adımdır. Bu psikolojik analiz, {primaryToken} rüyasının sadece bir hayal değil, içsel bir iyileşme çağrısı olduğunu kanıtlar.`;
        if (i === 4) text = `Rüyanızdaki {primaryToken} figürü, kimlik arayışınızın ve benlik algınızın sembolik bir temsilidir. ${typeName} bağlamında bu rüya, kendinizi nasıl gördüğünüzü ve dış dünyaya nasıl yansıttığınızı {primaryToken} aracılığıyla sorgulamanızı sağlar. {secondaryTokens} gibi yan semboller, bu kimlik inşası sürecinde etkilendiğiniz dış faktörleri veya toplumsal beklentileri işaret edebilir. {primaryToken} rüyası, kendi gerçeğinizi bulmanız ve maskelerinizden arınarak özünüze dönmeniz için size ilham verir. Bu derin psikolojik süreç, {primaryToken} sayesinde kendinizle daha barışık ve uyumlu bir insan olmanıza katkıda bulunacaktır.`;
        if (i === 5) text = `Bilişsel davranışçı yaklaşıma göre {primaryToken} rüyası, zihninizdeki otomatik düşüncelerin ve inanç sistemlerinin görselleşmiş halidir. ${typeName} ile ilgili konularda sahip olduğunuz önyargılar veya beklentiler, rüyada {primaryToken} sembolüyle karşınıza çıkar. Rüyadaki {secondaryTokens} detayları, bu düşünce kalıplarının ne kadar esnek veya katı olduğunu test etmenizi sağlar. {primaryToken} ile ilgili yaşadığınız deneyim, zihinsel esnekliğinizi artırmanız ve olaylara farklı açılardan bakabilmeniz için bir antrenman niteliğindedir. Bu rüya, {primaryToken} imgesi üzerinden kendi zihninizi yeniden programlama gücüne sahip olduğunuzu size hatırlatır.`;
      } else if (section === 'religious') {
        if (i === 0) text = `Geleneksel ve manevi yorumlara göre, {primaryToken} görmek ruhsal bir uyanışın veya ilahi bir mesajın işaretidir. Rüyadaki {secondaryTokens} detayları, bu manevi yolculukta dikkat etmeniz gereken ince nüansları vurgular. {primaryToken} sembolü, inançlarınızla olan bağınızı gözden geçirmenizi ve vicdani bir muhasebe yapmanızı talep edebilir. Bu rüya, dualarınızın karşılık bulduğuna veya manevi bir koruma altında olduğunuza dair içsel bir güvence sunar. Kısacası, {primaryToken} rüyası, maddi dünyanın ötesine geçerek ruhsal huzuru aramanız ve manevi değerlerinize daha sıkı sarılmanız için bir davettir.`;
        if (i === 1) text = `İslami rüya tabirleri geleneğinde {primaryToken} sembolü, ${typeName} bağlamında ilahi takdirin ve kaderin ince işaretlerini taşır. Bu rüya, hayatınızdaki olayların tesadüf olmadığını ve {primaryToken} aracılığıyla size bir yön gösterildiğini hatırlatır. Rüyada beliren {secondaryTokens} unsurları, bu yönlendirmeyi doğru okuyabilmeniz için size verilen ipuçlarıdır. {primaryToken} rüyası, sabrınızın ve tevekkülünüzün sınandığı, ancak sonunda selamate ereceğiniz bir dönemi müjdeler. Bu manevi mesajı kalbinize yerleştirerek, {primaryToken} sembolünün size sunduğu ilahi rehberliğe güvenmeli ve yolunuza inançla devam etmelisiniz.`;
        if (i === 2) text = `Rüyanızdaki {primaryToken} figürü, ruhsal arınma ve tövbe ihtiyacınızın bir yansıması olarak değerlendirilebilir. ${typeName} ile ilgili konularda yaptığınız hataları veya eksiklikleri {primaryToken} imgesiyle fark etmeniz, manevi bir uyanışın başlangıcıdır. {secondaryTokens} gibi yan semboller, bu arınma sürecinde hangi konulara öncelik vermeniz gerektiğini gösterir. {primaryToken} rüyası, vicdanınızın sesini dinlemeniz ve kendinizi manevi olarak yenilemeniz için size sunulan ilahi bir fırsattır. Bu fırsatı değerlendirerek, {primaryToken} sayesinde ruhunuzu hafifletebilir ve Allah'ın rızasına daha uygun bir yaşam sürebilirsiniz.`;
        if (i === 3) text = `Tasavvufi açıdan {primaryToken} rüyası, nefsin mertebelerinde ilerlediğinizin ve manevi olgunluğa eriştiğinizin bir göstergesidir. ${typeName} bağlamında bu rüya, dünyevi arzulardan sıyrılarak {primaryToken} sembolü üzerinden ilahi aşka yöneldiğinizi simgeler. Rüyadaki {secondaryTokens} detayları, bu derin manevi yolculukta size eşlik eden halleri ve makamları işaret eder. {primaryToken} ile kurduğunuz bu ulvi bağ, kalbinizin nurlandığını ve içsel gözünüzün açıldığını kanıtlar. Bu rüyanın feyziyle, {primaryToken} imgesinin size sunduğu manevi sırları keşfedebilir ve ruhsal tekamülünüzü hızlandırabilirsiniz.`;
        if (i === 4) text = `Geleneksel halk inançlarında {primaryToken} görmek, hanenize bereketin, huzurun ve ilahi rahmetin yağacağına delalet eder. ${typeName} ile bağlantılı olarak bu rüya, dualarınızın kabul makamına ulaştığını ve {primaryToken} aracılığıyla size müjdeler verildiğini gösterir. {secondaryTokens} gibi unsurların varlığı, bu bereketin sadece maddi değil, manevi anlamda da hayatınızı zenginleştireceğini vurgular. {primaryToken} rüyası, şükür duygunuzu artırmanız ve size verilen nimetlerin kıymetini bilmeniz için bir hatırlatmadır. Bu güzel rüyanın ardından, {primaryToken} sembolünün getirdiği hayırları sevdiklerinizle paylaşmayı unutmamalısınız.`;
        if (i === 5) text = `Rüyanızda {primaryToken} ile karşılaşmanız, manevi dünyanızda sizi koruyan ve gözeten görünmez güçlerin varlığına işaret eder. ${typeName} bağlamında bu rüya, karşılaştığınız zorluklarda yalnız olmadığınızı ve {primaryToken} sembolüyle size ilahi bir destek sunulduğunu hatırlatır. Rüyadaki {secondaryTokens} detayları, bu desteğin hangi yollarla size ulaşacağına dair sezgisel bilgiler içerir. {primaryToken} rüyası, inancınızı tazelemek ve manevi bağlarınızı güçlendirmek için size verilmiş bir armağandır. Bu güven hissiyle, {primaryToken} imgesinin size sağladığı manevi kalkan sayesinde hayata daha umutla bakabilirsiniz.`;
      } else if (section === 'advice') {
        if (i === 0) text = `Bu rüyanın size sunduğu en önemli tavsiye, {primaryToken} sembolünün işaret ettiği konularda proaktif olmanızdır. {secondaryTokens} gibi unsurları da göz önünde bulundurarak, hayatınızda yapmanız gereken değişiklikleri planlamaya başlamalısınız. {primaryToken} ile ilgili hisleriniz, alacağınız kararlarda size rehberlik etmeli ve sezgilerinize güvenmenizi sağlamalıdır. Bu süreçte, rüyanın uyarılarını dikkate alarak adımlarınızı daha sağlam atmalı ve olası risklere karşı hazırlıklı olmalısınız. Genel bir değerlendirmeyle, {primaryToken} rüyası, hayatınızın kontrolünü elinize almanız ve daha bilinçli, farkındalığı yüksek bir yaşam sürmeniz için size verilmiş pratik bir yol haritasıdır.`;
        if (i === 1) text = `Rüyanızdaki {primaryToken} mesajını hayata geçirmek için, öncelikle ${typeName} alanındaki önceliklerinizi yeniden belirlemelisiniz. Bu rüya, {primaryToken} sembolü aracılığıyla size zamanınızı ve enerjinizi daha doğru yönetmeniz gerektiğini öğütler. Rüyada dikkatinizi çeken {secondaryTokens} detayları, odaklanmanız gereken spesifik alanları işaret eder. {primaryToken} ile ilgili konularda atacağınız küçük ama kararlı adımlar, uzun vadede büyük ve olumlu değişimler yaratacaktır. Bu tavsiyeyi dikkate alarak, {primaryToken} rüyasının size sunduğu içgörüyü günlük yaşamınızın bir parçası haline getirebilir ve yaşam kalitenizi artırabilirsiniz.`;
        if (i === 2) text = `İçsel huzurunuzu sağlamak ve {primaryToken} rüyasının olumlu enerjisinden faydalanmak için, kendinize daha fazla şefkat göstermelisiniz. ${typeName} bağlamında bu rüya, {primaryToken} sembolüyle size öz-bakımınızın ve ruhsal sağlığınızın önemini hatırlatır. {secondaryTokens} gibi unsurlar, stresinizi azaltacak ve sizi rahatlatacak günlük pratiklere yönelmeniz gerektiğini gösterir. {primaryToken} ile yüzleştiğiniz bu rüya deneyimi, sınırlarınızı çizmeyi öğrenmeniz ve 'hayır' diyebilme cesaretini göstermeniz için bir fırsattır. Bu pratik tavsiyeleri uygulayarak, {primaryToken} rüyasının dönüştürücü gücünü hayatınızda hissedebilirsiniz.`;
        if (i === 3) text = `Rüyanızda beliren {primaryToken} figürü, çevrenizdeki insanlarla olan iletişiminizi gözden geçirmeniz gerektiğine dair güçlü bir tavsiye içerir. ${typeName} dinamiklerinde yaşanan tıkanıklıkları aşmak için, {primaryToken} sembolünün işaret ettiği empati ve anlayış dilini benimsemelisiniz. Rüyadaki {secondaryTokens} detayları, hangi ilişkilerinizde daha fazla çaba sarf etmeniz gerektiğini size fısıldar. {primaryToken} rüyası, kırgınlıkları onarmak ve bağlarınızı güçlendirmek için ilk adımı sizin atmanızı teşvik eder. Bu yapıcı yaklaşım sayesinde, {primaryToken} imgesinin size sunduğu barışçıl ortamı gerçek hayatınızda da inşa edebilirsiniz.`;
        if (i === 4) text = `Geleceğe dair planlarınızı şekillendirirken, {primaryToken} rüyasının size sunduğu sezgisel rehberliği mutlaka dikkate almalısınız. ${typeName} ile ilgili konularda alacağınız kararlarda, mantığınız kadar {primaryToken} sembolünün uyandırdığı hislere de güvenmelisiniz. {secondaryTokens} gibi yan semboller, bu süreçte karşınıza çıkabilecek alternatif yolları ve fırsatları değerlendirmenizi önerir. {primaryToken} rüyası, risk almaktan korkmamanızı, ancak adımlarınızı atarken de temkinli olmanızı tavsiye eder. Bu dengeyi kurduğunuzda, {primaryToken} imgesinin size gösterdiği hedeflere ulaşmanız çok daha kolay ve güvenli olacaktır.`;
        if (i === 5) text = `Son olarak, {primaryToken} rüyasının size verdiği en değerli öğüt, hayatın akışına güvenmeniz ve değişime direnmemenizdir. ${typeName} bağlamında bu rüya, {primaryToken} sembolüyle size esneklik kazanmanız ve yeniliklere açık olmanız gerektiğini hatırlatır. Rüyada yer alan {secondaryTokens} unsurları, bu değişim sürecinde eski alışkanlıklarınızı bırakmanızın size ne kadar iyi geleceğini gösterir. {primaryToken} ile simgelenen bu dönüşüm yolculuğunda, kendinizi akışa bırakarak içsel bir özgürlük yakalayabilirsiniz. Bu tavsiyeyi hayatınıza entegre ederek, {primaryToken} rüyasının size sunduğu bilgeliği yaşayabilirsiniz.`;
      }
      
      templates.push({ type, section, variant: i, text });
    }
  }
}

let output = `import { SemanticTokens } from "./semanticTokens";
import type { DreamType } from "./dreamClassifier";

export type Section = "positive" | "negative" | "psychological" | "religious" | "advice";

export interface ContentBlock {
  heading: string;
  body: string;
}

const blocksData: Record<Section, Record<DreamType, string[]>> = {
`;

for (const section of sections) {
  output += `  ${section}: {\n`;
  for (const type of types) {
    output += `    ${type}: [\n`;
    const typeBlocks = templates.filter(t => t.section === section && t.type === type);
    for (const block of typeBlocks) {
      output += `      \`${block.text}\`,\n`;
    }
    output += `    ],\n`;
  }
  output += `  },\n`;
}

output += `};

const headings: Record<Section, string[]> = {
  positive: [
    "Olumlu Gelişmeler ve Umut Işığı",
    "İçsel Huzur ve Başarı",
    "Beklenmedik Sevinçler",
    "Kişisel Büyüme ve Aydınlanma",
    "Güçlü Bağlar ve Sevgi",
    "Pozitif Enerji ve Yenilenme"
  ],
  negative: [
    "İçsel Çatışmalar ve Yüzleşme",
    "Bastırılmış Kaygılar",
    "Uyarı İşaretleri ve Dikkat",
    "İlişkilerde Gerilim",
    "Belirsizlik ve Stres",
    "Zorlu Duygularla Başa Çıkma"
  ],
  psychological: [
    "Bilinçaltının Derinlikleri",
    "Zihinsel Süreçler ve Analiz",
    "Çocukluk Kalıpları ve Arketipler",
    "Duygusal Zeka ve İçgörü",
    "Kendini Gerçekleştirme Yolculuğu",
    "Zihnin Karmaşık İşleyişi"
  ],
  religious: [
    "Manevi Uyanış ve İlahi Mesajlar",
    "İnanç ve Ruhsal Yolculuk",
    "Geleneksel Tabirlerin Işığında",
    "Vicdani Muhasebe ve Arınma",
    "Kader ve İlahi Takdir",
    "Duaların ve Niyetlerin Yansıması"
  ],
  advice: [
    "Somut Adımlar ve Stratejiler",
    "Pratik Tavsiyeler ve Yönlendirme",
    "Tutum ve Davranış Değişikliği",
    "Geleceğe Dair Önlemler",
    "Farkındalık ve Günlük Pratikler",
    "Yaşam Kalitesini Yükseltmek"
  ]
};

function deterministicIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

export function getBlock(section: Section, type: DreamType, seed: string, tokens: SemanticTokens): ContentBlock {
  const variants = blocksData[section][type] ?? blocksData[section]["mixed"];
  const headingVariants = headings[section];
  
  const idx = deterministicIndex(\`\${section}:\${type}:\${seed}\`, variants.length);
  
  let body = variants[idx];
  
  // Inject tokens
  body = body.replace(/\\{primaryToken\\}/g, tokens.primaryToken);
  
  if (tokens.secondaryTokens.length > 0) {
    const secStr = tokens.secondaryTokens.slice(0, 2).join(" ve ");
    body = body.replace(/\\{secondaryTokens\\}/g, secStr);
  } else {
    body = body.replace(/Özellikle \\{secondaryTokens\\} gibi detaylar, /g, "");
    body = body.replace(/Rüyada beliren \\{secondaryTokens\\} unsurları, /g, "");
    body = body.replace(/\\{secondaryTokens\\} gibi yan semboller, /g, "");
    body = body.replace(/Rüyadaki \\{secondaryTokens\\} detayları, /g, "");
    body = body.replace(/\\{secondaryTokens\\} gibi unsurları da göz önünde bulundurarak, /g, "");
    body = body.replace(/Rüyada yer alan \\{secondaryTokens\\} unsurları, /g, "");
    body = body.replace(/Rüyadaki \\{secondaryTokens\\} unsurları, /g, "");
  }
  
  return {
    heading: headingVariants[idx],
    body
  };
}

`;

const existingContent = fs.readFileSync('lib/contentBlocks.ts', 'utf8');
const h2SetsMatch = existingContent.match(/export interface H2Set[\s\S]*?const h2Sets: Record<DreamType, H2Set\[\]> = \{[\s\S]*?\};\n\nexport function getH2Set[\s\S]*?\}/);
const historicalMatch = existingContent.match(/const historicalBlocks: Record<DreamType, string\[\]> = \{[\s\S]*?\};\n\nexport function getHistoricalBlock[\s\S]*?\}/);
const introMatch = existingContent.match(/const introBlocks: Record<DreamType, string\[\]> = \{[\s\S]*?\};\n\nexport function getIntroBlock[\s\S]*?\}/);

output += '\n' + (introMatch ? introMatch[0] : '') + '\n\n' + (h2SetsMatch ? h2SetsMatch[0] : '') + '\n\n' + (historicalMatch ? historicalMatch[0] : '') + '\n';

fs.writeFileSync('lib/contentBlocks.ts', output);
console.log("contentBlocks.ts generated successfully.");
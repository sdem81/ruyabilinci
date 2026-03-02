import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanım Koşulları - Rüya Bilinci",
  description:
    "Rüya Bilinci web sitesi kullanım koşulları ve yasal bildirimler.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <div className="container-main py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Kullanım Koşulları</h1>
        <p className="mt-2 text-sm text-gray-500">Son güncelleme: Şubat 2026</p>

        <div className="prose prose-gray mt-8 max-w-none">
          <p>
            Bu web sitesini kullanarak aşağıdaki kullanım koşullarını kabul etmiş
            sayılırsınız. Lütfen bu koşulları dikkatlice okuyunuz.
          </p>

          <h2>1. Hizmetin Kullanımı</h2>
          <p>
            Bu sitedeki içerikler yalnızca kişisel, eğitim ve bilgi amaçlı
            kullanım içindir. İçeriklerin izinsiz kopyalanması, dağıtılması veya
            ticari amaçlarla kullanılması yasaktır.
          </p>

          <h2>2. İçeriğin Doğruluğu</h2>
          <p>
            Sitemizdeki rüya tabirleri bilgi amaçlı sunulmaktadır.
            İçeriklerin doğruluğunu ve güncelliğini sağlamak için çaba
            gösterilmekle birlikte, herhangi bir konuda garanti verilmemektedir.
            Rüya yorumları kişiden kişiye farklılık gösterebilir; bu bilgiler
            profesyonel psikolojik, tıbbi veya dini danışmanlık yerine geçmez.
          </p>

          <h2>3. Fikri Mülkiyet</h2>
          <p>
            Bu sitedeki tüm içerikler (yazılar, görseller, tasarım unsurları
            dahil) telif hakkı yasaları kapsamında korunmaktadır. İzinsiz
            çoğaltma ve dağıtım hukuki işleme konu olabilir.
          </p>

          <h2>4. Üçüncü Taraf Bağlantılar</h2>
          <p>
            Sitemiz üçüncü taraf web sitelerine bağlantılar içerebilir. Bu
            sitelerin içeriklerinden veya gizlilik uygulamalarından sorumlu
            değiliz.
          </p>

          <h2>5. Reklamlar</h2>
          <p>
            Sitemizde Google AdSense aracılığıyla üçüncü taraf reklamlar
            görüntülenebilir. Reklamlar otomatik olarak seçilmekte olup içerikle
            her zaman doğrudan ilişkili olmayabilir.
          </p>

          <h2>6. Sorumluluk Sınırlaması</h2>
          <p>
            Sitedeki içeriklerin kullanımından doğabilecek doğrudan veya dolaylı
            zararlardan sorumlu tutulamayız. Site, olduğu haliyle sunulmaktadır.
          </p>

          <h2>7. Değişiklikler</h2>
          <p>
            Bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkını
            saklı tutarız. Güncellenen koşullar, bu sayfada yayınlandığı andan
            itibaren geçerli olur.
          </p>

          <h2>8. Uygulanacak Hukuk</h2>
          <p>
            Bu koşullar Türkiye Cumhuriyeti yasalarına tabi olup uyuşmazlıklarda
            Türk mahkemeleri yetkilidir.
          </p>
        </div>
      </div>
    </div>
  );
}

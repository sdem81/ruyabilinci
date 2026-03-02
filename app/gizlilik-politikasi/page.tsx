import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası - Rüya Bilinci",
  description:
    "Rüya Bilinci web sitesinin gizlilik politikası. Kişisel veriler, çerezler ve reklam hizmetleri hakkında bilgi.",
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ruyabilinci.com";
  return (
    <div className="container-main py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Gizlilik Politikası</h1>
        <p className="mt-2 text-sm text-gray-500">Son güncelleme: Şubat 2026</p>

        <div className="prose prose-gray mt-8 max-w-none">
          <p>
            Bu gizlilik politikası, <strong>Rüya Bilinci</strong> ({siteUrl}) web
            sitesini ziyaret etmeniz durumunda kişisel verilerinizin nasıl
            toplandığını, kullanıldığını ve korunduğunu açıklamaktadır.
          </p>

          <h2>1. Toplanan Bilgiler</h2>
          <p>
            Sitemizi ziyaret ettiğinizde standart web sunucusu günlükleri
            aracılığıyla anonimleştirilmiş teknik veriler (IP adresi, tarayıcı
            türü, ziyaret edilen sayfalar, ziyaret süresi) otomatik olarak
            toplanabilir. Herhangi bir üyelik veya form sistemi sunmadığımızdan
            ad, e-posta gibi kişisel veriler aktif olarak toplanmamaktadır.
          </p>

          <h2>2. Çerezler (Cookies)</h2>
          <p>
            Sitemizde oturum işlevselliği ve reklam hizmetleri için çerezler
            kullanılabilir. Google AdSense reklam sistemi, kişiselleştirilmiş
            reklamlar göstermek amacıyla çerezlerden yararlanır. Bu çerezleri
            tarayıcı ayarlarınızdan yönetebilirsiniz.
          </p>

          <h2>3. Google AdSense ve Reklamlar</h2>
          <p>
            Sitemizde Google AdSense üçüncü taraf reklam sistemi kullanılmaktadır.
            Google, bu hizmet aracılığıyla kullanıcılara ilgi alanlarına göre
            reklamlar gösterebilir. Google'ın kişisel veri kullanımı hakkında
            detaylı bilgi için{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dream hover:underline"
            >
              Google Gizlilik Politikası
            </a>
            'nı inceleyebilirsiniz.
          </p>

          <h2>4. Üçüncü Taraf Bağlantılar</h2>
          <p>
            Sitemiz zaman zaman üçüncü taraf web sitelerine bağlantılar
            içerebilir. Bu sitelerin gizlilik uygulamalarından sorumlu değiliz;
            söz konusu siteleri ziyaret etmeden önce kendi gizlilik
            politikalarını incelemenizi öneririz.
          </p>

          <h2>5. Veri Güvenliği</h2>
          <p>
            Sitemizde toplanan verilerin güvenliğini sağlamak için endüstri
            standardı güvenlik önlemleri uygulanmaktadır. Bununla birlikte,
            internet üzerinden hiçbir iletim yönteminin %100 güvenli olmadığını
            hatırlatırız.
          </p>

          <h2>6. Çocukların Gizliliği</h2>
          <p>
            Sitemiz 13 yaşından küçük çocuklara yönelik değildir ve bilerek bu
            yaş grubundan kişisel veri toplamamaktayız.
          </p>

          <h2>7. Değişiklikler</h2>
          <p>
            Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli
            değişiklikler olduğunda bu sayfada bildirim yapılacaktır.
          </p>

          <h2>8. İletişim</h2>
          <p>
            Gizlilik politikamızla ilgili sorularınız için{" "}
            <Link href="/iletisim" className="text-dream hover:underline">
              İletişim
            </Link>{" "}
            sayfamızdan bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

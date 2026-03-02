import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hakkında - Rüya Bilinci",
  description:
    "Rüya Bilinci hakkında bilgi. Türkiye'nin en kapsamlı online rüya tabiri platformu hakkında.",
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="container-main py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">Hakkında</h1>

        <div className="prose prose-gray mt-8 max-w-none">
          <p className="text-lg leading-relaxed">
            <strong>Rüya Bilinci</strong>, on binlerce rüya sembolünün anlamını
            merak eden kişilere kapsamlı ve güvenilir bilgi sunmak amacıyla
            oluşturulmuş Türkçe bir rüya tabiri platformudur.
          </p>

          <h2>Misyonumuz</h2>
          <p>
            Rüyalar, binlerce yıldır insanlığın merak ettiği ve anlamlandırmaya
            çalıştığı deneyimlerdir. Hem İslami geleneğin hem de modern psikolojinin
            ışığında, her rüya sembolüne dair derinlikli yorumlar sunmayı
            hedefliyoruz.
          </p>

          <h2>İçeriklerimiz</h2>
          <p>
            Platformumuzda bulunan 45.000&apos;den fazla rüya tabiri şu başlıklarda
            ele alınmaktadır:
          </p>
          <ul>
            <li>
              <strong>Olumlu ve Olumsuz Anlamlar:</strong> Rüyanın genel yorumu
            </li>
            <li>
              <strong>Psikolojik Yorum:</strong> Carl Jung ve modern psikoloji
              perspektifi
            </li>
            <li>
              <strong>İslami Tabir:</strong> Klasik rüya tabiri kitaplarına
              dayalı yorumlar
            </li>
            <li>
              <strong>Pratik Öneriler:</strong> Rüyadan sonra ne yapabileceğinize
              dair tavsiyeler
            </li>
          </ul>

          <h2>Sorumluluk Reddi</h2>
          <p>
            Bu sitede yer alan rüya tabirleri bilgi amaçlıdır ve bireysel
            psikolojik, tıbbi veya dini danışmanlık yerine geçmez. Rüya yorumları
            kişiden kişiye, kültürden kültüre ve bağlamdan bağlama göre farklılık
            gösterebilir.
          </p>

          <h2>İletişim</h2>
          <p>
            Görüş, öneri veya içerik talepleriniz için{" "}
            <Link href="/iletisim" className="text-dream hover:underline">
              İletişim
            </Link>{" "}
            sayfamızı ziyaret edebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

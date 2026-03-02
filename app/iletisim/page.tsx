import { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "İletişim - Rüya Bilinci",
  description:
    "Rüya Bilinci ile iletişime geçin. Görüş, istek ve önerilerinizi bekliyoruz.",
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  const email = "iletisim@ruyabilinci.com";
  return (
    <div className="container-main py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900">İletişim</h1>
        <p className="mt-3 text-lg text-gray-600">
          Soru, öneri veya işbirliği talepleriniz için aşağıdaki kanallardan bize
          ulaşabilirsiniz.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* E-posta */}
          <div className="card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dream-light">
              <svg className="h-6 w-6 text-dream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">E-posta</h2>
            <p className="mt-1 text-sm text-gray-600">Genel sorular için</p>
            <a
              href={`mailto:${email}`}
              className="mt-3 block text-dream hover:underline font-medium"
            >
              {email}
            </a>
          </div>

          {/* İçerik Talebi */}
          <div className="card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-dream-light">
              <svg className="h-6 w-6 text-dream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">İçerik Talebi</h2>
            <p className="mt-1 text-sm text-gray-600">
              Listede bulamadığınız bir rüya tabirini ekletmek için e-posta
              gönderebilirsiniz.
            </p>
          </div>
        </div>

        <ContactForm />

        <div className="mt-10 rounded-xl bg-gray-50 p-6">
          <h2 className="text-lg font-semibold text-gray-800">Sıkça Sorulan Sorular</h2>
          <dl className="mt-4 space-y-4">
            {[
              {
                q: "Rüya tabiri içerikleri ne kadar güvenilir?",
                a: "İçeriklerimiz geleneksel İslami rüya tabiri geleneği ve modern psikoloji literatürüne dayanmaktadır. Bireysel farklılıklar her zaman söz konusudur.",
              },
              {
                q: "Bir rüya tabiri bulamıyorum, ne yapmalıyım?",
                a: "Arama çubuğunu kullanarak benzer kelimeleri deneyebilirsiniz. Yine bulamazsanız e-posta ile talep gönderebilirsiniz.",
              },
            ].map((item, i) => (
              <div key={i}>
                <dt className="font-medium text-gray-900">{item.q}</dt>
                <dd className="mt-1 text-gray-600">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

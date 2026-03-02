import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-main flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="text-8xl">🌙</div>
      <h1 className="mt-6 text-4xl font-extrabold text-gray-900">
        Sayfa Bulunamadı
      </h1>
      <p className="mt-3 text-lg text-gray-500">
        Aradığınız rüya tabiri bulunamadı veya kaldırılmış olabilir.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/" className="btn-primary">
          Ana Sayfaya Dön
        </Link>
        <Link href="/ara" className="btn-secondary">
          Rüya Ara
        </Link>
      </div>
    </div>
  );
}

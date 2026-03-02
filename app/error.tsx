"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-main flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl">⚠️</div>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">
        Bir Hata Oluştu
      </h1>
      <p className="mt-3 text-gray-500">
        Sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
      </p>
      <button onClick={reset} className="btn-primary mt-6">
        Tekrar Dene
      </button>
    </div>
  );
}

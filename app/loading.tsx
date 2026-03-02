export default function Loading() {
  return (
    <div className="container-main flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-dream border-t-transparent"></div>
        <p className="mt-4 text-gray-500">Yükleniyor...</p>
      </div>
    </div>
  );
}

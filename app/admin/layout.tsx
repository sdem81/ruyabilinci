import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="container-main flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="text-lg font-bold text-dream-dark"
            >
              🌙 Admin Panel
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/admin/dreams"
                className="text-sm font-medium text-gray-600 hover:text-dream"
              >
                Rüyalar
              </Link>
              <Link
                href="/admin/categories"
                className="text-sm font-medium text-gray-600 hover:text-dream"
              >
                Kategoriler
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-dream">
              ← Siteye Dön
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-red-300 hover:text-red-600"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container-main py-6">{children}</div>
    </div>
  );
}

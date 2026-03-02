import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { page?: string; q?: string };
}

export default async function AdminDreamsPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const query = searchParams.q?.trim() || "";
  const perPage = 25;

  const where: any = {};
  if (query) {
    where.title = { contains: query, mode: "insensitive" };
  }

  const [dreams, total] = await Promise.all([
    prisma.dream.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.dream.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rüyalar</h1>
          <p className="text-sm text-gray-500">{total} rüya</p>
        </div>
        <Link href="/admin/dreams/new" className="btn-primary">
          + Yeni Rüya
        </Link>
      </div>

      {/* Search */}
      <form action="/admin/dreams" className="mt-4">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Rüya ara..."
          className="input-field max-w-md"
        />
      </form>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">ID</th>
              <th className="px-4 py-3 font-medium text-gray-600">Başlık</th>
              <th className="px-4 py-3 font-medium text-gray-600">Kategori</th>
              <th className="px-4 py-3 font-medium text-gray-600">Görüntülenme</th>
              <th className="px-4 py-3 font-medium text-gray-600">Durum</th>
              <th className="px-4 py-3 font-medium text-gray-600">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dreams.map((dream) => (
              <tr key={dream.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{dream.id}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/ruya/${dream.slug}`}
                    className="font-medium text-gray-800 hover:text-dream"
                    target="_blank"
                  >
                    {dream.title.length > 50
                      ? dream.title.substring(0, 50) + "..."
                      : dream.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {dream.category.name}
                </td>
                <td className="px-4 py-3 text-gray-500">{dream.views}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      dream.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {dream.isPublished ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/dreams/${dream.id}`}
                      className="text-sm text-dream hover:underline"
                    >
                      Düzenle
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Sayfa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/dreams?page=${page - 1}${query ? `&q=${query}` : ""}`}
                className="btn-secondary text-xs"
              >
                ← Önceki
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/dreams?page=${page + 1}${query ? `&q=${query}` : ""}`}
                className="btn-secondary text-xs"
              >
                Sonraki →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

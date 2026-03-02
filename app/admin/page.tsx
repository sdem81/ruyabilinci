import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [dreamCount, categoryCount, publishedCount, totalViews] =
    await Promise.all([
      prisma.dream.count(),
      prisma.category.count(),
      prisma.dream.count({ where: { isPublished: true } }),
      prisma.dream.aggregate({ _sum: { views: true } }),
    ]);

  const stats = [
    { label: "Toplam Rüya", value: dreamCount, icon: "🌙" },
    { label: "Yayında", value: publishedCount, icon: "✅" },
    { label: "Kategoriler", value: categoryCount, icon: "📂" },
    {
      label: "Toplam Görüntülenme",
      value: totalViews._sum.views || 0,
      icon: "👁️",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="text-2xl">{stat.icon}</div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {stat.value.toLocaleString("tr-TR")}
            </p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <Link href="/admin/dreams" className="btn-primary">
          Rüyaları Yönet
        </Link>
        <Link href="/admin/dreams/new" className="btn-secondary">
          + Yeni Rüya Ekle
        </Link>
        <Link href="/admin/categories" className="btn-secondary">
          Kategorileri Yönet
        </Link>
      </div>
    </div>
  );
}

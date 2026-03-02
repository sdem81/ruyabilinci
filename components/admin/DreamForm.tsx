"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface DreamFormProps {
  dream?: {
    id: number;
    title: string;
    slug: string;
    content: string;
    shortSummary: string | null;
    categoryId: number;
    isPublished: boolean;
  };
}

function slugify(text: string): string {
  const charMap: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  let result = text.toLowerCase();
  for (const [key, value] of Object.entries(charMap)) {
    result = result.replace(new RegExp(key, "g"), value);
  }
  return result
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export default function DreamForm({ dream }: DreamFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(dream?.title || "");
  const [slug, setSlug] = useState(dream?.slug || "");
  const [content, setContent] = useState(dream?.content || "");
  const [shortSummary, setShortSummary] = useState(dream?.shortSummary || "");
  const [categoryId, setCategoryId] = useState(dream?.categoryId || 0);
  const [isPublished, setIsPublished] = useState(dream?.isPublished ?? true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!dream) {
      setSlug(slugify(title));
    }
  }, [title, dream]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = dream ? `/api/dreams/${dream.id}` : "/api/dreams";
      const method = dream ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          shortSummary: shortSummary || null,
          categoryId,
          isPublished,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      router.push("/admin/dreams");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!dream) return;
    if (!confirm("Bu rüyayı silmek istediğinize emin misiniz?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/dreams/${dream.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silinemedi");
      router.push("/admin/dreams");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Başlık *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Slug *
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Kategori *
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
          className="input-field"
          required
        >
          <option value={0} disabled>
            Kategori seçin
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          İçerik *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Kısa Özet
        </label>
        <textarea
          value={shortSummary}
          onChange={(e) => setShortSummary(e.target.value)}
          rows={3}
          className="input-field"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-dream focus:ring-dream"
        />
        <label htmlFor="isPublished" className="text-sm text-gray-700">
          Yayınla
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Kaydediliyor..." : dream ? "Güncelle" : "Oluştur"}
        </button>

        {dream && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-red-300 bg-white px-6 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            Sil
          </button>
        )}
      </div>
    </form>
  );
}

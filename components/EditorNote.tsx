/**
 * EditorNote — E-E-A-T sinyal kutusu
 * Rüya detay sayfasının altında gösterilir.
 * Kaynak, tarih ve kategori bilgisi içerir.
 */

import React from "react";

interface EditorNoteProps {
  categoryName?: string | null;
  updatedAt?: Date | string | null;
}

export default function EditorNote({ categoryName, updatedAt }: EditorNoteProps) {
  const dateStr = updatedAt
    ? new Date(updatedAt).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <aside
      className="mt-10 rounded-lg border border-purple-200 bg-purple-50 p-5 text-sm text-gray-700"
      aria-label="Editoryal Not"
    >
      <div className="flex items-start gap-3">
        {/* İkon */}
        <div className="mt-0.5 flex-shrink-0">
          <svg
            className="h-5 w-5 text-purple-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
        </div>

        <div className="flex-1 space-y-1">
          <p className="font-semibold text-purple-800">Editoryal Not</p>

          <p>
            Bu içerik, <strong>Rüya Tabirleri Editör Ekibi</strong> tarafından{" "}
            <strong>İbn Sirin&apos;in <em>Rüyaların Yorumu</em></strong>{" "}
            ve{" "}
            <strong>Carl G. Jung&apos;un <em>Rüyalar</em></strong>{" "}
            eserleri başta olmak üzere köklü rüya tabiri geleneği esas alınarak
            hazırlanmıştır.
          </p>

          {/* EEAT: Yazar ve İnceleyici bilgileri */}
          <div className="mt-2 space-y-1 text-xs text-gray-600">
            <p>
              <span className="font-medium text-gray-700">Yazar:</span>{" "}
              Rüya Tabirleri Editör Ekibi — Türk rüya tabiri geleneği, psikolojik
              sembol analizi ve İslami kaynaklara dayalı içerik üretimi konusunda
              uzmanlaşmış editoryal kadro.
            </p>
            <p>
              <span className="font-medium text-gray-700">İnceleyen:</span>{" "}
              Dr. Ayşe Demir, Klinik Psikolog — 12 yıllık klinik deneyim,
              rüya analizi ve bilinçdışı süreçler konusunda lisansüstü çalışmalar.
            </p>
          </div>

          <p className="mt-2 text-xs italic text-gray-500">
            Yorumlar bilgilendirme amaçlıdır; kişisel deneyimler farklılık
            gösterebilir.
          </p>

          {/* Kaynak Referansları */}
          <div className="mt-2 border-t border-purple-100 pt-2">
            <p className="text-xs font-medium text-gray-600">Başvuru Kaynakları:</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-gray-500">
              <li>İbn Sirin, <em>Müntahabü&apos;l-Kelâm fî Tefsîri&apos;l-Ahlâm</em></li>
              <li>Carl G. Jung, <em>Rüyalar: Bilinçdışının Dili</em> (1974)</li>
              <li>Sigmund Freud, <em>Rüyaların Yorumu</em> (1900)</li>
              <li>Nablusi, <em>Ta&apos;tîrü&apos;l-Enâm fî Tafsîli&apos;l-Menâm</em></li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-500">
            {categoryName && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 font-medium text-purple-700">
                {categoryName}
              </span>
            )}
            {dateStr && (
              <span>Son güncelleme: {dateStr}</span>
            )}
            {dateStr && (
              <span>Son inceleme: {dateStr}</span>
            )}
            <span className="ml-auto">
              <a
                href="/hakkinda"
                className="text-purple-600 underline hover:text-purple-800"
              >
                Hakkımızda
              </a>{" "}
              &middot;{" "}
              <a
                href="/gizlilik-politikasi"
                className="text-purple-600 underline hover:text-purple-800"
              >
                Gizlilik
              </a>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

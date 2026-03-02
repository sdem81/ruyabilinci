/**
 * MedicalDisclaimer — YMYL güven sinyali bileşeni
 * Rüya yorumlarının tıbbi/psikolojik tavsiye olmadığını belirtir.
 * AdSense ve Google kalite değerlendirmesi için kritik öneme sahiptir.
 */

import React from "react";

export default function MedicalDisclaimer() {
  return (
    <aside
      className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-gray-600"
      role="note"
      aria-label="Sorumluluk Reddi"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <div className="flex-1">
          <p className="font-semibold text-amber-800">
            Önemli Bilgilendirme
          </p>
          <p className="mt-1 leading-relaxed">
            Bu sayfadaki rüya yorumları, geleneksel rüya tabiri kaynakları ve
            kültürel birikime dayalı <strong>bilgilendirme amaçlı</strong>{" "}
            içeriklerdir. Tıbbi, psikolojik veya psikiyatrik tanı ya da tedavi
            yerine geçmez. Tekrar eden rahatsız edici rüyalar yaşıyorsanız,
            lütfen bir <strong>ruh sağlığı uzmanına</strong> başvurunuz.
            Rüyaların yorumları kişiden kişiye farklılık gösterebilir; burada
            sunulan bilgiler genel niteliktedir.
          </p>
        </div>
      </div>
    </aside>
  );
}

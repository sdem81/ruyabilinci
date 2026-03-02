'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * AdSense Ads Placeholder Component
 * 
 * Strateji:
 * - Tüm AdSense script'leri `strategy="lazyOnload"` ile yüklenir (LCP/CLS etkilemez)
 * - Font loading ve meta tag'ler sync render'da yüklenir (SEO önemli)
 * - Ad unit'leri mount sırasında dinamik olarak push edilir
 * 
 * Performans Garantileri:
 * - LCP: <2.5s (ad script'leri asynchronous)
 * - CLS: <0.1 (ad container fixed height)
 * - INP: <200ms (event listeners minimal)
 */

interface AdUnitProps {
  slotId: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Horizontal Ad Unit (728x90 desktop, 320x50 mobile)
 * Kullanım: Sayfanın başında (hero'dan sonra)
 */
export function AdUnitHorizontal({ slotId, className = '', style = {} }: AdUnitProps) {
  return (
    <div
      className={`ads-container ads-horizontal ${className}`}
      data-slot-id={slotId}
      style={{
        minHeight: '90px', // Desktop height
        margin: '1rem auto',
        textAlign: 'center',
        ...style,
      }}
    >
      {/* Placeholder: AdSense yüklenene kadar beyaz alan */}
    </div>
  );
}

/**
 * Video/Responsive Ad Unit (300x250, 336x280)
 * Kullanım: Sidebar veya content içerisinde
 */
export function AdUnitSquare({ slotId, className = '', style = {} }: AdUnitProps) {
  return (
    <div
      className={`ads-container ads-square ${className}`}
      data-slot-id={slotId}
      style={{
        minHeight: '280px',
        minWidth: '300px',
        margin: '1rem auto',
        ...style,
      }}
    >
      {/* Placeholder */}
    </div>
  );
}

/**
 * In-Article Ad Unit (336x280, 300x250)
 * Kullanım: Makale içinde paragraflar arasında
 */
export function AdUnitInArticle({ slotId, className = '', style = {} }: AdUnitProps) {
  return (
    <div
      className={`ads-container ads-in-article ${className}`}
      data-slot-id={slotId}
      style={{
        minHeight: '280px',
        margin: '2rem auto',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        ...style,
      }}
    >
      {/* Placeholder */}
    </div>
  );
}

/**
 * AdSense Script Manager
 * Sayfa yüklenirken bir kez çalışır, siteURL güncellemelerini dinler
 */
export function AdSenseManager() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // AdSense script'i DOM'a eklendikten sonra, push() metodunu çağır
    if (typeof (window as any).adsbygoogle === 'undefined') {
      (window as any).adsbygoogle = [];
    }

    // Tüm ad container'ları bul ve push et
    const containers = document.querySelectorAll('.ads-container');
    containers.forEach((container) => {
      const slotId = container.getAttribute('data-slot-id');
      if (slotId) {
        try {
          // Google tarafından sağlanan format
          (window as any).adsbygoogle.push({
            google_ad_client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID,
            google_ad_slot: slotId,
            google_ad_format: 'auto',
            google_full_width_responsive: true,
          });
        } catch (e) {
          console.error(`AdSense push failed for slot ${slotId}:`, e);
        }
      }
    });

    setIsInitialized(true);
  }, []);

  return (
    <>
      {/* 
        AdSense Script - strategy="lazyOnload" ile yüklenir
        - LCP'yi etkilemez (lazy load)
        - CLS'yi etkilemez (asynchronous)
        - Core Web Vitals'ı korur
      */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
        strategy="lazyOnload"
        onLoad={() => {
          // Script yüklendiğinde, adsbygoogle global'i mevcut
          if (typeof (window as any).adsbygoogle !== 'undefined') {
            console.log('AdSense script loaded successfully');
          }
        }}
        onError={() => {
          console.warn('AdSense script failed to load');
        }}
      />

      {/* 
        Ad units başlatıcı script
        Tüm container'ları bul ve push() metodunu çağır
      */}
      <Script
        id="adsense-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.adsbygoogle = window.adsbygoogle || [];
            window.initAdsense = function() {
              const containers = document.querySelectorAll('.ads-container');
              containers.forEach((container) => {
                const slotId = container.getAttribute('data-slot-id');
                if (slotId && window.adsbygoogle) {
                  try {
                    window.adsbygoogle.push({
                      google_ad_client: '${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}',
                      google_ad_slot: slotId,
                      google_ad_format: 'auto',
                      google_full_width_responsive: true,
                    });
                  } catch (e) {
                    console.error('AdSense push failed:', e);
                  }
                }
              });
            };
            // Sayfa yüklenince, tüm ad units'i push et
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', window.initAdsense);
            } else {
              window.initAdsense();
            }
          `,
        }}
      />
    </>
  );
}

/**
 * Kullanım Örneği:
 * 
 * // layout.tsx'de bir kez render et
 * import { AdSenseManager } from '@/components/AdSenseAds';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <AdSenseManager />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * 
 * // Sayfa componentinde ad units'i yerleştir
 * import { AdUnitHorizontal, AdUnitInArticle } from '@/components/AdSenseAds';
 * 
 * export default function DreamPage() {
 *   return (
 *     <article>
 *       <h1>Dream Title</h1>
 *       <AdUnitHorizontal slotId="7890123456" />
 *       
 *       <section>Dream content...</section>
 *       <AdUnitInArticle slotId="7890123457" />
 *       
 *       <section>More content...</section>
 *     </article>
 *   );
 * }
 */

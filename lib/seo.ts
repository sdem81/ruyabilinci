import { Metadata } from "next";

const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ruyabilinci.com";
const SITE_NAME = "Rüya Bilinci";

function normalizeSiteUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const SITE_URL = normalizeSiteUrl(RAW_SITE_URL);

interface SeoParams {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  /** true ise noindex uygulanır (thin/empty content) */
  noindex?: boolean;
}

export function generateSeoMetadata({
  title,
  description,
  path,
  type = "website",
  image,
  noindex = false,
}: SeoParams): Metadata {
  const url = `${SITE_URL}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  const shouldIndex = !noindex;

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      locale: "tr_TR",
      ...(image && {
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateFaqSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema({
  title,
  description,
  url,
  datePublished,
  dateModified,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline: title,
    description,
    url,
    inLanguage: "tr-TR",
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: "Rüya Tabirleri Editör Ekibi",
      url: `${SITE_URL}/hakkinda`,
    },
    reviewedBy: {
      "@type": "Person",
      name: "Dr. Ayşe Demir",
      jobTitle: "Klinik Psikolog",
      description: "12 yıllık klinik deneyim, rüya analizi ve bilinçdışı süreçler konusunda lisansüstü çalışmalar.",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
      sameAs: [
        "https://tr.wikipedia.org/wiki/R%C3%BCya_tabiri",
      ],
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * AI destekli içerik üreticisi (OpenAI GPT-4o-mini).
 * 
 * Kullanmak için:
 *   1. npm install openai
 *   2. .env dosyasına ekle: OPENAI_API_KEY="sk-..."
 *   3. npx ts-node ... --ai modu ile çalıştır
 * 
 * AI olmadan da uygulama tam çalışır; bu modül sadece ek kalite sağlar.
 */

import { generateDreamContent, GeneratedContent } from "./content-generator";
import { slugify } from "../utils/slugify";

let openai: any = null;

async function getOpenAI() {
  if (openai) return openai;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OpenAI } = require("openai");
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai;
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `Sen profesyonel bir Türkçe rüya tabiri içerik yazarısın.
Görevin: Verilen rüya başlığı için SEO uyumlu, özgün, Google AdSense dostu Türkçe içerik üretmek.

KURALLAR:
- İçerik 700-1200 kelime olmalı
- Başlık: H2 ile başla (## )  
- Bölümler: H2 ## ve H3 ### kullan
- Markdown formatı kullan
- Türkçe, doğal ve akıcı dil
- Anahtar kelimeyi başlıkta ve ilk paragrafta kullan
- Gereksiz tekrar yapma
- Spam veya aşırı anahtar kelime doldurma yapma

YAPISI:
1. ## [Başlık] Rüyası Ne Anlama Gelir? (giriş, 2 paragraf)
2. ## Rüya Yorumu: Olumlu ve Olumsuz Anlamlar
   - ### ✅ Olumlu Anlamlar (liste)
   - ### ⚠️ Olumsuz Anlamlar (liste)
3. ## Psikolojik Yorum
   - ### Bilinçaltının Dili (1-2 paragraf)
4. ## Dini Yorum
   - ### İslami Perspektiften [Başlık] (1-2 paragraf)
5. ## Öneriler ve Tavsiyeler (madde listesi)
6. ## Sıkça Sorulan Sorular (3 soru-cevap)
7. ## Benzer Rüya Tabirleri (dahili link listesi)

Her başlık için benzersiz içerik üret. Benzer rüyalar için gerçekçi başlıklar seç.`;

export async function generateContentWithAI(
  title: string,
  useAI: boolean = false
): Promise<GeneratedContent> {
  if (!useAI || !process.env.OPENAI_API_KEY) {
    return generateDreamContent(title);
  }

  const client = await getOpenAI();
  if (!client) {
    console.warn("  OpenAI yüklenemedi, template sistemi kullanılıyor...");
    return generateDreamContent(title);
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Rüya başlığı: "${title}"\n\nBu rüya için içerik üret. Benzer rüyalar için bu başlığa semantik olarak yakın 4 farklı rüya başlığı ekle ve /ruya/[slug] formatında link ver.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const markdown = completion.choices[0]?.message?.content || "";

    if (!markdown || markdown.length < 500) {
      throw new Error("AI yanıtı yetersiz");
    }

    // Extract related slugs from markdown links
    const linkRegex = /\[([^\]]+)\]\(\/ruya\/([^)]+)\)/g;
    const relatedSlugs: string[] = [];
    let match;
    while ((match = linkRegex.exec(markdown)) !== null) {
      relatedSlugs.push(match[2]);
    }

    // Generate meta description from first paragraph
    const firstParagraph = markdown
      .replace(/^#.*\n/gm, "")
      .replace(/\*\*/g, "")
      .split("\n")
      .find((line: string) => line.trim().length > 60) || "";

    const metaDescription =
      firstParagraph.substring(0, 157).trim() +
      (firstParagraph.length > 157 ? "..." : "");

    return {
      markdown,
      metaDescription,
      wordCount: markdown.split(/\s+/).length,
      relatedSlugs,
    };
  } catch (err: any) {
    console.warn(`  ⚠ AI hatası (${err.message}), template kullanılıyor...`);
    return generateDreamContent(title);
  }
}

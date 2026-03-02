import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const charMap: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

function slugify(text: string): string {
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

function extractCategory(title: string): string {
  // Extract the main topic keyword to group into categories
  const lower = title.toLowerCase();

  const categoryMap: [string, string][] = [
    ["abdest", "Abdest"],
    ["namaz", "Namaz"],
    ["araba", "Araç & Taşıt"],
    ["araba", "Araç & Taşıt"],
    ["otomobil", "Araç & Taşıt"],
    ["at ", "Hayvanlar"],
    ["ata ", "Hayvanlar"],
    ["köpek", "Hayvanlar"],
    ["kedi", "Hayvanlar"],
    ["yılan", "Hayvanlar"],
    ["kuş", "Hayvanlar"],
    ["balık", "Hayvanlar"],
    ["böcek", "Hayvanlar"],
    ["arı ", "Hayvanlar"],
    ["karınca", "Hayvanlar"],
    ["fare", "Hayvanlar"],
    ["su ", "Doğa"],
    ["deniz", "Doğa"],
    ["dağ", "Doğa"],
    ["orman", "Doğa"],
    ["yağmur", "Doğa"],
    ["kar ", "Doğa"],
    ["deprem", "Doğa"],
    ["sel ", "Doğa"],
    ["ateş", "Doğa"],
    ["altın", "Değerli Eşyalar"],
    ["para", "Değerli Eşyalar"],
    ["pırlanta", "Değerli Eşyalar"],
    ["yüzük", "Değerli Eşyalar"],
    ["elmas", "Değerli Eşyalar"],
    ["anne", "Aile"],
    ["baba", "Aile"],
    ["kardeş", "Aile"],
    ["çocuk", "Aile"],
    ["bebek", "Aile"],
    ["evlen", "Aile"],
    ["düğün", "Aile"],
    ["ölü", "Ölüm & Kayıp"],
    ["ölmek", "Ölüm & Kayıp"],
    ["cenaze", "Ölüm & Kayıp"],
    ["mezar", "Ölüm & Kayıp"],
    ["kan ", "Sağlık"],
    ["hasta", "Sağlık"],
    ["doktor", "Sağlık"],
    ["diş", "Sağlık"],
    ["ev ", "Ev & Mekan"],
    ["evi ", "Ev & Mekan"],
    ["evin ", "Ev & Mekan"],
    ["kapı", "Ev & Mekan"],
    ["pencere", "Ev & Mekan"],
    ["yemek", "Yiyecek & İçecek"],
    ["ekmek", "Yiyecek & İçecek"],
    ["meyve", "Yiyecek & İçecek"],
    ["süt", "Yiyecek & İçecek"],
    ["uçmak", "Ruhani"],
    ["uçma", "Ruhani"],
    ["melek", "Ruhani"],
    ["cami", "Ruhani"],
    ["kuran", "Ruhani"],
    ["dua", "Ruhani"],
    ["kavga", "İlişkiler"],
    ["sevgili", "İlişkiler"],
    ["aşk", "İlişkiler"],
    ["öpmek", "İlişkiler"],
    ["ağla", "Duygular"],
    ["kork", "Duygular"],
    ["gülmek", "Duygular"],
    ["kaçmak", "Duygular"],
    ["giysi", "Giyim"],
    ["elbise", "Giyim"],
    ["ayakkabı", "Giyim"],
  ];

  for (const [keyword, category] of categoryMap) {
    if (lower.includes(keyword)) {
      return category;
    }
  }

  return "Genel";
}

async function main() {
  console.log("Rüya başlıkları içe aktarılıyor...");

  const data = fs.readFileSync("./tekillestirilmis_basliklar.csv", "utf-8");
  const lines = data.split("\n").slice(1); // başlık satırını atla

  // Collect unique categories first
  const categorySet = new Set<string>();
  const dreamData: { title: string; slug: string; category: string }[] = [];

  for (const line of lines) {
    const baslik = line.split(";")[0].trim(); // sadece ilk sütunu al
    if (!baslik) continue;

    const slug = slugify(baslik);
    const category = extractCategory(baslik);
    categorySet.add(category);
    dreamData.push({ title: baslik, slug, category });
  }

  console.log(`${dreamData.length} rüya başlığı bulundu.`);
  console.log(`${categorySet.size} kategori tespit edildi.`);

  // Create categories first
  const categoryMap = new Map<string, number>();
  const categoryArray = Array.from(categorySet);
  for (let ci = 0; ci < categoryArray.length; ci++) {
    const catName = categoryArray[ci];
    const cat = await prisma.category.upsert({
      where: { slug: slugify(catName) },
      update: {},
      create: {
        name: catName,
        slug: slugify(catName),
        seoText: `${catName} ile ilgili rüya tabirleri ve yorumları. ${catName} kategorisindeki rüyaların anlamlarını keşfedin.`,
      },
    });
    categoryMap.set(catName, cat.id);
  }
  console.log("Kategoriler oluşturuldu.");

  // Batch insert dreams - process in chunks of 100
  const BATCH_SIZE = 100;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < dreamData.length; i += BATCH_SIZE) {
    const batch = dreamData.slice(i, i + BATCH_SIZE);

    for (const dream of batch) {
      const categoryId = categoryMap.get(dream.category);
      if (!categoryId) continue;

      try {
        await prisma.dream.create({
          data: {
            title: dream.title,
            slug: dream.slug,
            content: `${dream.title} ne anlama gelir? ${dream.title} rüyası, rüya tabircilerine göre çeşitli anlamlar taşımaktadır. Bu rüyanın detaylı tabiri ve yorumu için sayfamızı inceleyebilirsiniz.`,
            shortSummary: `${dream.title} rüyasının anlamı ve tabiri.`,
            categoryId,
          },
        });
        inserted++;
      } catch (e: any) {
        if (e.code === "P2002") {
          // Unique constraint violation - slug already exists
          skipped++;
        } else {
          console.error(`Hata: ${dream.title}`, e.message);
        }
      }
    }

    if ((i + BATCH_SIZE) % 5000 < BATCH_SIZE) {
      console.log(
        `İlerleme: ${Math.min(i + BATCH_SIZE, dreamData.length)}/${dreamData.length} (eklenen: ${inserted}, atlanan: ${skipped})`
      );
    }
  }

  console.log(`\nTamamlandı! Eklenen: ${inserted}, Atlanan: ${skipped}`);
}

main()
  .then(() => {
    console.log("Rüyalar başarıyla eklendi!");
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error("Hata oluştu:", e);
    prisma.$disconnect();
    process.exit(1);
  });

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🌙</span>
              <span className="text-lg font-bold text-dream-dark">
                Rüya Bilinci
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              Türkiye&apos;nin en kapsamlı rüya tabirleri sitesi. 45.000+ rüya
              tabiri ve yorumu ile rüyalarınızın anlamını keşfedin.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Hızlı Bağlantılar
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/", label: "Ana Sayfa" },
                { href: "/ara", label: "Rüya Ara" },
                { href: "/kategori/hayvanlar", label: "Hayvanlar" },
                { href: "/kategori/insanlar-ve-iliskiler", label: "İnsanlar" },
                { href: "/kategori/doga-ve-dogal-olaylar", label: "Doğa" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-dream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Kategoriler
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/kategori/duygular-ve-hisler", label: "Duygular" },
                { href: "/kategori/nesneler-ve-esyalar", label: "Nesneler" },
                { href: "/kategori/mekanlar-ve-yerler", label: "Mekanlar" },
                { href: "/kategori/yiyecek-ve-icecekler", label: "Yiyecekler" },
                { href: "/kategori/dini-ve-manevi", label: "Dini & Manevi" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-dream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Kurumsal
            </h3>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/hakkinda", label: "Hakkında" },
                { href: "/iletisim", label: "İletişim" },
                { href: "/gizlilik-politikasi", label: "Gizlilik Politikası" },
                { href: "/kullanim-kosullari", label: "Kullanım Koşulları" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-500 hover:text-dream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Rüya Bilinci. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link href="/gizlilik-politikasi" className="hover:text-dream">
                Gizlilik
              </Link>
              <Link href="/kullanim-kosullari" className="hover:text-dream">
                Koşullar
              </Link>
              <Link href="/iletisim" className="hover:text-dream">
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

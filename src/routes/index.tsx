import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { getFullCategories, getAllProducts, CategoryItem, ProductItem } from "@/lib/catalog";
import { FALLBACK_IMAGE } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Almir Mobilya Dekorasyon — Ölçüye Özel Dolap, Kapı, Parke" },
      {
        name: "description",
        content:
          "Almir Mobilya Dekorasyon: mutfak dolabı, gardırop, kapı ve parke katalogları. Malzeme, ölçü ve fiyat bilgileriyle ölçüye özel üretim.",
      },
      { property: "og:title", content: "Almir Mobilya Dekorasyon" },
      {
        property: "og:description",
        content: "Ölçüye özel mutfak dolabı, gardırop, kapı ve parke katalogları.",
      },
      {
        name: "google-site-verification",
        content: "rO9Hzp6WGoYIPPjIH_Su0EJbkkgoMQSnOgSeir5TLmc",
      },
    ],
  }),
  component: Index,
});

const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    id: "1",
    slug: "dolap",
    name: "Dolaplar",
    description: "Mutfak dolabı, gardırop, banyo dolabı ve kitaplık çözümleri.",
    image_url: "/images/kategori-dolap.jpg",
    slideshow_enabled: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "kapi",
    name: "Kapılar",
    description: "İç mekan, çerçeveli ve masif kapı modelleri.",
    image_url: "/images/kategori-kapi.jpg",
    slideshow_enabled: true,
    sort_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    slug: "parke",
    name: "Parkeler",
    description: "Masif, lamine ve balık sırtı parke uygulamaları.",
    image_url: "/images/kategori-parke.jpg",
    slideshow_enabled: true,
    sort_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

type SlideFrame = {
  src: string;
  duration: number; // 5000 (kategori) veya 3000 (ürün)
  type: "category" | "product";
  title: string;
};

function CategoryCard({ cat, allProducts }: { cat: CategoryItem; allProducts: ProductItem[] }) {
  // Bu kategoriye ait alt kategorilerin id'leri
  const subIds = useMemo(() => new Set((cat.subcategories || []).map((s) => s.id)), [cat.subcategories]);

  // Bu kategoriye ait görselli ürünler (en yeniden en eskiye sıralı)
  const catProducts = useMemo(() => {
    return allProducts
      .filter((p) => subIds.has(p.subcategory_id) && Boolean(p.image_url))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allProducts, subIds]);

  // Slayt kareleri dizisi:
  // 5 sn ana kategori fotosu -> 3 sn 1. ürün fotosu -> 5 sn kategori fotosu -> 3 sn 2. ürün fotosu... (1a1s1d1f döngüsü)
  const frames = useMemo<SlideFrame[]>(() => {
    const catSrc = cat.image_url || FALLBACK_IMAGE;

    // Slayt kapalıysa veya kategoriye ait ürün görseli yoksa yalnızca kategori fotosu
    if (!cat.slideshow_enabled || catProducts.length === 0) {
      return [{ src: catSrc, duration: 5000, type: "category", title: cat.name }];
    }

    const list: SlideFrame[] = [];
    for (const prod of catProducts) {
      // 5 saniye ana kategori fotosu
      list.push({ src: catSrc, duration: 5000, type: "category", title: cat.name });
      // 3 saniye ürün fotosu
      if (prod.image_url) {
        list.push({ src: prod.image_url, duration: 3000, type: "product", title: prod.name });
      }
    }
    return list;
  }, [cat, catProducts]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Otomatik slayt zamanlayıcısı
  useEffect(() => {
    if (frames.length <= 1) return;
    const currentFrame = frames[currentIndex % frames.length];
    if (!currentFrame) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % frames.length);
    }, currentFrame.duration);

    return () => clearTimeout(timer);
  }, [currentIndex, frames]);

  const activeIndex = frames.length > 0 ? currentIndex % frames.length : 0;
  const activeFrame = frames[activeIndex] || frames[0] || {
    type: "category" as const,
    title: cat.name,
    src: cat.image_url || FALLBACK_IMAGE,
    duration: 5000,
  };

  return (
    <Link
      to="/kategori/$category"
      params={{ category: cat.slug }}
      className="group panel overflow-hidden p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative block"
    >
      {/* Görsel Alanı ve Pürüzsüz Animasyonlu Geçiş */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-secondary/40">
        {frames.map((frame, idx) => {
          const isActive = idx === activeIndex;
          return (
            <img
              key={idx}
              src={frame.src}
              alt={`${cat.name} ${frame.title}`}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${
                isActive
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 z-0 pointer-events-none"
              }`}
            />
          );
        })}

        {/* Slayt Açıkken ve ürün gösterilirken veya slayt akarken şık gösterge etiketi */}
        {cat.slideshow_enabled && frames.length > 1 && (
          <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-md transition-all">
            <span
              className={`size-1.5 rounded-full transition-colors ${
                activeFrame?.type === "product" ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span className="truncate max-w-[190px]">
              {activeFrame?.type === "product" ? `Ürün: ${activeFrame.title}` : cat.name}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-2 pb-1 pt-4">
        <div>
          <p className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {cat.name}
          </p>
          <p className="line-clamp-1 text-sm text-muted-foreground">{cat.description}</p>
        </div>
        <span className="grid size-9 place-items-center rounded-full bg-secondary text-lg text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          →
        </span>
      </div>
    </Link>
  );
}

function Index() {
  const { data: categories = DEFAULT_CATEGORIES } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const data = await getFullCategories();
        if (!data || data.length === 0) return DEFAULT_CATEGORIES;
        return data;
      } catch {
        return DEFAULT_CATEGORIES;
      }
    },
    initialData: DEFAULT_CATEGORIES,
  });

  // Tüm ürünleri çekerek kategori kartlarındaki slayta gönderiyoruz
  const { data: allProducts = [] } = useQuery({
    queryKey: ["all-products-for-home"],
    queryFn: async () => {
      try {
        const prods = await getAllProducts();
        return prods || [];
      } catch {
        return [];
      }
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-5">
      <section className="grid items-center gap-10 py-14 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="label-eyebrow">Almir Mobilya Dekorasyon</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl">
            Ölçüye özel mobilya,
            <br />
            atölyeden evinize.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Dolaptan parkeye, kapıdan gardıroba. Kataloglarımızda her ürünün malzemesi, ölçüsü ve
            fiyatı açık yazar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/kategori/$category"
              params={{ category: "dolap" }}
              className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-ink-foreground"
            >
              Katalogları keşfet
            </Link>
            <Link
              to="/mesajlar"
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              Soru sor
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border shadow-panel">
          <img
            src="/images/hero-mutfak.jpg"
            alt="Almir Mobilya ölçüye özel meşe mutfak dolabı uygulaması"
            width={1600}
            height={1104}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="pb-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl tracking-tight">Kategoriler</h2>
          <span className="text-sm text-muted-foreground">
            {categories?.length ?? 0} ana kategori
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {categories?.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} allProducts={allProducts} />
          ))}
        </div>
      </section>
    </div>
  );
}
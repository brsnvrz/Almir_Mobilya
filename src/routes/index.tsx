import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getFullCategories } from "@/lib/catalog";
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
    ],
  }),
  component: Index,
});

const DEFAULT_CATEGORIES = [
  {
    id: "1",
    slug: "dolap",
    name: "Dolaplar",
    description: "Mutfak dolabı, gardırop, banyo dolabı ve kitaplık çözümleri.",
    image_url: "/images/kategori-dolap.jpg",
  },
  {
    id: "2",
    slug: "kapi",
    name: "Kapılar",
    description: "İç mekan, çerçeveli ve masif kapı modelleri.",
    image_url: "/images/kategori-kapi.jpg",
  },
  {
    id: "3",
    slug: "parke",
    name: "Parkeler",
    description: "Masif, lamine ve balık sırtı parke uygulamaları.",
    image_url: "/images/kategori-parke.jpg",
  },
];

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
            <Link
              key={cat.id}
              to="/kategori/$category"
              params={{ category: cat.slug }}
              className="group panel overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1"
            >
              <img
                src={cat.image_url || FALLBACK_IMAGE}
                alt={`${cat.name} kategorisi`}
                width={1200}
                height={900}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <div className="flex items-center justify-between px-2 pb-1 pt-4">
                <div>
                  <p className="font-display text-xl font-semibold">{cat.name}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{cat.description}</p>
                </div>
                <span className="grid size-9 place-items-center rounded-full bg-secondary text-lg">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

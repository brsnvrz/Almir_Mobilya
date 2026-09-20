import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getFullCategories, getAllProducts } from "@/lib/catalog";
import { FALLBACK_IMAGE, formatPrice } from "@/lib/format";
import { ArrowLeft, Sparkles } from "lucide-react";

export const Route = createFileRoute("/katalog/$category/$subcategory")({
  head: ({ params }) => {
    const title = `${params.subcategory} Kataloğu — Almir Mobilya`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: "Malzeme, ölçü ve fiyat bilgileriyle Almir Mobilya ürün kataloğu.",
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Malzeme, ölçü ve fiyat bilgileriyle Almir Mobilya ürün kataloğu.",
        },
      ],
    };
  },
  component: CatalogPage,
});

function CatalogPage() {
  const { category, subcategory } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["catalog", category, subcategory],
    queryFn: async () => {
      const allCats = await getFullCategories();
      const cat = allCats.find((c) => c.slug === category);
      if (!cat) return null;

      const allSubs = cat.subcategories || [];
      const sub = allSubs.find((s) => s.slug === subcategory);
      if (!sub) return null;

      const allProds = await getAllProducts();
      const products = allProds.filter((p) => p.subcategory_id === sub.id);

      return { cat, sub, allSubs, products };
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="h-6 w-32 animate-pulse rounded bg-secondary" />
        <div className="mt-4 h-10 w-72 animate-pulse rounded bg-secondary" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Katalog Bulunamadı</h1>
        <p className="mt-3 text-muted-foreground">
          Aradığınız katalog bulunamadı veya taşınmış olabilir.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    );
  }

  const { cat, sub, allSubs, products } = data;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      {/* Ekmek kırıntısı */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <span>/</span>
        <Link to="/kategori/$category" params={{ category: cat.slug }} className="hover:text-foreground">
          {cat.name}
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{sub.name}</span>
      </nav>

      {/* Başlık Alanı */}
      <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link
            to="/kategori/$category"
            params={{ category: cat.slug }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            <span>{cat.name} Tüm Kategorisi</span>
          </Link>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {sub.name}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            {sub.description || "Almir Mobilya güvencesiyle ölçüye özel üretim modeller."}
          </p>
        </div>
        <div className="rounded-full border border-border bg-secondary px-3.5 py-1.5 text-xs font-medium text-foreground">
          {products.length} Ürün Listeleniyor
        </div>
      </div>

      {/* Kardeş Alt Kategoriler Hızlı Geçiş Sekmeleri */}
      {allSubs.length > 1 && (
        <div className="mt-8 flex flex-wrap items-center gap-2 border-y border-border py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">
            Diğer Gruplar:
          </span>
          <Link
            to="/kategori/$category"
            params={{ category: cat.slug }}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Tüm {cat.name}
          </Link>
          {allSubs.map((s) => (
            <Link
              key={s.id}
              to="/katalog/$category/$subcategory"
              params={{ category: cat.slug, subcategory: s.slug }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                s.slug === sub.slug
                  ? "bg-ink text-ink-foreground shadow-sm ring-2 ring-primary/20"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      {/* Ürün Listesi Grid */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            to="/urun/$productId"
            params={{ productId: product.id }}
            className="group panel overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1.5"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary">
              <img
                src={product.image_url || sub.image_url || FALLBACK_IMAGE}
                alt={product.name}
                width={900}
                height={900}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-sm">
                {sub.name}
              </span>
            </div>

            <div className="px-2 pt-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                  {product.name}
                </h2>
                <p className="whitespace-nowrap font-display text-lg font-bold text-primary">
                  {formatPrice(product.price ? Number(product.price) : null, product.currency)}
                </p>
              </div>

              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {product.summary || product.description}
              </p>

              {/* Malzeme Etiketleri */}
              {Array.isArray(product.materials) && product.materials.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.materials.map((m: string) => (
                    <span
                      key={m}
                      className="rounded-md border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <div className="my-16 rounded-2xl border border-dashed border-border py-16 text-center">
          <Sparkles className="mx-auto size-8 text-muted-foreground/60" />
          <p className="mt-3 text-base font-medium">Bu alt kategoride henüz ürün bulunmuyor.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Yeni modeller atölyemizde hazırlanmaktadır.
          </p>
        </div>
      )}
    </div>
  );
}

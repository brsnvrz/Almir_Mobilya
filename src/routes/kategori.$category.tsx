import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getCategoryPageData } from "@/lib/catalog";
import { FALLBACK_IMAGE, formatPrice } from "@/lib/format";
import { Layers, ArrowRight, Sparkles, Filter } from "lucide-react";

export const Route = createFileRoute("/kategori/$category")({
  head: ({ params }) => {
    const title = `${params.category.charAt(0).toUpperCase() + params.category.slice(1)} Kataloğu — Almir Mobilya`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: "Almir Mobilya ölçüye özel üretim kategorisindeki alt gruplar, modeller ve şık ürün katalogları.",
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: "Ölçüye özel mobilya ve ahşap dekorasyon katalogları.",
        },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useParams();
  const [activeSubId, setActiveSubId] = useState<string>("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category-page", category],
    queryFn: async () => {
      const result = await getCategoryPageData(category);
      if (!result) return null;
      return result;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="h-8 w-48 animate-pulse rounded-md bg-secondary" />
        <div className="mt-4 h-12 w-96 animate-pulse rounded-md bg-secondary" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Kategori Bulunamadı</h1>
        <p className="mt-3 text-muted-foreground">
          Aradığınız "{category}" kategorisi mevcut değil veya kaldırılmış olabilir.
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

  const { cat, subs, products } = data;

  // Filtrelenmiş ürün listesi
  const filteredProducts =
    activeSubId === "all"
      ? products
      : products.filter((p) => p.subcategory_id === activeSubId);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      {/* Ekmek kırıntısı (Breadcrumbs) */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{cat.name}</span>
      </nav>

      {/* Başlık ve Kategori Açıklaması */}
      <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="label-eyebrow">Almir Mobilya Kataloğu</span>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {cat.name}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            {cat.description || "Ölçüye özel tasarım ve kaliteli üretim seçenekleri."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="rounded-full border border-border bg-secondary px-3 py-1 font-medium text-foreground">
            {subs.length} Alt Kategori
          </span>
          <span className="rounded-full border border-border bg-secondary px-3 py-1 font-medium text-foreground">
            {products.length} Ürün
          </span>
        </div>
      </div>

      {/* Alt Kategoriler Kart Görünümü */}
      {subs.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold flex items-center gap-2">
              <Layers className="size-5 text-primary" />
              <span>Alt Kategoriler</span>
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subs.map((sub) => {
              const count = products.filter((p) => p.subcategory_id === sub.id).length;
              return (
                <Link
                  key={sub.id}
                  to="/katalog/$category/$subcategory"
                  params={{ category: cat.slug, subcategory: sub.slug }}
                  className="group panel relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                        {sub.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {sub.description || "Özel ölçü ve malzeme seçenekleri"}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary shrink-0" />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span>{count} Model</span>
                    <span className="font-medium text-primary group-hover:underline">Kataloğu Aç →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Alt Kategorilere Göre Filtrelenen Şık Katalog Görünümü */}
      <section className="mt-14 border-t border-border pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <span>Ürün Kataloğu</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              İncelemek istediğiniz alt kategoriye tıklayarak ürünleri anında filtreleyin.
            </p>
          </div>
        </div>

        {/* Dinamik Alt Kategori Filtre Sekmeleri (Filter Tabs / Pills) */}
        {subs.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-border pb-4">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Filter className="size-3.5" />
              Filtrele:
            </span>
            <button
              onClick={() => setActiveSubId("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeSubId === "all"
                  ? "bg-ink text-ink-foreground shadow-sm ring-2 ring-primary/20"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              Tümü ({products.length})
            </button>
            {subs.map((sub) => {
              const count = products.filter((p) => p.subcategory_id === sub.id).length;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubId(sub.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    activeSubId === sub.id
                      ? "bg-ink text-ink-foreground shadow-sm ring-2 ring-primary/20"
                      : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {sub.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Ürün Listesi Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to="/urun/$productId"
              params={{ productId: product.id }}
              className="group panel overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-secondary">
                <img
                  src={product.image_url || FALLBACK_IMAGE}
                  alt={product.name}
                  width={900}
                  height={900}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.subcategories?.name && (
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-sm">
                    {product.subcategories.name}
                  </span>
                )}
              </div>

              <div className="px-2 pt-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
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
                    {product.materials.slice(0, 3).map((m: string) => (
                      <span
                        key={m}
                        className="rounded-md border border-border bg-secondary/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                      >
                        {m}
                      </span>
                    ))}
                    {product.materials.length > 3 && (
                      <span className="text-[11px] text-muted-foreground">
                        +{product.materials.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="my-16 rounded-2xl border border-dashed border-border py-12 text-center">
            <p className="text-base text-muted-foreground">
              Bu kategoride henüz gösterilecek ürün bulunmuyor.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
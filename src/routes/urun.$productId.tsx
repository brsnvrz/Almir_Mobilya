import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_IMAGE, formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { notifyAdminsOnNewQuestion } from "@/lib/notifications";
import { insertMessage } from "@/lib/messages";
import { AuthModal } from "@/components/AuthModal";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Ruler,
  ShieldCheck,
  Truck,
  Factory,
} from "lucide-react";

export const Route = createFileRoute("/urun/$productId")({
  head: () => ({
    meta: [
      { title: "Ürün Detayı — Almir Mobilya" },
      {
        name: "description",
        content: "Malzeme, ölçü, garanti ve fiyat bilgileriyle Almir Mobilya ürün detayı.",
      },
      { property: "og:title", content: "Ürün Detayı — Almir Mobilya" },
      {
        property: "og:description",
        content: "Malzeme, ölçü, garanti ve fiyat bilgileriyle Almir Mobilya ürün detayı.",
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { productId } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Soru sorma form alanları
  const [questionBody, setQuestionBody] = useState("");
  const [questionSent, setQuestionSent] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data: product, error } = await supabase
        .from("products")
        .select("*, subcategories(*, categories(*))")
        .eq("id", productId)
        .maybeSingle();
      if (error) throw error;
      return product;
    },
  });

  const sendQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Giriş yapmanız gerekmektedir.");
      if (!data) throw new Error("Ürün bulunamadı.");

      const subjectText = `${data.name} hakkında soru`;

      const inserted = await insertMessage({
        user_id: user.id,
        user_email: user.email ?? null,
        user_name: (user.user_metadata?.["full_name"] as string | undefined) ?? null,
        subject: subjectText,
        body: questionBody.trim(),
        product_id: data.id,
        product: {
          id: data.id,
          name: data.name,
          image_url: data.image_url ?? null,
          price: data.price ?? null,
          currency: data.currency ?? "TRY",
        },
      });

      // E-posta bildirim altyapısını tetikle
      void notifyAdminsOnNewQuestion({
        messageId: inserted.id,
        subject: subjectText,
        body: questionBody.trim(),
        userEmail: user.email ?? null,
        userName: (user.user_metadata?.["full_name"] as string | undefined) ?? null,
        productId: data.id,
        productName: data.name,
      });

      return inserted;
    },
    onSuccess: () => {
      setQuestionBody("");
      setQuestionSent(true);
      toast.success("Sorunuz Almir Mobilya ekibine iletildi!", {
        description: "Yanıt geldiğinde Sohbet sayfasından takip edebilirsiniz.",
      });
      void queryClient.invalidateQueries({ queryKey: ["my-messages"] });
    },
    onError: (err: any) => {
      toast.error("Soru gönderilemedi: " + (err.message || "Lütfen tekrar deneyin."));
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20">
        <div className="h-6 w-48 animate-pulse rounded bg-secondary" />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-secondary" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 animate-pulse rounded bg-secondary" />
            <div className="h-20 animate-pulse rounded bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Ürün Bulunamadı</h1>
        <p className="mt-3 text-muted-foreground">
          Aradığınız ürün mevcut değil veya kaldırılmış olabilir.
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

  const sub = data.subcategories;
  const cat = sub?.categories;
  const extras = (data.extra_specs ?? {}) as Record<string, string>;

  // Çoklu görseller listesi: Ana görsel + galeri görselleri
  const rawImages = [data.image_url, ...(Array.isArray(data.gallery) ? data.gallery : [])];
  const images = Array.from(new Set(rawImages.filter((img): img is string => Boolean(img && img.trim()))));
  if (images.length === 0) {
    images.push(sub?.image_url || FALLBACK_IMAGE);
  }

  const currentImage = images[activeImageIdx] || images[0];

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      {/* Ekmek kırıntısı */}
      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <span>/</span>
        {cat && (
          <>
            <Link to="/kategori/$category" params={{ category: cat.slug }} className="hover:text-foreground">
              {cat.name}
            </Link>
            <span>/</span>
          </>
        )}
        {cat && sub && (
          <>
            <Link
              to="/katalog/$category/$subcategory"
              params={{ category: cat.slug, subcategory: sub.slug }}
              className="hover:text-foreground"
            >
              {sub.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="font-medium text-foreground">{data.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        {/* SOL: Çoklu Görsel Galerisi */}
        <div>
          <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-panel">
            <img
              src={currentImage}
              alt={`${data.name} - Görsel ${activeImageIdx + 1}`}
              width={1400}
              height={1750}
              className="h-full w-full object-cover transition-all duration-300"
            />

            {/* Büyütme Butonu */}
            <button
              onClick={() => setZoomOpen(true)}
              className="absolute right-4 top-4 rounded-full bg-background/85 p-2.5 text-foreground backdrop-blur-md transition-transform hover:scale-105 shadow-md"
              title="Tam boyutta incele"
            >
              <Maximize2 className="size-4" />
            </button>

            {/* Galeri Okları (Birden fazla görsel varsa) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background shadow-md"
                  aria-label="Önceki görsel"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100 hover:bg-background shadow-md"
                  aria-label="Sonraki görsel"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}

            {/* Görsel Sayacı */}
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {activeImageIdx + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Küçük Resimler (Thumbnails) */}
          {images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    idx === activeImageIdx
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${data.name} thumbnail ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ: Ürün Bilgileri ve Fiyat */}
        <div>
          {sub && (
            <span className="inline-block rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold text-foreground">
              {sub.name}
            </span>
          )}

          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {data.name}
          </h1>

          {/* Fiyat */}
          <div className="mt-4 flex items-baseline gap-3">
            <p className="font-display text-3xl font-bold text-primary sm:text-4xl">
              {formatPrice(data.price ? Number(data.price) : null, data.currency)}
            </p>
            {data.price && (
              <span className="text-xs text-muted-foreground">KDV Dahil / Özel Ölçü Baz Fiyat</span>
            )}
          </div>

          {/* Açıklama */}
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            {data.description || data.summary || "Özel ölçüye ve mekanınıza uygun olarak üretilmektedir."}
          </p>

          {/* Malzeme Bilgileri */}
          {Array.isArray(data.materials) && data.materials.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                <span>Kullanılan Malzemeler</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.materials.map((m: string) => (
                  <span
                    key={m}
                    className="rounded-lg border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Standart Ölçüler Tablosu */}
          <div className="mt-6 border-t border-border pt-5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Ruler className="size-3.5 text-primary" />
              <span>Standart Ölçüler</span>
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-border bg-card p-3">
                <span className="block text-xs text-muted-foreground">Genişlik</span>
                <span className="font-display text-base font-semibold">
                  {data.width_cm ? `${data.width_cm} cm` : "Özel"}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <span className="block text-xs text-muted-foreground">Yükseklik</span>
                <span className="font-display text-base font-semibold">
                  {data.height_cm ? `${data.height_cm} cm` : "Özel"}
                </span>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <span className="block text-xs text-muted-foreground">Derinlik</span>
                <span className="font-display text-base font-semibold">
                  {data.depth_cm ? `${data.depth_cm} cm` : "Özel"}
                </span>
              </div>
            </div>
          </div>

          {/* 'Daha Fazla' Butonu ve Teknik Detaylar Akordiyonu */}
          <div className="mt-6">
            <button
              onClick={() => setShowMore((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              <span>{showMore ? "Daha Az Teknik Detay" : "Daha Fazla Bilgi ve Teknik Detaylar"}</span>
              {showMore ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>

            {showMore && (
              <div className="panel mt-3 divide-y divide-border p-4 text-sm animate-in fade-in-50 duration-200">
                <DetailRow
                  icon={<ShieldCheck className="size-4 text-primary" />}
                  label="Garanti Süresi"
                  value={data.warranty}
                />
                <DetailRow
                  icon={<Truck className="size-4 text-primary" />}
                  label="Teslimat Süresi"
                  value={data.delivery_time}
                />
                <DetailRow
                  icon={<Factory className="size-4 text-primary" />}
                  label="Üretim Yeri"
                  value={data.production_place}
                />
                <DetailRow label="Ağırlık" value={data.weight} />
                {Object.entries(extras).map(([k, v]) => (
                  <DetailRow key={k} label={k} value={String(v)} />
                ))}
              </div>
            )}
          </div>

          {/* Ürün Detayında Doğrudan Soru Sorma / Teklif Modülü */}
          <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5 text-primary" />
              <h2 className="font-display text-lg font-semibold text-foreground">
                Bu Ürün Hakkında Soru Sorun
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Ölçü değişikliği, renk kartelası veya özel fiyat taleplerinizi doğrudan atölyemize iletin.
            </p>

            {user ? (
              <div className="mt-4 space-y-3">
                {questionSent ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-foreground">
                    <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-4" />
                      <span>Sorunuz başarıyla iletildi!</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Yöneticimiz yanıtladığında Sohbet sayfasından konuşmayı takip edebilirsiniz.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/mesajlar"
                        className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                      >
                        Sohbete Git
                      </Link>
                      <button
                        onClick={() => setQuestionSent(false)}
                        className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium"
                      >
                        Yeni Soru Yaz
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={questionBody}
                      onChange={(e) => setQuestionBody(e.target.value)}
                      rows={3}
                      placeholder={`${data.name} için aklınıza takılan soruyu, oda ölçülerinizi veya talebinizi yazın…`}
                      className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {user.email} olarak gönderiliyor
                      </span>
                      <button
                        onClick={() => sendQuestionMutation.mutate()}
                        disabled={!questionBody.trim() || sendQuestionMutation.isPending}
                        className="rounded-full bg-ink px-5 py-2 text-xs font-semibold text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {sendQuestionMutation.isPending ? "İletiliyor…" : "Soruyu İlet"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-border bg-background p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Sorunuzu iletebilmek ve yöneticimizin yanıtını takip edebilmek için Google ile giriş yapmanız gerekmektedir.
                </p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                  <span>Giriş Yap ve Soru Sor</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox / Görsel Büyütme Modalı */}
      {zoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setZoomOpen(false)}
        >
          <button
            onClick={() => setZoomOpen(false)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/25"
            aria-label="Kapat"
          >
            <X className="size-6" />
          </button>
          <img
            src={currentImage}
            alt={data.name}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Giriş Modalı */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2.5 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

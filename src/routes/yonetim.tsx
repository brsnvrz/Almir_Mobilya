import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  getMessages,
  getMessageReplies,
  insertMessageReply,
  updateMessageStatus,
} from "@/lib/messages";
import {
  getFullCategories,
  createCategory,
  removeCategory,
  createSubcategory,
  removeSubcategory,
  getAllProducts,
  saveProduct,
  removeProduct,
} from "@/lib/catalog";
import { formatPrice, FALLBACK_IMAGE } from "@/lib/format";
import { toast } from "sonner";
import {
  Shield,
  Layers,
  FolderTree,
  Package,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  Image as ImageIcon,
  Sliders,
  X,
  Loader2,
  Upload,
  UploadCloud,
  Star,
  FileText,
  Download,
  Play,
  Pause,
  Search,
  Save,
} from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import { processImageFile, processMultipleImageFiles } from "@/lib/image-upload";
import { getPdfDocumentFn, savePdfDocumentFn } from "@/lib/server-documents";

export const Route = createFileRoute("/yonetim")({
  validateSearch: (search: Record<string, unknown>) => ({
    edit: typeof search.edit === "string" ? search.edit : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Yönetim Paneli — Almir Mobilya" },
      { name: "description", content: "Almir Mobilya katalog, ürün ve mesaj yönetimi." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Yönetim Paneli — Almir Mobilya" },
      { property: "og:description", content: "Almir Mobilya katalog, ürün ve mesaj yönetimi." },
    ],
  }),
  component: AdminPage,
});

type Tab = "urunler" | "kategoriler" | "mesajlar";

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { edit: editProductId } = Route.useSearch();
  const [tab, setTab] = useState<Tab>("urunler");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const doc = await getPdfDocumentFn({ data: "yenilikler_pdf" });
      if (!doc || !doc.data) {
        toast.info("Henüz bir yenilikler PDF'i yüklenmedi. Yüklemek için dosya seçiniz.");
        document.getElementById("changelog-pdf-upload")?.click();
        return;
      }
      const link = document.createElement("a");
      link.href = doc.data;
      link.download = doc.filename || "Almir_Mobilya_Yenilikler.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Yenilikler PDF'i indirildi.");
    } catch (err: any) {
      toast.error("PDF indirilemedi: " + (err?.message || "Hata"));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Lütfen bir PDF dosyası seçiniz.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Dosya boyutu 20 MB'dan küçük olmalıdır.");
      return;
    }

    setIsUploadingPdf(true);
    try {
      toast.info("PDF yükleniyor...");
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          await savePdfDocumentFn({
            data: {
              key: "yenilikler_pdf",
              filename: file.name,
              data: base64Data,
            },
          });
          toast.success("Yenilikler PDF'i başarıyla kaydedildi.");
        } catch (err: any) {
          toast.error("Kayıt başarısız: " + (err?.message || "Hata"));
        } finally {
          setIsUploadingPdf(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error("Dosya okunamadı: " + (err?.message || "Hata"));
      setIsUploadingPdf(false);
    } finally {
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-24 text-center text-muted-foreground">
        <p className="animate-pulse text-base">Yetki kontrol ediliyor…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Shield className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Yönetici Girişi</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Almir Mobilya yönetim paneline erişmek için yetkili hesabınızla giriş yapınız.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="mt-6 rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-105"
        >
          Giriş Yap
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <Shield className="size-6" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight">Erişim Yetkisi Yok</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          <strong>{user.email}</strong> hesabının yönetim paneline erişim yetkisi bulunmamaktadır.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      {/* Üst Başlık ve Bilgi */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="label-eyebrow">Almir Mobilya</span>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Admin
            </span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Yönetim Paneli
          </h1>
          <p className="text-xs text-muted-foreground">
            Oturum açan: <span className="font-medium text-foreground">{user.email}</span>
          </p>
        </div>

        {/* ORTA: Yenilikleri Gör Butonu */}
        <div className="flex items-center self-start sm:self-center">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs active:scale-95"
            title="Yüklü olan yenilikler PDF belgesini indir"
          >
            {isDownloadingPdf ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FileText className="size-4" />
            )}
            <span>{isDownloadingPdf ? "İndiriliyor..." : "Yenilikleri Gör"}</span>
          </button>
        </div>

        {/* SAĞ: Sekme Butonları ve Göz Önünde Olmayan PDF Yükleme Butonu */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Çok göz önünde durmayan, sade ve şık PDF Yükleme Butonu */}
          <input
            type="file"
            accept="application/pdf"
            id="changelog-pdf-upload"
            className="hidden"
            disabled={isUploadingPdf}
            onChange={handleUploadPdf}
          />
          <label
            htmlFor="changelog-pdf-upload"
            title="Yenilikler PDF'i Yükle veya Güncelle"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/40 px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer transition-all shadow-2xs mr-1"
          >
            {isUploadingPdf ? (
              <Loader2 className="size-3 animate-spin text-primary" />
            ) : (
              <UploadCloud className="size-3" />
            )}
            <span>{isUploadingPdf ? "Yükleniyor..." : "PDF Belgesi Yükle"}</span>
          </label>
          {(
            [
              ["urunler", "Ürünler", Package],
              ["kategoriler", "Kategori & Alt Kategori", FolderTree],
              ["mesajlar", "Gelen Mesajlar", MessageSquare],
            ] as const
          ).map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                tab === value
                  ? "bg-ink text-ink-foreground shadow"
                  : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sekme İçerikleri */}
      <div className="mt-8">
        {tab === "urunler" && <ProductsAdminSection editProductId={editProductId} />}
        {tab === "kategoriler" && <CategoriesAdminSection />}
        {tab === "mesajlar" && <MessagesAdminSection />}
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 1. ÜRÜNLER YÖNETİMİ (TAM CRUD + ÇOKLU GÖRSEL GALERİSİ + EXTRA SPECS)     */
/* ========================================================================= */

type ProductFormData = {
  id?: string;
  subcategory_id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  materials: string; // virgülle ayrılmış
  width_cm: string;
  height_cm: string;
  depth_cm: string;
  weight: string;
  warranty: string;
  delivery_time: string;
  production_place: string;
  price: string;
  currency: string;
  image_url: string;
  gallery: string[]; // Çoklu görsel galerisi
  extra_specs: Record<string, string>; // Teknik ekstra özellikler
};

const emptyProductForm: ProductFormData = {
  subcategory_id: "",
  name: "",
  slug: "",
  summary: "",
  description: "",
  materials: "",
  width_cm: "",
  height_cm: "",
  depth_cm: "",
  weight: "",
  warranty: "",
  delivery_time: "",
  production_place: "",
  price: "",
  currency: "TRY",
  image_url: "",
  gallery: [],
  extra_specs: {},
};

function ProductsAdminSection({ editProductId }: { editProductId?: string }) {
  const queryClient = useQueryClient();
  const [selectedSubId, setSelectedSubId] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [autoOpenDone, setAutoOpenDone] = useState(false);

  // Kategoriler ve Alt Kategorileri Çek
  const { data: categories } = useQuery({
    queryKey: ["admin-categories-all"],
    queryFn: async () => {
      return getFullCategories();
    },
  });

  // Tüm Ürünleri Çek
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: async () => {
      return getAllProducts();
    },
  });

  const saveProductMutation = useMutation({
    mutationFn: async (payload: ProductFormData) => {
      if (!payload.name.trim()) throw new Error("Ürün adı zorunludur.");
      if (!payload.subcategory_id) throw new Error("Lütfen bir alt kategori seçin.");

      const slug = payload.slug.trim() || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const row = {
        subcategory_id: payload.subcategory_id,
        name: payload.name.trim(),
        slug,
        summary: payload.summary.trim() || null,
        description: payload.description.trim() || null,
        materials: payload.materials
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean),
        width_cm: payload.width_cm.trim() || null,
        height_cm: payload.height_cm.trim() || null,
        depth_cm: payload.depth_cm.trim() || null,
        weight: payload.weight.trim() || null,
        warranty: payload.warranty.trim() || null,
        delivery_time: payload.delivery_time.trim() || null,
        production_place: payload.production_place.trim() || null,
        price: payload.price ? Number(payload.price) : null,
        currency: payload.currency || "TRY",
        image_url: payload.image_url.trim() || null,
        gallery: payload.gallery.filter((g) => Boolean(g && g.trim())),
        extra_specs: payload.extra_specs || {},
      };

      await saveProduct(row, payload.id);
    },
    onSuccess: () => {
      toast.success("Ürün başarıyla kaydedildi!");
      setIsFormOpen(false);
      setEditingProduct(null);
      void queryClient.invalidateQueries({ queryKey: ["admin-products-all"] });
      void queryClient.invalidateQueries({ queryKey: ["category-page"] });
      void queryClient.invalidateQueries({ queryKey: ["catalog"] });
      void queryClient.invalidateQueries({ queryKey: ["product"] });
    },
    onError: (err: any) => {
      toast.error("Hata: " + (err.message || "Kaydedilemedi."));
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
      await removeProduct(id);
    },
    onSuccess: () => {
      toast.success("Ürün silindi.");
      void queryClient.invalidateQueries({ queryKey: ["admin-products-all"] });
    },
  });

  // Filtreleme
  const allSubcategories = (categories || []).flatMap((c) => c.subcategories || []);
  const filteredProducts = (products || []).filter((p) => {
    const matchSub = selectedSubId === "all" || p.subcategory_id === selectedSubId;
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  // URL'de ?edit=<id> varsa ürün listesi gelince otomatik düzenleme formunu aç
  useEffect(() => {
    if (!editProductId || autoOpenDone || !products) return;
    const p = products.find((x) => x.id === editProductId);
    if (!p) return;
    setEditingProduct({
      id: p.id,
      subcategory_id: p.subcategory_id,
      name: p.name,
      slug: p.slug,
      summary: p.summary || "",
      description: p.description || "",
      materials: Array.isArray(p.materials) ? p.materials.join(", ") : "",
      width_cm: p.width_cm || "",
      height_cm: p.height_cm || "",
      depth_cm: p.depth_cm || "",
      weight: p.weight || "",
      warranty: p.warranty || "",
      delivery_time: p.delivery_time || "",
      production_place: p.production_place || "",
      price: p.price ? String(p.price) : "",
      currency: p.currency || "TRY",
      image_url: p.image_url || "",
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      extra_specs: (p.extra_specs as Record<string, string>) || {},
    });
    setIsFormOpen(true);
    setAutoOpenDone(true);
  }, [editProductId, products, autoOpenDone]);

  return (
    <div>
      {/* Üst Buton ve Filtre Çubuğu */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün adı ile ara…"
            className="w-64 rounded-full border border-input bg-background px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="rounded-full border border-input bg-background px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tüm Alt Kategoriler ({products?.length ?? 0})</option>
            {allSubcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setEditingProduct({ ...emptyProductForm, subcategory_id: allSubcategories[0]?.id || "" });
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow transition-transform hover:scale-105"
        >
          <Plus className="size-4" />
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      {/* Ürün Listesi Tablosu */}
      <div className="panel mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/50 text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="p-3">Görsel</th>
                <th className="p-3">Ürün Adı</th>
                <th className="p-3">Alt Kategori</th>
                <th className="p-3">Fiyat</th>
                <th className="p-3">Galeri</th>
                <th className="p-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-3">
                    <img
                      src={p.image_url || FALLBACK_IMAGE}
                      alt={p.name}
                      className="size-12 rounded-lg object-cover border border-border"
                    />
                  </td>
                  <td className="p-3 font-semibold text-foreground">
                    <p className="text-sm">{p.name}</p>
                    <span className="text-[11px] text-muted-foreground font-normal">/{p.slug}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {p.subcategories?.name || "Belirtilmemiş"}
                  </td>
                  <td className="p-3 font-display font-semibold text-primary">
                    {formatPrice(p.price ? Number(p.price) : null, p.currency)}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-medium">
                      {(p.gallery?.length ?? 0) + (p.image_url ? 1 : 0)} görsel
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/urun/$productId"
                        params={{ productId: p.id }}
                        target="_blank"
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Sayfada Görüntüle"
                      >
                        <ExternalLink className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          setEditingProduct({
                            id: p.id,
                            subcategory_id: p.subcategory_id,
                            name: p.name,
                            slug: p.slug,
                            summary: p.summary || "",
                            description: p.description || "",
                            materials: Array.isArray(p.materials) ? p.materials.join(", ") : "",
                            width_cm: p.width_cm || "",
                            height_cm: p.height_cm || "",
                            depth_cm: p.depth_cm || "",
                            weight: p.weight || "",
                            warranty: p.warranty || "",
                            delivery_time: p.delivery_time || "",
                            production_place: p.production_place || "",
                            price: p.price ? String(p.price) : "",
                            currency: p.currency || "TRY",
                            image_url: p.image_url || "",
                            gallery: Array.isArray(p.gallery) ? p.gallery : [],
                            extra_specs: (p.extra_specs as Record<string, string>) || {},
                          });
                          setIsFormOpen(true);
                        }}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Düzenle"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProductMutation.mutate(p.id)}
                        className="rounded-lg border border-border p-1.5 text-destructive hover:bg-destructive/10"
                        title="Sil"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    {isLoading ? "Yükleniyor…" : "Eşleşen ürün bulunamadı."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ürün Ekle / Düzenle Modal Formu */}
      {isFormOpen && editingProduct && (
        <ProductEditModal
          initial={editingProduct}
          allSubcategories={allSubcategories}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSave={(payload) => saveProductMutation.mutate(payload)}
          isPending={saveProductMutation.isPending}
        />
      )}
    </div>
  );
}

function ProductEditModal({
  initial,
  allSubcategories,
  onClose,
  onSave,
  isPending,
}: {
  initial: ProductFormData;
  allSubcategories: any[];
  onClose: () => void;
  onSave: (payload: ProductFormData) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<ProductFormData>(initial);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecVal, setNewSpecVal] = useState("");
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const set = (key: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const addGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    setForm((f) => ({
      ...f,
      gallery: [...f.gallery, newGalleryUrl.trim()],
    }));
    setNewGalleryUrl("");
  };

  const removeGalleryImage = (index: number) => {
    setForm((f) => ({
      ...f,
      gallery: f.gallery.filter((_, idx) => idx !== index),
    }));
  };

  const addExtraSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setForm((f) => ({
      ...f,
      extra_specs: {
        ...f.extra_specs,
        [newSpecKey.trim()]: newSpecVal.trim(),
      },
    }));
    setNewSpecKey("");
    setNewSpecVal("");
  };

  const removeExtraSpec = (k: string) => {
    setForm((f) => {
      const next = { ...f.extra_specs };
      delete next[k];
      return { ...f, extra_specs: next };
    });
  };

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="panel max-h-[90vh] w-full max-w-3xl overflow-y-auto p-6 shadow-2xl bg-card">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-display text-xl font-semibold">
            {form.id ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary">
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(form);
          }}
          className="mt-6 space-y-5"
        >
          {/* Temel Bilgiler */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Alt Kategori *
              </label>
              <select
                value={form.subcategory_id}
                onChange={set("subcategory_id")}
                className={inputClass}
                required
              >
                <option value="">Seçiniz</option>
                {allSubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Ürün Adı *
              </label>
              <input
                value={form.name}
                onChange={(e) => {
                  set("name")(e);
                  if (!form.id && !form.slug) {
                    const generated = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9ğüşıöç]+/g, "-")
                      .replace(/^-|-$/g, "");
                    setForm((f) => ({ ...f, slug: generated }));
                  }
                }}
                className={inputClass}
                placeholder="örn. Meşe Mutfak Üst Dolabı"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                URL Adı (Slug) *
              </label>
              <input
                value={form.slug}
                onChange={set("slug")}
                className={inputClass}
                placeholder="örn. mese-mutfak-ust-dolabi"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Fiyat (TL)
              </label>
              <input
                type="number"
                value={form.price}
                onChange={set("price")}
                className={inputClass}
                placeholder="örn. 8450"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Kısa Özet (Katalog Kartı Açıklaması)
            </label>
            <input
              value={form.summary}
              onChange={set("summary")}
              className={inputClass}
              placeholder="örn. Masif meşe gövde, 60 cm modül"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Detaylı Açıklama
            </label>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              className={inputClass}
              placeholder="Ürünün detaylı işçilik, mekanizma ve tasarım özellikleri…"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Malzemeler (Virgülle ayırın)
            </label>
            <input
              value={form.materials}
              onChange={set("materials")}
              className={inputClass}
              placeholder="Masif meşe, Su bazlı vernik, Frenli menteşe"
            />
          </div>

          {/* Görsel ve Çoklu Galeri Alanı */}
          <div className="rounded-xl border border-border p-4 bg-secondary/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="size-4 text-primary" />
                <span>Görsel ve Çoklu Galeri Yönetimi</span>
              </span>
              <span className="text-[11px] font-normal text-muted-foreground">
                (Bulutta kalıcı saklanır)
              </span>
            </h3>

            {/* 1. Ana Görsel Seçimi */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Ana Kapak Görseli
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="main-image-upload"
                    className="hidden"
                    disabled={isUploadingMain}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingMain(true);
                      try {
                        toast.info("Ana görsel optimize ediliyor...");
                        const base64 = await processImageFile(file);
                        setForm((f) => ({ ...f, image_url: base64 }));
                        toast.success("Ana görsel başarıyla eklendi.");
                      } catch (err: any) {
                        toast.error(err?.message || "Görsel yüklenemedi.");
                      } finally {
                        setIsUploadingMain(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  <label
                    htmlFor="main-image-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {isUploadingMain ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Upload className="size-3.5" />
                    )}
                    <span>{isUploadingMain ? "Yükleniyor..." : "Galeriden Fotoğraf Seç"}</span>
                  </label>
                </div>
              </div>

              <input
                value={form.image_url}
                onChange={set("image_url")}
                className={inputClass}
                placeholder="veya internetten resim linki yapıştırın (https://...)"
              />
            </div>

            {/* 2. Ek Galeri Görselleri (Çoklu Fotoğraflar) */}
            <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Ek Galeri Görselleri (Çoklu Fotoğraflar)
                </label>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    id="gallery-images-upload"
                    className="hidden"
                    disabled={isUploadingGallery}
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      setIsUploadingGallery(true);
                      try {
                        toast.info(`${files.length} fotoğraf optimize ediliyor...`);
                        const base64List = await processMultipleImageFiles(files);
                        setForm((f) => ({
                          ...f,
                          gallery: [...f.gallery, ...base64List],
                        }));
                        toast.success(`${base64List.length} fotoğraf galeriye eklendi.`);
                      } catch (err: any) {
                        toast.error(err?.message || "Görseller yüklenemedi.");
                      } finally {
                        setIsUploadingGallery(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  <label
                    htmlFor="gallery-images-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    {isUploadingGallery ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="size-3.5" />
                    )}
                    <span>{isUploadingGallery ? "Optimize ediliyor..." : "Galeriden Çoklu Fotoğraf Seç"}</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  className={inputClass}
                  placeholder="veya ek görsel linki yapıştırın…"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGalleryImage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addGalleryImage}
                  className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground whitespace-nowrap"
                >
                  Link Ekle
                </button>
              </div>

              {/* Önizleme Thumbnail Dizisi */}
              <div className="mt-4">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                  Yüklü Görseller ({form.image_url ? 1 : 0} ana + {form.gallery.length} galeri):
                </p>
                <div className="flex flex-wrap gap-3">
                  {/* Ana Görsel Önizleme */}
                  {form.image_url && (
                    <div className="group relative size-20 rounded-xl border-2 border-primary overflow-hidden shadow-sm">
                      <img src={form.image_url} alt="Ana" className="h-full w-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-primary text-[10px] text-center font-bold text-primary-foreground py-0.5">
                        Ana Görsel
                      </span>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, image_url: "" }))}
                        className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Ana görseli kaldır"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {/* Çoklu Galeri Thumbnail'leri */}
                  {form.gallery.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative size-20 rounded-xl border border-border overflow-hidden bg-background shadow-xs hover:border-primary transition-all"
                    >
                      <img src={url} alt={`Galeri ${idx + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            // Bu görseli ana görsel yap, eskisini galeriye al
                            const oldMain = form.image_url;
                            const newGallery = form.gallery.filter((_, i) => i !== idx);
                            if (oldMain) newGallery.unshift(oldMain);
                            setForm((f) => ({
                              ...f,
                              image_url: url,
                              gallery: newGallery,
                            }));
                            toast.success("Görsel ana kapak yapıldı.");
                          }}
                          className="size-7 rounded-full bg-white/20 hover:bg-white/40 text-white grid place-items-center transition-colors"
                          title="Ana Görsel Yap"
                        >
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="size-7 rounded-full bg-destructive/80 hover:bg-destructive text-white grid place-items-center transition-colors"
                          title="Görseli kaldır"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {!form.image_url && form.gallery.length === 0 && (
                    <div className="w-full py-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                      Henüz görsel eklenmedi. Yukarıdaki butonlardan galerinizden fotoğraf seçebilirsiniz.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Standart Ölçüler */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Genişlik (cm)
              </label>
              <input value={form.width_cm} onChange={set("width_cm")} className={inputClass} placeholder="örn. 60" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Yükseklik (cm)
              </label>
              <input value={form.height_cm} onChange={set("height_cm")} className={inputClass} placeholder="örn. 210" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Derinlik (cm)
              </label>
              <input value={form.depth_cm} onChange={set("depth_cm")} className={inputClass} placeholder="örn. 35" />
            </div>
          </div>

          {/* Teknik Detaylar */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Garanti Süresi
              </label>
              <input value={form.warranty} onChange={set("warranty")} className={inputClass} placeholder="örn. 5 yıl" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Teslim Süresi
              </label>
              <input value={form.delivery_time} onChange={set("delivery_time")} className={inputClass} placeholder="örn. 15-20 gün" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Üretim Yeri
              </label>
              <input value={form.production_place} onChange={set("production_place")} className={inputClass} placeholder="örn. Bursa Atölyesi" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                Ağırlık
              </label>
              <input value={form.weight} onChange={set("weight")} className={inputClass} placeholder="örn. 24 kg" />
            </div>
          </div>

          {/* Ekstra Özellikler (Key-Value) */}
          <div className="rounded-xl border border-border p-4 bg-secondary/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sliders className="size-4 text-primary" />
              <span>Özel Teknik Özellikler (Extra Specs)</span>
            </h3>
            <div className="mt-3 flex gap-2">
              <input
                value={newSpecKey}
                onChange={(e) => setNewSpecKey(e.target.value)}
                placeholder="Özellik adı (örn. Kulp)"
                className={inputClass}
              />
              <input
                value={newSpecVal}
                onChange={(e) => setNewSpecVal(e.target.value)}
                placeholder="Değer (örn. Mat Krom)"
                className={inputClass}
              />
              <button
                type="button"
                onClick={addExtraSpec}
                className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground whitespace-nowrap"
              >
                Özellik Ekle
              </button>
            </div>

            {/* Eklenen Özellikler Listesi */}
            {Object.keys(form.extra_specs).length > 0 && (
              <div className="mt-3 divide-y divide-border text-xs">
                {Object.entries(form.extra_specs).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-1.5">
                    <span className="font-semibold text-muted-foreground">{k}:</span>
                    <div className="flex items-center gap-2">
                      <span>{v}</span>
                      <button
                        type="button"
                        onClick={() => removeExtraSpec(k)}
                        className="text-destructive hover:opacity-80"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Butonları */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-5 py-2 text-xs font-medium hover:bg-secondary"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-primary px-7 py-2 text-xs font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========================================================================= */
/* 2. KATEGORİ & ALT KATEGORİ YÖNETİMİ (TAM CRUD)                            */
/* ========================================================================= */

function CategoriesAdminSection() {
  const queryClient = useQueryClient();
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catImg, setCatImg] = useState("");

  const [activeCatId, setActiveCatId] = useState<string | null>(null);

  const [subName, setSubName] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subImg, setSubImg] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["admin-categories-full"],
    queryFn: async () => {
      return getFullCategories();
    },
  });

  const selectedCat = categories?.find((c) => c.id === (activeCatId ?? categories[0]?.id)) ?? categories?.[0] ?? null;

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-categories-full"] });
    void queryClient.invalidateQueries({ queryKey: ["header-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
    void queryClient.invalidateQueries({ queryKey: ["category-page"] });
  };

  const addCategory = useMutation({
    mutationFn: async () => {
      if (!catName.trim()) throw new Error("Kategori adı gereklidir.");
      const slug = catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await createCategory({
        name: catName.trim(),
        slug,
        description: catDesc.trim() || null,
        image_url: catImg.trim() || null,
      });
    },
    onSuccess: () => {
      setCatName("");
      setCatSlug("");
      setCatDesc("");
      setCatImg("");
      toast.success("Ana kategori eklendi.");
      invalidateAll();
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Bu kategoriyi ve altındaki tüm ürünleri silmek istediğinize emin misiniz?")) return;
      await removeCategory(id);
    },
    onSuccess: () => {
      toast.success("Kategori silindi.");
      invalidateAll();
    },
  });

  const addSubcategory = useMutation({
    mutationFn: async () => {
      if (!selectedCat) throw new Error("Önce bir ana kategori seçmelisiniz.");
      if (!subName.trim()) throw new Error("Alt kategori adı gereklidir.");
      const slug = subSlug.trim() || subName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await createSubcategory({
        category_id: selectedCat.id,
        name: subName.trim(),
        slug,
        description: subDesc.trim() || null,
        image_url: subImg.trim() || null,
      });
    },
    onSuccess: () => {
      setSubName("");
      setSubSlug("");
      setSubDesc("");
      setSubImg("");
      toast.success("Alt kategori eklendi.");
      invalidateAll();
    },
  });

  const deleteSubcategory = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm("Bu alt kategoriyi ve içindeki ürünleri silmek istediğinize emin misiniz?")) return;
      await removeSubcategory(id);
    },
    onSuccess: () => {
      toast.success("Alt kategori silindi.");
      invalidateAll();
    },
  });

  // Kategori düzenleme state
  const [editingCat, setEditingCat] = useState<{
    id: string; name: string; slug: string; description: string; image_url: string;
  } | null>(null);
  const [editingCatUploading, setEditingCatUploading] = useState(false);

  const updateCategory = useMutation({
    mutationFn: async (payload: { id: string; name: string; slug: string; description: string; image_url: string }) => {
      if (!payload.name.trim()) throw new Error("Kategori adı gereklidir.");
      await createCategory({
        id: payload.id,
        name: payload.name.trim(),
        slug: payload.slug.trim() || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: payload.description.trim() || null,
        image_url: payload.image_url.trim() || null,
      });
    },
    onSuccess: () => {
      setEditingCat(null);
      toast.success("Kategori güncellendi.");
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error("Hata: " + (err.message || "Güncellenemedi."));
    },
  });

  // Alt kategori düzenleme state
  const [editingSub, setEditingSub] = useState<{
    id: string; category_id: string; name: string; slug: string; description: string; image_url: string;
  } | null>(null);
  const [editingSubUploading, setEditingSubUploading] = useState(false);

  const updateSubcategory = useMutation({
    mutationFn: async (payload: { id: string; category_id: string; name: string; slug: string; description: string; image_url: string }) => {
      if (!payload.name.trim()) throw new Error("Alt kategori adı gereklidir.");
      await createSubcategory({
        id: payload.id,
        category_id: payload.category_id,
        name: payload.name.trim(),
        slug: payload.slug.trim() || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: payload.description.trim() || null,
        image_url: payload.image_url.trim() || null,
      });
    },
    onSuccess: () => {
      setEditingSub(null);
      toast.success("Alt kategori güncellendi.");
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error("Hata: " + (err.message || "Güncellenemedi."));
    },
  });

  // Slayt (slideshow) state
  const [slideshowCatId, setSlideshowCatId] = useState<string | null>(null);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [slideshowRunning, setSlideshowRunning] = useState(false);

  // Kategori arama state
  const [catSearch, setCatSearch] = useState("");
  const [subSearch, setSubSearch] = useState("");

  const filteredCategories = (categories || []).filter((c) =>
    !catSearch.trim() || c.name.toLowerCase().includes(catSearch.toLowerCase()) || c.slug.includes(catSearch.toLowerCase())
  );
  const filteredSubcategories = (selectedCat?.subcategories || []).filter((s: any) =>
    !subSearch.trim() || s.name.toLowerCase().includes(subSearch.toLowerCase()) || s.slug.includes(subSearch.toLowerCase())
  );

  // Slayt goesterimi icin urunler - en yeni en eski
  const { data: allProducts } = useQuery({
    queryKey: ["admin-products-all"],
    queryFn: async () => getAllProducts(),
  });

  const slideshowCat = slideshowCatId ? categories?.find((c) => c.id === slideshowCatId) : null;
  const slideshowSubIds = new Set((slideshowCat?.subcategories || []).map((s: any) => s.id));
  const slideshowProducts = (allProducts || [])
    .filter((p) => slideshowSubIds.has(p.subcategory_id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Slayt frameleri: kategori (5sn) -> urun (3sn) -> kategori (5sn) -> urun (3sn)...
  const slideshowFrames = slideshowCat
    ? (() => {
        const frames: { type: "cat" | "prod"; duration: number; src: string; label: string }[] = [];
        const catSrc = slideshowCat.image_url || "";
        if (slideshowProducts.length === 0) {
          frames.push({ type: "cat", duration: 5000, src: catSrc, label: slideshowCat.name });
        } else {
          for (const prod of slideshowProducts) {
            frames.push({ type: "cat", duration: 5000, src: catSrc, label: slideshowCat.name });
            if (prod.image_url) {
              frames.push({ type: "prod", duration: 3000, src: prod.image_url, label: prod.name });
            }
          }
        }
        return frames;
      })()
    : [];

  useEffect(() => {
    if (!slideshowRunning || slideshowFrames.length === 0) return;
    const frame = slideshowFrames[slideshowIndex];
    const timer = setTimeout(() => {
      setSlideshowIndex((i) => (i + 1) % slideshowFrames.length);
    }, frame?.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [slideshowRunning, slideshowIndex, slideshowFrames]);

  const currentFrame = slideshowFrames[slideshowIndex];

  const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary";

  return (
    <>
      {/* Slayt Modal */}
      {slideshowCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden bg-black shadow-2xl">
            <div className="flex items-center justify-between bg-black/70 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-white/80">
                  {currentFrame?.type === "cat" ? "📁 " : "🪑 "}
                  {currentFrame?.label || "—"}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                  {slideshowIndex + 1} / {slideshowFrames.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSlideshowRunning((r) => !r)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/30 transition"
                >
                  {slideshowRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                  {slideshowRunning ? "Duraklat" : "Oynat"}
                </button>
                <button
                  onClick={() => {
                    setSlideshowCatId(null);
                    setSlideshowRunning(false);
                    setSlideshowIndex(0);
                  }}
                  className="rounded-full bg-white/10 p-1.5 text-white hover:bg-white/20 transition"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {currentFrame?.src ? (
                <img
                  key={slideshowIndex}
                  src={currentFrame.src}
                  alt={currentFrame.label}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-white/40">
                  <ImageIcon className="size-12" />
                  <span className="text-xs">Bu kategori için fotoğraf yok</span>
                </div>
              )}

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3">
                <p className="text-sm font-semibold text-white">{currentFrame?.label}</p>
                <p className="text-[11px] text-white/60">
                  {currentFrame?.type === "cat" ? "Ana Kategori" : "Ürün"} • {currentFrame ? currentFrame.duration / 1000 : 0}sn
                </p>
              </div>

              <button
                onClick={() => setSlideshowIndex((i) => (i - 1 + slideshowFrames.length) % slideshowFrames.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-1 text-white text-lg hover:bg-black/70 transition"
              >
                ‹
              </button>
              <button
                onClick={() => setSlideshowIndex((i) => (i + 1) % slideshowFrames.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-1 text-white text-lg hover:bg-black/70 transition"
              >
                ›
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 bg-black/70 py-3 px-4 flex-wrap">
              {slideshowFrames.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setSlideshowIndex(i)}
                  className={`rounded-full transition-all ${
                    i === slideshowIndex
                      ? "bg-white w-4 h-2"
                      : f.type === "cat"
                      ? "bg-primary/60 size-2"
                      : "bg-white/30 size-2"
                  }`}
                  title={f.label}
                />
              ))}
            </div>

            <div className="bg-black/60 px-4 py-2 text-[10px] text-white/40 text-center">
              Sıralama: 5sn kategori → 3sn ürün (en yeni → en eski)
            </div>
          </div>
        </div>
      )}

      {/* Kategori Düzenleme Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="panel w-full max-w-md p-6 bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-lg font-semibold">Kategori Düzenle</h3>
              <button onClick={() => setEditingCat(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Kategori Adı *</label>
                <input
                  value={editingCat.name}
                  onChange={(e) => setEditingCat((c) => c ? { ...c, name: e.target.value } : c)}
                  className={inputCls}
                  placeholder="Kategori Adı"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Slug</label>
                <input
                  value={editingCat.slug}
                  onChange={(e) => setEditingCat((c) => c ? { ...c, slug: e.target.value } : c)}
                  className={inputCls}
                  placeholder="slug"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Açıklama</label>
                <input
                  value={editingCat.description}
                  onChange={(e) => setEditingCat((c) => c ? { ...c, description: e.target.value } : c)}
                  className={inputCls}
                  placeholder="Açıklama"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Kategori Resmi</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-cat-img-upload"
                    className="hidden"
                    disabled={editingCatUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setEditingCatUploading(true);
                      try {
                        toast.info("Görsel optimize ediliyor...");
                        const base64 = await processImageFile(file);
                        setEditingCat((c) => c ? { ...c, image_url: base64 } : c);
                        toast.success("Görsel eklendi.");
                      } catch (err: any) {
                        toast.error(err?.message || "Görsel yüklenemedi.");
                      } finally {
                        setEditingCatUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  <label
                    htmlFor="edit-cat-img-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {editingCatUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    <span>{editingCatUploading ? "Yükleniyor..." : "Galeriden Seç"}</span>
                  </label>
                  {editingCat.image_url && (
                    <img src={editingCat.image_url} alt="Kategori" className="size-10 rounded-lg object-cover border border-border" />
                  )}
                </div>
                <input
                  value={editingCat.image_url}
                  onChange={(e) => setEditingCat((c) => c ? { ...c, image_url: e.target.value } : c)}
                  className={inputCls}
                  placeholder="veya resim linki yapıştırın (https://...)"
                />
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  onClick={() => setEditingCat(null)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => updateCategory.mutate(editingCat)}
                  disabled={updateCategory.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {updateCategory.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  {updateCategory.isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alt Kategori Düzenleme Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="panel w-full max-w-md p-6 bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-lg font-semibold">Alt Kategori Düzenle</h3>
              <button onClick={() => setEditingSub(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-secondary">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Alt Kategori Adı *</label>
                <input
                  value={editingSub.name}
                  onChange={(e) => setEditingSub((s) => s ? { ...s, name: e.target.value } : s)}
                  className={inputCls}
                  placeholder="Alt Kategori Adı"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Slug</label>
                <input
                  value={editingSub.slug}
                  onChange={(e) => setEditingSub((s) => s ? { ...s, slug: e.target.value } : s)}
                  className={inputCls}
                  placeholder="slug"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Açıklama</label>
                <input
                  value={editingSub.description}
                  onChange={(e) => setEditingSub((s) => s ? { ...s, description: e.target.value } : s)}
                  className={inputCls}
                  placeholder="Açıklama"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">Alt Kategori Resmi</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="edit-sub-img-upload"
                    className="hidden"
                    disabled={editingSubUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setEditingSubUploading(true);
                      try {
                        toast.info("Görsel optimize ediliyor...");
                        const base64 = await processImageFile(file);
                        setEditingSub((s) => s ? { ...s, image_url: base64 } : s);
                        toast.success("Görsel eklendi.");
                      } catch (err: any) {
                        toast.error(err?.message || "Görsel yüklenemedi.");
                      } finally {
                        setEditingSubUploading(false);
                        e.target.value = "";
                      }
                    }}
                  />
                  <label
                    htmlFor="edit-sub-img-upload"
                    className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {editingSubUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                    <span>{editingSubUploading ? "Yükleniyor..." : "Galeriden Seç"}</span>
                  </label>
                  {editingSub.image_url && (
                    <img src={editingSub.image_url} alt="Alt Kategori" className="size-10 rounded-lg object-cover border border-border" />
                  )}
                </div>
                <input
                  value={editingSub.image_url}
                  onChange={(e) => setEditingSub((s) => s ? { ...s, image_url: e.target.value } : s)}
                  className={inputCls}
                  placeholder="veya resim linki yapıştırın (https://...)"
                />
              </div>
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  onClick={() => setEditingSub(null)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium hover:bg-secondary"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => updateSubcategory.mutate(editingSub)}
                  disabled={updateSubcategory.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {updateSubcategory.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  {updateSubcategory.isPending ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* SOL: Ana Kategoriler */}
        <div className="panel p-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <FolderTree className="size-5 text-primary" />
            <span>Ana Kategoriler</span>
          </h2>

          {/* Yeni Ana Kategori Ekle Formu */}
          <div className="mt-4 rounded-xl border border-dashed border-border p-4 bg-secondary/30">
            <p className="text-xs font-semibold mb-3">Yeni Ana Kategori Ekle</p>
            <div className="grid gap-2">
              <input
                value={catName}
                onChange={(e) => {
                  setCatName(e.target.value);
                  if (!catSlug) setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }}
                placeholder="Kategori Adı (örn. Masa & Sandalye)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                placeholder="Slug (örn. masa-sandalye)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Açıklama"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                value={catImg}
                onChange={(e) => setCatImg(e.target.value)}
                placeholder="Kategori resim linki (opsiyonel)"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => addCategory.mutate()}
                disabled={!catName.trim() || addCategory.isPending}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                Kategori Ekle
              </button>
            </div>
          </div>

          {/* Kategori Arama */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              placeholder="Kategorilerde ara…"
              className="w-full rounded-full border border-input bg-background pl-8 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Kategori Listesi */}
          <div className="mt-3 space-y-2">
            {filteredCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                  cat.id === selectedCat?.id
                    ? "border-primary bg-secondary shadow-sm"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="size-10 rounded-lg object-cover border border-border flex-shrink-0"
                  />
                ) : (
                  <div className="size-10 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{cat.name}</p>
                  <span className="text-[11px] text-muted-foreground">
                    /{cat.slug} • {cat.subcategories?.length ?? 0} alt kategori
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSlideshowCatId(cat.id);
                      setSlideshowIndex(0);
                      setSlideshowRunning(true);
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    title="Slayt Gösterisi Aç"
                  >
                    <Play className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCat({
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description || "",
                        image_url: cat.image_url || "",
                      });
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Düzenle"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCategory.mutate(cat.id);
                    }}
                    className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                    title="Sil"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <p className="text-center py-4 text-xs text-muted-foreground">
                {catSearch ? "Eşleşen kategori bulunamadı." : "Henüz kategori eklenmemiş."}
              </p>
            )}
          </div>
        </div>

        {/* SAĞ: Seçili Kategoriye Ait Alt Kategoriler */}
        <div className="panel p-6">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <span>"{selectedCat?.name || 'Seçili'}" Alt Kategorileri</span>
          </h2>

          {selectedCat ? (
            <>
              {/* Yeni Alt Kategori Ekle Formu */}
              <div className="mt-4 rounded-xl border border-dashed border-border p-4 bg-secondary/30">
                <p className="text-xs font-semibold mb-3">Bu Kategoriye Alt Kategori Ekle</p>
                <div className="grid gap-2">
                  <input
                    value={subName}
                    onChange={(e) => {
                      setSubName(e.target.value);
                      if (!subSlug) setSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }}
                    placeholder="Alt Kategori Adı (örn. Mutfak Dolabı)"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    value={subSlug}
                    onChange={(e) => setSubSlug(e.target.value)}
                    placeholder="Slug (örn. mutfak-dolabi)"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    value={subDesc}
                    onChange={(e) => setSubDesc(e.target.value)}
                    placeholder="Açıklama"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    value={subImg}
                    onChange={(e) => setSubImg(e.target.value)}
                    placeholder="Alt kategori resim linki (opsiyonel)"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => addSubcategory.mutate()}
                    disabled={!subName.trim() || addSubcategory.isPending}
                    className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-ink-foreground disabled:opacity-50"
                  >
                    Alt Kategori Ekle
                  </button>
                </div>
              </div>

              {/* Alt Kategori Arama */}
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <input
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  placeholder="Alt kategorilerde ara…"
                  className="w-full rounded-full border border-input bg-background pl-8 pr-4 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Alt Kategori Listesi */}
              <div className="mt-3 space-y-2">
                {filteredSubcategories.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 bg-card"
                  >
                    {sub.image_url ? (
                      <img
                        src={sub.image_url}
                        alt={sub.name}
                        className="size-9 rounded-lg object-cover border border-border flex-shrink-0"
                      />
                    ) : (
                      <div className="size-9 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="size-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{sub.name}</p>
                      <span className="text-[11px] text-muted-foreground">/{sub.slug}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() =>
                          setEditingSub({
                            id: sub.id,
                            category_id: sub.category_id,
                            name: sub.name,
                            slug: sub.slug,
                            description: sub.description || "",
                            image_url: sub.image_url || "",
                          })
                        }
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        title="Düzenle"
                      >
                        <Edit2 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSubcategory.mutate(sub.id)}
                        className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                        title="Sil"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredSubcategories.length === 0 && (
                  <p className="text-center py-6 text-xs text-muted-foreground">
                    {subSearch
                      ? "Eşleşen alt kategori bulunamadı."
                      : "Bu ana kategoriye ait henüz alt kategori eklenmemiş."}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-6 text-xs text-muted-foreground">Lütfen soldan bir ana kategori seçin.</p>
          )}
        </div>
      </div>
    </>
  );
}


/* ========================================================================= */
/* 3. MESAJ & SORU YÖNETİMİ (GÖRÜNTÜLEME + ÜRÜN BİLGİSİ + YANIT YAZMA)      */
/* ========================================================================= */

function MessagesAdminSection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "answered">("all");

  const { data: threads } = useQuery({
    queryKey: ["admin-messages-list"],
    queryFn: async () => {
      return getMessages({ isAdmin: true });
    },
  });

  const selectedThread = threads?.find((t) => t.id === (activeId ?? threads[0]?.id)) ?? threads?.[0] ?? null;

  // Sekmeler / pencereler arası senkronizasyon dinleyici
  useEffect(() => {
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-messages-list"] });
      if (selectedThread?.id) {
        void queryClient.invalidateQueries({ queryKey: ["admin-thread-replies", selectedThread.id] });
      }
    };
    window.addEventListener("almir-messages-changed", handler);
    return () => window.removeEventListener("almir-messages-changed", handler);
  }, [selectedThread?.id, queryClient]);

  const { data: replies } = useQuery({
    queryKey: ["admin-thread-replies", selectedThread?.id],
    enabled: !!selectedThread?.id,
    queryFn: async () => {
      return getMessageReplies(selectedThread!.id);
    },
  });

  const sendReplyMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedThread || !adminReply.trim()) return;

      await insertMessageReply({
        message_id: selectedThread.id,
        author_id: user.id,
        author_name: "Almir Mobilya",
        from_admin: true,
        body: adminReply.trim(),
      });

      await updateMessageStatus(selectedThread.id, "answered");
    },
    onSuccess: () => {
      setAdminReply("");
      toast.success("Yanıtınız kullanıcıya iletildi.");
      void queryClient.invalidateQueries({ queryKey: ["admin-thread-replies", selectedThread?.id] });
      void queryClient.invalidateQueries({ queryKey: ["admin-messages-list"] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedThread) return;
      const nextStatus = selectedThread.status === "answered" ? "open" : "answered";
      await updateMessageStatus(selectedThread.id, nextStatus);
    },
    onSuccess: () => {
      toast.success("Durum güncellendi.");
      void queryClient.invalidateQueries({ queryKey: ["admin-messages-list"] });
    },
  });

  const filteredThreads = (threads || []).filter((t) => {
    if (filterStatus === "all") return true;
    return t.status === filterStatus;
  });

  return (
    <div className="grid gap-6 md:grid-cols-[320px_1fr]">
      {/* Sol: Gelen Mesajlar Listesi */}
      <div className="space-y-3">
        <div className="flex gap-1.5 rounded-xl border border-border bg-secondary/50 p-1 text-xs">
          <button
            onClick={() => setFilterStatus("all")}
            className={`flex-1 rounded-lg py-1.5 font-semibold ${
              filterStatus === "all" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            Tümü ({threads?.length ?? 0})
          </button>
          <button
            onClick={() => setFilterStatus("open")}
            className={`flex-1 rounded-lg py-1.5 font-semibold ${
              filterStatus === "open" ? "bg-card shadow-sm text-amber-600" : "text-muted-foreground"
            }`}
          >
            Bekleyen
          </button>
          <button
            onClick={() => setFilterStatus("answered")}
            className={`flex-1 rounded-lg py-1.5 font-semibold ${
              filterStatus === "answered" ? "bg-card shadow-sm text-emerald-600" : "text-muted-foreground"
            }`}
          >
            Yanıtlandı
          </button>
        </div>

        <div className="space-y-2">
          {filteredThreads.map((t) => {
            const isAnswered = t.status === "answered";
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full rounded-xl border p-3.5 text-left text-xs transition-all ${
                  t.id === selectedThread?.id
                    ? "border-primary bg-secondary shadow-sm"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate max-w-[180px]">{t.user_name || t.user_email}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isAnswered
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {isAnswered ? "Yanıtlandı" : "Bekliyor"}
                  </span>
                </div>
                <p className="font-medium text-foreground mt-1 line-clamp-1">{t.subject || "Soru"}</p>
                <p className="mt-1 line-clamp-1 text-muted-foreground">{t.body}</p>
                {t.products && (
                  <p className="mt-1.5 text-[10px] text-primary truncate">
                    İlgili Ürün: {t.products.name}
                  </p>
                )}
              </button>
            );
          })}
          {filteredThreads.length === 0 && (
            <p className="text-center py-8 text-xs text-muted-foreground">Mesaj kaydı yok.</p>
          )}
        </div>
      </div>

      {/* Sağ: Seçili Mesaj Detayı ve Yanıt Paneli */}
      <div className="panel flex flex-col justify-between p-6 min-h-[500px]">
        {selectedThread ? (
          <div>
            <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-muted-foreground">
                  Gönderen: <strong>{selectedThread.user_name || "İsimsiz"}</strong> ({selectedThread.user_email})
                </span>
                <h3 className="font-display text-xl font-semibold mt-1">
                  {selectedThread.subject || "Soru"}
                </h3>
              </div>
              <button
                onClick={() => toggleStatusMutation.mutate()}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                  selectedThread.status === "answered"
                    ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
                    : "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25"
                }`}
              >
                {selectedThread.status === "answered" ? "✓ Yanıtlandı Olarak İşaretli" : "Cevap Bekliyor (Tamamla)"}
              </button>
            </div>

            {/* İlgili Ürün Gösterimi */}
            {selectedThread.products && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedThread.products.image_url || FALLBACK_IMAGE}
                    alt={selectedThread.products.name}
                    className="size-12 rounded-lg object-cover border border-border"
                  />
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                      Hakkında Soru Sorulan Ürün
                    </span>
                    <p className="text-sm font-semibold">{selectedThread.products.name}</p>
                  </div>
                </div>
                <Link
                  to="/urun/$productId"
                  params={{ productId: selectedThread.products.id }}
                  target="_blank"
                  className="rounded-full bg-card border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-secondary"
                >
                  Ürünü Aç →
                </Link>
              </div>
            )}

            {/* Mesaj ve Yanıt Akışı */}
            <div className="mt-6 space-y-4">
              <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-secondary p-4 text-sm">
                <span className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Müşteri Mesajı
                </span>
                <p className="whitespace-pre-wrap">{selectedThread.body}</p>
                <span className="mt-1 block text-[10px] opacity-60">
                  {new Date(selectedThread.created_at).toLocaleString("tr-TR")}
                </span>
              </div>

              {replies?.map((r) => (
                <div
                  key={r.id}
                  className={
                    r.from_admin
                      ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-ink p-4 text-sm text-ink-foreground shadow-sm"
                      : "max-w-[85%] rounded-2xl rounded-tl-md bg-secondary p-4 text-sm"
                  }
                >
                  <span className="block text-[11px] font-semibold text-primary mb-1">
                    {r.from_admin ? "Almir Mobilya (Admin)" : selectedThread.user_name || "Müşteri"}
                  </span>
                  <p className="whitespace-pre-wrap">{r.body}</p>
                  <span className="mt-1 block text-right text-[10px] opacity-60">
                    {new Date(r.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>

            {/* Yanıt Yazma Alanı */}
            <div className="mt-8 border-t border-border pt-4">
              <div className="flex gap-2">
                <input
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Müşteriye resmi yanıtınızı yazın…"
                  className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (adminReply.trim()) sendReplyMutation.mutate();
                    }
                  }}
                />
                <button
                  onClick={() => sendReplyMutation.mutate()}
                  disabled={!adminReply.trim() || sendReplyMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50 shadow"
                >
                  <Send className="size-3.5" />
                  <span>Gönder</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="m-auto text-center py-12 text-muted-foreground text-xs">
            Soldan bir mesaj seçiniz.
          </div>
        )}
      </div>
    </div>
  );
}


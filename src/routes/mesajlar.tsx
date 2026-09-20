import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { notifyAdminsOnNewQuestion } from "@/lib/notifications";
import {
  getMessages,
  getMessageReplies,
  insertMessage,
  insertMessageReply,
} from "@/lib/messages";
import { AuthModal } from "@/components/AuthModal";
import { formatPrice, FALLBACK_IMAGE } from "@/lib/format";
import { toast } from "sonner";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Search = { urun?: string };

export const Route = createFileRoute("/mesajlar")({
  validateSearch: (search: Record<string, unknown>): Search =>
    typeof search["urun"] === "string" ? { urun: search["urun"] } : {},
  head: () => ({
    meta: [
      { title: "Sohbet ve Sorular — Almir Mobilya" },
      {
        name: "description",
        content:
          "Almir Mobilya ekibine ürün, ölçü ve fiyat sorularınızı iletin; yanıtları bu sayfadan anlık takip edin.",
      },
      { property: "og:title", content: "Sohbet ve Sorular — Almir Mobilya" },
      {
        property: "og:description",
        content: "Sorunuzu iletin, Almir Mobilya ekibi doğrudan yanıtlasın.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { urun } = Route.useSearch();
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  // İlgili ürün varsa bilgilerini çek
  const { data: relatedProduct } = useQuery({
    queryKey: ["related-product", urun],
    enabled: !!urun,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, price, currency")
        .eq("id", urun!)
        .maybeSingle();
      if (error) return null;
      return data;
    },
  });

  // İlgili ürün geldiğinde başlığı otomatik doldur
  useEffect(() => {
    if (relatedProduct && !subject) {
      setSubject(`${relatedProduct.name} hakkında soru`);
    }
  }, [relatedProduct]);

  // Kullanıcının mesaj geçmişini çek
  const { data: threads, isLoading: threadsLoading } = useQuery({
    queryKey: ["my-messages", user?.id, isAdmin],
    enabled: !!user,
    queryFn: async () => {
      return getMessages({
        userId: user?.id,
        userEmail: user?.email ?? undefined,
        isAdmin,
      });
    },
  });

  const selectedId = activeId ?? threads?.[0]?.id ?? null;
  const selectedThread = threads?.find((t) => t.id === selectedId) ?? null;

  // Sekmeler veya pencereler arası senkronizasyon dinleyici
  useEffect(() => {
    const handler = () => {
      void queryClient.invalidateQueries({ queryKey: ["my-messages"] });
      if (selectedId) {
        void queryClient.invalidateQueries({ queryKey: ["replies", selectedId] });
      }
    };
    window.addEventListener("almir-messages-changed", handler);
    return () => window.removeEventListener("almir-messages-changed", handler);
  }, [selectedId, queryClient]);

  // Seçili mesajın yanıtlarını çek
  const { data: replies } = useQuery({
    queryKey: ["replies", selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      return getMessageReplies(selectedId!);
    },
  });

  // Yeni mesaj oluştur
  const createMessage = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Giriş yapmanız gerekmektedir.");
      if (!body.trim()) throw new Error("Lütfen bir soru mesajı yazın.");

      const subjectText = subject.trim() || (relatedProduct ? `${relatedProduct.name} hakkında soru` : "Genel Soru");

      const inserted = await insertMessage({
        user_id: user.id,
        user_email: user.email ?? null,
        user_name: (user.user_metadata?.["full_name"] as string | undefined) ?? null,
        subject: subjectText,
        body: body.trim(),
        product_id: urun ?? null,
        product: relatedProduct
          ? {
              id: relatedProduct.id,
              name: relatedProduct.name,
              image_url: relatedProduct.image_url ?? null,
              price: relatedProduct.price ?? null,
              currency: relatedProduct.currency ?? "TRY",
            }
          : null,
      });

      // E-posta bildirim altyapısını tetikle
      void notifyAdminsOnNewQuestion({
        messageId: inserted.id,
        subject: subjectText,
        body: body.trim(),
        userEmail: user.email ?? null,
        userName: (user.user_metadata?.["full_name"] as string | undefined) ?? null,
        productId: urun ?? null,
        productName: relatedProduct?.name ?? null,
      });

      return inserted;
    },
    onSuccess: (newMsg) => {
      setBody("");
      setSubject("");
      setActiveId(newMsg.id);
      toast.success("Sorunuz Almir Mobilya ekibine iletildi!");
      void queryClient.invalidateQueries({ queryKey: ["my-messages"] });
    },
    onError: (err: any) => {
      toast.error("Mesaj gönderilemedi: " + (err.message || "Tekrar deneyin."));
    },
  });

  // Yanıt gönder
  const sendReply = useMutation({
    mutationFn: async () => {
      if (!user || !selectedId) throw new Error("Giriş gerekli");
      if (!reply.trim()) return;

      await insertMessageReply({
        message_id: selectedId,
        author_id: user.id,
        author_name: (user.user_metadata?.["full_name"] as string | undefined) ?? user.email ?? null,
        from_admin: isAdmin,
        body: reply.trim(),
      });
    },
    onSuccess: () => {
      setReply("");
      void queryClient.invalidateQueries({ queryKey: ["replies", selectedId] });
      toast.success("Yanıtınız eklendi.");
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <MessageSquare className="size-7" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight">
          Soru Sormak İçin Giriş Yapın
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Almir Mobilya yetkililerine ölçü, fiyat veya özel tasarım sorularınızı iletebilmek ve verilen yanıtları canlı takip edebilmek için Google hesabınızla giriş yapın.
        </p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="mt-8 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          Giriş Yap
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <span className="label-eyebrow">Müşteri İletişim</span>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Sorularınız ve Yanıtlar
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        Sorularınızı doğrudan atölye ekibimize iletin. Yanıtlar aynı gün içinde bu ekranda görüntülenir.
      </p>

      {/* Yeni Soru Alanı */}
      <div className="panel mt-8 p-6 shadow-panel">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Yeni Soru Gönder</h2>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>

        {/* İlgili Ürün Kartı */}
        {relatedProduct && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-3">
              <img
                src={relatedProduct.image_url || FALLBACK_IMAGE}
                alt={relatedProduct.name}
                className="size-12 rounded-lg object-cover border border-border"
              />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  İlgili Ürün
                </span>
                <p className="text-sm font-semibold">{relatedProduct.name}</p>
              </div>
            </div>
            <p className="font-display text-sm font-bold text-primary">
              {formatPrice(relatedProduct.price ? Number(relatedProduct.price) : null, relatedProduct.currency)}
            </p>
          </div>
        )}

        <div className="mt-4 space-y-3">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Konu (örn. Meşe dolap için özel ölçü fiyatı)"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Sorunuzu, ölçülerinizi veya merak ettiğiniz detayları buraya yazın…"
            className="w-full rounded-xl border border-input bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Sorunuz yönetici panelimize ve anlık e-posta bildirimine iletilir.
          </p>
          <button
            onClick={() => createMessage.mutate()}
            disabled={!body.trim() || createMessage.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-xs font-semibold text-ink-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Send className="size-3.5" />
            <span>{createMessage.isPending ? "Gönderiliyor…" : "Soruyu Gönder"}</span>
          </button>
        </div>
      </div>

      {/* Mesajlaşma / Konuşmalar Alanı */}
      <div className="mt-12 grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Sol: Konuşma Listesi */}
        <div className="space-y-2">
          <h2 className="font-display text-lg font-semibold">Konuşma Geçmişiniz</h2>
          {threadsLoading && (
            <p className="text-xs text-muted-foreground">Yükleniyor…</p>
          )}
          {!threadsLoading && threads?.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Henüz soru kaydınız bulunmuyor.
            </div>
          )}
          {threads?.map((t) => {
            const isAnswered = t.status === "answered";
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                className={`w-full rounded-xl border p-3.5 text-left text-sm transition-all ${
                  t.id === selectedId
                    ? "border-primary bg-secondary shadow-sm"
                    : "border-border hover:bg-secondary/60"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold line-clamp-1">{t.subject || "Soru"}</p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isAnswered
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {isAnswered ? "Yanıtlandı" : "Bekliyor"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{t.body}</p>
                <p className="mt-2 text-[10px] text-muted-foreground/70">
                  {new Date(t.created_at).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </button>
            );
          })}
        </div>

        {/* Sağ: Seçili Konuşma ve Yanıtlar */}
        <div className="panel flex flex-col justify-between p-6 min-h-[420px]">
          {selectedThread ? (
            <div>
              <div className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold">
                    {selectedThread.subject || "Soru"}
                  </h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedThread.status === "answered"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {selectedThread.status === "answered" ? "Yanıtlandı" : "Cevap Bekliyor"}
                  </span>
                </div>
                {selectedThread.products && (
                  <Link
                    to="/urun/$productId"
                    params={{ productId: selectedThread.products.id }}
                    className="mt-2 inline-flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Package className="size-3.5" />
                    <span>Ürün: {selectedThread.products.name}</span>
                  </Link>
                )}
              </div>

              {/* Mesaj Akışı */}
              <div className="mt-6 space-y-4">
                {/* Kullanıcının orijinal sorusu */}
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-secondary p-4 text-sm">
                  <span className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Siz
                  </span>
                  <p className="whitespace-pre-wrap">{selectedThread.body}</p>
                </div>

                {/* Yanıtlar */}
                {replies?.map((r) => (
                  <div
                    key={r.id}
                    className={
                      r.from_admin
                        ? "ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-ink p-4 text-sm text-ink-foreground shadow-sm"
                        : "max-w-[85%] rounded-2xl rounded-tl-md bg-secondary p-4 text-sm"
                    }
                  >
                    {r.from_admin ? (
                      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <ShieldCheck className="size-3.5" />
                        <span>Almir Mobilya Yetkilisi</span>
                      </div>
                    ) : (
                      <span className="block text-[11px] font-semibold text-muted-foreground mb-1">
                        Siz
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{r.body}</p>
                    <span className="mt-1 block text-right text-[10px] opacity-60">
                      {new Date(r.created_at).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Ek Yanıt Gönderme Alanı */}
              <div className="mt-8 border-t border-border pt-4">
                <div className="flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Yanıtınızı buraya yazın…"
                    className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (reply.trim()) sendReply.mutate();
                      }
                    }}
                  />
                  <button
                    onClick={() => sendReply.mutate()}
                    disabled={!reply.trim() || sendReply.isPending}
                    className="rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    Gönder
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="m-auto text-center py-12 text-muted-foreground">
              <MessageSquare className="mx-auto size-8 opacity-40" />
              <p className="mt-2 text-sm">Görüntülemek için soldaki bir soruyu seçin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

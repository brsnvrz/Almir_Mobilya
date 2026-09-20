import { supabase } from "@/integrations/supabase/client";

export type MessageItem = {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  product_id: string | null;
  subject: string | null;
  body: string;
  status: string; // 'open' | 'answered'
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    image_url: string | null;
    price?: number | null;
    currency?: string;
  } | null;
};

export type MessageReplyItem = {
  id: string;
  message_id: string;
  author_id: string;
  author_name: string | null;
  from_admin: boolean;
  body: string;
  created_at: string;
};

const LOCAL_MESSAGES_KEY = "almir_local_messages";
const LOCAL_REPLIES_KEY = "almir_local_message_replies";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getStoredMessages(): MessageItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
    return raw ? (JSON.parse(raw) as MessageItem[]) : [];
  } catch {
    return [];
  }
}

function saveStoredMessages(items: MessageItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(items));
    notifyMessageChannel();
  } catch {}
}

function getStoredReplies(): MessageReplyItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_REPLIES_KEY);
    return raw ? (JSON.parse(raw) as MessageReplyItem[]) : [];
  } catch {
    return [];
  }
}

function saveStoredReplies(items: MessageReplyItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_REPLIES_KEY, JSON.stringify(items));
    notifyMessageChannel();
  } catch {}
}

function notifyMessageChannel() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("almir-messages-changed"));
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("almir_messages_sync");
      bc.postMessage({ type: "changed", timestamp: Date.now() });
      bc.close();
    }
  } catch {}
}

/**
 * Mesaj oluşturma: Öncelikle Supabase'e yazmayı dener.
 * Eğer RLS politikası (401 / code 42501) engellerse, güvenli yerel depolamaya yazar ve akışı kesmez.
 */
export async function insertMessage(payload: {
  user_id: string;
  user_email?: string | null;
  user_name?: string | null;
  subject?: string | null;
  body: string;
  product_id?: string | null;
  product?: {
    id: string;
    name: string;
    image_url: string | null;
    price?: number | null;
    currency?: string;
  } | null;
}): Promise<MessageItem> {
  const localId = generateUUID();
  const now = new Date().toISOString();

  const newMsg: MessageItem = {
    id: localId,
    user_id: payload.user_id,
    user_email: payload.user_email ?? null,
    user_name: payload.user_name ?? null,
    product_id: payload.product_id ?? null,
    subject: payload.subject ?? null,
    body: payload.body.trim(),
    status: "open",
    created_at: now,
    updated_at: now,
    products: payload.product ?? null,
  };

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        user_id: payload.user_id,
        user_email: payload.user_email ?? null,
        user_name: payload.user_name ?? null,
        subject: payload.subject ?? null,
        body: payload.body.trim(),
        product_id: payload.product_id ?? null,
      })
      .select("*, products(id, name, image_url, price, currency)")
      .maybeSingle();

    if (error) {
      console.warn("[Messages] Supabase yazma uyarısı (yerel depolama kullanılacak):", error.message);
      // Yerel listeye ekle
      const current = getStoredMessages();
      saveStoredMessages([newMsg, ...current.filter((m) => m.id !== newMsg.id)]);
      return newMsg;
    }

    if (data) {
      // Başarılı Supabase kaydı, yerel yedeklemeyi de güncelle
      const current = getStoredMessages();
      saveStoredMessages([data as MessageItem, ...current.filter((m) => m.id !== (data as any).id)]);
      return data as MessageItem;
    }
  } catch (err: any) {
    console.warn("[Messages] Supabase bağlantı hatası (yerel depolama kullanılacak):", err?.message);
  }

  // Fallback
  const current = getStoredMessages();
  saveStoredMessages([newMsg, ...current.filter((m) => m.id !== newMsg.id)]);
  return newMsg;
}

/**
 * Mesajları listeleme: Supabase'den çekilenler ile yerel depolamadaki mesajları birleştirir.
 */
export async function getMessages(options?: {
  userId?: string | null;
  userEmail?: string | null;
  isAdmin?: boolean;
}): Promise<MessageItem[]> {
  const localItems = getStoredMessages();
  let remoteItems: MessageItem[] = [];

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*, products(id, name, image_url, price, currency)")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      remoteItems = data as MessageItem[];
    }
  } catch (err) {
    console.warn("[Messages] Supabase mesaj okuma uyarısı:", err);
  }

  // ID'ye göre birleştir (remote öncelikli, yoksa local)
  const map = new Map<string, MessageItem>();
  for (const item of localItems) {
    map.set(item.id, item);
  }
  for (const item of remoteItems) {
    // remote'da products null gelmişse local'dekini koru
    const existing = map.get(item.id);
    map.set(item.id, {
      ...item,
      products: item.products || existing?.products || null,
    });
  }

  let all = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Eğer admin değilse sadece kendi mesajlarını görsün
  if (!options?.isAdmin) {
    const uid = options?.userId?.toLowerCase();
    const uemail = options?.userEmail?.toLowerCase().trim();
    all = all.filter((m) => {
      const matchId = uid && m.user_id?.toLowerCase() === uid;
      const matchEmail = uemail && m.user_email?.toLowerCase().trim() === uemail;
      return matchId || matchEmail;
    });
  }

  return all;
}

/**
 * Mesaj yanıtlarını çekme
 */
export async function getMessageReplies(messageId: string): Promise<MessageReplyItem[]> {
  const localReplies = getStoredReplies().filter((r) => r.message_id === messageId);
  let remoteReplies: MessageReplyItem[] = [];

  try {
    const { data, error } = await supabase
      .from("message_replies")
      .select("*")
      .eq("message_id", messageId)
      .order("created_at");

    if (!error && Array.isArray(data)) {
      remoteReplies = data as MessageReplyItem[];
    }
  } catch {}

  const map = new Map<string, MessageReplyItem>();
  for (const r of localReplies) {
    map.set(r.id, r);
  }
  for (const r of remoteReplies) {
    map.set(r.id, r);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

/**
 * Yanıt ekleme
 */
export async function insertMessageReply(payload: {
  message_id: string;
  author_id: string;
  author_name?: string | null;
  from_admin: boolean;
  body: string;
}): Promise<MessageReplyItem> {
  const newReply: MessageReplyItem = {
    id: generateUUID(),
    message_id: payload.message_id,
    author_id: payload.author_id,
    author_name: payload.author_name ?? null,
    from_admin: payload.from_admin,
    body: payload.body.trim(),
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("message_replies")
      .insert({
        message_id: payload.message_id,
        author_id: payload.author_id,
        author_name: payload.author_name ?? null,
        from_admin: payload.from_admin,
        body: payload.body.trim(),
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      const current = getStoredReplies();
      saveStoredReplies([...current.filter((r) => r.id !== (data as any).id), data as MessageReplyItem]);
      return data as MessageReplyItem;
    }
  } catch {}

  // Fallback to local
  const currentReplies = getStoredReplies();
  saveStoredReplies([...currentReplies.filter((r) => r.id !== newReply.id), newReply]);

  // Eğer admin yanıt verdiyse mesajın durumunu 'answered' yap
  if (payload.from_admin) {
    await updateMessageStatus(payload.message_id, "answered");
  }

  return newReply;
}

/**
 * Mesaj durumu güncelleme ('open' | 'answered')
 */
export async function updateMessageStatus(messageId: string, status: "open" | "answered") {
  try {
    await supabase.from("messages").update({ status }).eq("id", messageId);
  } catch {}

  const current = getStoredMessages();
  const updated = current.map((m) => (m.id === messageId ? { ...m, status, updated_at: new Date().toISOString() } : m));
  saveStoredMessages(updated);
}

import {
  getMessagesFn,
  getMessageRepliesFn,
  insertMessageFn,
  insertMessageReplyFn,
  updateMessageStatusFn,
} from "./server-messages";

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
 * Mesaj oluşturma: Neon PostgreSQL'e kaydeder.
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
    const saved = await insertMessageFn({
      data: {
        user_id: payload.user_id,
        user_email: payload.user_email ?? null,
        user_name: payload.user_name ?? null,
        subject: payload.subject ?? null,
        body: payload.body.trim(),
        product_id: payload.product_id ?? null,
      },
    });

    if (saved) {
      const item: MessageItem = {
        ...(saved as MessageItem),
        products: payload.product ?? null,
      };
      notifyMessageChannel();
      return item;
    }
  } catch (err: any) {
    console.warn("[Messages] Neon yazma uyarısı, yerel depolanıyor:", err?.message);
  }

  // Fallback
  const current = getStoredMessages();
  saveStoredMessages([newMsg, ...current.filter((m) => m.id !== newMsg.id)]);
  return newMsg;
}

/**
 * Mesajları listeleme: Neon PostgreSQL'den çeker.
 */
export async function getMessages(options?: {
  userId?: string | null;
  userEmail?: string | null;
  isAdmin?: boolean;
}): Promise<MessageItem[]> {
  let remoteItems: MessageItem[] = [];

  try {
    const data = await getMessagesFn();
    if (Array.isArray(data)) {
      remoteItems = data as MessageItem[];
    }
  } catch (err) {
    console.warn("[Messages] Neon mesaj okuma uyarısı:", err);
  }

  const localItems = getStoredMessages();
  const map = new Map<string, MessageItem>();
  for (const item of localItems) {
    map.set(item.id, item);
  }
  for (const item of remoteItems) {
    const existing = map.get(item.id);
    map.set(item.id, {
      ...item,
      products: item.products || existing?.products || null,
    });
  }

  let all = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

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
  let remoteReplies: MessageReplyItem[] = [];

  try {
    const data = await getMessageRepliesFn({ data: messageId });
    if (Array.isArray(data)) {
      remoteReplies = data as MessageReplyItem[];
    }
  } catch (err) {
    console.warn("[Messages] Neon yanıt çekme hatası:", err);
  }

  const localReplies = getStoredReplies().filter((r) => r.message_id === messageId);
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
    const saved = await insertMessageReplyFn({ data: payload });
    if (saved) {
      if (payload.from_admin) {
        await updateMessageStatus(payload.message_id, "answered");
      }
      notifyMessageChannel();
      return saved as MessageReplyItem;
    }
  } catch (err) {
    console.warn("[Messages] Neon yanıt ekleme hatası:", err);
  }

  // Fallback to local
  const currentReplies = getStoredReplies();
  saveStoredReplies([...currentReplies.filter((r) => r.id !== newReply.id), newReply]);

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
    await updateMessageStatusFn({ data: { id: messageId, status } });
  } catch (err) {
    console.warn("[Messages] Neon durum güncelleme hatası:", err);
  }

  const current = getStoredMessages();
  const updated = current.map((m) => (m.id === messageId ? { ...m, status, updated_at: new Date().toISOString() } : m));
  saveStoredMessages(updated);
}

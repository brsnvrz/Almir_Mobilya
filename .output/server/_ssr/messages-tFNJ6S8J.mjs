import { t as supabase } from "./client-DxLTTzyN.mjs";
import { t as BroadcastChannel } from "../_libs/unenv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/messages-tFNJ6S8J.js
var LOCAL_MESSAGES_KEY = "almir_local_messages";
var LOCAL_REPLIES_KEY = "almir_local_message_replies";
function generateUUID() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
function getStoredMessages() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function saveStoredMessages(items) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(items));
		notifyMessageChannel();
	} catch {}
}
function getStoredReplies() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(LOCAL_REPLIES_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function saveStoredReplies(items) {
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
			bc.postMessage({
				type: "changed",
				timestamp: Date.now()
			});
			bc.close();
		}
	} catch {}
}
/**
* Mesaj oluşturma: Öncelikle Supabase'e yazmayı dener.
* Eğer RLS politikası (401 / code 42501) engellerse, güvenli yerel depolamaya yazar ve akışı kesmez.
*/
async function insertMessage(payload) {
	const localId = generateUUID();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const newMsg = {
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
		products: payload.product ?? null
	};
	try {
		const { data, error } = await supabase.from("messages").insert({
			user_id: payload.user_id,
			user_email: payload.user_email ?? null,
			user_name: payload.user_name ?? null,
			subject: payload.subject ?? null,
			body: payload.body.trim(),
			product_id: payload.product_id ?? null
		}).select("*, products(id, name, image_url, price, currency)").maybeSingle();
		if (error) {
			console.warn("[Messages] Supabase yazma uyarısı (yerel depolama kullanılacak):", error.message);
			saveStoredMessages([newMsg, ...getStoredMessages().filter((m) => m.id !== newMsg.id)]);
			return newMsg;
		}
		if (data) {
			saveStoredMessages([data, ...getStoredMessages().filter((m) => m.id !== data.id)]);
			return data;
		}
	} catch (err) {
		console.warn("[Messages] Supabase bağlantı hatası (yerel depolama kullanılacak):", err?.message);
	}
	saveStoredMessages([newMsg, ...getStoredMessages().filter((m) => m.id !== newMsg.id)]);
	return newMsg;
}
/**
* Mesajları listeleme: Supabase'den çekilenler ile yerel depolamadaki mesajları birleştirir.
*/
async function getMessages(options) {
	const localItems = getStoredMessages();
	let remoteItems = [];
	try {
		const { data, error } = await supabase.from("messages").select("*, products(id, name, image_url, price, currency)").order("created_at", { ascending: false });
		if (!error && Array.isArray(data)) remoteItems = data;
	} catch (err) {
		console.warn("[Messages] Supabase mesaj okuma uyarısı:", err);
	}
	const map = /* @__PURE__ */ new Map();
	for (const item of localItems) map.set(item.id, item);
	for (const item of remoteItems) {
		const existing = map.get(item.id);
		map.set(item.id, {
			...item,
			products: item.products || existing?.products || null
		});
	}
	let all = Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
async function getMessageReplies(messageId) {
	const localReplies = getStoredReplies().filter((r) => r.message_id === messageId);
	let remoteReplies = [];
	try {
		const { data, error } = await supabase.from("message_replies").select("*").eq("message_id", messageId).order("created_at");
		if (!error && Array.isArray(data)) remoteReplies = data;
	} catch {}
	const map = /* @__PURE__ */ new Map();
	for (const r of localReplies) map.set(r.id, r);
	for (const r of remoteReplies) map.set(r.id, r);
	return Array.from(map.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}
/**
* Yanıt ekleme
*/
async function insertMessageReply(payload) {
	const newReply = {
		id: generateUUID(),
		message_id: payload.message_id,
		author_id: payload.author_id,
		author_name: payload.author_name ?? null,
		from_admin: payload.from_admin,
		body: payload.body.trim(),
		created_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	try {
		const { data, error } = await supabase.from("message_replies").insert({
			message_id: payload.message_id,
			author_id: payload.author_id,
			author_name: payload.author_name ?? null,
			from_admin: payload.from_admin,
			body: payload.body.trim()
		}).select().maybeSingle();
		if (!error && data) {
			saveStoredReplies([...getStoredReplies().filter((r) => r.id !== data.id), data]);
			return data;
		}
	} catch {}
	saveStoredReplies([...getStoredReplies().filter((r) => r.id !== newReply.id), newReply]);
	if (payload.from_admin) await updateMessageStatus(payload.message_id, "answered");
	return newReply;
}
/**
* Mesaj durumu güncelleme ('open' | 'answered')
*/
async function updateMessageStatus(messageId, status) {
	try {
		await supabase.from("messages").update({ status }).eq("id", messageId);
	} catch {}
	saveStoredMessages(getStoredMessages().map((m) => m.id === messageId ? {
		...m,
		status,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	} : m));
}
//#endregion
export { updateMessageStatus as a, insertMessageReply as i, getMessages as n, insertMessage as r, getMessageReplies as t };

import { t as supabase } from "./client-DxLTTzyN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-C46Q34UE.js
var STORAGE_CATEGORIES_KEY = "almir_custom_categories";
var STORAGE_SUBCATEGORIES_KEY = "almir_custom_subcategories";
var STORAGE_PRODUCTS_KEY = "almir_custom_products";
var STORAGE_DELETED_KEY = "almir_deleted_ids";
function generateUUID() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
function getStored(key) {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}
function setStored(key, items) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(items));
		window.dispatchEvent(new CustomEvent("almir-catalog-changed"));
	} catch {}
}
function getDeletedIds() {
	return new Set(getStored(STORAGE_DELETED_KEY));
}
function addDeletedId(id) {
	const current = getStored(STORAGE_DELETED_KEY);
	if (!current.includes(id)) setStored(STORAGE_DELETED_KEY, [...current, id]);
}
/**
* Tüm ana ve alt kategorileri getirir (Supabase + Yerel eklemeler)
*/
async function getFullCategories() {
	const deletedIds = getDeletedIds();
	const localCats = getStored(STORAGE_CATEGORIES_KEY).filter((c) => !deletedIds.has(c.id));
	const localSubs = getStored(STORAGE_SUBCATEGORIES_KEY).filter((s) => !deletedIds.has(s.id));
	let remoteCats = [];
	try {
		const { data, error } = await supabase.from("categories").select("*, subcategories(*)").order("sort_order");
		if (!error && Array.isArray(data)) remoteCats = data.filter((c) => !deletedIds.has(c.id));
	} catch (err) {
		console.warn("[Catalog] Supabase kategoriler çekilirken hata:", err);
	}
	const catMap = /* @__PURE__ */ new Map();
	for (const c of remoteCats) {
		const activeSubs = (c.subcategories || []).filter((s) => !deletedIds.has(s.id));
		catMap.set(c.id, {
			...c,
			subcategories: activeSubs
		});
	}
	for (const c of localCats) {
		const existingSubs = catMap.get(c.id)?.subcategories || [];
		catMap.set(c.id, {
			...c,
			subcategories: existingSubs
		});
	}
	for (const s of localSubs) {
		const cat = catMap.get(s.category_id);
		if (cat) {
			const subs = cat.subcategories || [];
			if (!subs.some((item) => item.id === s.id)) cat.subcategories = [...subs, s];
		}
	}
	return Array.from(catMap.values()).sort((a, b) => a.sort_order - b.sort_order);
}
/**
* Ana kategori ekleme
*/
async function createCategory(payload) {
	const id = generateUUID();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const newCat = {
		id,
		name: payload.name.trim(),
		slug: payload.slug.trim(),
		description: payload.description || null,
		image_url: payload.image_url || null,
		sort_order: payload.sort_order ?? 99,
		created_at: now,
		updated_at: now,
		subcategories: []
	};
	try {
		const { data, error } = await supabase.from("categories").insert({
			name: newCat.name,
			slug: newCat.slug,
			description: newCat.description,
			image_url: newCat.image_url,
			sort_order: newCat.sort_order
		}).select().maybeSingle();
		if (error) {
			console.warn("[Catalog] Supabase kategori ekleme RLS uyarısı, yerel kaydediliyor:", error.message);
			setStored(STORAGE_CATEGORIES_KEY, [...getStored(STORAGE_CATEGORIES_KEY).filter((c) => c.id !== newCat.id), newCat]);
			return newCat;
		}
		if (data) {
			setStored(STORAGE_CATEGORIES_KEY, [...getStored(STORAGE_CATEGORIES_KEY).filter((c) => c.id !== data.id), data]);
			return data;
		}
	} catch {}
	setStored(STORAGE_CATEGORIES_KEY, [...getStored(STORAGE_CATEGORIES_KEY).filter((c) => c.id !== newCat.id), newCat]);
	return newCat;
}
/**
* Ana kategori silme
*/
async function removeCategory(id) {
	try {
		await supabase.from("categories").delete().eq("id", id);
	} catch {}
	addDeletedId(id);
	setStored(STORAGE_CATEGORIES_KEY, getStored(STORAGE_CATEGORIES_KEY).filter((c) => c.id !== id));
}
/**
* Alt kategori ekleme
*/
async function createSubcategory(payload) {
	const id = generateUUID();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const newSub = {
		id,
		category_id: payload.category_id,
		name: payload.name.trim(),
		slug: payload.slug.trim(),
		description: payload.description || null,
		image_url: payload.image_url || null,
		sort_order: payload.sort_order ?? 99,
		created_at: now,
		updated_at: now
	};
	try {
		const { data, error } = await supabase.from("subcategories").insert({
			category_id: newSub.category_id,
			name: newSub.name,
			slug: newSub.slug,
			description: newSub.description,
			image_url: newSub.image_url,
			sort_order: newSub.sort_order
		}).select().maybeSingle();
		if (error) {
			console.warn("[Catalog] Supabase alt kategori ekleme RLS uyarısı, yerel kaydediliyor:", error.message);
			setStored(STORAGE_SUBCATEGORIES_KEY, [...getStored(STORAGE_SUBCATEGORIES_KEY).filter((s) => s.id !== newSub.id), newSub]);
			return newSub;
		}
		if (data) {
			setStored(STORAGE_SUBCATEGORIES_KEY, [...getStored(STORAGE_SUBCATEGORIES_KEY).filter((s) => s.id !== data.id), data]);
			return data;
		}
	} catch {}
	setStored(STORAGE_SUBCATEGORIES_KEY, [...getStored(STORAGE_SUBCATEGORIES_KEY).filter((s) => s.id !== newSub.id), newSub]);
	return newSub;
}
/**
* Alt kategori silme
*/
async function removeSubcategory(id) {
	try {
		await supabase.from("subcategories").delete().eq("id", id);
	} catch {}
	addDeletedId(id);
	setStored(STORAGE_SUBCATEGORIES_KEY, getStored(STORAGE_SUBCATEGORIES_KEY).filter((s) => s.id !== id));
}
/**
* Tüm ürünleri getirir (Supabase + Yerel)
*/
async function getAllProducts() {
	const deletedIds = getDeletedIds();
	const localProds = getStored(STORAGE_PRODUCTS_KEY).filter((p) => !deletedIds.has(p.id));
	let remoteProds = [];
	try {
		const { data, error } = await supabase.from("products").select("*, subcategories(*)").order("created_at", { ascending: false });
		if (!error && Array.isArray(data)) remoteProds = data.filter((p) => !deletedIds.has(p.id));
	} catch {}
	const map = /* @__PURE__ */ new Map();
	for (const p of remoteProds) map.set(p.id, p);
	for (const p of localProds) map.set(p.id, p);
	return Array.from(map.values());
}
/**
* Ürün ekleme veya güncelleme
*/
async function saveProduct(row, id) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const prodId = id || generateUUID();
	const productItem = {
		...row,
		id: prodId,
		materials: Array.isArray(row.materials) ? row.materials : [],
		gallery: Array.isArray(row.gallery) ? row.gallery : [],
		extra_specs: row.extra_specs || {},
		created_at: now,
		updated_at: now
	};
	try {
		if (id) {
			const { data, error } = await supabase.from("products").update(row).eq("id", id).select("*, subcategories(*)").maybeSingle();
			if (!error && data) {
				setStored(STORAGE_PRODUCTS_KEY, [...getStored(STORAGE_PRODUCTS_KEY).filter((p) => p.id !== id), data]);
				return data;
			}
		} else {
			const { data, error } = await supabase.from("products").insert(row).select("*, subcategories(*)").maybeSingle();
			if (!error && data) {
				setStored(STORAGE_PRODUCTS_KEY, [...getStored(STORAGE_PRODUCTS_KEY).filter((p) => p.id !== data.id), data]);
				return data;
			}
		}
	} catch {}
	setStored(STORAGE_PRODUCTS_KEY, [...getStored(STORAGE_PRODUCTS_KEY).filter((p) => p.id !== prodId), productItem]);
	return productItem;
}
/**
* Ürün silme
*/
async function removeProduct(id) {
	try {
		await supabase.from("products").delete().eq("id", id);
	} catch {}
	addDeletedId(id);
	setStored(STORAGE_PRODUCTS_KEY, getStored(STORAGE_PRODUCTS_KEY).filter((p) => p.id !== id));
}
/**
* Kategori sayfası verisini getirir
*/
async function getCategoryPageData(categorySlug) {
	const cat = (await getFullCategories()).find((c) => c.slug === categorySlug);
	if (!cat) return null;
	const subs = cat.subcategories || [];
	const subIds = new Set(subs.map((s) => s.id));
	return {
		cat,
		subs,
		products: (await getAllProducts()).filter((p) => subIds.has(p.subcategory_id))
	};
}
//#endregion
export { getFullCategories as a, removeSubcategory as c, getCategoryPageData as i, saveProduct as l, createSubcategory as n, removeCategory as o, getAllProducts as r, removeProduct as s, createCategory as t };

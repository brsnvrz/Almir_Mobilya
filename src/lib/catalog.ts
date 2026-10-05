import {
  getFullCategoriesFn,
  getAllProductsFn,
  getProductByIdOrSlugFn,
  saveProductFn,
  removeProductFn,
  saveCategoryFn,
  removeCategoryFn,
  saveSubcategoryFn,
  removeSubcategoryFn,
} from "./server-catalog";

export type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  slideshow_enabled?: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  subcategories?: SubcategoryItem[];
};

export type SubcategoryItem = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  categories?: CategoryItem;
};

export type ProductItem = {
  id: string;
  subcategory_id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  materials: string[];
  width_cm: string | null;
  height_cm: string | null;
  depth_cm: string | null;
  weight: string | null;
  warranty: string | null;
  delivery_time: string | null;
  production_place: string | null;
  price: number | null;
  currency: string;
  image_url: string | null;
  gallery: string[];
  extra_specs: Record<string, any>;
  sort_order: number;
  created_at: string;
  updated_at: string;
  subcategories?: SubcategoryItem;
};

const STORAGE_CATEGORIES_KEY = "almir_custom_categories";
const STORAGE_SUBCATEGORIES_KEY = "almir_custom_subcategories";
const STORAGE_PRODUCTS_KEY = "almir_custom_products";
const STORAGE_DELETED_KEY = "almir_deleted_ids";

function getStored<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function setStored<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("almir-catalog-changed"));
  } catch {}
}

function getDeletedIds(): Set<string> {
  return new Set(getStored<string>(STORAGE_DELETED_KEY));
}

function addDeletedId(id: string) {
  const current = getStored<string>(STORAGE_DELETED_KEY);
  if (!current.includes(id)) {
    setStored(STORAGE_DELETED_KEY, [...current, id]);
  }
}

function notifyCatalogChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("almir-catalog-changed"));
  }
}

/**
 * Tüm ana ve alt kategorileri getirir (Neon PostgreSQL)
 */
export async function getFullCategories(): Promise<CategoryItem[]> {
  try {
    const data = await getFullCategoriesFn();
    if (Array.isArray(data) && data.length > 0) {
      return data as CategoryItem[];
    }
  } catch (err) {
    console.warn("[Catalog] Neon kategoriler çekilirken hata:", err);
  }

  // Fallback to local storage if network error
  const deletedIds = getDeletedIds();
  return getStored<CategoryItem>(STORAGE_CATEGORIES_KEY).filter((c) => !deletedIds.has(c.id));
}

/**
 * Ana kategori ekleme
 */
export async function createCategory(payload: {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  slideshow_enabled?: boolean;
  sort_order?: number;
}): Promise<CategoryItem> {
  try {
    const saved = await saveCategoryFn({ data: payload });
    notifyCatalogChanged();
    return saved as CategoryItem;
  } catch (err) {
    console.error("[Catalog] Kategori kaydedilemedi:", err);
    throw err;
  }
}

/**
 * Ana kategori silme
 */
export async function removeCategory(id: string) {
  try {
    await removeCategoryFn({ data: id });
  } catch (err) {
    console.warn("[Catalog] Kategori Neon'dan silinemedi:", err);
  }

  addDeletedId(id);
  const current = getStored<CategoryItem>(STORAGE_CATEGORIES_KEY);
  setStored(STORAGE_CATEGORIES_KEY, current.filter((c) => c.id !== id));
  notifyCatalogChanged();
}

/**
 * Alt kategori ekleme
 */
export async function createSubcategory(payload: {
  id?: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
}): Promise<SubcategoryItem> {
  try {
    const saved = await saveSubcategoryFn({ data: payload });
    notifyCatalogChanged();
    return saved as SubcategoryItem;
  } catch (err) {
    console.error("[Catalog] Alt kategori kaydedilemedi:", err);
    throw err;
  }
}

/**
 * Alt kategori silme
 */
export async function removeSubcategory(id: string) {
  try {
    await removeSubcategoryFn({ data: id });
  } catch (err) {
    console.warn("[Catalog] Alt kategori Neon'dan silinemedi:", err);
  }

  addDeletedId(id);
  const current = getStored<SubcategoryItem>(STORAGE_SUBCATEGORIES_KEY);
  setStored(STORAGE_SUBCATEGORIES_KEY, current.filter((s) => s.id !== id));
  notifyCatalogChanged();
}

/**
 * Tüm ürünleri getirir (Neon PostgreSQL)
 */
export async function getAllProducts(): Promise<ProductItem[]> {
  try {
    const remoteProds = await getAllProductsFn();
    if (Array.isArray(remoteProds)) {
      return remoteProds as ProductItem[];
    }
  } catch (err) {
    console.warn("[Catalog] Ürünler Neon veritabanından çekilemedi:", err);
  }

  const deletedIds = getDeletedIds();
  return getStored<ProductItem>(STORAGE_PRODUCTS_KEY).filter((p) => !deletedIds.has(p.id));
}

/**
 * Ürün detay sayfası: id veya slug ile veritabanında arar.
 */
export async function getProductByIdOrSlug(productId: string): Promise<ProductItem | null> {
  const key = decodeURIComponent(productId).trim();
  if (!key) return null;

  try {
    const item = await getProductByIdOrSlugFn({ data: key });
    if (item) {
      return item as ProductItem;
    }
  } catch (err) {
    console.warn("[Catalog] Ürün detayı veritabanından alınamadı:", err);
  }

  const deletedIds = getDeletedIds();
  if (deletedIds.has(key)) return null;

  const localProds = getStored<ProductItem>(STORAGE_PRODUCTS_KEY).filter((p) => !deletedIds.has(p.id));
  return (
    localProds.find((p) => p.id === key) ||
    localProds.find((p) => p.slug === key) ||
    null
  );
}

/**
 * Ürün ekleme veya güncelleme (Neon PostgreSQL)
 */
export async function saveProduct(row: any, id?: string): Promise<ProductItem> {
  const payload = { ...row, ...(id ? { id } : {}) };

  try {
    const saved = await saveProductFn({ data: payload });
    notifyCatalogChanged();
    return saved as ProductItem;
  } catch (err) {
    console.error("[Catalog] Ürün Neon veritabanına kaydedilemedi:", err);
    throw err;
  }
}

/**
 * Ürün silme
 */
export async function removeProduct(id: string) {
  try {
    await removeProductFn({ data: id });
  } catch (err) {
    console.warn("[Catalog] Ürün Neon'dan silinemedi:", err);
  }

  addDeletedId(id);
  const current = getStored<ProductItem>(STORAGE_PRODUCTS_KEY);
  setStored(STORAGE_PRODUCTS_KEY, current.filter((p) => p.id !== id));
  notifyCatalogChanged();
}

/**
 * Kategori sayfası verisini getirir
 */
export async function getCategoryPageData(categorySlug: string) {
  const allCats = await getFullCategories();
  const cat = allCats.find((c) => c.slug === categorySlug);
  if (!cat) return null;

  const subs = cat.subcategories || [];
  const subIds = new Set(subs.map((s) => s.id));

  const allProds = await getAllProducts();
  const products = allProds.filter((p) => subIds.has(p.subcategory_id));

  return { cat, subs, products };
}

/**
 * Alt kategori / katalog sayfası verisini getirir
 */
export async function getCatalogPageData(categorySlug: string, subcategorySlug: string) {
  const allCats = await getFullCategories();
  const cat = allCats.find((c) => c.slug === categorySlug);
  if (!cat) return null;

  const subs = cat.subcategories || [];
  const sub = subs.find((s) => s.slug === subcategorySlug);
  if (!sub) return null;

  const allProds = await getAllProducts();
  const products = allProds.filter((p) => p.subcategory_id === sub.id);

  return { cat, sub, products };
}

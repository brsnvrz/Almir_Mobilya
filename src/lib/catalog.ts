import { supabase } from "@/integrations/supabase/client";

export type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
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

/**
 * Tüm ana ve alt kategorileri getirir (Supabase + Yerel eklemeler)
 */
export async function getFullCategories(): Promise<CategoryItem[]> {
  const deletedIds = getDeletedIds();
  const localCats = getStored<CategoryItem>(STORAGE_CATEGORIES_KEY).filter((c) => !deletedIds.has(c.id));
  const localSubs = getStored<SubcategoryItem>(STORAGE_SUBCATEGORIES_KEY).filter((s) => !deletedIds.has(s.id));

  let remoteCats: CategoryItem[] = [];
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*, subcategories(*)")
      .order("sort_order");

    if (!error && Array.isArray(data)) {
      remoteCats = (data as CategoryItem[]).filter((c) => !deletedIds.has(c.id));
    }
  } catch (err) {
    console.warn("[Catalog] Supabase kategoriler çekilirken hata:", err);
  }

  // Birleştir
  const catMap = new Map<string, CategoryItem>();
  for (const c of remoteCats) {
    const activeSubs = (c.subcategories || []).filter((s) => !deletedIds.has(s.id));
    catMap.set(c.id, { ...c, subcategories: activeSubs });
  }
  for (const c of localCats) {
    const existing = catMap.get(c.id);
    const existingSubs = existing?.subcategories || [];
    catMap.set(c.id, {
      ...c,
      subcategories: existingSubs,
    });
  }

  // Yerel alt kategorileri ilgili ana kategorilere iliştir
  for (const s of localSubs) {
    const cat = catMap.get(s.category_id);
    if (cat) {
      const subs = cat.subcategories || [];
      if (!subs.some((item) => item.id === s.id)) {
        cat.subcategories = [...subs, s];
      }
    }
  }

  return Array.from(catMap.values()).sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Ana kategori ekleme
 */
export async function createCategory(payload: {
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
}): Promise<CategoryItem> {
  const id = generateUUID();
  const now = new Date().toISOString();
  const newCat: CategoryItem = {
    id,
    name: payload.name.trim(),
    slug: payload.slug.trim(),
    description: payload.description || null,
    image_url: payload.image_url || null,
    sort_order: payload.sort_order ?? 99,
    created_at: now,
    updated_at: now,
    subcategories: [],
  };

  try {
    const { data, error } = await supabase.from("categories").insert({
      name: newCat.name,
      slug: newCat.slug,
      description: newCat.description,
      image_url: newCat.image_url,
      sort_order: newCat.sort_order,
    }).select().maybeSingle();

    if (error) {
      console.warn("[Catalog] Supabase kategori ekleme RLS uyarısı, yerel kaydediliyor:", error.message);
      const current = getStored<CategoryItem>(STORAGE_CATEGORIES_KEY);
      setStored(STORAGE_CATEGORIES_KEY, [...current.filter((c) => c.id !== newCat.id), newCat]);
      return newCat;
    }
    if (data) {
      const current = getStored<CategoryItem>(STORAGE_CATEGORIES_KEY);
      setStored(STORAGE_CATEGORIES_KEY, [...current.filter((c) => c.id !== (data as any).id), data as CategoryItem]);
      return data as CategoryItem;
    }
  } catch {}

  const current = getStored<CategoryItem>(STORAGE_CATEGORIES_KEY);
  setStored(STORAGE_CATEGORIES_KEY, [...current.filter((c) => c.id !== newCat.id), newCat]);
  return newCat;
}

/**
 * Ana kategori silme
 */
export async function removeCategory(id: string) {
  try {
    await supabase.from("categories").delete().eq("id", id);
  } catch {}

  addDeletedId(id);
  const current = getStored<CategoryItem>(STORAGE_CATEGORIES_KEY);
  setStored(STORAGE_CATEGORIES_KEY, current.filter((c) => c.id !== id));
}

/**
 * Alt kategori ekleme
 */
export async function createSubcategory(payload: {
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
}): Promise<SubcategoryItem> {
  const id = generateUUID();
  const now = new Date().toISOString();
  const newSub: SubcategoryItem = {
    id,
    category_id: payload.category_id,
    name: payload.name.trim(),
    slug: payload.slug.trim(),
    description: payload.description || null,
    image_url: payload.image_url || null,
    sort_order: payload.sort_order ?? 99,
    created_at: now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabase.from("subcategories").insert({
      category_id: newSub.category_id,
      name: newSub.name,
      slug: newSub.slug,
      description: newSub.description,
      image_url: newSub.image_url,
      sort_order: newSub.sort_order,
    }).select().maybeSingle();

    if (error) {
      console.warn("[Catalog] Supabase alt kategori ekleme RLS uyarısı, yerel kaydediliyor:", error.message);
      const current = getStored<SubcategoryItem>(STORAGE_SUBCATEGORIES_KEY);
      setStored(STORAGE_SUBCATEGORIES_KEY, [...current.filter((s) => s.id !== newSub.id), newSub]);
      return newSub;
    }
    if (data) {
      const current = getStored<SubcategoryItem>(STORAGE_SUBCATEGORIES_KEY);
      setStored(STORAGE_SUBCATEGORIES_KEY, [...current.filter((s) => s.id !== (data as any).id), data as SubcategoryItem]);
      return data as SubcategoryItem;
    }
  } catch {}

  const current = getStored<SubcategoryItem>(STORAGE_SUBCATEGORIES_KEY);
  setStored(STORAGE_SUBCATEGORIES_KEY, [...current.filter((s) => s.id !== newSub.id), newSub]);
  return newSub;
}

/**
 * Alt kategori silme
 */
export async function removeSubcategory(id: string) {
  try {
    await supabase.from("subcategories").delete().eq("id", id);
  } catch {}

  addDeletedId(id);
  const current = getStored<SubcategoryItem>(STORAGE_SUBCATEGORIES_KEY);
  setStored(STORAGE_SUBCATEGORIES_KEY, current.filter((s) => s.id !== id));
}

/**
 * Tüm ürünleri getirir (Supabase + Yerel)
 */
export async function getAllProducts(): Promise<ProductItem[]> {
  const deletedIds = getDeletedIds();
  const localProds = getStored<ProductItem>(STORAGE_PRODUCTS_KEY).filter((p) => !deletedIds.has(p.id));

  let remoteProds: ProductItem[] = [];
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, subcategories(*)")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      remoteProds = (data as ProductItem[]).filter((p) => !deletedIds.has(p.id));
    }
  } catch {}

  const map = new Map<string, ProductItem>();
  for (const p of remoteProds) {
    map.set(p.id, p);
  }
  for (const p of localProds) {
    map.set(p.id, p);
  }

  return Array.from(map.values());
}

/**
 * Ürün detay sayfası: id veya slug ile hem veritabanı hem yerel kayıtlarda arar.
 */
export async function getProductByIdOrSlug(productId: string): Promise<ProductItem | null> {
  const key = decodeURIComponent(productId).trim();
  if (!key) return null;

  const deletedIds = getDeletedIds();
  if (deletedIds.has(key)) return null;

  let remote: ProductItem | null = null;
  try {
    const byId = await supabase
      .from("products")
      .select("*, subcategories(*, categories(*))")
      .eq("id", key)
      .maybeSingle();

    if (!byId.error && byId.data) {
      remote = byId.data as ProductItem;
    } else {
      const bySlug = await supabase
        .from("products")
        .select("*, subcategories(*, categories(*))")
        .eq("slug", key)
        .maybeSingle();
      if (!bySlug.error && bySlug.data) {
        remote = bySlug.data as ProductItem;
      }
    }
  } catch (err) {
    console.warn("[Catalog] Ürün detayı veritabanından alınamadı:", err);
  }

  const localProds = getStored<ProductItem>(STORAGE_PRODUCTS_KEY).filter((p) => !deletedIds.has(p.id));
  const local =
    localProds.find((p) => p.id === key) ||
    localProds.find((p) => p.slug === key) ||
    null;

  const product = remote ?? local;
  if (!product) return null;

  if (!product.subcategories) {
    const cats = await getFullCategories();
    for (const cat of cats) {
      const sub = (cat.subcategories || []).find((s) => s.id === product.subcategory_id);
      if (sub) {
        product.subcategories = { ...sub, categories: cat };
        break;
      }
    }
  }

  return product;
}

/**
 * Ürün ekleme veya güncelleme
 */
export async function saveProduct(row: any, id?: string): Promise<ProductItem> {
  const now = new Date().toISOString();
  const prodId = id || generateUUID();
  const payload = { ...row, id: prodId };

  const productItem: ProductItem = {
    ...payload,
    id: prodId,
    materials: Array.isArray(row.materials) ? row.materials : [],
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    extra_specs: row.extra_specs || {},
    created_at: now,
    updated_at: now,
  };

  try {
    const query = id
      ? supabase.from("products").update(row).eq("id", id)
      : supabase.from("products").insert(payload);

    const { data, error } = await query.select("*, subcategories(*)").maybeSingle();

    if (error) {
      console.warn("[Catalog] Supabase ürün kaydı uyarısı, yerel kaydediliyor:", error.message);
    } else if (data) {
      const saved = data as ProductItem;
      const current = getStored<ProductItem>(STORAGE_PRODUCTS_KEY);
      setStored(STORAGE_PRODUCTS_KEY, [...current.filter((p) => p.id !== saved.id && p.id !== prodId), saved]);
      return saved;
    }
  } catch (err) {
    console.warn("[Catalog] Ürün kaydı veritabanına yazılamadı, yerel kaydediliyor:", err);
  }

  const current = getStored<ProductItem>(STORAGE_PRODUCTS_KEY);
  setStored(STORAGE_PRODUCTS_KEY, [...current.filter((p) => p.id !== prodId), productItem]);
  return productItem;
}

/**
 * Ürün silme
 */
export async function removeProduct(id: string) {
  try {
    await supabase.from("products").delete().eq("id", id);
  } catch {}

  addDeletedId(id);
  const current = getStored<ProductItem>(STORAGE_PRODUCTS_KEY);
  setStored(STORAGE_PRODUCTS_KEY, current.filter((p) => p.id !== id));
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

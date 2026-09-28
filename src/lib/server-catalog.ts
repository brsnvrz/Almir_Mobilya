import { createServerFn } from "@tanstack/react-start";
import { getSql } from "./neon";

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  subcategories?: SubcategoryRow[];
};

export type SubcategoryRow = {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  categories?: CategoryRow;
};

export type ProductRow = {
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
  subcategories?: SubcategoryRow;
};

export const getFullCategoriesFn = createServerFn({ method: "GET" }).handler(async () => {
  const sql = getSql();
  const cats = (await sql`
    SELECT id, slug, name, description, image_url, sort_order, created_at, updated_at
    FROM categories
    ORDER BY sort_order ASC, created_at ASC
  `) as CategoryRow[];

  const subs = (await sql`
    SELECT id, category_id, slug, name, description, image_url, sort_order, created_at, updated_at
    FROM subcategories
    ORDER BY sort_order ASC, created_at ASC
  `) as SubcategoryRow[];

  const subMap = new Map<string, SubcategoryRow[]>();
  for (const s of subs) {
    if (!subMap.has(s.category_id)) subMap.set(s.category_id, []);
    subMap.get(s.category_id)!.push(s);
  }

  return cats.map((c) => ({
    ...c,
    subcategories: subMap.get(c.id) || [],
  }));
});

export const getAllProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  const sql = getSql();
  const prods = (await sql`
    SELECT 
      p.id, p.subcategory_id, p.slug, p.name, p.summary, p.description,
      p.materials, p.width_cm, p.height_cm, p.depth_cm, p.weight,
      p.warranty, p.delivery_time, p.production_place, p.extra_specs,
      p.price, p.currency, p.image_url, p.gallery, p.sort_order,
      p.created_at, p.updated_at,
      row_to_json(s.*) as subcategories
    FROM products p
    LEFT JOIN subcategories s ON s.id = p.subcategory_id
    ORDER BY p.sort_order ASC, p.created_at DESC
  `) as ProductRow[];

  return prods.map((p) => ({
    ...p,
    materials: Array.isArray(p.materials) ? p.materials : [],
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    extra_specs: p.extra_specs || {},
  }));
});

export const getProductByIdOrSlugFn = createServerFn({ method: "GET" })
  .validator((key: string) => key)
  .handler(async ({ data: key }) => {
    if (!key) return null;
    const sql = getSql();
    const rows = (await sql`
      SELECT 
        p.id, p.subcategory_id, p.slug, p.name, p.summary, p.description,
        p.materials, p.width_cm, p.height_cm, p.depth_cm, p.weight,
        p.warranty, p.delivery_time, p.production_place, p.extra_specs,
        p.price, p.currency, p.image_url, p.gallery, p.sort_order,
        p.created_at, p.updated_at,
        json_build_object(
          'id', s.id,
          'category_id', s.category_id,
          'slug', s.slug,
          'name', s.name,
          'description', s.description,
          'image_url', s.image_url,
          'sort_order', s.sort_order,
          'created_at', s.created_at,
          'updated_at', s.updated_at,
          'categories', json_build_object(
            'id', c.id,
            'slug', c.slug,
            'name', c.name
          )
        ) as subcategories
      FROM products p
      LEFT JOIN subcategories s ON s.id = p.subcategory_id
      LEFT JOIN categories c ON c.id = s.category_id
      WHERE p.id::text = ${key} OR p.slug = ${key}
      LIMIT 1
    `) as ProductRow[];

    if (!rows || rows.length === 0) return null;
    const p = rows[0];
    return {
      ...p,
      materials: Array.isArray(p.materials) ? p.materials : [],
      gallery: Array.isArray(p.gallery) ? p.gallery : [],
      extra_specs: p.extra_specs || {},
    };
  });

export const saveProductFn = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data }) => {
    const sql = getSql();
    const {
      id,
      subcategory_id,
      slug,
      name,
      summary,
      description,
      materials,
      width_cm,
      height_cm,
      depth_cm,
      weight,
      warranty,
      delivery_time,
      production_place,
      extra_specs,
      price,
      currency = "TRY",
      image_url,
      gallery,
      sort_order = 0,
    } = data;

    const mats = Array.isArray(materials) ? materials : [];
    const gals = Array.isArray(gallery) ? gallery : [];
    const specs = JSON.stringify(extra_specs || {});

    let result: ProductRow[];

    if (id) {
      result = (await sql`
        INSERT INTO products (
          id, subcategory_id, slug, name, summary, description,
          materials, width_cm, height_cm, depth_cm, weight,
          warranty, delivery_time, production_place, extra_specs,
          price, currency, image_url, gallery, sort_order, updated_at
        ) VALUES (
          ${id}::uuid, ${subcategory_id}::uuid, ${slug}, ${name}, ${summary || null}, ${description || null},
          ${mats}, ${width_cm || null}, ${height_cm || null}, ${depth_cm || null}, ${weight || null},
          ${warranty || null}, ${delivery_time || null}, ${production_place || null}, ${specs}::jsonb,
          ${price ?? null}, ${currency}, ${image_url || null}, ${gals}, ${sort_order}, now()
        )
        ON CONFLICT (id) DO UPDATE SET
          subcategory_id = EXCLUDED.subcategory_id,
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          summary = EXCLUDED.summary,
          description = EXCLUDED.description,
          materials = EXCLUDED.materials,
          width_cm = EXCLUDED.width_cm,
          height_cm = EXCLUDED.height_cm,
          depth_cm = EXCLUDED.depth_cm,
          weight = EXCLUDED.weight,
          warranty = EXCLUDED.warranty,
          delivery_time = EXCLUDED.delivery_time,
          production_place = EXCLUDED.production_place,
          extra_specs = EXCLUDED.extra_specs,
          price = EXCLUDED.price,
          currency = EXCLUDED.currency,
          image_url = EXCLUDED.image_url,
          gallery = EXCLUDED.gallery,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()
        RETURNING *
      `) as ProductRow[];
    } else {
      result = (await sql`
        INSERT INTO products (
          subcategory_id, slug, name, summary, description,
          materials, width_cm, height_cm, depth_cm, weight,
          warranty, delivery_time, production_place, extra_specs,
          price, currency, image_url, gallery, sort_order
        ) VALUES (
          ${subcategory_id}::uuid, ${slug}, ${name}, ${summary || null}, ${description || null},
          ${mats}, ${width_cm || null}, ${height_cm || null}, ${depth_cm || null}, ${weight || null},
          ${warranty || null}, ${delivery_time || null}, ${production_place || null}, ${specs}::jsonb,
          ${price ?? null}, ${currency}, ${image_url || null}, ${gals}, ${sort_order}
        )
        RETURNING *
      `) as ProductRow[];
    }

    const saved = result[0];
    return {
      ...saved,
      materials: Array.isArray(saved.materials) ? saved.materials : [],
      gallery: Array.isArray(saved.gallery) ? saved.gallery : [],
      extra_specs: saved.extra_specs || {},
    };
  });

export const removeProductFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = getSql();
    await sql`DELETE FROM products WHERE id::text = ${id}`;
    return { success: true, id };
  });

export const saveCategoryFn = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data }) => {
    const sql = getSql();
    const { id, name, slug, description, image_url, sort_order = 0 } = data;

    let res: CategoryRow[];
    if (id) {
      res = (await sql`
        INSERT INTO categories (id, name, slug, description, image_url, sort_order, updated_at)
        VALUES (${id}::uuid, ${name}, ${slug}, ${description || null}, ${image_url || null}, ${sort_order}, now())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()
        RETURNING *
      `) as CategoryRow[];
    } else {
      res = (await sql`
        INSERT INTO categories (name, slug, description, image_url, sort_order)
        VALUES (${name}, ${slug}, ${description || null}, ${image_url || null}, ${sort_order})
        RETURNING *
      `) as CategoryRow[];
    }
    return res[0];
  });

export const removeCategoryFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = getSql();
    await sql`DELETE FROM categories WHERE id::text = ${id}`;
    return { success: true, id };
  });

export const saveSubcategoryFn = createServerFn({ method: "POST" })
  .validator((payload: any) => payload)
  .handler(async ({ data }) => {
    const sql = getSql();
    const { id, category_id, name, slug, description, image_url, sort_order = 0 } = data;

    let res: SubcategoryRow[];
    if (id) {
      res = (await sql`
        INSERT INTO subcategories (id, category_id, name, slug, description, image_url, sort_order, updated_at)
        VALUES (${id}::uuid, ${category_id}::uuid, ${name}, ${slug}, ${description || null}, ${image_url || null}, ${sort_order}, now())
        ON CONFLICT (id) DO UPDATE SET
          category_id = EXCLUDED.category_id,
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url,
          sort_order = EXCLUDED.sort_order,
          updated_at = now()
        RETURNING *
      `) as SubcategoryRow[];
    } else {
      res = (await sql`
        INSERT INTO subcategories (category_id, name, slug, description, image_url, sort_order)
        VALUES (${category_id}::uuid, ${name}, ${slug}, ${description || null}, ${image_url || null}, ${sort_order})
        RETURNING *
      `) as SubcategoryRow[];
    }
    return res[0];
  });

export const removeSubcategoryFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = getSql();
    await sql`DELETE FROM subcategories WHERE id::text = ${id}`;
    return { success: true, id };
  });

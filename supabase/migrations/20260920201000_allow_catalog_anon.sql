-- ============ ALLOW CATALOG MANAGEMENT FOR CLIENTS ============
-- Kategoriler, alt kategoriler ve ürünler için istemci tarafında ekleme/düzenleme/silme izinleri tanımlar.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subcategories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;

-- Categories policies
DROP POLICY IF EXISTS "Anon manage categories" ON public.categories;
CREATE POLICY "Anon manage categories" ON public.categories
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Subcategories policies
DROP POLICY IF EXISTS "Anon manage subcategories" ON public.subcategories;
CREATE POLICY "Anon manage subcategories" ON public.subcategories
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- Products policies
DROP POLICY IF EXISTS "Anon manage products" ON public.products;
CREATE POLICY "Anon manage products" ON public.products
  FOR ALL TO anon USING (true) WITH CHECK (true);

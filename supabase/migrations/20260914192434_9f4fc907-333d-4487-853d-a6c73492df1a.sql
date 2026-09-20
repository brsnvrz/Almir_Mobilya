-- ============ ADMIN EMAIL ALLOWLIST ============
CREATE TABLE public.admin_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX admin_emails_email_key ON public.admin_emails (lower(email));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_emails TO authenticated;
GRANT ALL ON public.admin_emails TO service_role;
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_emails (email) VALUES ('nevruzbaris@gmail.com'), ('osmanndemir16@gmail.com');

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(
    nullif(auth.jwt() ->> 'email', ''),
    (SELECT email FROM auth.users WHERE id = auth.uid())
  ));
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails a
    WHERE lower(a.email) = public.current_user_email()
  );
$$;

CREATE POLICY "Admins manage admin emails" ON public.admin_emails
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============ TIMESTAMP HELPER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are public" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ SUBCATEGORIES ============
CREATE TABLE public.subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);
GRANT SELECT ON public.subcategories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subcategories TO authenticated;
GRANT ALL ON public.subcategories TO service_role;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subcategories are public" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admins manage subcategories" ON public.subcategories FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER subcategories_updated_at BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id uuid NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  summary text,
  description text,
  materials text[] NOT NULL DEFAULT '{}',
  width_cm text,
  height_cm text,
  depth_cm text,
  weight text,
  warranty text,
  delivery_time text,
  production_place text,
  extra_specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  price numeric(12,2),
  currency text NOT NULL DEFAULT 'TRY',
  image_url text,
  gallery text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subcategory_id, slug)
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MESSAGES ============
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  user_email text,
  user_name text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  subject text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own messages" ON public.messages FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users create own messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins update messages" ON public.messages FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete messages" ON public.messages FOR DELETE TO authenticated
  USING (public.is_admin());
CREATE TRIGGER messages_updated_at BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ MESSAGE REPLIES ============
CREATE TABLE public.message_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  author_name text,
  from_admin boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_replies TO authenticated;
GRANT ALL ON public.message_replies TO service_role;
ALTER TABLE public.message_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read replies of own messages" ON public.message_replies FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND m.user_id = auth.uid())
  );
CREATE POLICY "Write replies on own messages" ON public.message_replies FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.is_admin()
      OR EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND m.user_id = auth.uid())
    )
  );
CREATE POLICY "Admins delete replies" ON public.message_replies FOR DELETE TO authenticated
  USING (public.is_admin());

-- ============ DEMO CATALOG DATA ============
INSERT INTO public.categories (slug, name, description, sort_order) VALUES
  ('dolap', 'Dolaplar', 'Mutfak dolabı, gardırop, banyo dolabı ve kitaplık çözümleri.', 1),
  ('kapi', 'Kapılar', 'İç mekan, çerçeveli ve masif kapı modelleri.', 2),
  ('parke', 'Parkeler', 'Masif, lamine ve balık sırtı parke uygulamaları.', 3);

INSERT INTO public.subcategories (category_id, slug, name, description, sort_order)
SELECT c.id, v.slug, v.name, v.description, v.sort_order
FROM public.categories c
JOIN (VALUES
  ('dolap', 'mutfak-dolabi', 'Mutfak Dolabı', 'Ölçüye özel üretilen mutfak dolapları.', 1),
  ('dolap', 'gardirop', 'Gardırop', 'Sürgülü ve menteşeli gardırop modelleri.', 2),
  ('dolap', 'banyo-dolabi', 'Banyo Dolabı', 'Suya dayanıklı banyo dolapları.', 3),
  ('dolap', 'kitaplik', 'Kitaplık', 'Ölçüye özel kitaplık ve raf sistemleri.', 4),
  ('kapi', 'ic-mekan-kapisi', 'İç Mekan Kapısı', 'Oda ve banyo kapıları.', 1),
  ('kapi', 'celik-kapi', 'Çelik Kapı', 'Güvenlikli giriş kapıları.', 2),
  ('parke', 'masif-parke', 'Masif Parke', 'Tam masif ahşap parke.', 1),
  ('parke', 'lamine-parke', 'Lamine Parke', 'Dayanıklı lamine parke.', 2)
) AS v(cat_slug, slug, name, description, sort_order) ON v.cat_slug = c.slug;

INSERT INTO public.products (subcategory_id, slug, name, summary, description, materials, width_cm, height_cm, depth_cm, weight, warranty, delivery_time, production_place, extra_specs, price, sort_order)
SELECT s.id, v.slug, v.name, v.summary, v.description, v.materials, v.w, v.h, v.d, v.weight, v.warranty, v.delivery, v.place, v.extra::jsonb, v.price, v.sort_order
FROM public.subcategories s
JOIN (VALUES
  ('mutfak-dolabi', 'mese-mutfak-ust-dolabi', 'Meşe Mutfak Üst Dolabı', 'Masif meşe, 60 cm modül', 'Bilezikli menteşe ve kanallı çekmece rayı. Planlanmış meşe yüzey, su bazlı mat vernik ile korunur.', ARRAY['Masif meşe','Bilezikli menteşe','Su bazlı mat vernik'], '60', '38', '35', '24 kg', '5 yıl', '7-10 gün', 'Bursa atölyesi', '{"Kulp":"Krom","Raf sayısı":"2"}', 8450.00, 1),
  ('mutfak-dolabi', 'kestane-mutfak-dolabi', 'Kestane Mutfak Dolabı', 'Masif gövde, lake kapak', 'Tam boy mutfak kolonu. Ölçüye göre 80-120 cm arası üretilebilir.', ARRAY['Masif meşe gövde','Lake kapak','Krom kulp'], '80-120', '210', '58', '96 kg', '5 yıl gövde, 2 yıl menteşe', '20-25 gün', 'Bursa atölyesi', '{"Raf içi":"32 cm","Çekmece":"52 cm"}', 48900.00, 2),
  ('mutfak-dolabi', 'antrasit-govde-dolap', 'Antrasit Gövde Dolap', 'MDF gövde, saten boya', 'Antrasit saten boyalı, gizli kulplu modern mutfak dolabı.', ARRAY['18 mm MDF','Saten boya','Frenli menteşe'], '100', '210', '60', '105 kg', '5 yıl', '20-25 gün', 'Bursa atölyesi', '{"Kulp":"Gizli","Aydınlatma":"LED"}', 56750.00, 3),
  ('gardirop', 'surgulu-gardirop', 'Sürgülü Gardırop', 'Aynalı sürgü kapak', 'Yumuşak kapanmalı sürgü sistem, içi ölçüye göre bölmelidir.', ARRAY['Melamin gövde','Aynalı sürgü kapak','Alüminyum ray'], '240', '240', '65', '180 kg', '3 yıl', '20-25 gün', 'Bursa atölyesi', '{"Askı boyu":"110 cm","Çekmece":"3 adet"}', 39500.00, 1),
  ('gardirop', 'mese-gardirop', 'Meşe Gardırop', 'Masif meşe menteşeli', 'Doğal meşe desenli, üç kapaklı klasik gardırop.', ARRAY['Masif meşe','Frenli menteşe'], '180', '230', '60', '150 kg', '5 yıl', '20-25 gün', 'Bursa atölyesi', '{"Kapak":"3","Raf":"5"}', 32900.00, 2),
  ('banyo-dolabi', 'suya-dayanikli-banyo-dolabi', 'Suya Dayanıklı Banyo Dolabı', 'Kompakt lamine gövde', 'Nem ve suya dayanıklı kompakt lamine gövde, seramik lavabolu.', ARRAY['Kompakt lamine','Seramik lavabo','Paslanmaz vida'], '80', '60', '45', '38 kg', '3 yıl', '10-14 gün', 'Bursa atölyesi', '{"Lavabo":"Dahil","Ayna":"Opsiyonel"}', 14900.00, 1),
  ('kitaplik', 'mese-kitaplik', 'Meşe Kitaplık', 'Ölçüye özel raf sistemi', 'Duvara sabitlenen, ölçüye özel meşe kitaplık.', ARRAY['Masif meşe','Metal gizli askı'], '200', '220', '32', '85 kg', '5 yıl', '15-20 gün', 'Bursa atölyesi', '{"Raf":"6","Taşıma kapasitesi":"30 kg/raf"}', 21500.00, 1),
  ('ic-mekan-kapisi', 'amerikan-panel-kapi', 'Amerikan Panel Kapı', 'PVC kaplama', 'Hafif, sessiz kapanan iç mekan kapısı; kasa ve pervaz dahil.', ARRAY['Ahşap iskelet','PVC kaplama','Kilit takımı'], '90', '210', '10', '28 kg', '2 yıl', '7-10 gün', 'Bursa atölyesi', '{"Kasa":"Dahil","Renk":"6 seçenek"}', 5400.00, 1),
  ('celik-kapi', 'guvenlikli-celik-kapi', 'Güvenlikli Çelik Kapı', 'Çok noktalı kilit', '9 noktadan kilitlenen, ısı ve ses yalıtımlı çelik daire kapısı.', ARRAY['Galvaniz çelik','Poliüretan dolgu','Çok noktalı kilit'], '100', '210', '12', '95 kg', '5 yıl', '10-14 gün', 'Bursa atölyesi', '{"Kilit":"9 nokta","Yalıtım":"Isı + ses"}', 18750.00, 1),
  ('masif-parke', 'mese-masif-parke', 'Meşe Masif Parke', 'Balık sırtı uygulama', 'Doğal meşe masif parke, balık sırtı veya düz uygulanabilir.', ARRAY['Masif meşe','Su bazlı vernik'], '90 mm', '15 mm', '600 mm', '—', '10 yıl', '7-10 gün', 'Bursa atölyesi', '{"Uygulama":"Balık sırtı / düz","Fiyat birimi":"m²"}', 2450.00, 1),
  ('lamine-parke', 'lamine-parke-ac4', 'Lamine Parke AC4', 'Yüksek dayanım', 'AC4 sınıfı, yoğun kullanıma uygun lamine parke.', ARRAY['HDF taşıyıcı','AC4 aşınma katmanı'], '190 mm', '8 mm', '1200 mm', '—', '5 yıl', '3-5 gün', 'İthal', '{"Sınıf":"AC4","Fiyat birimi":"m²"}', 690.00, 1)
) AS v(sub_slug, slug, name, summary, description, materials, w, h, d, weight, warranty, delivery, place, extra, price, sort_order) ON v.sub_slug = s.slug;
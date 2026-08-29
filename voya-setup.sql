-- ============================================================
--  متجر ڤويا — تجهيز قاعدة البيانات دفعة واحدة
--
--  الصق هذا الملف كاملًا في محرّر SQL (Neon / Supabase) واضغط Run.
--  ينشئ الجداول والفهارس ثم يملؤها بـ 8 تصنيفات
--  و 14 منتجًا وحسابَي دخول.
--
--  يفترض قاعدة بيانات مخصّصة لهذا المشروع. لا تنفّذه على قاعدة فيها
--  بيانات تطبيق آخر — أسماء مثل users و products و orders شائعة.
--
--  ── تشارك قاعدة واحدة مع تطبيق آخر؟ ───────────────────────
--  أزل علامة التعليق عن السطرين التاليين، ثم اضبط DB_SCHEMA=voya
--  في متغيّرات بيئة الخادم. عندها يُنشأ كل شيء داخل مخطّط معزول
--  ولا يُلمَس أي جدول في public.
--
--  CREATE SCHEMA IF NOT EXISTS voya;
--  SET search_path TO voya, public;
-- ============================================================

-- ============================================================
--  مخطّط قاعدة بيانات متجر ڤويا
--  يُنفَّذ عبر: npm run db:migrate
-- ============================================================

-- الامتدادات تُثبَّت في public لتبقى أنواعها متاحة لأي مخطّط
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- ------------------------------------------------------------
--  المستخدمون
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         CITEXT      NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'customer'
                            CHECK (role IN ('customer', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  التصنيفات
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  name_en     TEXT        NOT NULL DEFAULT '',
  blurb       TEXT        NOT NULL DEFAULT '',
  tone        TEXT        NOT NULL DEFAULT '#c25b8a',
  position    INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  المنتجات
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           BIGSERIAL PRIMARY KEY,
  slug         TEXT        NOT NULL UNIQUE,
  name         TEXT        NOT NULL,
  name_en      TEXT        NOT NULL DEFAULT '',
  category_id  BIGINT      NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price        NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  compare_at   NUMERIC(10,2) CHECK (compare_at IS NULL OR compare_at > price),
  size         TEXT        NOT NULL DEFAULT '',
  rating       NUMERIC(2,1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  reviews      INTEGER     NOT NULL DEFAULT 0 CHECK (reviews >= 0),
  badge        TEXT,
  short        TEXT        NOT NULL DEFAULT '',
  description  TEXT        NOT NULL DEFAULT '',
  how_to_use   TEXT        NOT NULL DEFAULT '',
  benefits     TEXT[]      NOT NULL DEFAULT '{}',
  ingredients  TEXT[]      NOT NULL DEFAULT '{}',
  shape        TEXT        NOT NULL DEFAULT 'bottle'
                           CHECK (shape IN ('bottle','jar','tube','box','pouch')),
  tone_from    TEXT        NOT NULL DEFAULT '#c25b8a',
  tone_to      TEXT        NOT NULL DEFAULT '#6b2a48',
  stock        INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);
CREATE INDEX IF NOT EXISTS products_active_idx   ON products(is_active);
-- فهارس ثلاثية الحروف تُسرّع البحث بـ ILIKE على الاسم والوصف المختصر
CREATE INDEX IF NOT EXISTS products_name_trgm_idx  ON products USING GIN (name  gin_trgm_ops);
CREATE INDEX IF NOT EXISTS products_short_trgm_idx ON products USING GIN (short gin_trgm_ops);

-- ------------------------------------------------------------
--  السلة المحفوظة للمستخدم المسجّل
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  user_id     BIGINT      NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  product_id  BIGINT      NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty         INTEGER     NOT NULL CHECK (qty > 0 AND qty <= 99),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

-- ------------------------------------------------------------
--  الطلبات
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                BIGSERIAL PRIMARY KEY,
  reference         TEXT        NOT NULL UNIQUE,
  user_id           BIGINT      REFERENCES users(id) ON DELETE SET NULL,
  customer_name     TEXT        NOT NULL,
  customer_email    TEXT        NOT NULL,
  customer_phone    TEXT        NOT NULL,
  emirate           TEXT        NOT NULL,
  area              TEXT        NOT NULL,
  address           TEXT        NOT NULL,
  notes             TEXT        NOT NULL DEFAULT '',
  payment_method    TEXT        NOT NULL DEFAULT 'cod'
                                CHECK (payment_method IN ('cod', 'card')),
  status            TEXT        NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal          NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_fee      NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
  total             NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
--  أعمدة الدفع الإلكتروني (تُضاف بأمان على قواعد بيانات قائمة)
-- ------------------------------------------------------------
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en    TEXT NOT NULL DEFAULT '';
ALTER TABLE products   ADD COLUMN IF NOT EXISTS how_to_use TEXT NOT NULL DEFAULT '';

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_brand TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_wallet TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_released BOOLEAN NOT NULL DEFAULT FALSE;

DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
    CHECK (payment_status IN ('unpaid','processing','paid','failed','refunded'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- معرّف نيّة الدفع فريد، فإعادة إرسال نفس الـ webhook لا تُنشئ حالة مكرّرة
CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_intent_idx
  ON orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS orders_user_idx    ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx  ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at DESC);

-- سطور الطلب: نخزّن نسخة من الاسم والسعر وقت الشراء حتى لا يتغيّر الطلب
-- إذا عُدّل المنتج أو حُذف لاحقًا.
CREATE TABLE IF NOT EXISTS order_items (
  id           BIGSERIAL PRIMARY KEY,
  order_id     BIGINT      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   BIGINT      REFERENCES products(id) ON DELETE SET NULL,
  product_slug TEXT        NOT NULL,
  product_name TEXT        NOT NULL,
  unit_price   NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  qty          INTEGER     NOT NULL CHECK (qty > 0),
  line_total   NUMERIC(10,2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

-- ------------------------------------------------------------
--  تحديث updated_at تلقائيًا
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_touch    ON users;
DROP TRIGGER IF EXISTS products_touch ON products;
DROP TRIGGER IF EXISTS orders_touch   ON orders;

CREATE TRIGGER users_touch    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER products_touch BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER orders_touch   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ── تفريغ ثم التعبئة ──────────────────────────────────────
TRUNCATE order_items, orders, cart_items, products, categories, users RESTART IDENTITY CASCADE;

-- ── التصنيفات ─────────────────────────────────────────────
INSERT INTO categories (slug, name, name_en, blurb, tone, position) VALUES
  ('hair-care', 'العناية بالشعر', 'Hair Care', 'شامبو وبلسم وخلطات وزيوت', '#b8788c', 0),
  ('skin-care', 'العناية بالبشرة', 'Skin Care', 'سيروم ومرطبات وواقي شمس', '#a75f7c', 1),
  ('makeup', 'مكياج', 'Makeup', 'حواجب وعيون وشفاه', '#8a4a63', 2),
  ('fragrance', 'عطور', 'Fragrance', 'عطور نسائية بتوقيع فويا', '#6b3149', 3),
  ('beauty', 'العناية بالجمال', 'Beauty Care', 'مقشرات وعناية بالجسم', '#c9a227', 4),
  ('kids', 'عالم الأطفال', 'Baby World', 'عناية لطيفة وآمنة للصغار', '#e7c37a', 5),
  ('summer', 'أجواء الصيف', 'Summer Vibes', 'حماية وانتعاش تحت الشمس', '#b08430', 6),
  ('uae', 'صنع في الإمارات', 'Made in UAE', 'خلطات محلية بوصفات أصيلة', '#4c2333', 7);

-- ── المنتجات ──────────────────────────────────────────────
INSERT INTO products
  (slug, name, name_en, category_id, price, compare_at, size, rating, reviews,
   badge, short, description, how_to_use, benefits, ingredients,
   shape, tone_from, tone_to, stock)
VALUES
  ('curlysilk-set', 'مجموعة كيرلي سيلك', 'Curly Silk Set',
   (SELECT id FROM categories WHERE slug = 'hair-care'),
   185, 300, '300 مل × 3', 4.9, 342,
   'رائج', 'المجموعة الأشهر في فويا للشعر الكيرلي: روتين متكامل يعرّف التموجات ويمنحها نعومة الحرير دون ثِقل.', 'المجموعة الأشهر في فويا للشعر الكيرلي: روتين متكامل يعرّف التموجات ويمنحها نعومة الحرير دون ثِقل. شامبو لطيف + بلسم مغذٍّ + كريم تصفيف بتركيبة خالية من السلفات.', 'اغسلي بالشامبو، ثم البلسم لمدة دقيقتين، وبعد التجفيف بالمنشفة وزّعي كريم التصفيف على الخصل وهي رطبة.',
   ARRAY['المحتوى: 3 قطع — شامبو + بلسم + كريم تصفيف','الحجم: 300 مل × 3','النوع: للشعر الكيرلي والمموج'], ARRAY['بروتين الحرير','زيت الأرغان','زبدة الشيا','خلاصة الألوفيرا'], 'box', '#b8788c', '#6b3149', 26),
  ('milk-shampoo', 'شامبو بروتين الحليب الأصلي 500 مل', 'Milk Protein Shampoo',
   (SELECT id FROM categories WHERE slug = 'hair-care'),
   65, NULL, '500 مل', 4.8, 214,
   NULL, 'شامبو بروتين الحليب الأصلي بحجم عائلي 500 مل.', 'شامبو بروتين الحليب الأصلي بحجم عائلي 500 مل — تنظيف لطيف وتغذية عميقة تترك الشعر ناعمًا كالحرير من أول غسلة.', 'يوزع على شعر مبلل، يُدلّك بلطف ثم يُشطف جيدًا. يستخدم 2–3 مرات أسبوعيًا.',
   ARRAY['الحجم: 500 مل','المناسب: جميع أنواع الشعر','الضمان: منتج أصلي 100%'], ARRAY['بروتين الحليب','بانثينول','خلاصة الصبار.'], 'bottle', '#b8788c', '#6b3149', 48),
  ('hair-toner', 'أقوى تونر للشعر', 'Hair Toner Mist',
   (SELECT id FROM categories WHERE slug = 'hair-care'),
   100, 120, '150 مل', 4.7, 188,
   'رائج', 'تونر الشعر الأقوى مبيعًا.', 'تونر الشعر الأقوى مبيعًا — رذاذ منعش يهدّئ فروة الرأس، يقلل التقصف ويمنح لمعانًا فوريًا برائحة ورد ناعمة.', 'يرش على فروة الرأس والخصل صباحًا ومساءً دون شطف.',
   ARRAY['الحجم: 150 مل','الاستخدام: يومي','الرائحة: ورد طائفي خفيف'], '{}', 'bottle', '#b8788c', '#6b3149', 35),
  ('hair-gel', 'جل تصفيف الشعر', 'Hair Styling Gel',
   (SELECT id FROM categories WHERE slug = 'hair-care'),
   50, NULL, '250 مل', 4.6, 97,
   NULL, 'جل تصفيف بقوام كريمي لامع يثبّت التسريحة ويعرّف الخصل دون تيبّس أو بقايا بيضاء.', 'جل تصفيف بقوام كريمي لامع يثبّت التسريحة ويعرّف الخصل دون تيبّس أو بقايا بيضاء. مثالي لتسريحات الكيرلي والأطفال.', 'كمية صغيرة على أطراف الأصابع تُوزع على الشعر الرطب أو الجاف حسب التسريحة.',
   ARRAY['الحجم: 250 مل','الثبات: متوسط مرن','اللمعان: طبيعي'], '{}', 'tube', '#b8788c', '#6b3149', 41),
  ('sidr-mix', 'خلطة السدر الخاصة — أعشاب طبيعية', 'Sidr Herbal Blend',
   (SELECT id FROM categories WHERE slug = 'uae'),
   100, 120, '', 4.9, 263,
   'صنع في الإمارات', 'خلطة السدر الإماراتية الخاصة بفويا.', 'خلطة السدر الإماراتية الخاصة بفويا — سدر مطحون نقي مع أعشاب مختارة تُحضَّر محليًا. تنظّف فروة الرأس وتقوّي البصيلات وتكثّف الشعر بتراثنا الأصيل.', 'تُخلط بماء دافئ حتى قوام العجينة، تُوزع على الشعر 30–45 دقيقة ثم تُشطف.',
   ARRAY['الوزن: 250 غ','الصنع: إماراتي 100%','الاستخدام: مرة أسبوعيًا'], ARRAY['سدر مطحون','أعشاب طبيعية إماراتية','بدون إضافات كيميائية.'], 'jar', '#4c2333', '#1f0e16', 19),
  ('mashat-mix', 'خلطة المشاط الخاصة — أعشاب', 'Mashat Herbal Blend',
   (SELECT id FROM categories WHERE slug = 'uae'),
   100, 130, '', 4.8, 151,
   'صنع في الإمارات', 'خلطة المشاط التراثية بأعشاب مغذية وورد مجفف.', 'خلطة المشاط التراثية بأعشاب مغذية وورد مجفف — سرّ النساء الإماراتيات لشعر طويل كثيف ولامع. تُحضَّر بعناية في الإمارات.', 'تُخلط بالماء أو اللبن، تُترك على الشعر 45 دقيقة ثم تُغسل بالشامبو.',
   ARRAY['الوزن: 250 غ','الصنع: إماراتي 100%','الاستخدام: مرة أسبوعيًا'], ARRAY['أعشاب مشاط تقليدية','ورد مجفف','حناء نقية.'], 'jar', '#4c2333', '#1f0e16', 22),
  ('brow-gel', 'جل تحديد الحواجب أنستازيا (Ash Brown)', 'Anastasia Brow Gel — Ash Brown',
   (SELECT id FROM categories WHERE slug = 'makeup'),
   40, 48, '', 4.7, 129,
   'عرض خاص', 'جل الحواجب الأصلي من Anastasia Beverly Hills بدرجة Ash Brown.', 'جل الحواجب الأصلي من Anastasia Beverly Hills بدرجة Ash Brown — تحديد طبيعي يدوم طوال اليوم بفرشاة دقيقة لا تتكتل.', '',
   ARRAY['العلامة: Anastasia Beverly Hills','الدرجة: Ash Brown','الثبات: حتى 12 ساعة'], '{}', 'tube', '#8a4a63', '#4c2333', 30),
  ('body-scrub', 'مقشر الجسم بالجوز الطبيعي', 'Walnut Body Scrub',
   (SELECT id FROM categories WHERE slug = 'beauty'),
   40, NULL, '', 4.6, 84,
   NULL, 'مقشر جسم بحبيبات الجوز الطبيعية يزيل الجلد الميت بلطف ويترك البشرة ناعمة ومشرقة مع ترطيب زيتي خفيف.', 'مقشر جسم بحبيبات الجوز الطبيعية يزيل الجلد الميت بلطف ويترك البشرة ناعمة ومشرقة مع ترطيب زيتي خفيف.', 'يُدلّك على بشرة رطبة بحركات دائرية ثم يُشطف. مرة إلى مرتين أسبوعيًا.',
   ARRAY['الوزن: 300 غ','الحبيبات: جوز طبيعي مطحون','المناسب: جميع أنواع البشرة'], '{}', 'jar', '#c9a227', '#8a6a1d', 37),
  ('baby-oil', 'زيت مغذٍّ لشعر الأطفال', 'Nourishing Baby Hair Oil',
   (SELECT id FROM categories WHERE slug = 'kids'),
   45, NULL, '100 مل', 4.9, 176,
   'جديد', 'زيت لطيف بتركيبة آمنة لفروة رأس طفلك الحساسة.', 'زيت لطيف بتركيبة آمنة لفروة رأس طفلك الحساسة — يرطّب، يفكّ التشابك ويمنح لمعانًا صحيًا دون دموع.', 'قطرات قليلة على شعر الطفل الرطب أو الجاف، يمشَّط بلطف.',
   ARRAY['الحجم: 100 مل','العمر: من الولادة','التركيبة: آمنة ولطيفة'], ARRAY['زيت جوز الهند','زيت اللوز الحلو','فيتامين E'], 'bottle', '#e7c37a', '#b08430', 29),
  ('baby-spray', 'رذاذ شعر للأطفال', 'Kids Detangling Hair Spray',
   (SELECT id FROM categories WHERE slug = 'kids'),
   35, NULL, '150 مل', 4.8, 143,
   'جديد', 'رذاذ فكّ التشابك المنعش للأطفال.', 'رذاذ فكّ التشابك المنعش للأطفال — تسريحة صباحية سريعة بلا شدّ وبلا بكاء، برائحة ورد خفيفة يحبها الصغار.', 'يرش على الشعر قبل التمشيط صباحًا أو بعد الاستحمام.',
   ARRAY['الحجم: 150 مل','الرائحة: ورد خفيف','التركيبة: لا تسيل للعينين'], '{}', 'pouch', '#e7c37a', '#b08430', 33),
  ('voya-perfume', 'عطر فويا النسائي', 'VOYA Femme Eau de Parfum',
   (SELECT id FROM categories WHERE slug = 'fragrance'),
   160, NULL, '100 مل', 4.9, 205,
   'جديد', 'توقيع فويا العطري.', 'توقيع فويا العطري — ورد دمشقي يعانق الفانيليا والمسك الأبيض في قارورة وردية بغطاء ذهبي. أنوثة تدوم من الصباح إلى المساء.', '',
   ARRAY['الحجم: 100 مل','التركيز: Eau de Parfum','العائلة: زهرية شرقية'], '{}', 'bottle', '#6b3149', '#2e1520', 24),
  ('radiance-serum', 'سيروم البشرة المشرقة', 'Radiant Skin Serum',
   (SELECT id FROM categories WHERE slug = 'skin-care'),
   85, NULL, '30 مل', 4.8, 167,
   NULL, 'سيروم الإشراقة بفيتامين C وحمض الهيالورونيك.', 'سيروم الإشراقة بفيتامين C وحمض الهيالورونيك — يوحّد اللون، يرطّب بعمق ويمنح بشرتكِ توهّجًا طبيعيًا خلال أسبوعين.', '3–4 قطرات صباحًا ومساءً على بشرة نظيفة قبل المرطب.',
   ARRAY['الحجم: 30 مل','الملاءمة: جميع أنواع البشرة','النتيجة: إشراقة خلال 14 يومًا'], ARRAY['فيتامين C 10%','حمض الهيالورونيك','خلاصة الورد.'], 'bottle', '#a75f7c', '#4c2333', 31),
  ('sunscreen-spf50', 'واقي شمس خفيف SPF50', 'Featherlight Sunscreen SPF50',
   (SELECT id FROM categories WHERE slug = 'summer'),
   70, NULL, '50 مل', 4.7, 112,
   'جديد', 'واقي شمس بقوام ريشي لا يترك أثرًا أبيض.', 'واقي شمس بقوام ريشي لا يترك أثرًا أبيض — حماية SPF50 واسعة الطيف مثالية تحت المكياج في أجواء الإمارات المشمسة.', '',
   ARRAY['الحماية: SPF50+ PA++++','الحجم: 50 مل','القوام: خفيف غير دهني'], '{}', 'pouch', '#b08430', '#8a6a1d', 44),
  ('deep-moisturizer', 'كريم ترطيب عميق', 'Deep Moisture Cream',
   (SELECT id FROM categories WHERE slug = 'skin-care'),
   75, 95, '50 مل', 4.8, 139,
   'عرض خاص', 'كريم ترطيب غني بالسيراميد وزبدة الشيا.', 'كريم ترطيب غني بالسيراميد وزبدة الشيا — 48 ساعة ترطيب عميق يعيد للبشرة نعومتها ومرونتها، مثالي للبشرة الجافة.', 'طبقة رقيقة صباحًا ومساءً على الوجه والرقبة.',
   ARRAY['الحجم: 50 مل','الترطيب: 48 ساعة','المناسب: البشرة الجافة والعادية'], ARRAY['سيراميد','زبدة شيا','نياسيناميد.'], 'jar', '#a75f7c', '#4c2333', 27);

-- ── الحسابات ──────────────────────────────────────────────
-- كلمات المرور مُجزّأة بـ bcrypt (12 دورة) ولا يمكن استخراجها من النص أدناه.
--   admin@byvoyastore.com / Admin@12345
--   noura@example.com     / Customer@123
INSERT INTO users (name, email, phone, password_hash, role) VALUES
  ('مدير المتجر', 'admin@byvoyastore.com', '+971500000000', '$2b$12$qYyOvS6LonVQR3nWBjXvNeJCWmVDoMF5N0PrvYZycnltnafk8E2kW', 'admin'),
  ('نورة العتيبي', 'noura@example.com', '+971501234567', '$2b$12$/j8r/2OaPV/zl22/cLIUSO4x2Wo3HtYBuzwlOrHnGUpst/FY1kNEu', 'customer');

-- ── تحقّق ─────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM categories) AS categories,
  (SELECT COUNT(*) FROM products)   AS products,
  (SELECT COUNT(*) FROM users)      AS users;

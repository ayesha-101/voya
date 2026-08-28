-- ============================================================
--  متجر ڤويا — تجهيز قاعدة البيانات دفعة واحدة
--
--  الصق هذا الملف كاملًا في محرّر SQL (Neon / Supabase) واضغط Run.
--  ينشئ الجداول والفهارس ثم يملؤها بـ 6 تصنيفات
--  و 18 منتجًا وحسابَي دخول.
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
INSERT INTO categories (slug, name, blurb, tone, position) VALUES
  ('face', 'العناية بالوجه', 'سيروم وكريمات وماسكات', '#c25b8a', 0),
  ('body', 'العناية بالجسم', 'مرطبات وزيوت ومقشرات', '#d67ea6', 1),
  ('bath', 'حمامات الأعشاب', 'طقوس الاسترخاء البحرية', '#87355b', 2),
  ('hair', 'العناية بالشعر', 'شامبو وبلسم وزيوت', '#a54470', 3),
  ('gifts', 'أطقم الهدايا', 'علب فاخرة جاهزة للإهداء', '#c27860', 4),
  ('accessories', 'إكسسوارات', 'فرش وليف وأدوات العناية', '#e8abc6', 5);

-- ── المنتجات ──────────────────────────────────────────────
INSERT INTO products
  (slug, name, name_en, category_id, price, compare_at, size, rating, reviews,
   badge, short, description, benefits, ingredients, shape, tone_from, tone_to, stock)
VALUES
  ('radiance-serum', 'سيروم الإشراق بالأعشاب البحرية', 'Radiance Seaweed Serum',
   (SELECT id FROM categories WHERE slug = 'face'),
   289, 349, '30 مل', 4.9, 214,
   'الأكثر مبيعًا', 'سيروم مركّز يوحّد لون البشرة ويمنحها إشراقة فورية.', 'تركيبة خفيفة سريعة الامتصاص تجمع بين خلاصة الأعشاب البحرية العضوية وفيتامين C المستقر لتوحيد لون البشرة وتقليل ظهور البقع الداكنة. يُستخدم صباحًا ومساءً على بشرة نظيفة قبل المرطب.',
   ARRAY['يوحّد لون البشرة','يقلل البقع الداكنة','يمنح إشراقة فورية','خفيف وغير دهني'], ARRAY['خلاصة الأعشاب البحرية العضوية','فيتامين C المستقر','حمض الهيالورونيك','زيت بذور العنب'], 'bottle', '#c25b8a', '#6b2a48', 24),
  ('hydrating-day-cream', 'كريم النهار المرطّب', 'Hydrating Day Cream',
   (SELECT id FROM categories WHERE slug = 'face'),
   245, NULL, '50 مل', 4.8, 168,
   NULL, 'ترطيب يدوم 24 ساعة مع حماية من الجفاف البيئي.', 'كريم نهاري غني بمستخلص عشب البحر الأحمر يشكّل طبقة حماية خفيفة تحافظ على رطوبة البشرة طوال اليوم دون ثقل أو لمعان.',
   ARRAY['ترطيب 24 ساعة','يحمي من الجفاف','قوام غير ثقيل','مناسب تحت المكياج'], ARRAY['عشب البحر الأحمر','زبدة الشيا','سكوالان نباتي','جلسرين نباتي'], 'jar', '#d67ea6', '#87355b', 31),
  ('detox-clay-mask', 'ماسك الطين البحري المنقّي', 'Detox Marine Clay Mask',
   (SELECT id FROM categories WHERE slug = 'face'),
   185, 220, '75 مل', 4.7, 132,
   'عرض خاص', 'ينقّي المسام ويشدّ البشرة في 10 دقائق.', 'طين بحري ناعم ممزوج بالأعشاب البحرية المجففة يسحب الشوائب من عمق المسام ويترك البشرة نظيفة ومشدودة. يُستخدم مرتين أسبوعيًا.',
   ARRAY['ينقّي المسام','يمتص الزيوت الزائدة','يشدّ البشرة','يقلل اللمعان'], ARRAY['طين الكاولين البحري','أعشاب بحرية مجففة','الفحم النشط','زيت شجرة الشاي'], 'jar', '#87355b', '#4c1c33', 18),
  ('eye-recovery-gel', 'جل العين المنعش', 'Eye Recovery Gel',
   (SELECT id FROM categories WHERE slug = 'face'),
   199, NULL, '15 مل', 4.6, 97,
   'جديد', 'يقلل الانتفاخ والهالات السوداء منذ الاستخدام الأول.', 'جل بارد سريع الامتصاص مصمم للمنطقة الحساسة حول العين، يقلل الانتفاخ الصباحي ويفتّح الهالات مع الاستخدام المنتظم.',
   ARRAY['يقلل الانتفاخ','يفتّح الهالات','ملمس بارد منعش','خالٍ من العطور'], ARRAY['خلاصة الطحالب الخضراء','الكافيين','خيار عضوي','بانثينول'], 'tube', '#e8abc6', '#c25b8a', 40),
  ('body-butter', 'زبدة الجسم بالأعشاب البحرية', 'Seaweed Body Butter',
   (SELECT id FROM categories WHERE slug = 'body'),
   165, NULL, '200 مل', 4.9, 256,
   'الأكثر مبيعًا', 'زبدة غنية تغذّي الجلد الجاف وتتركه ناعمًا كالحرير.', 'زبدة كثيفة تذوب على الجلد مباشرة، مصنوعة من زبدة الشيا العضوية ومستخلص الأعشاب البحرية لعلاج الجفاف الشديد خاصة في الكوعين والركبتين.',
   ARRAY['تغذية عميقة','تنعيم فوري','رائحة بحرية هادئة','تدوم طويلًا'], ARRAY['زبدة الشيا العضوية','زبدة الكاكاو','خلاصة الأعشاب البحرية','زيت جوز الهند'], 'jar', '#edb9a4', '#c27860', 52),
  ('body-oil', 'زيت الجسم الفاخر', 'Luxury Body Oil',
   (SELECT id FROM categories WHERE slug = 'body'),
   219, 265, '100 مل', 4.8, 143,
   NULL, 'زيت جاف سريع الامتصاص يمنح لمعانًا صحيًا.', 'مزيج من سبعة زيوت نباتية عضوية بقوام جاف لا يترك أثرًا دهنيًا، يُستخدم بعد الاستحمام مباشرة على الجلد الرطب.',
   ARRAY['امتصاص سريع','لمعان طبيعي','يحسّن مرونة الجلد','مناسب للتدليك'], ARRAY['زيت الأرغان','زيت الجوجوبا','زيت بذور المشمش','خلاصة اللاميناريا'], 'bottle', '#e0997f', '#a54470', 27),
  ('body-scrub', 'مقشّر الملح البحري', 'Sea Salt Body Scrub',
   (SELECT id FROM categories WHERE slug = 'body'),
   149, NULL, '250 غم', 4.7, 188,
   NULL, 'يزيل الجلد الميت ويجدد نعومة البشرة.', 'حبيبات ملح بحري طبيعي ممزوجة بزيوت مغذّية تزيل خلايا الجلد الميت وتنشّط الدورة الدموية وتترك الجسم ناعمًا ومنعشًا.',
   ARRAY['تقشير لطيف','ينشّط الدورة الدموية','يحضّر البشرة للترطيب','رائحة منعشة'], ARRAY['ملح البحر الأطلسي','أعشاب بحرية مطحونة','زيت دوار الشمس','زيت الليمون'], 'jar', '#f3d0e0', '#d67ea6', 35),
  ('hand-cream', 'كريم اليدين المغذّي', 'Nourishing Hand Cream',
   (SELECT id FROM categories WHERE slug = 'body'),
   79, NULL, '75 مل', 4.8, 301,
   NULL, 'حماية وترطيب لليدين الجافة طوال اليوم.', 'كريم يدين خفيف يمتص بسرعة ولا يترك أثرًا لزجًا، مثالي للاستخدام المتكرر بعد غسل اليدين.',
   ARRAY['امتصاص سريع','يقوّي الأظافر','بحجم الحقيبة','غير لزج'], ARRAY['خلاصة الأعشاب البحرية','الشمع النباتي','فيتامين E','الأليو فيرا'], 'tube', '#f6e0dd', '#d8a29d', 88),
  ('bath-soak', 'أملاح الاستحمام بالأعشاب البحرية', 'Seaweed Bath Soak',
   (SELECT id FROM categories WHERE slug = 'bath'),
   129, NULL, '500 غم', 4.9, 176,
   'الأكثر مبيعًا', 'طقس استرخاء بحري كامل داخل حوض منزلك.', 'أملاح إبسوم ممزوجة بأعشاب بحرية عضوية محصودة يدويًا، تذيب توتر العضلات وتفتح المسام وتترك الجسم في حالة استرخاء عميق.',
   ARRAY['يرخي العضلات','يخفف التوتر','ينقّي البشرة','تجربة سبا منزلية'], ARRAY['أملاح إبسوم','أعشاب بحرية عضوية','زيت اللافندر','أملاح البحر الميت'], 'pouch', '#a54470', '#4c1c33', 46),
  ('bath-elixir', 'إكسير الحمّام البحري', 'Marine Bath Elixir',
   (SELECT id FROM categories WHERE slug = 'bath'),
   189, NULL, '150 مل', 4.7, 84,
   'كمية محدودة', 'زيت حمّام مركّز يحوّل الماء إلى حليب حريري.', 'بضع قطرات تكفي لتحويل ماء الحوض إلى قوام حريري معطّر بروائح بحرية دافئة تهدّئ الحواس قبل النوم.',
   ARRAY['يهدّئ الحواس','يرطّب أثناء الاستحمام','رائحة تدوم','اقتصادي في الاستخدام'], ARRAY['زيت اللوز الحلو','خلاصة الفوقس','زيت النيرولي','فيتامين E'], 'bottle', '#c25b8a', '#6b2a48', 12),
  ('shower-gel', 'جل الاستحمام المنعش', 'Refreshing Shower Gel',
   (SELECT id FROM categories WHERE slug = 'bath'),
   95, NULL, '300 مل', 4.6, 205,
   NULL, 'رغوة كريمية تنظّف بلطف دون جفاف.', 'جل استحمام بقاعدة نباتية خالية من السلفات، ينظّف البشرة بعمق مع الحفاظ على حاجزها الطبيعي.',
   ARRAY['خالٍ من السلفات','رغوة كريمية','لا يسبب الجفاف','مناسب للاستخدام اليومي'], ARRAY['قاعدة جوز الهند','خلاصة الأعشاب البحرية','الجلسرين','زيت النعناع'], 'bottle', '#e8abc6', '#a54470', 64),
  ('repair-shampoo', 'شامبو الترميم بالأعشاب البحرية', 'Seaweed Repair Shampoo',
   (SELECT id FROM categories WHERE slug = 'hair'),
   139, 165, '300 مل', 4.8, 197,
   'عرض خاص', 'ينظّف ويرمّم الشعر التالف دون سلفات.', 'شامبو غني بالمعادن البحرية يعيد بناء ألياف الشعر التالفة من التصفيف الحراري والصبغات، ويمنح لمعانًا صحيًا من أول استخدام.',
   ARRAY['يرمّم التلف','يزيد اللمعان','خالٍ من السلفات','آمن للشعر المصبوغ'], ARRAY['بروتين الأعشاب البحرية','الكيراتين النباتي','بانثينول','زيت الأرغان'], 'bottle', '#d67ea6', '#6b2a48', 58),
  ('repair-conditioner', 'بلسم الترميم العميق', 'Deep Repair Conditioner',
   (SELECT id FROM categories WHERE slug = 'hair'),
   145, NULL, '250 مل', 4.7, 151,
   NULL, 'يفكّ التشابك ويغلّف كل خصلة بالترطيب.', 'بلسم كثيف يترك الشعر سهل التسريح وناعمًا، مع حماية من التقصف حتى الغسلة التالية.',
   ARRAY['يفكّ التشابك','يقلل التقصف','نعومة فورية','بدون سيليكون'], ARRAY['زبدة المانجو','خلاصة اللاميناريا','زيت الأفوكادو','الأحماض الأمينية'], 'tube', '#f3d0e0', '#c25b8a', 43),
  ('scalp-oil', 'زيت فروة الرأس المغذّي', 'Nourishing Scalp Oil',
   (SELECT id FROM categories WHERE slug = 'hair'),
   175, NULL, '60 مل', 4.9, 122,
   'جديد', 'يغذّي البصيلات ويقلل التساقط مع الاستخدام المنتظم.', 'خليط زيوت خفيف بقطارة دقيقة يوضع مباشرة على فروة الرأس ويُدلَّك بلطف، يُترك 30 دقيقة قبل الغسل أو طوال الليل.',
   ARRAY['يغذّي البصيلات','يقلل التساقط','يهدّئ الحكة','سهل الغسل'], ARRAY['زيت الخروع','زيت إكليل الجبل','خلاصة الأعشاب البحرية','زيت بذور اليقطين'], 'bottle', '#c27860', '#87355b', 21),
  ('ritual-gift-set', 'طقم طقوس السبا البحري', 'Marine Spa Ritual Set',
   (SELECT id FROM categories WHERE slug = 'gifts'),
   549, 690, '4 قطع', 5, 76,
   'عرض خاص', 'أربع قطع مختارة في علبة فاخرة جاهزة للإهداء.', 'يضم الطقم أملاح الاستحمام، زبدة الجسم، مقشّر الملح البحري، وليفة طبيعية، معبّأة في علبة هدايا فاخرة مع بطاقة إهداء.',
   ARRAY['توفير 140 د.إ','علبة هدايا فاخرة','بطاقة إهداء مجانية','تجربة سبا متكاملة'], ARRAY['أملاح الاستحمام','زبدة الجسم','مقشّر الملح البحري','ليفة طبيعية'], 'box', '#e0997f', '#87355b', 9),
  ('glow-duo', 'ثنائي الإشراق', 'Glow Duo',
   (SELECT id FROM categories WHERE slug = 'gifts'),
   469, 534, 'قطعتان', 4.9, 58,
   NULL, 'سيروم الإشراق + كريم النهار بسعر مخفّض.', 'الروتين الصباحي الكامل في علبة واحدة: سيروم الإشراق بالأعشاب البحرية مع كريم النهار المرطّب.',
   ARRAY['روتين متكامل','توفير 65 د.إ','تغليف أنيق','الأنسب للمبتدئين'], ARRAY['سيروم الإشراق 30 مل','كريم النهار 50 مل'], 'box', '#edb9a4', '#c25b8a', 15),
  ('dry-brush', 'فرشاة التقشير الجاف', 'Dry Body Brush',
   (SELECT id FROM categories WHERE slug = 'accessories'),
   89, NULL, 'قطعة واحدة', 4.6, 134,
   NULL, 'خشب طبيعي وشعيرات سيزال لتنشيط الدورة الليمفاوية.', 'فرشاة يدوية من خشب الزان الطبيعي وشعيرات السيزال، تُستخدم على الجلد الجاف قبل الاستحمام بحركات دائرية باتجاه القلب.',
   ARRAY['تنشّط الدورة الليمفاوية','تقشير يومي لطيف','خامات طبيعية','تدوم لسنوات'], ARRAY['خشب الزان','شعيرات السيزال الطبيعية'], 'box', '#f6e0dd', '#c27860', 72),
  ('konjac-sponge', 'إسفنجة الكونجاك للوجه', 'Konjac Face Sponge',
   (SELECT id FROM categories WHERE slug = 'accessories'),
   45, NULL, 'قطعة واحدة', 4.5, 219,
   NULL, 'تنظيف يومي لطيف مناسب لأكثر البشرات حساسية.', 'إسفنجة نباتية 100% من جذور الكونجاك، تنظّف البشرة بلطف وتزيل الشوائب دون الحاجة إلى منظّف قوي.',
   ARRAY['لطيفة جدًا','قابلة للتحلل','مناسبة للبشرة الحساسة','استخدام يومي'], ARRAY['جذور الكونجاك','مسحوق الفحم البحري'], 'pouch', '#fae9f1', '#e8abc6', 110);

-- ── الحسابات ──────────────────────────────────────────────
-- كلمات المرور مُجزّأة بـ bcrypt (12 دورة) ولا يمكن استخراجها من النص أدناه.
--   admin@byvoyastore.com / Admin@12345
--   noura@example.com     / Customer@123
INSERT INTO users (name, email, phone, password_hash, role) VALUES
  ('مدير المتجر', 'admin@byvoyastore.com', '+971500000000', '$2b$12$wgq3Qo9lhZwNlAzNsqk6SuGPX75d5bMzhrUYjRPAx7j5lx60izrva', 'admin'),
  ('نورة العتيبي', 'noura@example.com', '+971501234567', '$2b$12$ADHuvso5kd7ugJkYJkTXwO3MKwka5bnOAVVwo5NNiAu5UIs.nbL96', 'customer');

-- ── تحقّق ─────────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM categories) AS categories,
  (SELECT COUNT(*) FROM products)   AS products,
  (SELECT COUNT(*) FROM users)      AS users;

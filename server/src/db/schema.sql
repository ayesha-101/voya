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

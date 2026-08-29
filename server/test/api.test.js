import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { pool } from "../src/db/pool.js";

let base;
let server;

before(async () => {
  // هذه المجموعة تصف متجرًا بلا دفع إلكتروني (الدفع عند الاستلام فقط)
  server = createApp({ stripe: null }).listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await pool.end();
});

const api = async (path, options = {}) => {
  const res = await fetch(base + path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    body: options.json ? JSON.stringify(options.json) : options.body,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const login = async (email, password) => {
  const { body } = await api("/api/auth/login", { method: "POST", json: { email, password } });
  return body.token;
};

describe("الصحة والمنتجات", () => {
  it("نقطة الصحة تعمل", async () => {
    const { status, body } = await api("/api/health");
    assert.equal(status, 200);
    assert.equal(body.ok, true);
  });

  it("تُرجع قائمة المنتجات مع الإجمالي", async () => {
    const { status, body } = await api("/api/products");
    assert.equal(status, 200);
    assert.equal(body.total, 14);
    assert.ok(body.products[0].slug);
  });

  it("الفلترة بالتصنيف تعمل", async () => {
    const { body } = await api("/api/products?category=hair-care");
    assert.equal(body.total, 4);
    assert.ok(body.products.every((p) => p.category === "hair-care"));
  });

  it("الفرز بالسعر تصاعديًا صحيح", async () => {
    const { body } = await api("/api/products?sort=price-asc");
    const prices = body.products.map((p) => p.price);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
  });

  it("البحث النصّي يطابق المكوّنات", async () => {
    const { body } = await api("/api/products?q=" + encodeURIComponent("بروتين"));
    assert.ok(body.total >= 1);
  });

  it("ترفض قيم الفرز غير المعروفة", async () => {
    const { status, body } = await api("/api/products?sort=hack");
    assert.equal(status, 400);
    assert.ok(body.details.length > 0);
  });

  it("صفحة المنتج تعيد مقترحات", async () => {
    const { status, body } = await api("/api/products/curlysilk-set");
    assert.equal(status, 200);
    assert.equal(body.product.name, "مجموعة كيرلي سيلك");
    assert.equal(body.related.length, 4);
  });

  it("منتج غير موجود يعيد 404", async () => {
    const { status } = await api("/api/products/nope");
    assert.equal(status, 404);
  });
});

describe("المصادقة", () => {
  const email = `test-${Date.now()}@example.com`;

  it("ترفض كلمة مرور ضعيفة", async () => {
    const { status, body } = await api("/api/auth/register", {
      method: "POST",
      json: { name: "تجربة", email, password: "weak" },
    });
    assert.equal(status, 400);
    assert.ok(body.details.some((d) => d.field === "password"));
  });

  it("تسجّل مستخدمًا جديدًا وتعيد توكن", async () => {
    const { status, body } = await api("/api/auth/register", {
      method: "POST",
      json: { name: "مستخدم تجريبي", email, password: "Strong@123" },
    });
    assert.equal(status, 201);
    assert.ok(body.token);
    assert.equal(body.user.role, "customer");
    assert.equal(body.user.password_hash, undefined);
  });

  it("ترفض بريدًا مكرّرًا", async () => {
    const { status } = await api("/api/auth/register", {
      method: "POST",
      json: { name: "مكرر", email, password: "Strong@123" },
    });
    assert.equal(status, 409);
  });

  it("ترفض كلمة مرور خاطئة برسالة موحّدة", async () => {
    const { status, body } = await api("/api/auth/login", {
      method: "POST",
      json: { email, password: "Wrong@1234" },
    });
    assert.equal(status, 401);
    assert.match(body.error, /غير صحيحة/);
  });

  it("/me تتطلّب توكنًا", async () => {
    assert.equal((await api("/api/auth/me")).status, 401);
    const token = await login(email, "Strong@123");
    const { status, body } = await api("/api/auth/me", { token });
    assert.equal(status, 200);
    assert.equal(body.user.email, email);
  });
});

describe("السلة", () => {
  let token;

  before(async () => {
    token = await login("noura@example.com", "Customer@123");
    await api("/api/cart", { method: "DELETE", token });
  });

  it("تتطلّب تسجيل دخول", async () => {
    assert.equal((await api("/api/cart")).status, 401);
  });

  it("تضيف منتجًا وتحسب الشحن", async () => {
    const { status, body } = await api("/api/cart/items", {
      method: "POST", token, json: { slug: "hair-gel", qty: 1 },
    });
    assert.equal(status, 201);
    assert.equal(body.subtotal, 50);
    assert.equal(body.shippingFee, 20); // أقل من حد الشحن المجاني
    assert.equal(body.total, 70);
  });

  it("الشحن يصبح مجانيًا فوق الحد", async () => {
    const { body } = await api("/api/cart/items", {
      method: "POST", token, json: { slug: "curlysilk-set", qty: 1 },
    });
    assert.equal(body.subtotal, 235);
    assert.equal(body.shippingFee, 0);
  });

  it("ترفض كمية تتجاوز المخزون", async () => {
    const { status } = await api("/api/cart/items", {
      method: "POST", token, json: { slug: "sidr-mix", qty: 99 },
    });
    assert.equal(status, 400);
  });

  it("تحديث الكمية إلى صفر يحذف السطر", async () => {
    const { body } = await api("/api/cart/items/hair-gel", {
      method: "PATCH", token, json: { qty: 0 },
    });
    assert.ok(!body.items.some((i) => i.slug === "hair-gel"));
  });
});

describe("الطلبات", () => {
  const shipping = { emirate: "دبي", area: "الجميرا", address: "شارع 12، مبنى 4" };
  const customer = { name: "زائر تجريبي", email: "guest@example.com", phone: "+971501112222" };

  it("ترفض سلة فارغة", async () => {
    const { status } = await api("/api/orders", {
      method: "POST", json: { customer, shipping, items: [] },
    });
    assert.equal(status, 400);
  });

  it("ترفض إمارة غير صالحة", async () => {
    const { status } = await api("/api/orders", {
      method: "POST",
      json: { customer, shipping: { ...shipping, emirate: "الرياض" }, items: [{ slug: "hair-gel", qty: 1 }] },
    });
    assert.equal(status, 400);
  });

  it("تنشئ طلب زائر وتخصم المخزون", async () => {
    const before = (await api("/api/products/hair-gel")).body.product.stock;
    const { status, body } = await api("/api/orders", {
      method: "POST",
      json: { customer, shipping, items: [{ slug: "hair-gel", qty: 2 }] },
    });
    assert.equal(status, 201);
    assert.equal(body.order.items[0].unitPrice, 50);
    assert.equal(body.order.subtotal, 100);
    assert.equal(body.order.total, 120); // 100 + 20 شحن
    assert.match(body.order.reference, /^VY-[0-9A-F]{8}$/);

    const after = (await api("/api/products/hair-gel")).body.product.stock;
    assert.equal(after, before - 2);
  });

  it("تتجاهل أي سعر يرسله العميل وتستخدم سعر قاعدة البيانات", async () => {
    const { body } = await api("/api/orders", {
      method: "POST",
      json: { customer, shipping, items: [{ slug: "hair-gel", qty: 1, price: 1 }] },
    });
    assert.equal(body.order.items[0].unitPrice, 50);
  });

  it("ترفض الدفع بالبطاقة حين لا تكون البوابة مهيّأة", async () => {
    const { status, body } = await api("/api/orders", {
      method: "POST",
      json: { customer, shipping, paymentMethod: "card", items: [{ slug: "hair-gel", qty: 1 }] },
    });
    assert.equal(status, 400);
    assert.match(body.error, /الدفع عند الاستلام/);
  });

  it("طلب المستخدم المسجّل يفرّغ سلته ويظهر في سجلّه", async () => {
    const token = await login("noura@example.com", "Customer@123");
    await api("/api/cart", { method: "DELETE", token });
    await api("/api/cart/items", { method: "POST", token, json: { slug: "baby-spray", qty: 3 } });

    const { status, body } = await api("/api/orders", {
      method: "POST", token, json: { customer, shipping },
    });
    assert.equal(status, 201);
    assert.equal(body.order.subtotal, 105);

    assert.equal((await api("/api/cart", { token })).body.items.length, 0);
    const mine = await api("/api/orders", { token });
    assert.ok(mine.body.orders.some((o) => o.reference === body.order.reference));
  });

  it("لا يستطيع الزائر عرض طلب غيره بدون البريد الصحيح", async () => {
    const created = await api("/api/orders", {
      method: "POST", json: { customer, shipping, items: [{ slug: "hair-gel", qty: 1 }] },
    });
    const ref = created.body.order.reference;
    assert.equal((await api(`/api/orders/${ref}`)).status, 403);
    assert.equal((await api(`/api/orders/${ref}?email=wrong@example.com`)).status, 403);
    assert.equal((await api(`/api/orders/${ref}?email=guest@example.com`)).status, 200);
  });
});

describe("لوحة المدير", () => {
  let adminToken;
  let customerToken;

  before(async () => {
    adminToken = await login("admin@byvoyastore.com", "Admin@12345");
    customerToken = await login("noura@example.com", "Customer@123");
  });

  it("تمنع الزائر والعميل العادي", async () => {
    assert.equal((await api("/api/admin/stats")).status, 401);
    assert.equal((await api("/api/admin/stats", { token: customerToken })).status, 403);
  });

  it("تعيد الإحصاءات للمدير", async () => {
    const { status, body } = await api("/api/admin/stats", { token: adminToken });
    assert.equal(status, 200);
    assert.ok(body.totals.orders >= 1);
    assert.ok(body.totals.revenue > 0);
    assert.ok(Array.isArray(body.lowStock));
  });

  it("تنشئ منتجًا وتعدّله وتؤرشفه", async () => {
    const slug = `test-product-${Date.now()}`;
    const payload = {
      slug, name: "منتج اختباري", category: "skin-care", price: 100, stock: 5,
      short: "وصف مختصر", description: "وصف كامل",
    };

    const created = await api("/api/admin/products", { method: "POST", token: adminToken, json: payload });
    assert.equal(created.status, 201);
    assert.equal(created.body.product.price, 100);

    const updated = await api(`/api/admin/products/${slug}`, {
      method: "PUT", token: adminToken, json: { ...payload, price: 150, compareAt: 200 },
    });
    assert.equal(updated.body.product.price, 150);
    assert.equal(updated.body.product.compareAt, 200);

    // سعر مقارنة أقل من السعر مرفوض
    const bad = await api(`/api/admin/products/${slug}`, {
      method: "PUT", token: adminToken, json: { ...payload, price: 150, compareAt: 100 },
    });
    assert.equal(bad.status, 400);

    const archived = await api(`/api/admin/products/${slug}`, { method: "DELETE", token: adminToken });
    assert.equal(archived.body.archived, true);
    // المنتج المؤرشف يختفي من المتجر العام
    assert.equal((await api(`/api/products/${slug}`)).status, 404);
  });

  it("ترفض الحذف النهائي لمنتج مرتبط بطلبات", async () => {
    const { status } = await api("/api/admin/products/hair-gel?hard=true", {
      method: "DELETE", token: adminToken,
    });
    assert.equal(status, 409);
  });

  it("تغيّر حالة الطلب", async () => {
    const { body } = await api("/api/admin/orders", { token: adminToken });
    const ref = body.orders[0].reference;
    const res = await api(`/api/admin/orders/${ref}/status`, {
      method: "PATCH", token: adminToken, json: { status: "shipped" },
    });
    assert.equal(res.body.order.status, "shipped");

    const bad = await api(`/api/admin/orders/${ref}/status`, {
      method: "PATCH", token: adminToken, json: { status: "teleported" },
    });
    assert.equal(bad.status, 400);
  });
});

describe("الأمان", () => {
  it("تضيف ترويسات helmet", async () => {
    const res = await fetch(base + "/api/health");
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-powered-by"), null);
  });

  it("تصدّ حقن SQL في معامل البحث", async () => {
    const { status, body } = await api("/api/products?q=" + encodeURIComponent("'; DROP TABLE users;--"));
    assert.equal(status, 200);
    assert.equal(body.total, 0);
    // الجداول ما زالت موجودة
    assert.equal((await api("/api/products")).body.total > 0, true);
  });

  it("ترفض JSON التالف", async () => {
    const res = await fetch(base + "/api/auth/login", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{oops",
    });
    assert.equal(res.status, 400);
  });

  it("ترفض التوكن المزوّر", async () => {
    const { status } = await api("/api/auth/me", { token: "not.a.real.token" });
    assert.equal(status, 401);
  });

  it("مسار غير موجود يعيد 404 برسالة واضحة", async () => {
    const { status, body } = await api("/api/nope");
    assert.equal(status, 404);
    assert.match(body.error, /المسار غير موجود/);
  });
});

describe("إدارة المنتجات من اللوحة", () => {
  let token;
  // الاختبارات تنشئ منتجات حقيقية؛ تُحذف بعدها وإلا اختلّ عدّ المنتجات
  // في تشغيل لاحق على نفس قاعدة البيانات.
  const created = [];

  before(async () => {
    token = await login("admin@byvoyastore.com", "Admin@12345");
  });

  after(async () => {
    for (const slug of created) {
      await pool.query("DELETE FROM products WHERE slug = $1", [slug]);
    }
  });

  it("تُنشئ منتجًا كاملًا بسعر ومخزون وطريقة استخدام", async () => {
    const slug = `panel-${Date.now()}`;
    created.push(slug);
    const { status, body } = await api("/api/admin/products", {
      method: "POST",
      token,
      json: {
        slug,
        name: "ماسك الشعر بالكيراتين",
        nameEn: "Keratin Hair Mask",
        category: "hair-care",
        price: 120,
        compareAt: 150,
        size: "250 مل",
        stock: 33,
        rating: 4.7,
        reviews: 58,
        badge: "جديد",
        short: "ماسك أسبوعي يعيد بناء الشعر التالف.",
        description: "تركيبة كيراتين مركّزة للشعر المصبوغ والتالف.",
        howToUse: "يوزّع على شعر مغسول ويُترك 15 دقيقة ثم يُشطف.",
        benefits: ["الحجم: 250 مل", "النوع: للشعر التالف"],
        ingredients: ["كيراتين", "زيت الأرغان"],
        shape: "jar",
        tone: ["#b8788c", "#6b3149"],
      },
    });

    assert.equal(status, 201);
    assert.equal(body.product.price, 120);
    assert.equal(body.product.compareAt, 150);
    assert.equal(body.product.stock, 33);
    assert.equal(body.product.howToUse, "يوزّع على شعر مغسول ويُترك 15 دقيقة ثم يُشطف.");
    assert.equal(body.product.categoryName, "العناية بالشعر");
    assert.equal(body.product.categoryNameEn, "Hair Care");

    // يظهر فورًا في المتجر العام بكل حقوله
    const shop = await api(`/api/products/${slug}`);
    assert.equal(shop.status, 200);
    assert.equal(shop.body.product.price, 120);
    assert.equal(shop.body.product.stock, 33);
    assert.equal(shop.body.product.howToUse.length > 0, true);

    // ويظهر ضمن تصنيفه
    const inCat = await api("/api/products?category=hair-care&limit=100");
    assert.ok(inCat.body.products.some((p) => p.slug === slug));
  });

  it("تُعدّل السعر والمخزون فيتغيّران في المتجر", async () => {
    const slug = `panel-edit-${Date.now()}`;
    created.push(slug);
    const base = {
      slug,
      name: "منتج للتعديل",
      category: "skin-care",
      price: 60,
      stock: 10,
      short: "وصف",
      description: "وصف كامل",
    };
    await api("/api/admin/products", { method: "POST", token, json: base });

    const updated = await api(`/api/admin/products/${slug}`, {
      method: "PUT",
      token,
      json: { ...base, price: 95, stock: 4, howToUse: "مرتين أسبوعيًا." },
    });
    assert.equal(updated.body.product.price, 95);
    assert.equal(updated.body.product.stock, 4);

    const shop = await api(`/api/products/${slug}`);
    assert.equal(shop.body.product.price, 95);
    assert.equal(shop.body.product.stock, 4);
    assert.equal(shop.body.product.howToUse, "مرتين أسبوعيًا.");
  });

  it("ترفض سعرًا سالبًا ومخزونًا سالبًا", async () => {
    const bad = await api("/api/admin/products", {
      method: "POST",
      token,
      json: { slug: `bad-${Date.now()}`, name: "خطأ", category: "makeup", price: -5, stock: -1 },
    });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.details.some((d) => d.field === "price"));
    assert.ok(bad.body.details.some((d) => d.field === "stock"));
  });

  it("ترفض تصنيفًا غير موجود", async () => {
    const { status, body } = await api("/api/admin/products", {
      method: "POST",
      token,
      json: { slug: `nc-${Date.now()}`, name: "بلا تصنيف", category: "not-a-category", price: 10, stock: 1 },
    });
    assert.equal(status, 400);
    assert.match(body.error, /التصنيف غير موجود/);
  });
});

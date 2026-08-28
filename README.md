# ڤويا ستور — VOYA STORE

متجر إلكتروني عربي (RTL) كامل المكدّس لمنتجات العناية العضوية.

> منتجات مختارة بعناية وبأعلى جودة — *Carefully Selected Products with High Quality*

| الطبقة | التقنية |
| --- | --- |
| الواجهة | Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript |
| الخادم | Express 5 · REST API · ESM |
| قاعدة البيانات | PostgreSQL 16 (`pg`، استعلامات مُعامَلة) |
| المصادقة | JWT (كوكي httpOnly + Bearer) · bcrypt |
| الأمان | helmet · CORS بقائمة سماح · تحديد معدّل · تحقّق zod |

---

## التشغيل السريع

### 1. المتطلّبات
Node.js 20+ و PostgreSQL 14+.

### 2. التثبيت

```bash
npm install                      # يثبّت client و server معًا (npm workspaces)
```

### 3. قاعدة البيانات

```bash
createdb voya
cp server/.env.example server/.env      # ثم عدّل DATABASE_URL و JWT_SECRET
cp client/.env.example client/.env.local
```

ولّد مفتاح JWT قويًا:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4. الهجرة والبذور

```bash
npm run db:migrate    # ينشئ الجداول والفهارس
npm run db:seed       # 6 تصنيفات + 18 منتجًا + حسابين
```

### 5. التشغيل

```bash
npm run dev           # الواجهة على :3000 والخادم على :4000
```

| | |
| --- | --- |
| المتجر | http://localhost:3000 |
| الواجهة البرمجية | http://localhost:4000/api/health |

### حسابات التجربة

| الدور | البريد | كلمة المرور |
| --- | --- | --- |
| مدير | `admin@byvoyastore.com` | `Admin@12345` |
| عميل | `noura@example.com` | `Customer@123` |

---

## أوامر أخرى

```bash
npm run build      # بناء الإنتاج للطرفين
npm start          # تشغيل نسخة الإنتاج
npm run lint       # ESLint على client و server
npm test           # 35 اختبار تكامل للواجهة البرمجية
npm run db:reset   # حذف الجداول وإعادة إنشائها وتعبئتها
```

> `npm test` يعمل على قاعدة البيانات المحدّدة في `server/.env` ويُفرّغ جداولها.
> استخدم قاعدة بيانات منفصلة للاختبار في أي بيئة فيها بيانات حقيقية.

---

## الواجهة البرمجية

الأساس: `http://localhost:4000`

### عامة

| الطريقة | المسار | الوصف |
| --- | --- | --- |
| GET | `/api/health` | فحص الصحة |
| GET | `/api/categories` | التصنيفات مع عدد المنتجات |
| GET | `/api/products` | قائمة المنتجات — `?category= &q= &sort= &limit= &offset=` |
| GET | `/api/products/:slug` | منتج واحد + 4 مقترحات |
| POST | `/api/orders` | إنشاء طلب (يعمل للزائر والمسجّل) |
| GET | `/api/orders/:reference?email=` | تتبّع طلب |

قيم `sort`: `featured` · `price-asc` · `price-desc` · `rating` · `discount` · `newest`

### المصادقة

| الطريقة | المسار | الوصف |
| --- | --- | --- |
| POST | `/api/auth/register` | إنشاء حساب |
| POST | `/api/auth/login` | تسجيل دخول |
| POST | `/api/auth/logout` | تسجيل خروج |
| GET | `/api/auth/me` | بيانات المستخدم الحالي |
| PATCH | `/api/auth/me` | تعديل الاسم/الجوال |

### السلة (تتطلّب تسجيل دخول)

| الطريقة | المسار | الوصف |
| --- | --- | --- |
| GET | `/api/cart` | السلة مع الإجماليات |
| POST | `/api/cart/items` | إضافة كمية |
| PATCH | `/api/cart/items/:slug` | ضبط الكمية (0 = حذف) |
| DELETE | `/api/cart/items/:slug` | حذف سطر |
| DELETE | `/api/cart` | إفراغ السلة |
| POST | `/api/cart/merge` | دمج سلة الزائر بعد الدخول |
| GET | `/api/orders` | طلباتي |

### لوحة المدير (تتطلّب `role = admin`)

| الطريقة | المسار | الوصف |
| --- | --- | --- |
| GET | `/api/admin/stats` | مبيعات، طلبات، عملاء، مخزون منخفض |
| GET | `/api/admin/products` | كل المنتجات (النشطة والمؤرشفة) |
| POST | `/api/admin/products` | إنشاء منتج |
| PUT | `/api/admin/products/:slug` | تعديل منتج |
| DELETE | `/api/admin/products/:slug` | أرشفة (`?hard=true` حذف نهائي) |
| GET | `/api/admin/orders` | الطلبات — `?status=` |
| PATCH | `/api/admin/orders/:reference/status` | تغيير الحالة |

حالات الطلب: `pending` · `confirmed` · `shipped` · `delivered` · `cancelled`

---

## قرارات تصميم مهمة

**السعر يُقرأ من قاعدة البيانات دائمًا.** أي سعر يرسله العميل في نص الطلب يُتجاهل،
فلا يمكن التلاعب بالإجمالي من المتصفح.

**خصم المخزون داخل معاملة واحدة مع `SELECT … FOR UPDATE`.** طلبان متزامنان على
آخر قطعة لا يمكن أن ينجحا معًا.

**سطور الطلب تحفظ نسخة من الاسم والسعر وقت الشراء.** تعديل المنتج أو حذفه
لاحقًا لا يغيّر الطلبات التاريخية.

**حذف المنتج أرشفة افتراضيًا.** الحذف النهائي (`?hard=true`) مرفوض إن كان
المنتج مرتبطًا بطلب سابق.

**السلة تعمل بوضعين.** الزائر: `localStorage`. المسجّل: جدول `cart_items` على
الخادم. عند تسجيل الدخول تُدمج سلة الزائر تلقائيًا.

**إبطال الكاش عند الطلب.** صفحات المنتجات مخزّنة بوسم `products`؛ بعد أي تعديل
من اللوحة يُستدعى `/api/revalidate` فيرى المدير تغييره في المتجر مباشرة.

---

## الأمان

- **كلمات المرور**: bcrypt بـ 12 دورة. تُفرَض 8 أحرف مع حرف كبير وصغير ورقم.
- **رسائل موحّدة عند فشل الدخول** مع مقارنة تجزئة وهمية للحساب غير الموجود،
  فلا يكشف فارق التوقيت أي البُرد مسجّلة.
- **تحديد المعدّل**: 10 محاولات دخول لكل IP كل 15 دقيقة، و300 طلب/دقيقة عامة.
- **تحقّق zod** على `body` و`query` و`params` في كل مسار يقبل مدخلات.
- **helmet** لترويسات الأمان، و**CORS** بقائمة سماح صريحة مع `credentials`.
- **استعلامات مُعامَلة حصريًا** — لا تركيب نصوص SQL من مدخلات المستخدم.
- **JWT** في كوكي `httpOnly` + `SameSite=Lax` (فعّل `COOKIE_SECURE=true` خلف HTTPS).
- **حد 100KB** لحجم نص الطلب.

---

## بنية المشروع

```
voya/
├── client/                     واجهة Next.js
│   ├── src/app/                الصفحات (App Router)
│   │   ├── admin/              لوحة التحكّم
│   │   ├── api/revalidate/     إبطال الكاش بعد تعديل المدير
│   │   └── products/           القائمة وصفحة المنتج
│   ├── src/components/         مكوّنات الواجهة
│   │   ├── AuthProvider.tsx    حالة المستخدم
│   │   ├── CartProvider.tsx    السلة (زائر + مسجّل)
│   │   ├── ProductArt.tsx      صور المنتجات مولّدة SVG محليًا
│   │   └── admin/              مكوّنات اللوحة
│   ├── src/lib/                عميل الواجهة البرمجية والأنواع والتنسيق
│   └── src/data/site.ts        ← إعدادات المتجر (اسم، واتساب، شحن)
│
└── server/                     واجهة Express البرمجية
    ├── src/db/                 المخطّط والهجرة والبذور
    ├── src/routes/             auth · products · categories · cart · orders · admin
    ├── src/middleware/         المصادقة والتحقّق ومعالجة الأخطاء
    ├── src/lib/                التوكن والتسعير والتسلسل
    └── test/api.test.js        35 اختبار تكامل
```

---

## صور المنتجات

الصور مولّدة كـ SVG داخل `ProductArt.tsx` — المتجر يعمل بلا أي ملف صورة.
لاستخدام صور حقيقية: أضف عمود `image_url` إلى جدول `products`، ثم استبدل
`<ProductArt />` بـ `<Image />` من `next/image` في `ProductCard.tsx` و
`src/app/products/[slug]/page.tsx`.

---

## ما يحتاج ربطًا قبل الإطلاق

1. **بوابة الدفع** — خيار «بطاقة ائتمانية» يرفضه الخادم صراحةً. اربط
   Stripe أو Tap أو Checkout.com في `server/src/routes/orders.js`.
2. **إشعارات البريد** — لا يُرسل تأكيد طلب بعد.
3. **نموذج التواصل والنشرة البريدية** — يعرضان نجاحًا في الواجهة دون إرسال فعلي.
4. **استعادة كلمة المرور** — غير مطبّقة.
5. **رفع صور المنتجات** — لوحة التحكّم تضبط الشكل واللون فقط.

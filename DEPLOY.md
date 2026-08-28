# النشر على Vercel

المشروع مشروعان على Vercel من نفس المستودع:

| المشروع | المجلد الجذر | الدور |
| --- | --- | --- |
| `voya-store` | `client` | واجهة المتجر (Next.js) |
| `voya-api` | `server` | الواجهة البرمجية (Express كدالة بلا خادم) |

## 1. قاعدة البيانات

Vercel لا يوفّر PostgreSQL مباشرة. أنشئ واحدة مجانية من أي مزوّد:

- **Neon** — [neon.tech](https://neon.tech) (طبقة مجانية، الأسهل)
- **Supabase** — [supabase.com](https://supabase.com)
- **Vercel Marketplace** — `Storage → Create Database → Neon`

انسخ رابط الاتصال، وسيبدو هكذا:

```
postgresql://user:password@host.neon.tech/voya?sslmode=require
```

## 2. متغيّرات البيئة

### مشروع `voya-api`

| المتغيّر | القيمة |
| --- | --- |
| `DATABASE_URL` | رابط الاتصال من الخطوة 1 |
| `JWT_SECRET` | مفتاح عشوائي 32 حرفًا فأكثر |
| `CORS_ORIGINS` | رابط `voya-store` كاملًا، مثال `https://voya-store.vercel.app` |
| `COOKIE_SECURE` | `true` |
| `NODE_ENV` | `production` |

ولّد مفتاح JWT:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

للدفع الإلكتروني أضف كذلك `STRIPE_SECRET_KEY` و`STRIPE_PUBLISHABLE_KEY`
و`STRIPE_WEBHOOK_SECRET` (انظر README).

### مشروع `voya-store`

| المتغيّر | القيمة |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | رابط `voya-api` كاملًا، مثال `https://voya-api.vercel.app` |

> الرابطان يعتمد كلٌّ منهما على الآخر: انشر أولًا، خذ الرابطين، ثم
> اضبط `CORS_ORIGINS` و`NEXT_PUBLIC_API_URL` وأعد النشر.

## 3. تجهيز قاعدة البيانات

من جهازك، مع نفس `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://…" npm run db:migrate
DATABASE_URL="postgresql://…" npm run db:seed     # مرة واحدة فقط
```

> `db:seed` يمسح الجداول ويعيد تعبئتها — لا تشغّله على بيانات حقيقية.

## 4. الدفع الإلكتروني

في لوحة Stripe → **Developers → Webhooks → Add endpoint**:

```
https://voya-api.vercel.app/api/payments/webhook
```

الأحداث: `payment_intent.succeeded` · `payment_intent.payment_failed`
· `payment_intent.canceled` · `charge.refunded`

ثم انسخ `whsec_...` إلى `STRIPE_WEBHOOK_SECRET` في `voya-api`.

لـ **Apple Pay**: سجّل نطاق المتجر في
**Settings → Payments → Payment methods → Apple Pay → Add domain**.

## 5. التحقّق

```bash
curl https://voya-api.vercel.app/api/health
curl https://voya-api.vercel.app/api/products
```

ثم افتح رابط المتجر — يجب أن تظهر المنتجات وتعمل السلة.

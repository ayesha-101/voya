"use client";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/voya";

/** رسوم الشحن العادي — مجاني فوق حدّ الشحن المجاني. */
const getShipping = (subtotal: number) =>
  subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 25;
import { useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, Truck, Zap } from 'lucide-react';

import { formatPrice } from "@/lib/voya";
import type { ShippingData } from '@/components/checkout/order';
import { EXPRESS_SHIPPING_FEE } from '@/components/checkout/order';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const EMIRATES = ['أبوظبي', 'دبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'أم القيوين'];

type Errors = Partial<Record<keyof ShippingData, string>>;

const isValidUaePhone = (raw: string) => /^(?:\+?971|0)?5\d{8}$/.test(raw.replace(/[\s-]/g, ''));

function validate(data: ShippingData): Errors {
  const errors: Errors = {};
  if (data.fullName.trim().length < 3) errors.fullName = 'أدخلي الاسم الكامل (3 أحرف على الأقل)';
  if (!isValidUaePhone(data.phone)) errors.phone = 'نحتاج رقمكِ ليصلكِ الطلب 🌸 (5xxxxxxxx)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = 'أدخلي بريدًا إلكترونيًا صحيحًا';
  if (!data.city) errors.city = 'اختاري الإمارة';
  if (data.district.trim().length < 2) errors.district = 'أدخلي المدينة أو المنطقة';
  if (data.address.trim().length < 5) errors.address = 'أدخلي عنوانًا تفصيليًا';
  return errors;
}

const inputClass = (error?: string, valid?: boolean, value?: string) =>
  cn(
    'w-full rounded-2xl border bg-blush-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink-soft/60',
    error ? 'border-destructive' : valid && value ? 'border-success' : 'border-blush-200 focus:border-rose',
  );

function FieldError({ error }: { error?: string }) {
  return (
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="overflow-hidden pt-1.5 text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

interface FieldProps {
  label: string;
  name: keyof ShippingData;
  value: string;
  error?: string;
  valid: boolean;
  placeholder?: string;
  type?: string;
  dir?: 'ltr' | 'rtl';
  optional?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
}

function Field({ label, name, value, error, valid, placeholder, type = 'text', dir, optional, onChange, onBlur }: FieldProps) {
  return (
    <div>
      <label htmlFor={`ship-${name}`} className="mb-1.5 block text-sm font-semibold">
        {label}
        {optional && <span className="mr-1.5 text-xs font-normal text-ink-soft">(اختياري)</span>}
      </label>
      <div className="relative">
        <input
          id={`ship-${name}`}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          dir={dir}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          className={cn(inputClass(error, valid, value), dir === 'ltr' && 'pr-4 text-left')}
        />
        {valid && value && !error && (
          <Check className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-success" strokeWidth={2.5} />
        )}
      </div>
      <FieldError error={error} />
    </div>
  );
}

interface Props {
  data: ShippingData;
  onChange: (data: ShippingData) => void;
  onNext: () => void;
  subtotal: number;
}

export default function ShippingStep({ data, onChange, onNext, subtotal }: Props) {
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingData, boolean>>>({});
  const errors = validate(data);
  const show = (name: keyof ShippingData) => (touched[name] ? errors[name] : undefined);
  const isValid = (name: keyof ShippingData) => Boolean(touched[name]) && !errors[name];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...data, [name]: value });
  };
  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setTouched({ fullName: true, phone: true, email: true, city: true, district: true, address: true });
      return;
    }
    onNext();
  };

  const standardCost = getShipping(subtotal);
  const options = [
    { value: 'standard' as const, icon: Truck, title: 'توصيل عادي', desc: '1–3 أيام', cost: standardCost === 0 ? 'مجاني' : formatPrice(standardCost) },
    { value: 'express' as const, icon: Zap, title: 'توصيل سريع', desc: 'خلال 24 ساعة', cost: formatPrice(EXPRESS_SHIPPING_FEE) },
  ];

  const phoneError = show('phone');
  const phoneValid = isValid('phone');

  return (
    <form onSubmit={submit} noValidate className="rounded-[32px] bg-white p-6 shadow-card md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        معلومات الشحن
        <img src="/ornament-thread.svg" alt="" aria-hidden className="h-3 w-20 opacity-80" />
      </h2>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label="الاسم الكامل" name="fullName" value={data.fullName} error={show('fullName')} valid={isValid('fullName')} placeholder="مثال: مريم المنصوري" onChange={handleChange} onBlur={handleBlur} />

        {/* phone with fixed +971 prefix */}
        <div>
          <label htmlFor="ship-phone" className="mb-1.5 block text-sm font-semibold">رقم الجوال</label>
          <div className="relative">
            <div
              className={cn(
                'flex items-center gap-2 rounded-2xl border bg-blush-50 py-3 pl-4 pr-3 transition-colors',
                phoneError ? 'border-destructive' : phoneValid ? 'border-success' : 'border-blush-200 focus-within:border-rose',
              )}
            >
              <span dir="ltr" className="tnum shrink-0 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-mauve">
                +971
              </span>
              <input
                id="ship-phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                dir="ltr"
                value={data.phone}
                placeholder="5x xxx xxxx"
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(phoneError)}
                className="w-full bg-transparent text-left text-sm tracking-wide outline-none placeholder:text-ink-soft/60"
              />
            </div>
            {phoneValid && data.phone && !phoneError && (
              <Check className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-success" strokeWidth={2.5} />
            )}
          </div>
          <FieldError error={phoneError} />
        </div>

        <div className="sm:col-span-2">
          <Field label="البريد الإلكتروني" name="email" value={data.email} error={show('email')} valid={isValid('email')} placeholder="name@example.com" type="email" dir="ltr" onChange={handleChange} onBlur={handleBlur} />
        </div>

        <div>
          <label htmlFor="ship-city" className="mb-1.5 block text-sm font-semibold">الإمارة</label>
          <div className="relative">
            <select
              id="ship-city"
              name="city"
              value={data.city}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(show('city'))}
              className={cn(
                'w-full appearance-none rounded-2xl border bg-blush-50 px-4 py-3 text-sm outline-none transition-colors',
                show('city') ? 'border-destructive' : isValid('city') ? 'border-success' : 'border-blush-200 focus:border-rose',
                !data.city && 'text-ink-soft/60',
              )}
            >
              <option value="" disabled>اختاري الإمارة</option>
              {EMIRATES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" strokeWidth={1.5} />
          </div>
          <FieldError error={show('city')} />
        </div>

        <Field label="المدينة / المنطقة" name="district" value={data.district} error={show('district')} valid={isValid('district')} placeholder="مثال: الجميرا" onChange={handleChange} onBlur={handleBlur} />
        <div className="sm:col-span-2">
          <Field label="العنوان بالتفصيل" name="address" value={data.address} error={show('address')} valid={isValid('address')} placeholder="الشارع، المبنى، رقم الشقة" onChange={handleChange} onBlur={handleBlur} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="ship-notes" className="mb-1.5 block text-sm font-semibold">
            ملاحظات للتوصيل <span className="mr-1.5 text-xs font-normal text-ink-soft">(اختياري)</span>
          </label>
          <textarea
            id="ship-notes"
            name="notes"
            value={data.notes}
            onChange={handleChange}
            rows={2}
            placeholder="أي تفاصيل تساعد مندوب التوصيل"
            className="w-full resize-none rounded-2xl border border-blush-200 bg-blush-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-ink-soft/60 focus:border-rose"
          />
        </div>
      </div>

      {/* delivery options */}
      <fieldset className="mt-7">
        <legend className="text-sm font-bold">طريقة التوصيل</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {options.map((opt) => {
            const selected = data.method === opt.value;
            const Icon = opt.icon;
            return (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-3xl border p-4 transition-all duration-300',
                  selected ? 'border-rose bg-blush-100 shadow-card' : 'border-blush-200 bg-blush-50 hover:border-rose/40',
                )}
              >
                <input
                  type="radio"
                  name="method"
                  value={opt.value}
                  checked={selected}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-full', selected ? 'bg-gradient-rose text-white' : 'bg-blush-200 text-rose-deep')}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">{opt.title}</span>
                  <span className="block text-xs text-ink-soft">{opt.desc}</span>
                </span>
                <span className={cn('tnum text-sm font-bold', opt.cost === 'مجاني' ? 'text-success' : 'text-rose-deep')}>{opt.cost}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        type="submit"
        className="group mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-rose py-3.5 text-sm font-bold text-white transition-shadow duration-300 hover:shadow-card-hover"
      >
        متابعة إلى الدفع
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={2} />
      </button>
    </form>
  );
}

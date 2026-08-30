"use client";

import { useMemo, useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SUBJECTS = ['استفسار عن منتج', 'حالة طلب', 'اقتراح', 'شراكة', 'أخرى'];

const MAX_MSG = 500;

type Fields = { name: string; email: string; phone: string; subject: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const INITIAL: Fields = { name: '', email: '', phone: '', subject: '', message: '' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{8,15}$/;

function validate(fields: Fields): Errors {
  const errors: Errors = {};
  if (fields.name.trim().length < 2) errors.name = 'يرجى إدخال الاسم الكامل';
  if (!EMAIL_RE.test(fields.email.trim())) errors.email = 'يرجى إدخال بريد إلكتروني صحيح';
  if (fields.phone.trim() && !PHONE_RE.test(fields.phone.trim())) errors.phone = 'يرجى إدخال رقم جوال صحيح';
  if (!fields.subject) errors.subject = 'يرجى اختيار موضوع الرسالة';
  if (fields.message.trim().length < 10) errors.message = 'يرجى كتابة رسالة لا تقل عن 10 أحرف';
  else if (fields.message.length > MAX_MSG) errors.message = `الرسالة تتجاوز ${MAX_MSG} حرفًا`;
  return errors;
}

function Field({
  id,
  label,
  optional,
  error,
  valid,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  valid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-plum transition-all duration-300 group-focus-within:-translate-y-0.5 group-focus-within:text-rose-deep"
      >
        {label}
        {optional && <span className="text-xs font-normal text-ink-soft">(اختياري)</span>}
      </label>
      <div className="relative">
        {children}
        {valid && !error && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="h-3 w-3" strokeWidth={2.5} />
          </span>
        )}
      </div>
      {error && <p className="mt-1.5 text-[13px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

const inputClass = (error?: string) =>
  cn(
    'w-full rounded-2xl border bg-white px-4 py-3 text-[15px] text-plum outline-none transition-all placeholder:text-ink-soft/60',
    'focus:border-rose focus:shadow-[0_0_0_4px_#F5DCE3]',
    error ? 'border-destructive' : 'border-blush-200',
  );

/** Petal burst on success — one-shot, 8 petals */
function PetalBurst() {
  const petals = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 70 + ((i * 23) % 50);
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 14 + ((i * 5) % 12),
          delay: 0.5 + i * 0.05,
        };
      }),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {petals.map((p) => (
        <motion.img
          key={p.id}
          src="/petal.svg"
          alt=""
          className="absolute"
          style={{ width: p.size }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: p.x, y: p.y - 40, opacity: [0, 1, 0], scale: 1, rotate: 160 }}
          transition={{ duration: 1.4, delay: p.delay, ease: EASE }}
        />
      ))}
    </div>
  );
}

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [sent, setSent] = useState(false);

  const update = (key: keyof Fields) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next = { ...fields, [key]: e.target.value };
    setFields(next);
    if (touched[key]) {
      const all = validate(next);
      setErrors((prev) => ({ ...prev, [key]: all[key] }));
    }
  };

  const blur = (key: keyof Fields) => (_e: FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const all = validate(fields);
    setErrors((prev) => ({ ...prev, [key]: all[key] }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const all = validate(fields);
    setErrors(all);
    setTouched({ name: true, email: true, phone: true, subject: true, message: true });
    if (Object.keys(all).length === 0) setSent(true);
  };

  const reset = () => {
    setFields(INITIAL);
    setErrors({});
    setTouched({});
    setSent(false);
  };

  const isValid = (key: keyof Fields) => touched[key] && !validate(fields)[key] && Boolean(fields[key].trim());

  return (
    <div id="contact-form" className="scroll-mt-28 rounded-[32px] bg-white p-6 shadow-card md:p-10">
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative flex min-h-[480px] flex-col items-center justify-center text-center"
          >
            <PetalBurst />
            {/* animated stroke check */}
            <motion.svg viewBox="0 0 80 80" className="h-24 w-24" initial="hidden" animate="visible" aria-hidden="true">
              <motion.circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke="#D67B93"
                strokeWidth="4"
                strokeLinecap="round"
                variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
                transition={{ duration: 0.7, ease: EASE }}
              />
              <motion.path
                d="M26 41.5 36 51 55 31"
                fill="none"
                stroke="#D67B93"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{ hidden: { pathLength: 0 }, visible: { pathLength: 1 } }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.55 }}
              />
            </motion.svg>
            <h3 className="mt-6 text-2xl font-bold text-plum">وصلتنا رسالتكِ!</h3>
            <p className="font-body mt-3 max-w-sm text-[15px] leading-[1.9] text-ink-soft">
              سنرد عليكِ خلال 24 ساعة 🌸
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 rounded-full border-2 border-rose px-8 py-3 text-[15px] font-semibold text-rose-deep transition-colors hover:bg-rose hover:text-white"
            >
              إرسال رسالة أخرى
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <h3 className="text-xl font-semibold text-plum md:text-2xl">أرسلي لنا رسالة</h3>

            <div className="mt-6 space-y-5">
              <Field id="cf-name" label="الاسم الكامل" error={touched.name ? errors.name : undefined} valid={isValid('name')}>
                <input
                  id="cf-name"
                  type="text"
                  value={fields.name}
                  onChange={update('name')}
                  onBlur={blur('name')}
                  placeholder="مثال: نورة العبدالله"
                  className={inputClass(touched.name ? errors.name : undefined)}
                />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="cf-email" label="البريد الإلكتروني" error={touched.email ? errors.email : undefined} valid={isValid('email')}>
                  <input
                    id="cf-email"
                    type="email"
                    dir="ltr"
                    value={fields.email}
                    onChange={update('email')}
                    onBlur={blur('email')}
                    placeholder="you@example.com"
                    className={cn(inputClass(touched.email ? errors.email : undefined), 'text-right placeholder:text-right')}
                  />
                </Field>

                <Field id="cf-phone" label="رقم الجوال" optional error={touched.phone ? errors.phone : undefined} valid={isValid('phone')}>
                  <input
                    id="cf-phone"
                    type="tel"
                    dir="ltr"
                    value={fields.phone}
                    onChange={update('phone')}
                    onBlur={blur('phone')}
                    placeholder="05x xxx xxxx"
                    className={cn(inputClass(touched.phone ? errors.phone : undefined), 'text-right placeholder:text-right')}
                  />
                </Field>
              </div>

              <Field id="cf-subject" label="موضوع الرسالة" error={touched.subject ? errors.subject : undefined} valid={isValid('subject')}>
                <div className="relative">
                  <select
                    id="cf-subject"
                    value={fields.subject}
                    onChange={update('subject')}
                    onBlur={blur('subject')}
                    className={cn(
                      inputClass(touched.subject ? errors.subject : undefined),
                      'appearance-none pl-10',
                      !fields.subject && 'text-ink-soft/60',
                    )}
                  >
                    <option value="" disabled>
                      اختاري الموضوع…
                    </option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s} className="text-plum">
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                    strokeWidth={1.5}
                  />
                </div>
              </Field>

              <Field id="cf-message" label="الرسالة" error={touched.message ? errors.message : undefined} valid={isValid('message')}>
                <textarea
                  id="cf-message"
                  rows={5}
                  value={fields.message}
                  onChange={update('message')}
                  onBlur={blur('message')}
                  maxLength={MAX_MSG}
                  placeholder="اكتبي رسالتكِ هنا…"
                  className={cn(inputClass(touched.message ? errors.message : undefined), 'min-h-[140px] resize-y')}
                />
              </Field>
              <div className="-mt-3 flex justify-end">
                <span
                  className={cn('tnum text-xs', fields.message.length >= MAX_MSG ? 'text-destructive' : 'text-ink-soft')}
                  dir="ltr"
                >
                  {fields.message.length}/{MAX_MSG}
                </span>
              </div>

              <button
                type="submit"
                className="bg-gradient-rose flex w-full items-center justify-center gap-2 rounded-full py-4 text-[15px] font-bold text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                أرسلي رسالتكِ 🌸
                <Send className="h-4 w-4 -scale-x-100" strokeWidth={1.5} />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

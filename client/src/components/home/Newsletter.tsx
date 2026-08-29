"use client";

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { toast } from '@/components/Toast';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function PetalExplosion({ burstKey }: { burstKey: number }) {
  if (burstKey === 0) return null;
  return (
    <span key={burstKey} className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <motion.img
            key={i}
            src="/petal.svg"
            alt=""
            initial={{ x: 0, y: 0, scale: 0.3, opacity: 1 }}
            animate={{ x: Math.cos(angle) * 64, y: Math.sin(angle) * 48, scale: 1, opacity: 0, rotate: i * 45 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute w-3.5"
          />
        );
      })}
    </span>
  );
}

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  const reduced = useReducedMotion();

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || done) return;
    setDone(true);
    if (!reduced) setBurst((b) => b + 1);
    toast('أهلًا بكِ في النادي 🌸');
  };

  return (
    <section className="bg-silk relative overflow-hidden py-20 md:py-28">
      {/* 3 light petals */}
      {!reduced &&
        [...Array(3)].map((_, i) => (
          <motion.img
            key={i}
            src="/petal.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute opacity-40"
            style={{ top: `${15 + i * 28}%`, right: `${12 + i * 32}%`, width: 16 + i * 5 }}
            animate={{ y: [0, 30, 0], rotate: [0, 25, -12, 0] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="container-voya"
      >
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_24px_72px_rgba(150,97,122,0.2)] md:p-12">
          <p className="font-ruqaa text-[26px] text-gold">نادي فويا</p>
          <h3 className="mt-2 font-heading text-[24px] font-semibold text-plum md:text-[30px]">انضمي إلى نادي فويا 🌸</h3>
          <p className="mt-3 font-body text-sm leading-[1.9] text-ink-soft md:text-[15px]">
            خصومات حصرية، وصول مبكر للمنتجات الجديدة، ونصائح جمال أسبوعية — مباشرة إلى بريدكِ.
          </p>
          <form onSubmit={subscribe} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="بريدك الإلكتروني"
              className="w-full rounded-full border border-blush-200 bg-blush-50 px-5 py-3.5 text-sm text-plum outline-none transition-colors placeholder:text-ink-soft/60 focus:border-rose"
            />
            <button
              type="submit"
              disabled={done}
              className={
                done
                  ? 'relative flex shrink-0 items-center justify-center gap-2 rounded-full bg-success px-8 py-3.5 text-sm font-bold text-white'
                  : 'relative shrink-0 rounded-full bg-gradient-rose px-8 py-3.5 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5'
              }
            >
              {done ? (
                <>
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  تم الاشتراك
                </>
              ) : (
                'اشتراك'
              )}
              <PetalExplosion burstKey={burst} />
            </button>
          </form>
          <p className="mt-4 text-xs text-ink-soft">باشتراككِ تحصلين على خصم 10% على أول طلب</p>
        </div>
      </motion.div>
    </section>
  );
}

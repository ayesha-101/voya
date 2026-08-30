"use client";

import { motion } from 'framer-motion';
import ContactHeader from '@/components/contact/ContactHeader';
import ChannelsCard from '@/components/contact/ChannelsCard';
import ContactForm from '@/components/contact/ContactForm';
import FaqSection from '@/components/contact/FaqSection';
import ContactCta from '@/components/contact/ContactCta';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ContactView() {
  return (
    <>
      <ContactHeader />
      <ChannelsCard />

      {/* form (right, 55%) + side image (left, 45%) */}
      <section className="bg-cream">
        <div className="container-voya grid gap-10 py-16 md:py-24 lg:grid-cols-[55fr_45fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <ContactForm />
          </motion.div>

          {/* side image with offset gold frame + corner rose */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="relative mx-auto w-full max-w-md self-start lg:sticky lg:top-28 lg:max-w-none"
          >
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0 }}
              whileInView={{ opacity: 1, x: 12, y: 12 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
              className="pointer-events-none absolute -inset-3 rounded-signature-lg border-2 border-gold/50"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-signature-lg bg-blush-100 shadow-card-hover">
              <img
                src="/contact-visual.jpg"
                alt="مساحة عمل فويا — هاتف عليه محادثة واتساب وكوب قهوة ومزهرية صغيرة"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <img
              src="/petal.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -left-6 -top-6 w-14 -rotate-12 opacity-70"
            />
          </motion.div>
        </div>
      </section>

      <FaqSection />
      <ContactCta />
    </>
  );
}

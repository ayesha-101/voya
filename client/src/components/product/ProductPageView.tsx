"use client";

import { productColors } from "@/lib/voya";
import { useState } from 'react';
import Link from "next/link";
import { motion, useScroll, useSpring } from 'framer-motion';
import { ChevronLeft, SearchX } from 'lucide-react';
import type { Product } from "@/lib/types";
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import PerksStrip from '@/components/product/PerksStrip';
import ProductTabs from '@/components/product/ProductTabs';
import ReviewsSection from '@/components/product/ReviewsSection';
import SimilarProducts from '@/components/product/SimilarProducts';
import StickyBuyBar from '@/components/product/StickyBuyBar';

/** Rose → gold reading-progress thread at the very top of the page. */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: 'right',
        background: 'linear-gradient(90deg, #C6A15B, #D67B93)',
      }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px]"
    />
  );
}

function Breadcrumb({ product }: { product: Product }) {
  return (
    <nav aria-label="مسار التنقل" className="container-voya pt-6 md:pt-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-ink-soft">
        <li>
          <Link href="/" className="transition-colors hover:text-rose-deep">
            الرئيسية
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        </li>
        <li>
          <Link href="/products" className="transition-colors hover:text-rose-deep">
            المتجر
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        </li>
        <li>
          <Link href={`/products?category=${product.categoryName}`}
            className="transition-colors hover:text-rose-deep"
          >
            {product.categoryName}
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        </li>
        <li className="max-w-[220px] truncate font-semibold text-rose-deep sm:max-w-none">
          {product.name}
        </li>
      </ol>
    </nav>
  );
}

function NotFound() {
  return (
    <div className="container-voya flex min-h-[60dvh] flex-col items-center justify-center py-24 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blush-100 text-rose">
        <SearchX className="h-9 w-9" strokeWidth={1.5} />
      </span>
      <h1 className="mt-6 text-2xl font-bold text-plum md:text-3xl">هذا المنتج لم يعد متوفرًا</h1>
      <p className="font-body mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
        يبدو أن الرابط غير صحيح أو أن المنتج نفد من متجرنا… لا تحزني يا غالية، عندنا بدائل
        ستعجبكِ حتمًا.
      </p>
      <Link href="/products"
        className="mt-8 flex h-12 items-center rounded-full bg-gradient-rose px-8 text-sm font-bold text-white shadow-card transition-transform duration-300 hover:-translate-y-0.5"
      >
        تسوّقي الآن
      </Link>
    </div>
  );
}

function ProductView({ product, catalog }: { product: Product; catalog: Product[] }) {
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);

  return (
    <>
      <ReadingProgress />
      <Breadcrumb product={product} />

      {/* buy area: gallery (right / 52%) + details (left / 48%) */}
      <section className="container-voya mt-6 md:mt-10">
        <div className="grid gap-10 lg:grid-cols-[52fr_48fr] lg:gap-12">
          {/* gallery: first on mobile, right side of screen on desktop (RTL) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery product={product} />
          </div>
          {/* details: left side of screen on desktop (RTL) */}
          <div>
            <ProductInfo
              product={product}
              colorIdx={colorIdx}
              setColorIdx={setColorIdx}
              qty={qty}
              setQty={setQty}
            />
          </div>
        </div>
      </section>

      <PerksStrip />
      <ProductTabs product={product} />
      <ReviewsSection product={product} />
      <SimilarProducts product={product} catalog={catalog} />

      {/* mobile sticky buy bar */}
      <StickyBuyBar product={product} colorName={productColors(product)[colorIdx]?.name} />
    </>
  );
}

export default function ProductPageView({
  product,
  catalog,
}: {
  product: Product;
  catalog: Product[];
}) {
  // المفتاح يعيد ضبط الاختيارات عند الانتقال بين المنتجات
  return <ProductView key={product.slug} product={product} catalog={catalog} />;
}

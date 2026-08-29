import type { Category, Product } from "./types";

type Lang = "ar" | "en";

/**
 * أسماء التصنيفات والمنتجات تأتي من قاعدة البيانات بلغتين.
 * هذه الدوال تختار الاسم المناسب وتعود للعربية إن غاب المقابل الإنجليزي.
 */
export const categoryName = (c: Pick<Category, "name" | "nameEn">, lang: Lang) =>
  lang === "en" && c.nameEn ? c.nameEn : c.name;

export const productName = (p: Pick<Product, "name" | "nameEn">, lang: Lang) =>
  lang === "en" && p.nameEn ? p.nameEn : p.name;

export const productCategoryName = (
  p: Pick<Product, "categoryName" | "categoryNameEn">,
  lang: Lang,
) => (lang === "en" && p.categoryNameEn ? p.categoryNameEn : p.categoryName);

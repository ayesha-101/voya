import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** دمج أصناف Tailwind مع حسم التعارضات — تعتمد عليها مكوّنات القالب. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

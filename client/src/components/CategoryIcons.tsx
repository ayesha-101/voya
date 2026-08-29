import { Baby, Droplets, Flag, Flower2, Palette, Scissors, Sparkles, Sun } from "lucide-react";

/** أيقونة لكل قسم — كما في القالب. */
export const CATEGORY_ICONS: Record<string, typeof Sparkles> = {
  "hair-care": Scissors,
  "skin-care": Droplets,
  makeup: Palette,
  fragrance: Flower2,
  beauty: Sparkles,
  kids: Baby,
  summer: Sun,
  uae: Flag,
};

export { Sparkles as DefaultCategoryIcon };

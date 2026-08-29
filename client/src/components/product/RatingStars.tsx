"use client";

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Read-only star rating row (gold fill). */
export default function RatingStars({
  rating,
  className,
  starClassName = 'h-4 w-4',
}: {
  rating: number;
  className?: string;
  starClassName?: string;
}) {
  return (
    <span className={cn('flex items-center gap-0.5 text-amber', className)} aria-label={`التقييم ${rating} من 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={starClassName}
          strokeWidth={1.5}
          fill={i < Math.round(rating) ? 'currentColor' : 'none'}
        />
      ))}
    </span>
  );
}

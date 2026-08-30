"use client";

import { memo, useEffect, useRef, useState } from 'react';

const COLORS = ['#D67B93', '#B85C76', '#96617A', '#C6A15B', '#F5DCE3', '#F1E6D3'];
const DURATION = 3000;
const PETAL_COUNT = 40;

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vr: number;
}

/** Celebratory petal-burst (3s, once) from the center in rose/gold tones — honors prefers-reduced-motion. */
const Confetti = memo(function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // honor prefers-reduced-motion — checked lazily on mount, no effect needed
  const [enabled] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const petals: Petal[] = Array.from({ length: PETAL_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2.5 + Math.random() * 5) * dpr;
      return {
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5 * dpr,
        size: (5 + Math.random() * 7) * dpr,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
      };
    });

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const fade = Math.max(0, 1 - elapsed / DURATION);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of petals) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.vx *= 0.985; // silky air drag
        p.vy = p.vy * 0.985 + 0.09 * dpr; // gentle gravity
        ctx.save();
        ctx.globalAlpha = Math.min(0.9, fade * 1.2);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        // petal = soft ellipse
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size / 2, p.size / 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (elapsed < DURATION) {
        raf = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
    />
  );
});

export default Confetti;

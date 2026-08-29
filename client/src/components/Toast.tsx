"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

let emit: ((msg: string) => void) | null = null;

/** إشعار خفيف أسفل الشاشة — تستدعيه مكوّنات القالب. */
export function toast(message: string) {
  emit?.(message);
}

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    emit = (m) => setMsg(m);
    return () => {
      emit = null;
    };
  }, []);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <AnimatePresence>
      {msg && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          className="bg-plum shadow-modal fixed bottom-6 left-1/2 z-[90] -translate-x-1/2 rounded-full px-6 py-3 text-sm font-medium text-white"
        >
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

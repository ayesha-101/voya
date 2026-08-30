"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Props {
  /** non-null while the undo window (4s) is open */
  label: string | null;
  onUndo: () => void;
  onDismiss: () => void;
}

function UndoToast({ label, onUndo, onDismiss }: { label: string; onUndo: () => void; onDismiss: () => void }) {
  const [remaining, setRemaining] = useState(4);

  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    const i = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => {
      clearTimeout(t);
      clearInterval(i);
    };
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -64, opacity: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="pointer-events-auto flex items-center gap-3 rounded-full bg-plum py-2.5 pl-3 pr-5 text-sm font-medium text-blush-50 shadow-modal"
    >
      <Trash2 className="h-4 w-4 text-rose" strokeWidth={1.5} />
      <span className="max-w-[220px] truncate">أُزيل {label}</span>
      <button
        type="button"
        onClick={onUndo}
        className="rounded-full bg-gold px-3.5 py-1 text-xs font-bold text-plum transition-transform hover:scale-105"
      >
        تراجع <span className="tnum">({remaining})</span>
      </button>
    </motion.div>
  );
}

/** Top toast «أُزيل المنتج — تراجع؟» with a 4s undo window. */
export default function UndoBar({ label, onUndo, onDismiss }: Props) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <AnimatePresence>
        {label && <UndoToast key={label} label={label} onUndo={onUndo} onDismiss={onDismiss} />}
      </AnimatePresence>
    </div>
  );
}

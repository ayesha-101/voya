"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="rounded-card border border-sand-200 bg-sand-50 p-8 text-center sm:p-12">
      <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">
        اشترك واحصل على خصم <span className="nums text-sea-700">10%</span>
      </h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
        كن أول من يعرف عن المنتجات الجديدة والعروض الحصرية. لن نرسل لك رسائل مزعجة.
      </p>

      {done ? (
        <p className="mx-auto mt-6 max-w-md rounded-full bg-sea-700 px-6 py-3.5 font-bold text-white">
          تم الاشتراك بنجاح — تفقّد بريدك ✓
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
          className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="بريدك الإلكتروني"
            aria-label="بريدك الإلكتروني"
            className="flex-1 rounded-full border border-sand-300 bg-white px-5 py-3.5 text-sm outline-none focus:border-sea-400"
          />
          <button
            type="submit"
            className="rounded-full bg-sea-700 px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-sea-800"
          >
            اشترك
          </button>
        </form>
      )}
    </section>
  );
}

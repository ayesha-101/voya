export type PolicySection = { heading: string; body: string[] };

export function PolicyPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: PolicySection[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
      <span className="mt-3 block h-1 w-14 rounded-full bg-rose-500" />
      <p className="mt-6 text-base leading-8 text-ink">{intro}</p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-extrabold text-plum-800">{s.heading}</h2>
            <div className="mt-3 space-y-3 text-[15px] leading-8 text-muted">
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

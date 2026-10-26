import type { ReactNode } from "react";

/** A page section with an emoji heading and an anchor id, so other pages can deep-link to it. */
export default function TitledSection({
  id,
  emoji,
  title,
  children,
}: {
  id: string;
  emoji: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
        <span aria-hidden="true">{emoji}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

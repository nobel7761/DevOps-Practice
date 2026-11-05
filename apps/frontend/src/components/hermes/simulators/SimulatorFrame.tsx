import type { ReactNode } from "react";

export default function SimulatorFrame({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <header>
        <h3 className="font-semibold">🎮 Simulator: {title}</h3>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </header>
      {children}
    </section>
  );
}

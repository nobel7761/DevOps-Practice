"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { ReactNode } from "react";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Gradient welcome banner; the stats row is passed in so the hero stays presentational. */
export default function HomeHero({
  courseCount,
  children,
}: {
  courseCount: number;
  children: ReactNode;
}) {
  const { user } = useAuth();
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/15 via-fuchsia-500/10 to-transparent p-6 sm:p-10">
      <div className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 size-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="relative">
        <p className="text-sm font-medium text-primary">
          {greeting()}
          {user ? `, ${user.firstName}` : ""} 👋
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to learn something new today?
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          {courseCount > 0
            ? "Pick up where you left off, or start a fresh course. Every lesson you finish is tracked for you."
            : "Your courses will show up here as soon as they are assigned to you."}
        </p>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

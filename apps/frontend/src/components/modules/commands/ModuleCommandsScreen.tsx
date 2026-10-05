"use client";

import { useMemo, useState } from "react";
import ModuleCommandsToolbar from "@/components/modules/commands/ModuleCommandsToolbar";
import ModuleCommandsCategoryGroup from "@/components/modules/commands/ModuleCommandsCategoryGroup";
import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import type { CommandEntry } from "@/lib/data/commands";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";

export default function ModuleCommandsScreen({
  milestone,
  module,
  commands,
}: {
  milestone: CourseMilestone;
  module: CourseModule;
  commands: CommandEntry[];
}) {
  const [query, setQuery] = useState("");
  const [quizMode, setQuizMode] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (entry) =>
        entry.command.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q),
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandEntry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.category) ?? [];
      list.push(entry);
      map.set(entry.category, list);
    }
    return map;
  }, [filtered]);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 print:py-0">
      <div className="print:hidden">
        <ModuleBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: milestone.title, href: `/?milestone=${milestone.id}` },
            {
              label: module.title,
              href: `/?milestone=${milestone.id}&module=${module.id}`,
            },
            { label: "সব Commands" },
          ]}
        />
      </div>
      <div className="mb-6 print:mb-4">
        <h1 className="text-2xl font-bold">{module.title} — সব Commands</h1>
        <p className="text-sm text-muted-foreground">
          {commands.length} টা command, category অনুযায়ী সাজানো। ইন্টারভিউর আগে
          fast review-এর জন্য।
        </p>
      </div>
      <ModuleCommandsToolbar
        query={query}
        onQueryChange={setQuery}
        quizMode={quizMode}
        onToggleQuiz={() => setQuizMode((v) => !v)}
      />
      {[...grouped.entries()].map(([category, entries]) => (
        <ModuleCommandsCategoryGroup
          key={category}
          category={category}
          entries={entries}
          quizMode={quizMode}
        />
      ))}
      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">
          কোনো command পাওয়া যায়নি।
        </p>
      )}
    </main>
  );
}

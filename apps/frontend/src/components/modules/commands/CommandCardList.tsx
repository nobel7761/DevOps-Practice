"use client";

import { useState } from "react";
import CommandCard from "@/components/modules/commands/CommandCard";
import type { CommandEntry } from "@/lib/data/commands";

export default function CommandCardList({
  entries,
  quizMode,
}: {
  entries: CommandEntry[];
  quizMode: boolean;
}) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => (
        <CommandCard
          key={entry.id}
          entry={entry}
          revealed={!quizMode || revealedIds.has(entry.id)}
          onReveal={() => setRevealedIds((prev) => new Set(prev).add(entry.id))}
        />
      ))}
    </div>
  );
}

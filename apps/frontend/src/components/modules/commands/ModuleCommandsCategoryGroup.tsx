import CommandCardList from "@/components/modules/commands/CommandCardList";
import type { CommandEntry } from "@/lib/data/commands";

export default function ModuleCommandsCategoryGroup({
  category,
  entries,
  quizMode,
}: {
  category: string;
  entries: CommandEntry[];
  quizMode: boolean;
}) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-semibold">{category}</h2>
      <CommandCardList entries={entries} quizMode={quizMode} />
    </section>
  );
}

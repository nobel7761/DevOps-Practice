import { commandGlossary } from "@/lib/data/commands/glossary";
import { labCommandIds } from "@/lib/data/commands/lab-commands";
import type { CommandEntry } from "@/lib/data/commands/types";
import { masteringAwsDevopsSeason4 } from "@/lib/data/course-modules";

export type { CommandEntry, CommandToken } from "@/lib/data/commands/types";

export function getLabCommands(labId: string): CommandEntry[] {
  return (labCommandIds[labId] ?? [])
    .map((id) => commandGlossary[id])
    .filter((entry): entry is CommandEntry => Boolean(entry));
}

export function getModuleCommands(moduleId: string): CommandEntry[] {
  const courseModule = masteringAwsDevopsSeason4.milestones
    .flatMap((milestone) => milestone.modules)
    .find((candidate) => candidate.id === moduleId);

  if (!courseModule) return [];

  const seen = new Set<string>();
  const ordered: CommandEntry[] = [];

  for (const content of courseModule.contents) {
    if (content.type !== "lab" || !content.labId) continue;
    for (const entry of getLabCommands(content.labId)) {
      if (seen.has(entry.id)) continue;
      seen.add(entry.id);
      ordered.push(entry);
    }
  }

  return ordered;
}

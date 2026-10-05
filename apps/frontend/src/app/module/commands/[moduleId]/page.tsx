import { notFound } from "next/navigation";
import ModuleCommandsScreen from "@/components/modules/commands/ModuleCommandsScreen";
import { getModuleCommands } from "@/lib/data/commands";
import { findModuleLocation } from "@/lib/data/course-modules";

export default async function ModuleCommandsPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const location = findModuleLocation(moduleId);
  const commands = getModuleCommands(moduleId);

  if (!location || commands.length === 0) {
    notFound();
  }

  return (
    <ModuleCommandsScreen
      milestone={location.milestone}
      module={location.module}
      commands={commands}
    />
  );
}

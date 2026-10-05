"use client";

import { useState } from "react";
import { Terminal } from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shared/shadcn";
import CommandCardList from "@/components/modules/commands/CommandCardList";
import QuizModeToggle from "@/components/modules/commands/QuizModeToggle";
import type { CommandEntry } from "@/lib/data/commands";

export default function LabCommandsDrawer({
  commands,
}: {
  commands: CommandEntry[];
}) {
  const [quizMode, setQuizMode] = useState(false);

  if (commands.length === 0) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Terminal /> Commands ({commands.length})
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>এই lab-এর Commands</SheetTitle>
          <SheetDescription>
            প্রতিটা command-এর মানে, বাংলায়, গল্প আকারে।
          </SheetDescription>
          <div className="pt-1">
            <QuizModeToggle
              active={quizMode}
              onToggle={() => setQuizMode((v) => !v)}
            />
          </div>
        </SheetHeader>
        <div className="px-4 pb-4">
          <CommandCardList entries={commands} quizMode={quizMode} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

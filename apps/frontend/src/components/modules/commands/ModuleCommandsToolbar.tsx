"use client";

import { Printer } from "lucide-react";
import { Button, Input } from "@/components/shared/shadcn";
import QuizModeToggle from "@/components/modules/commands/QuizModeToggle";

export default function ModuleCommandsToolbar({
  query,
  onQueryChange,
  quizMode,
  onToggleQuiz,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  quizMode: boolean;
  onToggleQuiz: () => void;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 print:hidden">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <QuizModeToggle active={quizMode} onToggle={onToggleQuiz} />
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer /> Print
        </Button>
      </div>
      <Input
        type="search"
        placeholder="Command খুঁজুন... (যেমন: grep, ls)"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  );
}

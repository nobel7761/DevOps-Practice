import { Brain } from "lucide-react";
import { Button } from "@/components/shared/shadcn";

export default function QuizModeToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
    >
      <Brain /> Quiz Mode {active ? "ON" : "OFF"}
    </Button>
  );
}

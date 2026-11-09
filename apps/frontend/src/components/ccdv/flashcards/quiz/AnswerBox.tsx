import { Loader2, ShieldCheck } from "lucide-react";
import { Button, Textarea } from "@/components/shared/shadcn";

export default function AnswerBox({
  value,
  validating,
  onChange,
  onValidate,
}: {
  value: string;
  validating: boolean;
  onChange: (value: string) => void;
  onValidate: () => void;
}) {
  const empty = value.trim().length === 0;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold" htmlFor="ccdv-card-answer">
        ✍️ তোমার উত্তর লেখো (বাংলা, English বা মিশিয়ে)
      </label>
      <Textarea
        id="ccdv-card-answer"
        value={value}
        placeholder="এখানে নিজের ভাষায় উত্তর টাইপ করো, তারপর Validate চাপো…"
        maxLength={1200}
        disabled={validating}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (
            (event.metaKey || event.ctrlKey) &&
            event.key === "Enter" &&
            !empty &&
            !validating
          ) {
            onValidate();
          }
        }}
      />
      <div className="flex items-center gap-2">
        <Button onClick={onValidate} disabled={empty || validating}>
          {validating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          {validating ? "AI যাচাই করছে…" : "Validate"}
        </Button>
        <span className="text-xs text-muted-foreground">
          Ctrl/⌘ + Enter-ও কাজ করে
        </span>
      </div>
    </div>
  );
}

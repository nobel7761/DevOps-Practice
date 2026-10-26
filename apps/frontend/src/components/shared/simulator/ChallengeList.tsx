import { CheckCircle2, Circle, Trophy } from "lucide-react";
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../shadcn";

export interface ChallengeView {
  id: string;
  title: string;
  goal: string;
  hint?: string;
}

function ChallengeItem({
  challenge,
  done,
  onSetup,
}: {
  challenge: ChallengeView;
  done: boolean;
  onSetup?: (id: string) => void;
}) {
  const Icon = done ? CheckCircle2 : Circle;
  return (
    <li className="flex gap-2 rounded-lg border border-border p-3 text-sm">
      <Icon
        className="mt-0.5 size-4 shrink-0"
        style={{ color: done ? "var(--sd-ok)" : undefined }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {challenge.title}
          {done && <span className="sr-only"> (সম্পন্ন)</span>}
        </p>
        <p className="text-muted-foreground">{challenge.goal}</p>
        {challenge.hint && !done && (
          <Collapsible>
            <CollapsibleTrigger className="mt-1 text-xs text-primary hover:underline">
              Hint দেখুন
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 text-xs text-muted-foreground">
              {challenge.hint}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
      {onSetup && !done && (
        <Button
          size="xs"
          variant="outline"
          className="shrink-0"
          onClick={() => onSetup(challenge.id)}
        >
          সাজান
        </Button>
      )}
    </li>
  );
}

/** Challenge mode: missions with a goal and optional hint; the simulator decides completion (Plan doc Section 9.1 rule 8). */
export function ChallengeList({
  challenges,
  completedIds,
  onSetup,
}: {
  challenges: ChallengeView[];
  completedIds: string[];
  /** Optional "সাজান" button that puts the simulator into the challenge's starting situation. */
  onSetup?: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          <Trophy className="size-4" /> Challenges
        </span>
        <Badge variant="secondary">
          {completedIds.length}/{challenges.length}
        </Badge>
      </div>
      <ul className="flex flex-col gap-2">
        {challenges.map((challenge) => (
          <ChallengeItem
            key={challenge.id}
            challenge={challenge}
            done={completedIds.includes(challenge.id)}
            onSetup={onSetup}
          />
        ))}
      </ul>
    </div>
  );
}

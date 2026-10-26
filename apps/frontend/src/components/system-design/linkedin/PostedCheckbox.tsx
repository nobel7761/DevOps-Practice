"use client";

import { Checkbox, Label } from "@/components/shared/shadcn";
import { usePostedState } from "./usePostedState";

export function PostedCheckbox({
  topicId,
  day,
}: {
  topicId: string;
  day: number;
}) {
  const { posted, prepublished, toggle } = usePostedState(topicId, day);
  const id = `posted-${topicId}`;
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={posted}
        disabled={prepublished}
        onCheckedChange={(c) => toggle(c === true)}
      />
      <Label htmlFor={id} className="text-sm font-normal">
        Post করেছি 📣{prepublished ? " (আগেই প্রকাশিত)" : ""}
      </Label>
    </div>
  );
}

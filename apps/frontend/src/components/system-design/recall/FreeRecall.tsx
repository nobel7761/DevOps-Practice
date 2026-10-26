"use client";

import { useState } from "react";
import { PlainTextarea } from "@/components/shared/form";
import { Button, Checkbox, Label } from "@/components/shared/shadcn";
import type { RecallPoint } from "@/lib/system-design/validate-topic";

/** Hard mode: only the topic is shown; write what you remember, then reveal the list and tick what you got. */
export function FreeRecall({
  title,
  points,
}: {
  title: string;
  points: RecallPoint[];
}) {
  const [notes, setNotes] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [remembered, setRemembered] = useState<string[]>([]);

  const toggle = (term: string, checked: boolean) =>
    setRemembered((current) =>
      checked ? [...current, term] : current.filter((t) => t !== term),
    );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm">
        <span className="font-semibold">{title}</span>: এর core point-গুলো কী
        কী? যত মনে পড়ে লিখুন।
      </p>
      <PlainTextarea
        value={notes}
        onChange={setNotes}
        rows={5}
        placeholder="একটা একটা লাইনে লিখুন..."
      />
      {!revealed ? (
        <Button className="w-fit" onClick={() => setRevealed(true)}>
          মিলিয়ে দেখুন
        </Button>
      ) : (
        <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
          <p className="text-sm font-medium">
            কোনগুলো মনে পড়েছিল, নিজে tick দিন: {remembered.length}/
            {points.length}
          </p>
          <ul className="flex flex-col gap-2">
            {points.map((point) => (
              <li key={point.term} className="flex items-center gap-2">
                <Checkbox
                  id={`free-${point.term}`}
                  checked={remembered.includes(point.term)}
                  onCheckedChange={(checked) =>
                    toggle(point.term, checked === true)
                  }
                />
                <Label htmlFor={`free-${point.term}`} className="font-normal">
                  {point.term}
                </Label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

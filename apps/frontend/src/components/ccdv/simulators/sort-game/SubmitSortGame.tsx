"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import SimulatorFrame from "@/components/hermes/simulators/SimulatorFrame";
import { Button } from "@/components/shared/shadcn";
import { LessonBox } from "@/components/shared/simulator";
import { loadStudy, resetSimStudy, saveSimStudy } from "@/lib/ccdv/study-api";
import type { SortBucket, SortItem } from "./index";
import PickCard from "./PickCard";

/** Sort-game with a submit step: pick every answer, press Submit, then see what was right and why. Answers are saved. */
export default function SubmitSortGame({
  chapterId,
  simKey,
  title,
  hint,
  takeaway,
  buckets,
  items,
}: {
  chapterId: string;
  simKey: string;
  title: string;
  hint: string;
  takeaway?: string;
  buckets: SortBucket[];
  items: SortItem[];
}) {
  const [choices, setChoices] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadStudy(chapterId).then((study) => {
      const saved = study.sims[simKey];
      if (cancelled || !saved) return;
      setChoices(saved.choices);
      setSubmitted(saved.submitted);
    });
    return () => {
      cancelled = true;
    };
  }, [chapterId, simKey]);

  const picked = Object.keys(choices).length;
  const correct = items.filter((item, i) => choices[i] === item.bucket).length;

  const pick = (index: number, bucketId: string) => {
    const next = { ...choices, [index]: bucketId };
    setChoices(next);
    void saveSimStudy(chapterId, simKey, next, false);
  };
  const submit = () => {
    setSubmitted(true);
    void saveSimStudy(chapterId, simKey, choices, true);
  };
  const reset = () => {
    setChoices({});
    setSubmitted(false);
    void resetSimStudy(chapterId, simKey);
  };

  return (
    <SimulatorFrame title={title} hint={hint}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium">
          {submitted
            ? `স্কোর: ${correct} / ${items.length}`
            : `বাছাই করা: ${picked} / ${items.length}`}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={reset}
          disabled={picked === 0 && !submitted}
        >
          <RotateCcw className="size-4" /> Reset
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <PickCard
            key={index}
            item={item}
            buckets={buckets}
            choice={choices[index]}
            submitted={submitted}
            onPick={(id) => pick(index, id)}
          />
        ))}
      </div>
      {!submitted && (
        <Button onClick={submit} disabled={picked < items.length}>
          Submit করো
        </Button>
      )}
      {submitted && takeaway && <LessonBox>{takeaway}</LessonBox>}
    </SimulatorFrame>
  );
}

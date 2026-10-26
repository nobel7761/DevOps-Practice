"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/shared/shadcn";
import {
  pointColor,
  type RecallRating,
  type RecallRecord,
} from "@/lib/system-design/recall/schedule";
import type { RecallMap } from "@/lib/system-design/validate-topic";
import { RecallMindMap } from "./RecallMindMap";
import { RecallPointCard } from "./RecallPointCard";
import { RecallPointList } from "./RecallPointList";

/** Main mode: explain each keyword out loud, then click it to check yourself and rate. */
export function KeywordRecall({
  title,
  recall,
  records,
  onRate,
}: {
  title: string;
  recall: RecallMap;
  records: RecallRecord[];
  onRate: (term: string, rating: RecallRating) => void;
}) {
  const [view, setView] = useState<"map" | "list">("map");
  const [selected, setSelected] = useState<string | null>(null);
  const recordFor = (term: string) => records.find((r) => r.term === term);
  const points = recall.points.map((p) => ({
    term: p.term,
    color: pointColor(recordFor(p.term)),
  }));
  const selectedPoint = recall.points.find((p) => p.term === selected);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          💡 এমনভাবে বলুন যেন একজন junior-কে বোঝাচ্ছেন। তারপর keyword-এ click
          করে মিলিয়ে দেখুন।
        </p>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          className="shrink-0"
          value={view}
          onValueChange={(v) => v && setView(v as "map" | "list")}
        >
          <ToggleGroupItem value="map" className="px-3">
            Mind map
          </ToggleGroupItem>
          <ToggleGroupItem value="list" className="px-3">
            List
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {view === "map" ? (
        <div
          className="overflow-x-auto rounded-xl border border-border"
          style={{ background: "var(--sd-canvas)" }}
        >
          <RecallMindMap
            title={title}
            points={points}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      ) : (
        <RecallPointList
          points={points}
          selected={selected}
          onSelect={setSelected}
        />
      )}
      {selectedPoint && (
        <RecallPointCard
          point={selectedPoint}
          lastRating={recordFor(selectedPoint.term)?.lastRating ?? null}
          onRate={(rating) => onRate(selectedPoint.term, rating)}
        />
      )}
    </div>
  );
}

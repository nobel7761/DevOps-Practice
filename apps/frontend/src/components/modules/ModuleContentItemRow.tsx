"use client";

import { useState } from "react";
import Link from "next/link";
import { StickyNote } from "lucide-react";
import { Badge } from "@/components/shared/shadcn";
import CustomButton from "@/components/shared/CustomButton";
import NoteEditor from "@/components/modules/notes/NoteEditor";
import { resolveContentHref } from "@/lib/data/content-href";
import type {
  CourseContentItem,
  CourseContentType,
} from "@/lib/data/course-modules";
import { hasInterview } from "@/lib/data/interview-modules";

const TYPE_LABELS: Record<CourseContentType, string> = {
  lab: "Lab",
  pre_class: "Pre-class",
  live_class: "Live class",
  ai_interview: "AI interview",
  ai_exam: "AI exam",
  project_submission: "Project",
  udemy_lecture: "Lecture",
  sd_lesson: "Lesson",
};

export default function ModuleContentItemRow({
  item,
  moduleId,
}: {
  item: CourseContentItem;
  moduleId: string;
}) {
  const [showNotes, setShowNotes] = useState(false);
  // Overrides `item.hasNote` the moment a save completes, so the icon
  // updates instantly without waiting on a refetch of the bulk notes check.
  const [hasNoteOverride, setHasNoteOverride] = useState<boolean | null>(null);
  const hasNote = hasNoteOverride ?? item.hasNote ?? false;

  const label = (
    <div className="flex min-w-0 items-center gap-2">
      <Badge variant="outline" className="shrink-0">
        {TYPE_LABELS[item.type]}
      </Badge>
      <span className="truncate">{item.title ?? "Untitled"}</span>
    </div>
  );

  const isUnprovisionedLab = item.type === "lab" && !item.labId;
  const isExternal = item.type === "udemy_lecture" && Boolean(item.externalUrl);
  const status = isUnprovisionedLab ? (
    <span className="shrink-0 text-xs italic text-muted-foreground">
      Coming soon
    </span>
  ) : item.durationLabel ? (
    <span className="shrink-0 text-xs text-muted-foreground">
      {item.durationLabel}
    </span>
  ) : item.completed ? (
    <span className="shrink-0 text-xs text-muted-foreground">Done</span>
  ) : null;

  const href = resolveContentHref(item, moduleId, hasInterview);

  const canHaveNotes = Boolean(item.contentId);

  const notesToggle = canHaveNotes && (
    <CustomButton
      variant="icon"
      iconColor={hasNote ? "green" : "slate"}
      className="shrink-0"
      aria-label={showNotes ? "Hide notes" : "Show notes"}
      onClick={() => setShowNotes((prev) => !prev)}
    >
      <StickyNote className="size-4" />
    </CustomButton>
  );

  const row = isExternal ? (
    <a
      href={item.externalUrl!}
      target="_blank"
      rel="noopener noreferrer"
      className="-mx-1 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-1 py-0.5 hover:bg-accent hover:underline"
    >
      {label}
      {status}
    </a>
  ) : href ? (
    <Link
      href={href}
      className="-mx-1 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-1 py-0.5 hover:bg-accent hover:underline"
    >
      {label}
      {status}
    </Link>
  ) : (
    <div
      className={`flex min-w-0 flex-1 items-center justify-between gap-3${isUnprovisionedLab ? " text-muted-foreground" : ""}`}
    >
      {label}
      {status}
    </div>
  );

  return (
    <li className="text-sm">
      <div className="flex items-center gap-1">
        {row}
        {notesToggle}
      </div>
      {canHaveNotes && showNotes && (
        <NoteEditor
          contentId={item.contentId!}
          onSaved={(hasContent) => setHasNoteOverride(hasContent)}
        />
      )}
    </li>
  );
}

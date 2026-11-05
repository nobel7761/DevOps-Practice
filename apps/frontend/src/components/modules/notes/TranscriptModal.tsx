"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/shadcn";
import TranscriptModalBody from "./TranscriptModalBody";

export default function TranscriptModal({
  open,
  onOpenChange,
  contentId,
  title,
  hasTranscript,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  title: string;
  hasTranscript: boolean;
  onSaved: (hasContent: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{title}</DialogTitle>
          <DialogDescription>
            {hasTranscript
              ? "এই video-র transcript add করা আছে।"
              : "এই video-র transcript paste করে Submit করুন।"}
          </DialogDescription>
        </DialogHeader>
        <TranscriptModalBody
          contentId={contentId}
          onSaved={onSaved}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

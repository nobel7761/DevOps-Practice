"use client";

import CustomButton from "@/components/shared/CustomButton";

export default function TranscriptView({
  content,
  onEdit,
}: {
  content: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-[60vh] overflow-y-auto rounded-md border border-border bg-background/50 p-3 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
      <div className="flex justify-end">
        <CustomButton variant="secondary" onClick={onEdit}>
          Edit
        </CustomButton>
      </div>
    </div>
  );
}

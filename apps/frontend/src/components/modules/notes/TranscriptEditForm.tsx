"use client";

import { useState } from "react";
import CustomButton from "@/components/shared/CustomButton";
import { Textarea } from "@/components/shared/shadcn";

export default function TranscriptEditForm({
  initialValue,
  saving,
  onSubmit,
  onCancel,
}: {
  initialValue: string;
  saving: boolean;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(initialValue);
  const isEmpty = draft.trim().length === 0;

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="এখানে transcript paste করুন..."
        className="max-h-[50vh] min-h-64 text-sm"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <CustomButton variant="secondary" onClick={onCancel}>
            Cancel
          </CustomButton>
        )}
        <CustomButton
          variant="primary"
          disabled={saving || isEmpty}
          onClick={() => onSubmit(draft)}
        >
          {saving ? "Saving..." : "Submit"}
        </CustomButton>
      </div>
    </div>
  );
}

"use client";

import { PlainTextarea } from "@/components/shared/form";
import { PLACEHOLDER, renderBold } from "@/lib/system-design/linkedin/post";

/** One line of the post preview; the experience placeholder line becomes an inline textbox. */
export function PostPreviewLine({
  line,
  personalPrompt,
  experience,
  onExperienceChange,
}: {
  line: string;
  personalPrompt: string;
  experience: string;
  onExperienceChange: (value: string) => void;
}) {
  if (PLACEHOLDER.test(line)) {
    return (
      <div className="my-1 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-2">
        <span className="mb-1 block text-xs font-medium text-primary">
          ✍️ আপনার অভিজ্ঞতা
        </span>
        <PlainTextarea
          value={experience}
          onChange={onExperienceChange}
          placeholder={personalPrompt}
          rows={2}
        />
      </div>
    );
  }
  return (
    <p className="min-h-[1.4em] whitespace-pre-wrap">{renderBold(line)}</p>
  );
}

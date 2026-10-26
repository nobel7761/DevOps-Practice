"use client";

import type { LinkedInPost } from "@/lib/system-design/validate-topic";
import { PostPreviewLine } from "./PostPreviewLine";

/** Roughly how the post looks on LinkedIn, with a dashed line where "...see more" cuts it (Plan doc Section 8.4). */
export function PostPreview({
  post,
  experience,
  onExperienceChange,
}: {
  post: LinkedInPost;
  experience: string;
  onExperienceChange: (value: string) => void;
}) {
  const lines = post.text.split("\n");
  const renderLine = (line: string, i: number) => (
    <PostPreviewLine
      key={i}
      line={line}
      personalPrompt={post.personalPrompt}
      experience={experience}
      onExperienceChange={onExperienceChange}
    />
  );

  return (
    <div className="rounded-xl border border-border bg-background p-4 text-sm leading-relaxed">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          আ
        </span>
        <div className="leading-tight">
          <p className="font-semibold">আপনি</p>
          <p className="text-xs text-muted-foreground">এখনই · 🌐</p>
        </div>
      </div>
      {lines.slice(0, 2).map(renderLine)}
      <div
        className="my-2 flex items-center gap-2 text-xs text-muted-foreground"
        aria-hidden="true"
      >
        <span className="h-px flex-1 border-t border-dashed border-muted-foreground/60" />
        এখানে &quot;...see more&quot; পড়বে
        <span className="h-px flex-1 border-t border-dashed border-muted-foreground/60" />
      </div>
      {lines.slice(2).map((line, i) => renderLine(line, i + 2))}
      <p className="mt-3 text-primary">{post.hashtags.join(" ")}</p>
    </div>
  );
}

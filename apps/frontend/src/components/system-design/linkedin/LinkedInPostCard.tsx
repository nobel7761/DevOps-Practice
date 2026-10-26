"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/shared/shadcn";
import type { RecapTopic } from "@/lib/system-design/export/carousel";
import {
  POST_TYPE_BADGES,
  buildCopyText,
} from "@/lib/system-design/linkedin/post";
import type { LinkedInPost } from "@/lib/system-design/validate-topic";
import { PollFields } from "./PollFields";
import { PostActions, type PostImage } from "./PostActions";
import { PostCounts } from "./PostCounts";
import { PostedCheckbox } from "./PostedCheckbox";
import { PostingTips } from "./PostingTips";
import { PostPreview } from "./PostPreview";
import { usePostExperience } from "./usePostExperience";

function FirstComment({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-sm">
      <span className="mb-1 block text-xs font-medium">
        প্রথম comment (post করার পরে নিজের post-এ দিন)
      </span>
      <p className="whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function Sources({ sources }: { sources: string[] }) {
  return (
    <div className="text-xs text-muted-foreground">
      <span className="font-medium">তথ্যের উৎস (যাচাই করে নিন):</span>
      <ul className="mt-1 list-disc pl-5">
        {sources.map((source) => (
          <li key={source}>{source}</li>
        ))}
      </ul>
    </div>
  );
}

/** Lesson section 18 "📣 LinkedIn Post" (Plan doc Section 8.4). `{link}` in the first comment becomes the lesson's full URL. */
export function LinkedInPostCard({
  post,
  topicId,
  day,
  lessonPath,
  image,
  recap,
}: {
  post: LinkedInPost;
  topicId: string;
  day: number;
  /** e.g. "/course/system-design-a-z?module=sd-day-012"; the origin is added in the browser. */
  lessonPath: string;
  image: PostImage;
  recap?: { week: number; topics: RecapTopic[]; nextTopics: string[] };
}) {
  const { experience, update, saved } = usePostExperience(topicId);
  // Read after mount so server and client render the same first comment.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const firstComment = post.firstComment.replaceAll(
    "{link}",
    `${origin}${lessonPath}`,
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary">{POST_TYPE_BADGES[post.type]}</Badge>
        <PostCounts copyText={buildCopyText(post, experience)} />
      </div>
      <PostPreview
        post={post}
        experience={experience}
        onExperienceChange={update}
      />
      {!saved && (
        <span className="-mt-2 text-xs text-muted-foreground">
          অভিজ্ঞতা save হচ্ছে...
        </span>
      )}
      <PostActions
        post={post}
        experience={experience}
        firstComment={firstComment}
        image={image}
        recap={recap}
      />
      <FirstComment text={firstComment} />
      {post.poll && <PollFields poll={post.poll} />}
      {post.sources && post.sources.length > 0 && (
        <Sources sources={post.sources} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <PostedCheckbox topicId={topicId} day={day} />
        <PostingTips />
      </div>
    </div>
  );
}

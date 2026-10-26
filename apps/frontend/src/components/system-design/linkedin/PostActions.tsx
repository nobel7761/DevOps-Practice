"use client";

import CopyButton from "@/components/shared/CopyButton";
import {
  LinkedInDownloadButton,
  RecapCarouselButton,
} from "@/components/shared/diagram";
import type { RecapTopic } from "@/lib/system-design/export/carousel";
import type { LinkedInPost } from "@/lib/system-design/validate-topic";
import { CopyPostButton } from "./CopyPostButton";

export interface PostImage {
  dayLabel: string;
  title: string;
  definition: string;
}

/** Copy post, copy first comment, and the matching visual: diagram PNG, or the week's PDF carousel for a recap. */
export function PostActions({
  post,
  experience,
  firstComment,
  image,
  recap,
}: {
  post: LinkedInPost;
  experience: string;
  firstComment: string;
  image: PostImage;
  recap?: { week: number; topics: RecapTopic[]; nextTopics: string[] };
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CopyPostButton post={post} experience={experience} />
      <CopyButton text={firstComment} label="প্রথম comment copy করুন" />
      {recap ? (
        <RecapCarouselButton
          week={recap.week}
          topics={recap.topics}
          nextTopics={recap.nextTopics}
        />
      ) : (
        post.visual && (
          <LinkedInDownloadButton
            getTarget={() =>
              document.querySelector<HTMLElement>(
                `[data-diagram-id="${post.visual}"]`,
              )
            }
            dayLabel={image.dayLabel}
            title={image.title}
            definition={image.definition}
            fileName={`${image.dayLabel.toLowerCase().replace(/\s+/g, "-")}-linkedin.png`}
          />
        )
      )}
    </div>
  );
}

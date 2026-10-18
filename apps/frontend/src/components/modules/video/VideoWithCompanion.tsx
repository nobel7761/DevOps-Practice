"use client";

import { BookOpenText, ListChecks } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/shadcn";
import LabComingSoonPanel from "@/components/modules/lab/LabComingSoonPanel";
import VideoCompanionPanel from "@/components/modules/video/VideoCompanionPanel";
import MarkCompleteButton from "@/components/shared/MarkCompleteButton";
import VideoPlayer from "@/components/shared/VideoPlayer";
import type { RelatedLab } from "@/lib/data/video-ask-context";

export default function VideoWithCompanion({
  contentId,
  title,
  videoUrl,
  golpoMarkdown,
  labs,
  moduleId,
  hasInterview,
}: {
  contentId: string;
  title: string;
  videoUrl: string;
  golpoMarkdown: string | null;
  labs: RelatedLab[];
  moduleId: string | null;
  hasInterview: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
      {/* Left: original video, unmodified. */}
      <Card className="lg:sticky lg:top-6">
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl">{title}</CardTitle>
          <MarkCompleteButton contentKey={contentId} type="video" />
        </CardHeader>
        <CardContent>
          <VideoPlayer src={videoUrl} title={title} />
        </CardContent>
      </Card>

      {/* Right: companion learning panel (golpo essay + quiz). */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)]">
        <div className="shrink-0">
          <h2 className="font-semibold">এই Video শেখার সহায়ক উপকরণ</h2>
          <p className="text-sm text-muted-foreground">
            এই topic-এর বাংলা golpo-style ব্যাখ্যা, beginner থেকে advanced, আর
            quiz।
          </p>
        </div>

        <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {golpoMarkdown ? (
            <VideoCompanionPanel
              contentId={contentId}
              videoTitle={title}
              markdown={golpoMarkdown}
              labs={labs}
              moduleId={moduleId}
              hasInterview={hasInterview}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <LabComingSoonPanel
                icon={BookOpenText}
                title="বাংলা Golpo Lesson"
                description="এই video-র topic-টা beginner থেকে advanced level পর্যন্ত গল্প আকারে বাংলায় ব্যাখ্যা করা হবে এখানে।"
              />
              <LabComingSoonPanel
                icon={ListChecks}
                title="Quiz"
                description="এই topic নিয়ে MCQ quiz — pass mark 95%।"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

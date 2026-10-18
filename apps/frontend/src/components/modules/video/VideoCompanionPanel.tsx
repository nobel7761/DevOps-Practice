"use client";

import { BookOpenText, ListChecks, MessageCircleQuestion } from "lucide-react";
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import AskAiPanel from "@/components/modules/video/AskAiPanel";
import LabQuiz from "@/components/modules/lab/quiz/LabQuiz";
import VideoGolpoEssay from "@/components/modules/video/VideoGolpoEssay";
import type { RelatedLab } from "@/lib/data/video-ask-context";

const TAB_TRIGGER_CLASS =
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground";

export default function VideoCompanionPanel({
  contentId,
  videoTitle,
  markdown,
  labs,
  moduleId,
  hasInterview,
}: {
  contentId: string;
  videoTitle: string;
  markdown: string;
  labs: RelatedLab[];
  moduleId: string | null;
  hasInterview: boolean;
}) {
  return (
    <Tabs defaultValue="golpo">
      <TabsList className="sticky top-0 z-10 w-full bg-background">
        <TabsTrigger value="golpo" className={TAB_TRIGGER_CLASS}>
          <BookOpenText className="size-4" />
          Golpo Lesson
        </TabsTrigger>
        <TabsTrigger value="quiz" className={TAB_TRIGGER_CLASS}>
          <ListChecks className="size-4" />
          Quiz
        </TabsTrigger>
        <TabsTrigger value="ask" className={TAB_TRIGGER_CLASS}>
          <MessageCircleQuestion className="size-4" />
          Ask OpenAI
        </TabsTrigger>
      </TabsList>
      <TabsContent value="golpo">
        <Card>
          <CardContent>
            <VideoGolpoEssay markdown={markdown} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="quiz">
        <Card>
          <CardContent>
            <LabQuiz labId={contentId} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ask">
        <Card>
          <CardContent>
            <AskAiPanel
              contentId={contentId}
              videoTitle={videoTitle}
              golpoMarkdown={markdown}
              labs={labs}
              moduleId={moduleId}
              hasInterview={hasInterview}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

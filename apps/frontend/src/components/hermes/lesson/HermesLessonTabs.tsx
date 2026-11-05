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
import type { HermesLesson } from "@/lib/data/hermes/lesson.types";
import { lessonToMarkdown } from "@/lib/data/hermes/lesson-to-markdown";
import { SdQuiz } from "@/components/system-design/quiz/SdQuiz";
import LessonBlockView from "./LessonBlockView";
import LessonRecap from "./LessonRecap";

const TAB_TRIGGER_CLASS =
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground";

export default function HermesLessonTabs({ lesson }: { lesson: HermesLesson }) {
  return (
    <Tabs defaultValue="lesson">
      <TabsList className="sticky top-0 z-10 w-full bg-background">
        <TabsTrigger value="lesson" className={TAB_TRIGGER_CLASS}>
          <BookOpenText className="size-4" />
          Golpo Lesson
        </TabsTrigger>
        <TabsTrigger value="quiz" className={TAB_TRIGGER_CLASS}>
          <ListChecks className="size-4" />
          Quiz
        </TabsTrigger>
        <TabsTrigger value="ask" className={TAB_TRIGGER_CLASS}>
          <MessageCircleQuestion className="size-4" />
          Ask AI
        </TabsTrigger>
      </TabsList>
      <TabsContent value="lesson">
        <Card>
          <CardContent>
            {lesson.blocks.map((block, index) => (
              <LessonBlockView key={index} block={block} />
            ))}
            <LessonRecap points={lesson.recap} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="quiz">
        <Card>
          <CardContent>
            <SdQuiz
              key={lesson.contentId}
              topicId={lesson.contentId}
              basePath="/hermes-quiz"
              bankSize={20}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="ask">
        <Card>
          <CardContent>
            <AskAiPanel
              contentId={lesson.contentId}
              videoTitle={lesson.title}
              golpoMarkdown={lessonToMarkdown(lesson)}
              labs={[]}
              moduleId={null}
              hasInterview={false}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

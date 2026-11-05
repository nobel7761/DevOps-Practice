"use client";

import {
  BookOpenText,
  FlaskConical,
  Layers,
  ListChecks,
  MessageCircleQuestion,
} from "lucide-react";
import AskAiPanel from "@/components/modules/video/AskAiPanel";
import McqPractice from "@/components/ccdv/practice/McqPractice";
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import { chapterToAskMarkdown } from "@/lib/data/ccdv/ask-context";
import { PART_LABELS, lessonContentId } from "@/lib/data/ccdv/schedule";
import type { CcdvChapterContent, ChapterPart } from "@/lib/data/ccdv/types";
import LabPanel from "./LabPanel";
import LessonPanel from "./LessonPanel";
import NotesPanel from "./NotesPanel";
import PartPanel from "./PartPanel";

const TRIGGER =
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground";

export default function ChapterTabs({
  chapterId,
  chapterTitle,
  content,
  initialPart,
}: {
  chapterId: string;
  chapterTitle: string;
  content: CcdvChapterContent;
  initialPart: ChapterPart;
}) {
  const id = (part: ChapterPart) => lessonContentId(chapterId, part);
  return (
    <Tabs defaultValue={initialPart}>
      <TabsList className="sticky top-0 z-10 w-full bg-background">
        <TabsTrigger value="lesson" className={TRIGGER}>
          <BookOpenText className="size-4" />
          {PART_LABELS.lesson}
        </TabsTrigger>
        <TabsTrigger value="lab" className={TRIGGER}>
          <FlaskConical className="size-4" />
          {PART_LABELS.lab}
        </TabsTrigger>
        <TabsTrigger value="cards" className={TRIGGER}>
          <Layers className="size-4" />
          {PART_LABELS.cards}
        </TabsTrigger>
        <TabsTrigger value="mcq" className={TRIGGER}>
          <ListChecks className="size-4" />
          {PART_LABELS.mcq}
        </TabsTrigger>
        <TabsTrigger value="ask" className={TRIGGER}>
          <MessageCircleQuestion className="size-4" />
          Ask AI
        </TabsTrigger>
      </TabsList>
      <TabsContent value="lesson">
        <PartPanel title={PART_LABELS.lesson} contentId={id("lesson")}>
          <LessonPanel lesson={content.lesson} />
        </PartPanel>
      </TabsContent>
      <TabsContent value="lab">
        <PartPanel title={PART_LABELS.lab} contentId={id("lab")}>
          <LabPanel lab={content.lab} />
        </PartPanel>
      </TabsContent>
      <TabsContent value="cards">
        <PartPanel title={PART_LABELS.cards} contentId={id("cards")}>
          <NotesPanel chapterId={chapterId} content={content} />
        </PartPanel>
      </TabsContent>
      <TabsContent value="mcq">
        <PartPanel title={PART_LABELS.mcq} contentId={id("mcq")}>
          <McqPractice chapterId={chapterId} mcqs={content.mcqs} />
        </PartPanel>
      </TabsContent>
      <TabsContent value="ask">
        <Card>
          <CardContent>
            <AskAiPanel
              contentId={`ccdv-${chapterId}-ask`}
              videoTitle={chapterTitle}
              golpoMarkdown={chapterToAskMarkdown(chapterTitle, content)}
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

"use client";

import {
  BookOpenText,
  ListChecks,
  MessageCircleQuestion,
  SquareTerminal,
} from "lucide-react";
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import AskAiPanel from "@/components/modules/video/AskAiPanel";
import LabExam from "@/components/shared/LabExam";
import LabGolpoLesson from "@/components/modules/lab/LabGolpoLesson";
import LabQuiz from "@/components/modules/lab/quiz/LabQuiz";
import type { CommandEntry } from "@/lib/data/commands";
import type { RelatedLab } from "@/lib/data/video-ask-context";
import type { LabExamSpec } from "@/lib/lab-exam/types";

export default function LabCompanionPanel({
  labId,
  labTitle,
  commands,
  labExamSpec,
  topicEssayMarkdown,
  askMarkdown,
  siblingLabs,
  moduleId,
  hasInterview,
}: {
  labId: string;
  labTitle: string;
  commands: CommandEntry[];
  labExamSpec: LabExamSpec;
  topicEssayMarkdown?: string | null;
  askMarkdown: string;
  siblingLabs: RelatedLab[];
  moduleId: string | null;
  hasInterview: boolean;
}) {
  return (
    <Tabs defaultValue="golpo">
      <TabsList className="sticky top-0 z-10 w-full bg-background">
        <TabsTrigger
          value="golpo"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
        >
          <BookOpenText className="size-4" />
          Golpo Lesson
        </TabsTrigger>
        <TabsTrigger
          value="quiz"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
        >
          <ListChecks className="size-4" />
          Quiz
        </TabsTrigger>
        <TabsTrigger
          value="terminal"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
        >
          <SquareTerminal className="size-4" />
          Terminal
        </TabsTrigger>
        <TabsTrigger
          value="ask"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
        >
          <MessageCircleQuestion className="size-4" />
          Ask AI
        </TabsTrigger>
      </TabsList>
      <TabsContent value="golpo">
        <Card>
          <CardContent>
            <LabGolpoLesson
              labTitle={labTitle}
              commands={commands}
              topicEssayMarkdown={topicEssayMarkdown}
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="quiz">
        <Card>
          <CardContent>
            <LabQuiz labId={labId} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="terminal">
        <LabExam spec={labExamSpec} />
      </TabsContent>
      <TabsContent value="ask">
        <Card>
          <CardContent>
            <AskAiPanel
              contentId={labId}
              videoTitle={labTitle}
              golpoMarkdown={askMarkdown}
              labs={siblingLabs}
              moduleId={moduleId}
              hasInterview={hasInterview}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

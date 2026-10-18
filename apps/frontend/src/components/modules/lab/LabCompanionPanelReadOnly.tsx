"use client";

import { BookOpenText, ListChecks } from "lucide-react";
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import LabGolpoLesson from "@/components/modules/lab/LabGolpoLesson";
import LabQuiz from "@/components/modules/lab/quiz/LabQuiz";
import type { CommandEntry } from "@/lib/data/commands";

const TAB_TRIGGER_CLASS =
  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground";

/** For labs with no interactive terminal support (e.g. Mininet/SDN labs — a different domain than the Linux-shell simulator can grade): golpo walkthrough + quiz only. */
export default function LabCompanionPanelReadOnly({
  labId,
  labTitle,
  commands,
  topicEssayMarkdown,
}: {
  labId: string;
  labTitle: string;
  commands: CommandEntry[];
  topicEssayMarkdown?: string | null;
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
      </TabsList>
      <TabsContent value="golpo">
        <Card>
          <CardContent>
            <LabGolpoLesson
              labTitle={labTitle}
              commands={commands}
              hasTerminal={false}
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
    </Tabs>
  );
}

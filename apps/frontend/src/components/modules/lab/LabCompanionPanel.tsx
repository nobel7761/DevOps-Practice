"use client";

import { BookOpenText, ListChecks, SquareTerminal } from "lucide-react";
import {
  Card,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/shadcn";
import LabExam from "@/components/shared/LabExam";
import LabGolpoLesson from "@/components/modules/lab/LabGolpoLesson";
import LabQuiz from "@/components/modules/lab/quiz/LabQuiz";
import type { CommandEntry } from "@/lib/data/commands";
import type { LabExamSpec } from "@/lib/lab-exam/types";

export default function LabCompanionPanel({
  labId,
  labTitle,
  commands,
  labExamSpec,
}: {
  labId: string;
  labTitle: string;
  commands: CommandEntry[];
  labExamSpec: LabExamSpec;
}) {
  return (
    <Tabs defaultValue="golpo">
      <TabsList className="sticky top-0 z-10 w-full bg-background">
        <TabsTrigger value="golpo">
          <BookOpenText className="size-4" />
          Golpo Lesson
        </TabsTrigger>
        <TabsTrigger value="quiz">
          <ListChecks className="size-4" />
          Quiz
        </TabsTrigger>
        <TabsTrigger value="terminal">
          <SquareTerminal className="size-4" />
          Terminal
        </TabsTrigger>
      </TabsList>
      <TabsContent value="golpo">
        <Card>
          <CardContent>
            <LabGolpoLesson labTitle={labTitle} commands={commands} />
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
    </Tabs>
  );
}

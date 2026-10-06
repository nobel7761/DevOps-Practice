"use client";

import { BookOpenText, ListChecks, SquareTerminal } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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

export default function LabCompanionDrawer({
  labId,
  labTitle,
  commands,
  labExamSpec,
}: {
  labId: string;
  labTitle: string;
  commands: CommandEntry[];
  labExamSpec: LabExamSpec | null;
}) {
  if (!labExamSpec) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpenText /> Golpo, Quiz ও Terminal
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[75vw] overflow-y-auto sm:max-w-[75vw]">
        <SheetHeader>
          <SheetTitle>এই Lab শেখার সহায়ক উপকরণ</SheetTitle>
          <SheetDescription>
            বাংলা golpo-style ব্যাখ্যা, quiz, আর practice terminal — এই lab-এর
            জন্য।
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <Tabs defaultValue="golpo">
            <TabsList className="w-full">
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
        </div>
      </SheetContent>
    </Sheet>
  );
}

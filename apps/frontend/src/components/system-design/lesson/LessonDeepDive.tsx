import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shared/shadcn";
import LessonProse from "@/components/system-design/lesson/LessonProse";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type {
  LessonDeepDiveItem,
  LessonMeta,
} from "@/lib/system-design/lesson.types";

// Collapsed by default so beginners aren't overwhelmed (Plan doc Section 5, item 6).
export default function LessonDeepDive({
  items,
  meta,
}: {
  items: LessonDeepDiveItem[];
  meta?: LessonMeta;
}) {
  return (
    <LessonSection section="deepDive">
      <p className="mb-2 text-sm text-muted-foreground">
        Intermediate → Advanced। প্রথমবার পড়লে চাইলে বাদ দিতে পারেন।
      </p>
      <Accordion
        type="multiple"
        className="rounded-xl border border-border px-4"
      >
        {items.map((item) => (
          <AccordionItem key={item.title} value={item.title}>
            <AccordionTrigger>{item.title}</AccordionTrigger>
            <AccordionContent>
              <LessonProse content={item} meta={meta} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </LessonSection>
  );
}

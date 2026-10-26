import {
  BookOpen,
  Brain,
  CalendarDays,
  Gamepad2,
  ListChecks,
  Share2,
  type LucideIcon,
} from "lucide-react";

type GuideStep = { icon: LucideIcon; title: string; text: string };

const STEPS: GuideStep[] = [
  {
    icon: CalendarDays,
    title: "প্রতিদিন একটা topic, ক্রম মেনে",
    text: "বাম পাশের sidebar থেকে Phase খুলে Day ধরে এগোন। প্রতিটা lesson-এর শুরুতে prerequisite দেওয়া আছে; সেগুলো আগে শেষ করুন।",
  },
  {
    icon: BookOpen,
    title: "Lesson উপর থেকে নিচে পড়ুন",
    text: "সমস্যা → analogy → মূল ধারণা → deep dive। Diagram-গুলোর ধাপ নিজে চালিয়ে দেখুন, শুধু চোখ বুলিয়ে যাবেন না।",
  },
  {
    icon: Gamepad2,
    title: "হাতে-কলমে করুন",
    text: "Simulator থাকলে challenge-গুলো pass করুন, তারপর Hands-on Lab নিজের মেশিনে চালান। Playground-এ সব simulator একসাথে পাবেন।",
  },
  {
    icon: ListChecks,
    title: "নিজেকে যাচাই করুন",
    text: '"নিজে ব্যাখ্যা করুন" আর interview প্রশ্নগুলোর উত্তর আগে মুখে বলুন, তারপর Quiz দিন: প্রতিবার ২০টা প্রশ্ন, pass করতে ৯৫% লাগবে।',
  },
  {
    icon: Brain,
    title: "Recall বাদ দেবেন না",
    text: 'পড়া topic ১, ৩, ৭, ১৪ ও ৩০ দিন পরে আবার review-তে আসে। প্রতিদিন নতুন topic-এর আগে "আজকের Recall" শেষ করুন।',
  },
  {
    icon: Share2,
    title: "শেখা জিনিস লিখে ফেলুন",
    text: "Quiz pass করার পর lesson-এর শেষের LinkedIn post আর diagram শেয়ার করুন; অন্যকে বোঝাতে গেলেই শেখা পাকা হয়।",
  },
];

function GuideItem({ step, index }: { step: GuideStep; index: number }) {
  const Icon = step.icon;
  return (
    <li className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-semibold">
          {index + 1}. {step.title}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">{step.text}</p>
      </div>
    </li>
  );
}

/** How to work through the course, shown on the landing before a topic is picked. */
export function SdStudyGuide() {
  return (
    <section className="mt-8 border-t border-border pt-6">
      <h2 className="mb-4 text-base font-semibold">কীভাবে course-টা করবেন</h2>
      <ol className="grid gap-5 sm:grid-cols-2">
        {STEPS.map((step, i) => (
          <GuideItem key={step.title} step={step} index={i} />
        ))}
      </ol>
    </section>
  );
}

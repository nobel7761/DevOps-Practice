import { Badge, Card, CardContent } from "@/components/shared/shadcn";
import { domainName } from "@/lib/data/ccdv/blueprint";
import type { ChapterMeta } from "@/lib/data/ccdv/schedule";
import TopicList from "./TopicList";

const DAY_PLAN =
  "৬০ মিনিট গল্প + simulator · ২৫ মিনিট lab · ২০ মিনিট MCQ · ১৫ মিনিট flashcard";

export default function ChapterHeader({ chapter }: { chapter: ChapterMeta }) {
  return (
    <Card className="mb-4">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Day {chapter.day}</Badge>
          {chapter.domains.map((id) => (
            <Badge key={id} variant="outline">
              D{id} · {domainName(id)}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          আজকের ২ ঘণ্টার plan: {DAY_PLAN}
        </p>
        <div>
          <p className="mb-1 text-sm font-semibold">
            আজকের topic (সব শেষ হলে চারটা part-ই Complete করো)
          </p>
          <TopicList topics={chapter.topics} />
        </div>
        <p className="text-xs text-muted-foreground">
          Official course-এর যে অংশ এখানে cover হয়েছে:{" "}
          {chapter.covers.join(" · ")}
        </p>
      </CardContent>
    </Card>
  );
}

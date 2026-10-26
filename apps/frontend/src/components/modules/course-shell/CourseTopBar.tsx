import { House } from "lucide-react";
import Link from "next/link";
import { Button, SidebarTrigger } from "@/components/shared/shadcn";

/** Sticky bar above a course page: sidebar toggle, then Home / course title. */
export default function CourseTopBar({
  courseTitle,
  courseHref,
}: {
  courseTitle: string;
  courseHref: string;
}) {
  return (
    <div className="sticky top-0 z-10 flex print:hidden h-12 items-center gap-2 border-b border-border bg-background/90 pr-28 pl-4 backdrop-blur">
      <SidebarTrigger aria-label="Sidebar খুলুন/বন্ধ করুন" />
      <Button asChild variant="ghost" size="sm">
        <Link href="/">
          <House /> Home
        </Link>
      </Button>
      <span className="text-sm text-muted-foreground">/</span>
      <Link
        href={courseHref}
        className="truncate text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {courseTitle}
      </Link>
    </div>
  );
}

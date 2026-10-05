import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/shadcn";
import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import VideoPlayer from "@/components/shared/VideoPlayer";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";

export default function VideoDetailScreen({
  milestone,
  module,
  title,
  videoUrl,
}: {
  milestone: CourseMilestone;
  module: CourseModule;
  title: string;
  videoUrl: string;
}) {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <ModuleBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: milestone.title, href: `/?milestone=${milestone.id}` },
          {
            label: module.title,
            href: `/?milestone=${milestone.id}&module=${module.id}`,
          },
          { label: title },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoPlayer src={videoUrl} title={title} />
        </CardContent>
      </Card>
    </main>
  );
}

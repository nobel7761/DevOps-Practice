import CourseListHero from "@/components/courses/CourseListHero";
import CourseCardGrid from "@/components/courses/CourseCardGrid";
import { courseRegistry } from "@/lib/data/courses/registry";

export default function CourseListScreen() {
  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 sm:py-12">
      <CourseListHero courseCount={courseRegistry.length} />
      <CourseCardGrid entries={courseRegistry} />
    </main>
  );
}

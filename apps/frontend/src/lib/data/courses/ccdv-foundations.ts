// "CCDV-F Prep" — our own Bangla course for the Claude Certified Developer – Foundations
// exam. 24 study days: 14 chapter days (each day = a module, each trackable part = a
// content item) followed by 10 full mock exams and an analytics page.
//
// Chapter content lives in lib/data/ccdv/chapters/<id>.json, exams in lib/data/ccdv/exams/.

import type {
  CourseContentItem,
  CourseMilestone,
  CourseModule,
  CourseSummary,
} from "@/lib/data/course-modules";
import {
  ANALYTICS_CONTENT_ID,
  CHAPTERS,
  CHAPTER_PARTS,
  MOCK_EXAM_START_DAY,
  PART_LABELS,
  chaptersOnDay,
  examContentId,
  lessonContentId,
} from "@/lib/data/ccdv/schedule";
import { EXAM_COUNT, EXAM_MINUTES } from "@/lib/data/ccdv/blueprint";

export const CCDV_COURSE_ID = "ccdv-foundations-prep";

function buildModule(
  id: string,
  title: string,
  contents: CourseContentItem[],
  counts: CourseModule["contentCounts"],
): CourseModule {
  return {
    id,
    title,
    contentCounts: counts,
    progress: { completed: 0, total: contents.length, percentage: 0 },
    contents,
  };
}

function dayModule(day: number): CourseModule {
  const chapters = chaptersOnDay(day);
  const contents: CourseContentItem[] = chapters.flatMap((chapter) =>
    CHAPTER_PARTS.map((part) => ({
      type: "ccdv_lesson" as const,
      title:
        chapters.length > 1
          ? `${chapter.title} — ${PART_LABELS[part]}`
          : PART_LABELS[part],
      completed: false,
      contentId: lessonContentId(chapter.id, part),
    })),
  );
  const title = `Day ${day} · ${chapters.map((chapter) => chapter.title).join(" + ")}`;
  return buildModule(`${CCDV_COURSE_ID}-day-${day}`, title, contents, {
    ccdv_lesson: contents.length,
  });
}

function examModule(number: number): CourseModule {
  const day = MOCK_EXAM_START_DAY + number - 1;
  const contents: CourseContentItem[] = [
    {
      type: "ccdv_exam",
      title: `Mock Exam ${number} (53 প্রশ্ন · ${EXAM_MINUTES} মিনিট)`,
      completed: false,
      contentId: examContentId(number),
    },
  ];
  return buildModule(
    `${CCDV_COURSE_ID}-day-${day}`,
    `Day ${day} · Mock Exam ${number}`,
    contents,
    { ccdv_exam: 1 },
  );
}

function analyticsModule(): CourseModule {
  return buildModule(
    `${CCDV_COURSE_ID}-analytics`,
    "Results ও Analytics",
    [
      {
        type: "ccdv_exam",
        title: "সব Mock Exam-এর score, domain-wise analysis ও trend",
        completed: false,
        contentId: ANALYTICS_CONTENT_ID,
      },
    ],
    { ccdv_exam: 1 },
  );
}

const learningDays = Array.from(
  new Set(CHAPTERS.map((chapter) => chapter.day)),
);
const dayModules = learningDays.map(dayModule);
const examModules = Array.from({ length: EXAM_COUNT }, (_, index) =>
  examModule(index + 1),
);

function weekMilestone(week: number, modules: CourseModule[]): CourseMilestone {
  return {
    id: `${CCDV_COURSE_ID}-week-${week}`,
    title: `Week ${week}`,
    modules,
  };
}

export const ccdvFoundationsCourse: CourseSummary = {
  courseTitle: "CCDV-F Prep: Claude Certified Developer – Foundations",
  courseId: CCDV_COURSE_ID,
  milestones: [
    weekMilestone(1, dayModules.slice(0, 6)),
    weekMilestone(2, dayModules.slice(6, 12)),
    weekMilestone(3, [...dayModules.slice(12, 14), ...examModules.slice(0, 4)]),
    weekMilestone(4, [...examModules.slice(4), analyticsModule()]),
  ],
};

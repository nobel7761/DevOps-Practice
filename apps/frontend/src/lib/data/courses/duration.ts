import type { CourseSummary } from "@/lib/data/course-modules";

function parseDurationLabel(label: string): number | null {
  const parts = label.split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return null;

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

export function formatTotalDuration(course: CourseSummary): string | null {
  let totalSeconds = 0;
  let hasAnyDuration = false;

  for (const milestone of course.milestones) {
    for (const module of milestone.modules) {
      for (const content of module.contents) {
        if (!content.durationLabel) continue;
        const seconds = parseDurationLabel(content.durationLabel);
        if (seconds === null) continue;
        hasAnyDuration = true;
        totalSeconds += seconds;
      }
    }
  }

  if (!hasAnyDuration) return null;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// Module ids that have an AI Interview ported from poridhi.io.
const MODULE_IDS_WITH_INTERVIEW = new Set([
  "74b6214c-6880-4092-a870-0dd99de179b0", // Linux Fundamentals
  "db3595de-7f99-4c5c-a2c6-3997b51f1715", // Text Processing & Regular Expressions
]);

export function hasInterview(moduleId: string): boolean {
  return MODULE_IDS_WITH_INTERVIEW.has(moduleId);
}

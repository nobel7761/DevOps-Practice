// Module ids that have an AI Interview ported from poridhi.io. Scoped to
// Module 1 for now — see lib/lab-exam and lib/data/commands for the same scope.
const MODULE_IDS_WITH_INTERVIEW = new Set([
  "74b6214c-6880-4092-a870-0dd99de179b0", // Linux Fundamentals
]);

export function hasInterview(moduleId: string): boolean {
  return MODULE_IDS_WITH_INTERVIEW.has(moduleId);
}

import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { HermesLesson } from "./lesson.types";
import { validateHermesLesson } from "./validate-lesson";

const DIR = path.join(__dirname, "docs");
const files = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))
  : [];

describe("Hermes docs lessons", () => {
  it.each(files)("%s is a valid lesson", (file) => {
    const lesson = JSON.parse(
      fs.readFileSync(path.join(DIR, file), "utf-8"),
    ) as HermesLesson;
    expect(validateHermesLesson(lesson, file.replace(/\.json$/, ""))).toEqual(
      [],
    );
  });
});

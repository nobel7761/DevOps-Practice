import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SIMULATORS } from "@/components/hermes/simulators/registry";
import type { HermesLesson } from "@/lib/data/hermes/lesson.types";
import LessonBlockView from "./LessonBlockView";

// Server-render smoke test: every lesson block and every simulator must render
// without throwing and produce markup. (Not a visual check.)
const DIR = path.join(__dirname, "../../../lib/data/hermes/docs");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));

describe("Hermes lessons render", () => {
  it.each(files)("%s renders every block", (file) => {
    const lesson = JSON.parse(
      fs.readFileSync(path.join(DIR, file), "utf-8"),
    ) as HermesLesson;
    lesson.blocks.forEach((block, i) => {
      const html = renderToStaticMarkup(
        createElement(LessonBlockView, { block }),
      );
      expect(
        html.length,
        `${file} block ${i} (${block.type}) is empty`,
      ).toBeGreaterThan(0);
      expect(html, `${file} block ${i} leaked raw ${"```"}`).not.toContain(
        "```",
      );
    });
  });
});

describe("Hermes simulators render", () => {
  it.each(Object.keys(SIMULATORS))("%s renders", (id) => {
    const html = renderToStaticMarkup(createElement(SIMULATORS[id]));
    expect(html).toContain("Simulator");
  });
});

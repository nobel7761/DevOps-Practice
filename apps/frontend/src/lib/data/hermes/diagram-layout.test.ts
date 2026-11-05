import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { HermesLesson } from "./lesson.types";

// Static layout checks for architecture diagrams (no browser needed).
// Node size is 132x64 (see LESSON_BRIEF.md).
const NODE_W = 132;
const NODE_H = 64;

const DIR = path.join(__dirname, "docs");
const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json"));

function load(file: string): HermesLesson {
  return JSON.parse(fs.readFileSync(path.join(DIR, file), "utf-8"));
}

describe("Hermes architecture diagram layout", () => {
  it.each(files)("%s: nodes do not overlap or collide on id", (file) => {
    const problems: string[] = [];
    for (const block of load(file).blocks) {
      if (block.type !== "diagram" || block.diagram.kind !== "architecture")
        continue;
      const { nodes } = block.diagram;
      const ids = new Set<string>();
      nodes.forEach((n, i) => {
        if (ids.has(n.id)) problems.push(`duplicate node id ${n.id}`);
        ids.add(n.id);
        if (n.x < 0 || n.y < 0)
          problems.push(`node ${n.id} has a negative position`);
        for (const m of nodes.slice(i + 1)) {
          if (Math.abs(n.x - m.x) < NODE_W && Math.abs(n.y - m.y) < NODE_H)
            problems.push(`nodes ${n.id} and ${m.id} overlap`);
        }
      });
    }
    expect(problems).toEqual([]);
  });

  it.each(files)("%s: sequence diagrams stay small", (file) => {
    const problems: string[] = [];
    for (const block of load(file).blocks) {
      if (block.type !== "diagram" || block.diagram.kind !== "sequence")
        continue;
      const { participants, messages } = block.diagram;
      if (participants.length > 5)
        problems.push(`${participants.length} participants`);
      if (messages.length > 10) problems.push(`${messages.length} messages`);
    }
    expect(problems).toEqual([]);
  });
});

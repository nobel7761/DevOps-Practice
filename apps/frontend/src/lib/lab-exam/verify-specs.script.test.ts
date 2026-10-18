/// <reference types="vitest" />
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import {
  createShell,
  execute,
  evaluateCheck,
  isAwaitingInput,
  submitInput,
} from "./engine";
import type { LabExamSpec } from "./types";

const DATA_DIR = join(__dirname, "data");
const ONLY_LAB_ID = process.env.VERIFY_LAB_ID || null;

const specFiles = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));

describe("lab-exam spec verification", () => {
  for (const file of specFiles) {
    const labId = file.replace(/\.json$/, "");
    if (ONLY_LAB_ID && labId !== ONLY_LAB_ID) continue;
    const spec: LabExamSpec = JSON.parse(
      readFileSync(join(DATA_DIR, file), "utf-8"),
    );

    it(`${spec.title} (${labId}): every task's answer passes its own check`, () => {
      let state = createShell();
      const failures: string[] = [];

      for (const task of spec.tasks) {
        if (!task.answer) continue; // nothing to verify if no literal answer given
        let result = execute(state, task.answer);
        while (isAwaitingInput(result.state)) {
          // matches the fixed placeholder evaluateCheck's own ref-completion uses
          result = submitInput(result.state, "refpass123");
        }
        const { pass, reason } = evaluateCheck(task.check, {
          input: task.answer,
          prevState: state,
          result,
        });
        if (!pass) {
          failures.push(
            `[${task.id}] answer="${task.answer}" FAILED: ${reason}`,
          );
        }
        // advance cumulative state regardless, so later tasks are tested
        // against the state this task's answer actually produced
        state = result.state;
      }

      expect(failures, failures.join("\n")).toEqual([]);
    });
  }
});

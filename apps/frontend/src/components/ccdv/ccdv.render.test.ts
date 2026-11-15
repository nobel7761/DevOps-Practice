import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CcdvChapterContent, CcdvExam } from "@/lib/data/ccdv/types";
import QuizDeck from "./flashcards/quiz/QuizDeck";
import ExamIntro from "./exam/ExamIntro";
import LabPanel from "./lesson/LabPanel";
import LessonPanel from "./lesson/LessonPanel";
import QuestionBody from "./question/QuestionBody";
import ReviewScreen from "./exam/ReviewScreen";

// Server-render smoke test (not a visual check): every chapter, lab, MCQ and exam renders.
const ROOT = path.join(__dirname, "../../lib/data/ccdv");
const list = (dir: string) =>
  fs.existsSync(path.join(ROOT, dir))
    ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(".json"))
    : [];
const outsidePre = (html: string) =>
  html
    .replace(/<pre[\s\S]*?<\/pre>/g, "")
    .replace(/<code[\s\S]*?<\/code>/g, "");
const read = <T>(dir: string, file: string): T =>
  JSON.parse(fs.readFileSync(path.join(ROOT, dir, file), "utf-8")) as T;

describe("CCDV chapters render", () => {
  it("has chapter files", () =>
    expect(list("chapters").length).toBeGreaterThan(0));
  it.each(list("chapters"))("%s lesson, lab and MCQs render", (file) => {
    const chapter = read<CcdvChapterContent>("chapters", file);
    const lesson = renderToStaticMarkup(
      createElement(LessonPanel, {
        chapterId: file.replace(/\.json$/, ""),
        lesson: chapter.lesson,
      }),
    );
    expect(lesson.length).toBeGreaterThan(1000);
    expect(
      outsidePre(lesson).includes("```"),
      `${file} lesson leaked raw fence`,
    ).toBe(false);
    const hasSortGame = chapter.lesson.blocks.some(
      (b) => b.type === "simulator" && b.id === "sort-game",
    );
    if (hasSortGame)
      expect(lesson, `${file} sort-game lost its Submit step`).toContain(
        "Submit করো",
      );
    const lab = renderToStaticMarkup(
      createElement(LabPanel, { lab: chapter.lab }),
    );
    expect(
      outsidePre(lab).includes("```"),
      `${file} lab leaked raw fence`,
    ).toBe(false);
    for (const q of chapter.mcqs) {
      const html = renderToStaticMarkup(
        createElement(QuestionBody, {
          question: q,
          selected: q.answerIndexes,
          revealed: true,
          onToggle: () => {},
        }),
      );
      expect(html).toContain("ব্যাখ্যা");
    }
  });
});

describe("CCDV exams render", () => {
  it("has exam files", () => expect(list("exams").length).toBeGreaterThan(0));
  it.each(list("exams"))("%s intro, question and review render", (file) => {
    const exam = read<CcdvExam>("exams", file);
    expect(
      renderToStaticMarkup(
        createElement(ExamIntro, {
          number: exam.number,
          draftRemaining: null,
          attempts: [],
          onView: () => {},
          onStart: () => {},
          onResume: () => {},
        }),
      ),
    ).toContain("53 questions");
    expect(
      renderToStaticMarkup(
        createElement(QuestionBody, {
          question: exam.questions[0],
          selected: [],
          revealed: false,
          onToggle: () => {},
        }),
      ),
    ).toContain("A.");
    expect(
      renderToStaticMarkup(
        createElement(ReviewScreen, {
          exam,
          answers: {},
          flagged: [],
          remaining: 7200,
          onGo: () => {},
          onBack: () => {},
          onSubmit: () => {},
        }),
      ),
    ).toContain("Unanswered");
  });
});

describe("CCDV interactive flashcards", () => {
  it.each(
    Array.from({ length: 15 }, (_, i) => `ch${String(i).padStart(2, "0")}`),
  )("%s quiz deck renders", (id) => {
    const chapter = read<CcdvChapterContent>("chapters", `${id}.json`);
    const html = renderToStaticMarkup(
      createElement(QuizDeck, { chapterId: id, cards: chapter.flashcards }),
    );
    expect(html).toContain(`Card 1 / ${chapter.flashcards.length}`);
    // typed answers are switched off for now (FLASHCARD_TYPED_ANSWERS)
    expect(html).not.toContain("Validate");
    expect(html).not.toContain("ccdv-card-answer");
  });
});

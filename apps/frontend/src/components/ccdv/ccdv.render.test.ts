import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CcdvChapterContent, CcdvExam } from "@/lib/data/ccdv/types";
import QuizDeck from "./flashcards/quiz/QuizDeck";
import { hasInteractiveFlashcards } from "@/lib/data/ccdv/schedule";
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

describe("CCDV interactive flashcards (Milestone 1)", () => {
  it("is enabled for Week 1 chapters only", () => {
    expect(["ch00", "ch01", "ch06"].every(hasInteractiveFlashcards)).toBe(true);
    expect(["ch07", "ch14"].some(hasInteractiveFlashcards)).toBe(false);
  });
  it.each(["ch00", "ch01", "ch02", "ch03", "ch04", "ch05", "ch06"])(
    "%s quiz deck renders",
    (id) => {
      const chapter = read<CcdvChapterContent>("chapters", `${id}.json`);
      const html = renderToStaticMarkup(
        createElement(QuizDeck, { chapterId: id, cards: chapter.flashcards }),
      );
      expect(html).toContain(`Card 1 / ${chapter.flashcards.length}`);
      expect(html).toContain("Validate");
    },
  );
});

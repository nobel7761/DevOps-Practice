"use client";

import { useEffect, useState } from "react";
import type { CardResult } from "@/lib/ccdv/storage";
import {
  loadStudy,
  resetCardsStudy,
  saveCardsStudy,
} from "@/lib/ccdv/study-api";
import { validateAnswer } from "@/lib/ccdv/validate-answer";
import type { CcdvFlashcard } from "@/lib/data/ccdv/types";
import AnswerBox from "./AnswerBox";
import DeckNav from "./DeckNav";
import DeckProgress from "./DeckProgress";
import ResetDeckButton from "./ResetDeckButton";
import QuizCard, { type CardStatus } from "./QuizCard";
import VerdictPanel, { type VerdictView } from "./VerdictPanel";

/** Flashcards as a colourful quiz: type an answer, an AI grader marks it correct/incorrect. */
export default function QuizDeck({
  chapterId,
  cards,
}: {
  chapterId: string;
  cards: CcdvFlashcard[];
}) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);
  const [results, setResults] = useState<Record<number, CardResult>>({});
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [validating, setValidating] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadStudy(chapterId).then((study) => {
      if (cancelled) return;
      setKnown(study.cards.known);
      setResults(study.cards.results);
      setDrafts(
        Object.fromEntries(
          Object.entries(study.cards.results).map(([i, r]) => [i, r.answer]),
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  if (cards.length === 0) return null;

  const rememberKnown = (next: number[]) => {
    setKnown(next);
    void saveCardsStudy(chapterId, results, next);
  };
  const resetDeck = async () => {
    await resetCardsStudy(chapterId);
    setKnown([]);
    setResults({});
    setDrafts({});
    jump(0);
  };
  const jump = (target: number) => {
    setIndex(target);
    setFlipped(false);
    setFailed(false);
  };
  const go = (delta: number) =>
    jump((index + delta + cards.length) % cards.length);

  const validate = async () => {
    setValidating(true);
    setFailed(false);
    try {
      const out = await validateAnswer({
        question: cards[index].front,
        referenceAnswer: cards[index].back,
        userAnswer: drafts[index] ?? "",
      });
      const next = {
        ...results,
        [index]: { answer: drafts[index] ?? "", ...out },
      };
      const nextKnown =
        out.verdict === "correct" && !known.includes(index)
          ? [...known, index]
          : known;
      setResults(next);
      setKnown(nextKnown);
      void saveCardsStudy(chapterId, next, nextKnown);
    } catch {
      setFailed(true);
    } finally {
      setValidating(false);
    }
  };

  const statuses: CardStatus[] = cards.map(
    (_, i) => results[i]?.verdict ?? "idle",
  );
  const result = results[index];
  const verdict: VerdictView | null = failed
    ? { kind: "error" }
    : result
      ? { kind: result.verdict, feedback: result.feedback }
      : null;

  return (
    <div className="flex flex-col gap-4">
      <DeckProgress
        statuses={statuses}
        known={known}
        current={index}
        onJump={jump}
        action={
          <ResetDeckButton
            disabled={Object.keys(results).length === 0 && known.length === 0}
            onReset={resetDeck}
          />
        }
      />
      <QuizCard
        card={cards[index]}
        index={index}
        total={cards.length}
        flipped={flipped}
        status={statuses[index]}
        known={known.includes(index)}
        onFlip={() => setFlipped((value) => !value)}
      />
      <AnswerBox
        key={index}
        value={drafts[index] ?? ""}
        validating={validating}
        onChange={(value) => setDrafts((prev) => ({ ...prev, [index]: value }))}
        onValidate={validate}
      />
      {verdict && <VerdictPanel verdict={verdict} />}
      <DeckNav
        onPrev={() => go(-1)}
        onAgain={() => {
          rememberKnown(known.filter((i) => i !== index));
          go(1);
        }}
        onKnown={() => {
          if (!known.includes(index)) rememberKnown([...known, index]);
          go(1);
        }}
        onNext={() => go(1)}
      />
    </div>
  );
}

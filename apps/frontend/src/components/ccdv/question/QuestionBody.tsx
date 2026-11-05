import type { CcdvMcqBase } from "@/lib/data/ccdv/types";
import Markdown from "@/components/shared/Markdown";
import OptionButton, { type OptionState } from "./OptionButton";

const COUNT_WORDS: Record<number, string> = { 2: "TWO", 3: "THREE", 4: "FOUR" };

function optionState(
  index: number,
  question: CcdvMcqBase,
  selected: number[],
  revealed: boolean,
): OptionState {
  const isSelected = selected.includes(index);
  const isAnswer = question.answerIndexes.includes(index);
  if (!revealed) return isSelected ? "selected" : "idle";
  if (isAnswer) return isSelected ? "correct" : "missed";
  return isSelected ? "wrong" : "idle";
}

/** One question with its options. `revealed` shows right/wrong marks and the explanation. */
export default function QuestionBody({
  question,
  selected,
  revealed,
  onToggle,
}: {
  question: CcdvMcqBase;
  selected: number[];
  revealed: boolean;
  onToggle: (index: number) => void;
}) {
  const need = question.answerIndexes.length;
  return (
    <div className="flex flex-col gap-3">
      <p className="whitespace-pre-line font-medium leading-relaxed">
        {question.question}
      </p>
      {need > 1 && (
        <p className="text-xs font-semibold text-muted-foreground">
          Select {COUNT_WORDS[need] ?? need}.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {question.options.map((text, index) => (
          <OptionButton
            key={index}
            letter={String.fromCharCode(65 + index)}
            text={text}
            state={optionState(index, question, selected, revealed)}
            disabled={revealed}
            onClick={() => onToggle(index)}
          />
        ))}
      </div>
      {revealed && (
        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <p className="mb-1 font-semibold">ব্যাখ্যা</p>
          <Markdown>{question.explanation}</Markdown>
        </div>
      )}
    </div>
  );
}

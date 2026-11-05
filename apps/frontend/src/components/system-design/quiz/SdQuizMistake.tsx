import InlineCode from "@/components/shared/InlineCode";
import type { SdQuestionResult } from "./sd-quiz.types";

/** One wrong answer: what was chosen and why it's wrong, the right answer and why it's right (Plan doc Section 7.2). */
export function SdQuizMistake({ result }: { result: SdQuestionResult }) {
  const chosen =
    result.chosenIndex === null ? null : result.options[result.chosenIndex];
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border p-4 text-sm">
      <p className="font-medium">
        <InlineCode text={result.question} />
      </p>
      <p
        className="rounded-lg border-l-4 px-3 py-2"
        style={{ borderColor: "var(--sd-fail)" }}
      >
        <span className="font-medium">❌ আপনি বেছেছিলেন:</span>{" "}
        {chosen ? <InlineCode text={chosen} /> : "উত্তর দেননি"}
        {result.whyChosenIsWrong && (
          <span className="mt-1 block text-muted-foreground">
            কেন ভুল: <InlineCode text={result.whyChosenIsWrong} />
          </span>
        )}
      </p>
      <p
        className="rounded-lg border-l-4 px-3 py-2"
        style={{ borderColor: "var(--sd-ok)" }}
      >
        <span className="font-medium">✅ সঠিক উত্তর:</span>{" "}
        <InlineCode text={result.options[result.correctIndex]} />
        <span className="mt-1 block text-muted-foreground">
          কেন সঠিক: <InlineCode text={result.explanation} />
        </span>
      </p>
    </li>
  );
}

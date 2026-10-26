import type { SdQuestionResult } from "./sd-quiz.types";

/** One wrong answer: what was chosen and why it's wrong, the right answer and why it's right (Plan doc Section 7.2). */
export function SdQuizMistake({ result }: { result: SdQuestionResult }) {
  const chosen =
    result.chosenIndex === null ? null : result.options[result.chosenIndex];
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border p-4 text-sm">
      <p className="font-medium">{result.question}</p>
      <p
        className="rounded-lg border-l-4 px-3 py-2"
        style={{ borderColor: "var(--sd-fail)" }}
      >
        <span className="font-medium">❌ আপনি বেছেছিলেন:</span>{" "}
        {chosen ?? "উত্তর দেননি"}
        {result.whyChosenIsWrong && (
          <span className="mt-1 block text-muted-foreground">
            কেন ভুল: {result.whyChosenIsWrong}
          </span>
        )}
      </p>
      <p
        className="rounded-lg border-l-4 px-3 py-2"
        style={{ borderColor: "var(--sd-ok)" }}
      >
        <span className="font-medium">✅ সঠিক উত্তর:</span>{" "}
        {result.options[result.correctIndex]}
        <span className="mt-1 block text-muted-foreground">
          কেন সঠিক: {result.explanation}
        </span>
      </p>
    </li>
  );
}

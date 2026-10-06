interface QuizResultItem {
  questionId: string;
  yourAnswerIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

export default function QuizQuestionCard({
  index,
  question,
  selected,
  result,
  disabled,
  onSelect,
}: {
  index: number;
  question: { id: string; question: string; options: string[] };
  selected?: number;
  result?: QuizResultItem;
  disabled: boolean;
  onSelect: (answerIndex: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="mb-3 text-sm font-medium">
        {index + 1}. {question.question}
      </p>
      <div className="flex flex-col gap-2">
        {question.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const isCorrectOption = result && result.correctIndex === optionIndex;
          const isWrongSelected = result && isSelected && !result.correct;

          return (
            <button
              key={optionIndex}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(optionIndex)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                isCorrectOption
                  ? "border-green-500 bg-green-500/10"
                  : isWrongSelected
                    ? "border-destructive bg-destructive/10"
                    : isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40"
              } ${disabled ? "cursor-default" : "cursor-pointer"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
      {result && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {result.explanation}
        </p>
      )}
    </div>
  );
}

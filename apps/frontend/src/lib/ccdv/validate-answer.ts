import client from "@/lib/api/client";

export interface AnswerValidation {
  verdict: "correct" | "incorrect";
  feedback: string;
}

/** Asks the backend grader whether the typed answer matches the flashcard's reference answer. */
export async function validateAnswer(input: {
  question: string;
  referenceAnswer: string;
  userAnswer: string;
}): Promise<AnswerValidation> {
  const res = await client.post<AnswerValidation>(
    "/ccdv-flashcard/validate",
    input,
  );
  return res.data;
}

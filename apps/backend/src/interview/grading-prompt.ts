import type OpenAI from 'openai';

type GradingMessage = OpenAI.Chat.ChatCompletionMessageParam;

export function buildGradingMessages(
  scenario: string,
  answer: string,
): GradingMessage[] {
  return [
    {
      role: 'system',
      content:
        'You are a strict but fair senior technical interviewer. ' +
        "Grade the candidate's answer against the given scenario — the answer " +
        'may be a shell command, configuration, code, or a written design/' +
        'reasoning explanation, whichever the scenario calls for. ' +
        'Respond with ONLY a JSON object with exactly these keys: ' +
        'score (0-100 integer, overall), verdict (one short sentence), ' +
        'strengths (array of short strings), improvements (array of short strings, ' +
        'use ["None needed, the answer is functionally correct"] if there are none), ' +
        'technicalAccuracy (0-100 integer), completeness (0-100 integer).',
    },
    {
      role: 'user',
      content: `Scenario: ${scenario}\n\nCandidate's answer:\n${answer}`,
    },
  ];
}

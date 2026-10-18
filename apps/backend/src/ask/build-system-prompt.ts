export interface AskLabSummary {
  title: string;
  intro: string;
}

export interface AskInterviewSummary {
  title: string;
  questions: { title: string; scenario: string }[];
}

export interface AskContext {
  videoTitle: string;
  golpoMarkdown?: string;
  labs?: AskLabSummary[];
  interview?: AskInterviewSummary;
}

const BASE_INSTRUCTIONS =
  'তুমি একজন সহায়ক teaching assistant, যে একজন student-কে একটা নির্দিষ্ট ' +
  'Linux/DevOps video lecture নিয়ে প্রশ্নের উত্তর দিচ্ছ। নিচে এই video-র ' +
  'content দেওয়া আছে — শুধু এই content আর সাধারণ Linux/DevOps জ্ঞান ব্যবহার ' +
  'করে উত্তর দাও। বাংলায় উত্তর দাও (technical term English script-এই রাখবে, ' +
  'যেমন "directory", "grep" — বাংলা script-এ transliterate করবে না)। প্রয়োজনে ' +
  'example/analogy ব্যবহার করে সহজ করে বুঝিয়ে দাও।';

/** Assembles everything known about a video (and its linked lab/interview) into one system prompt. */
export function buildSystemPrompt(context: AskContext): string {
  const sections: string[] = [
    BASE_INSTRUCTIONS,
    `\n## Video: ${context.videoTitle}`,
  ];

  if (context.golpoMarkdown) {
    sections.push(
      `\n## এই video-র golpo-style lesson\n${context.golpoMarkdown}`,
    );
  }

  if (context.labs && context.labs.length > 0) {
    const labsText = context.labs
      .map((lab) => `### ${lab.title}\n${lab.intro}`)
      .join('\n\n');
    sections.push(`\n## এই topic-এর সাথে যুক্ত lab exam(s)\n${labsText}`);
  }

  if (context.interview) {
    const questionsText = context.interview.questions
      .map((q) => `### ${q.title}\n${q.scenario}`)
      .join('\n\n');
    sections.push(
      `\n## এই topic-এর সাথে যুক্ত interview: ${context.interview.title}\n${questionsText}`,
    );
  }

  return sections.join('\n');
}

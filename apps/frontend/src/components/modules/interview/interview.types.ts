export interface InterviewQuestion {
  id: string;
  title: string;
  scenario: string;
}

export interface InterviewSpec {
  moduleId: string;
  title: string;
  questions: InterviewQuestion[];
}

export interface GradeResult {
  score: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  technicalAccuracy: number;
  completeness: number;
}

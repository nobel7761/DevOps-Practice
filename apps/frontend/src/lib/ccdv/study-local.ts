// Browser copy of the study state: works offline and is the fallback when the API is unreachable.
// Older builds kept flashcard data under separate keys; those are read once as a starting point.

import { loadCardResults, loadKnownCards } from "./storage";
import type { StudyState } from "./study-types";

const key = (chapterId: string) => `ccdv:study:${chapterId}`;

export function readLocalStudy(chapterId: string): StudyState {
  try {
    const raw = window.localStorage.getItem(key(chapterId));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StudyState>;
      return {
        mcq: parsed.mcq ?? { current: null, history: [] },
        cards: parsed.cards ?? { results: {}, known: [] },
        sims: parsed.sims ?? {},
      };
    }
  } catch {
    /* fall through */
  }
  return {
    mcq: { current: null, history: [] },
    cards: {
      results: loadCardResults(chapterId),
      known: loadKnownCards(chapterId),
    },
    sims: {},
  };
}

export function writeLocalStudy(chapterId: string, state: StudyState): void {
  try {
    window.localStorage.setItem(key(chapterId), JSON.stringify(state));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

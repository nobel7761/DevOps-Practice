/**
 * True once a task has failed enough times that the correct answer should be
 * revealed.
 */
export function shouldRevealAnswer(attempts: number, threshold = 10): boolean {
  return attempts >= threshold;
}

interface TaskRetryState {
  attempts: number;
  revealedHints: number;
  taskIdx: number;
  results: boolean[];
}

/**
 * State to apply when the learner keeps practicing the current task after
 * its answer was revealed, instead of restarting the whole exam: only this
 * task's attempt/hint counters clear, task index and prior results stay.
 */
export function continueTaskRetryState<T extends TaskRetryState>(state: T): T {
  return { ...state, attempts: 0, revealedHints: 0 };
}

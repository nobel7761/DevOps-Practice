/** A simulator mission (Plan doc Section 9.1 rule 8). The simulator checks `isComplete` against its own state. */
export interface Challenge<State> {
  id: string;
  title: string;
  goal: string;
  hint?: string;
  isComplete: (state: State) => boolean;
}

/** Completed challenge ids in challenge order. Once complete, a challenge stays complete. */
export function evaluateChallenges<State>(
  challenges: readonly Challenge<State>[],
  state: State,
  completedIds: readonly string[],
): string[] {
  return challenges
    .filter(
      (challenge) =>
        completedIds.includes(challenge.id) || challenge.isComplete(state),
    )
    .map((challenge) => challenge.id);
}

// Saves practice-MCQ attempts and flashcard-quiz results to the database (per user + chapter),
// mirrored in localStorage so everything still works when the API is down.

import client from "@/lib/api/client";
import type { CardResult } from "./storage";
import { readLocalStudy, writeLocalStudy } from "./study-local";
import {
  isStudyEmpty,
  type McqAnswerRecord,
  type McqAttemptRecord,
  type McqCurrent,
  type StudyState,
} from "./study-types";

const MCQ_HISTORY_LIMIT = 20;

interface ServerCardEntry extends CardResult {
  index: number;
}
interface ServerSim {
  key: string;
  choices: { item: number; bucket: string }[];
  submitted: boolean;
}
interface ServerState {
  mcq: { current: McqCurrent | null; history: McqAttemptRecord[] };
  cards: { results: ServerCardEntry[]; known: number[] };
  sims?: ServerSim[];
}

function fromServer(server: ServerState): StudyState {
  const results: Record<number, CardResult> = {};
  for (const { index, ...rest } of server.cards.results) results[index] = rest;
  const sims: StudyState["sims"] = {};
  for (const sim of server.sims ?? []) {
    sims[sim.key] = {
      submitted: sim.submitted,
      choices: Object.fromEntries(sim.choices.map((c) => [c.item, c.bucket])),
    };
  }
  return {
    mcq: server.mcq,
    cards: { results, known: server.cards.known },
    sims,
  };
}

const toServerCards = (results: Record<number, CardResult>) =>
  Object.entries(results).map(([index, r]) => ({ index: Number(index), ...r }));

const url = (chapterId: string, part?: "mcq" | "cards") =>
  `/ccdv-study/${chapterId}${part ? `/${part}` : ""}`;

async function pushLocalToServer(
  chapterId: string,
  state: StudyState,
): Promise<void> {
  const { current } = state.mcq;
  if (current) {
    await client.put(url(chapterId, "mcq"), {
      answers: current.answers,
      total: current.total,
      finished: current.finished,
    });
  }
  if (Object.keys(state.cards.results).length || state.cards.known.length) {
    await client.put(url(chapterId, "cards"), {
      results: toServerCards(state.cards.results),
      known: state.cards.known,
    });
  }
}

/** Server copy if reachable (seeding it from this browser's data when the server has none), else the local copy. */
export async function loadStudy(chapterId: string): Promise<StudyState> {
  const local = readLocalStudy(chapterId);
  try {
    const res = await client.get<ServerState>(url(chapterId));
    const server = fromServer(res.data);
    if (isStudyEmpty(server) && !isStudyEmpty(local)) {
      await pushLocalToServer(chapterId, local).catch(() => {});
      return local;
    }
    writeLocalStudy(chapterId, server);
    return server;
  } catch {
    return local;
  }
}

/** Records the answers of the current practice attempt; a finished attempt is also added to the history. */
export async function saveMcqStudy(
  chapterId: string,
  answers: McqAnswerRecord[],
  total: number,
  finished: boolean,
): Promise<StudyState> {
  const state = readLocalStudy(chapterId);
  const now = new Date().toISOString();
  state.mcq.current = { answers, total, finished, updatedAt: now };
  if (finished) {
    const attempt = {
      at: now,
      correct: answers.filter((a) => a.correct).length,
      total,
      answers,
    };
    state.mcq.history = [...state.mcq.history, attempt].slice(
      -MCQ_HISTORY_LIMIT,
    );
  }
  writeLocalStudy(chapterId, state);
  await client
    .put(url(chapterId, "mcq"), { answers, total, finished })
    .catch(() => {});
  return state;
}

/** Starts a fresh attempt; earlier finished attempts stay in the history. */
export async function resetMcqStudy(chapterId: string): Promise<StudyState> {
  const state = readLocalStudy(chapterId);
  state.mcq.current = null;
  writeLocalStudy(chapterId, state);
  await client.delete(url(chapterId, "mcq")).catch(() => {});
  return state;
}

export async function saveCardsStudy(
  chapterId: string,
  results: Record<number, CardResult>,
  known: number[],
): Promise<void> {
  const state = readLocalStudy(chapterId);
  state.cards = { results, known };
  writeLocalStudy(chapterId, state);
  await client
    .put(url(chapterId, "cards"), { results: toServerCards(results), known })
    .catch(() => {});
}

export async function resetCardsStudy(chapterId: string): Promise<void> {
  const state = readLocalStudy(chapterId);
  state.cards = { results: {}, known: [] };
  writeLocalStudy(chapterId, state);
  await client.delete(url(chapterId, "cards")).catch(() => {});
}

/** Saves the picks of one sort-game simulator; `submitted` locks them and reveals the answers. */
export async function saveSimStudy(
  chapterId: string,
  simKey: string,
  choices: Record<number, string>,
  submitted: boolean,
): Promise<void> {
  const state = readLocalStudy(chapterId);
  state.sims[simKey] = { choices, submitted };
  writeLocalStudy(chapterId, state);
  await client
    .put(`${url(chapterId)}/sim/${simKey}`, {
      choices: Object.entries(choices).map(([item, bucket]) => ({
        item: Number(item),
        bucket,
      })),
      submitted,
    })
    .catch(() => {});
}

export async function resetSimStudy(
  chapterId: string,
  simKey: string,
): Promise<void> {
  const state = readLocalStudy(chapterId);
  delete state.sims[simKey];
  writeLocalStudy(chapterId, state);
  await client.delete(`${url(chapterId)}/sim/${simKey}`).catch(() => {});
}

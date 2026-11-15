// Mock-exam attempts live in the database (per user) and are mirrored in localStorage,
// so a finished exam can be reviewed from any browser and still works if the API is down.

import client from "@/lib/api/client";
import { loadAttempts, saveAllAttempts, type AttemptRecord } from "./storage";

export async function pushAttempt(attempt: AttemptRecord): Promise<void> {
  await client.post("/ccdv-exam-attempts", attempt).catch(() => {});
}

/** Server attempts merged with any that only exist in this browser (those are uploaded), oldest first. */
export async function syncAttempts(): Promise<AttemptRecord[]> {
  const local = loadAttempts();
  try {
    const res = await client.get<AttemptRecord[]>("/ccdv-exam-attempts");
    const known = new Set(res.data.map((a) => a.id));
    const onlyLocal = local.filter((a) => !known.has(a.id));
    await Promise.all(onlyLocal.map(pushAttempt));
    const merged = [...res.data, ...onlyLocal].sort(
      (a, b) => a.submittedAt - b.submittedAt,
    );
    saveAllAttempts(merged);
    return merged;
  } catch {
    return local;
  }
}

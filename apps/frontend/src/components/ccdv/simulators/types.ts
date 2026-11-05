// Shared prop helpers for the data-driven CCDV simulators. Props come straight from
// lesson JSON, so every simulator guards against missing fields.

export interface SimulatorBase {
  title?: string;
  hint?: string;
  takeaway?: string;
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

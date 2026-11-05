export type Provider = "local" | "groq" | "openai";
export const CHAIN: Provider[] = ["local", "groq", "openai"];

export const REQUIREMENT: Record<Provider, string> = {
  local: "faster-whisper (voice extra)",
  groq: "GROQ_API_KEY",
  openai: "VOICE_TOOLS_OPENAI_KEY",
};

/** Docs: "Provider priority (automatic fallback): local > groq > openai". */
export function pick(
  enabled: boolean,
  ready: Record<Provider, boolean>,
): Provider | null {
  if (!enabled) return null;
  return CHAIN.find((p) => ready[p]) ?? null;
}

export type SizeProvider =
  "local" | "groq" | "openai" | "mistral" | "xai" | "elevenlabs";
/** Upload limits in MB from the docs; null = no limit. */
export const LIMIT_MB: Record<SizeProvider, number | null> = {
  local: null,
  groq: 25,
  openai: 25,
  mistral: 500,
  xai: 500,
  elevenlabs: 4900, // "just under 5 GB"
};

export function sizeVerdict(p: SizeProvider, mb: number): string {
  const limit = LIMIT_MB[p];
  if (limit === null) return "Local — কোনো limit নেই, split-ও হয় না।";
  if (mb <= limit) return `সীমার (${limit} MB) মধ্যে — সরাসরি যায়।`;
  return `সীমা (~${limit} MB) পেরিয়েছে → 16 kHz mono AAC-এ re-encode, তাতেও বড় হলে pause-এ split (ffmpeg লাগে)।`;
}

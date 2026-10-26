import type {
  RecallColor,
  RecallRating,
  RecallTopicStatus,
} from "@/lib/system-design/recall/schedule";

export const RECALL_COLOR_VAR: Record<RecallColor, string> = {
  green: "var(--sd-ok)",
  yellow: "var(--sd-warn)",
  red: "var(--sd-fail)",
  gray: "var(--muted-foreground)",
};

/** Icons go with the colours so a point's state is never colour-only. */
export const RECALL_COLOR_ICON: Record<RecallColor, string> = {
  green: "🟢",
  yellow: "🟡",
  red: "🔴",
  gray: "⚪",
};

export const RATING_OPTIONS: {
  rating: RecallRating;
  label: string;
  hint: string;
}[] = [
  {
    rating: "good",
    label: "🟢 পারছি",
    hint: "নিজে থেকে ঠিকমতো বুঝিয়ে বলতে পেরেছি",
  },
  { rating: "partial", label: "🟡 আংশিক", hint: "কিছুটা মনে ছিল, পুরোটা না" },
  { rating: "forgot", label: "🔴 পারছি না", hint: "মনে পড়েনি বা ভুল বলেছি" },
];

export const STATUS_LABEL: Record<RecallTopicStatus, string> = {
  "not-started": "শুরু হয়নি",
  "in-progress": "চলছে",
  strong: "মজবুত 💪",
};

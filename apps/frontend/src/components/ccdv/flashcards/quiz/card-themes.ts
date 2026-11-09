// Colour themes cycled across the cards of a deck. Full class names so Tailwind picks them up.

export interface CardTheme {
  gradient: string;
  emoji: string;
  dot: string;
  /** Soft background wash for the card body. */
  tint: string;
}

export const CARD_THEMES: CardTheme[] = [
  {
    gradient: "from-violet-600 to-fuchsia-500",
    tint: "from-violet-500/15 to-fuchsia-500/15",
    emoji: "🧠",
    dot: "bg-violet-500",
  },
  {
    gradient: "from-sky-600 to-cyan-500",
    tint: "from-sky-500/15 to-cyan-500/15",
    emoji: "🚀",
    dot: "bg-sky-500",
  },
  {
    gradient: "from-emerald-600 to-teal-500",
    tint: "from-emerald-500/15 to-teal-500/15",
    emoji: "🌿",
    dot: "bg-emerald-500",
  },
  {
    gradient: "from-amber-500 to-orange-500",
    tint: "from-amber-500/15 to-orange-500/15",
    emoji: "⚡",
    dot: "bg-amber-500",
  },
  {
    gradient: "from-rose-600 to-pink-500",
    tint: "from-rose-500/15 to-pink-500/15",
    emoji: "🎯",
    dot: "bg-rose-500",
  },
  {
    gradient: "from-indigo-600 to-blue-500",
    tint: "from-indigo-500/15 to-blue-500/15",
    emoji: "🔮",
    dot: "bg-indigo-500",
  },
];

export function themeFor(index: number): CardTheme {
  return CARD_THEMES[index % CARD_THEMES.length];
}

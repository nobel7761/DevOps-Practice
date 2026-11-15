import {
  Bot,
  Brain,
  Cloud,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** Deterministic cover look per course so each card is recognisable at a glance. */
const COVERS: { gradient: string; icon: LucideIcon }[] = [
  { gradient: "from-violet-500 via-purple-500 to-fuchsia-500", icon: Cloud },
  { gradient: "from-sky-500 via-blue-500 to-indigo-500", icon: Network },
  { gradient: "from-emerald-500 via-teal-500 to-cyan-500", icon: Bot },
  { gradient: "from-amber-500 via-orange-500 to-rose-500", icon: Rocket },
  { gradient: "from-rose-500 via-pink-500 to-purple-500", icon: Brain },
  { gradient: "from-cyan-500 via-sky-500 to-blue-600", icon: Workflow },
  { gradient: "from-lime-500 via-green-500 to-emerald-600", icon: ShieldCheck },
  { gradient: "from-fuchsia-500 via-violet-500 to-indigo-600", icon: Sparkles },
];

export function courseCover(index: number) {
  return COVERS[index % COVERS.length];
}

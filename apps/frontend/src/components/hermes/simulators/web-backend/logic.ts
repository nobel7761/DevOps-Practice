export type Backend =
  | "tavily"
  | "perplexity"
  | "exa"
  | "parallel"
  | "firecrawl"
  | "searxng"
  | "brave-free"
  | "ddgs"
  | "xai";
export type Capability = "search" | "extract";

/** Search-only backends (per docs table). */
const NO_EXTRACT: Backend[] = ["searxng", "brave-free", "ddgs", "xai"];

/** Docs "Auto-detection order" (managed gateway steps omitted). */
export const AUTO_ORDER: { backend: Backend; env: string }[] = [
  { backend: "tavily", env: "TAVILY_API_KEY" },
  { backend: "perplexity", env: "PERPLEXITY_API_KEY" },
  { backend: "exa", env: "EXA_API_KEY" },
  { backend: "parallel", env: "PARALLEL_API_KEY" },
  { backend: "firecrawl", env: "FIRECRAWL_API_KEY" },
  { backend: "searxng", env: "SEARXNG_URL" },
  { backend: "brave-free", env: "BRAVE_SEARCH_API_KEY" },
  { backend: "ddgs", env: "ddgs package" },
];

export interface Input {
  capability: Capability;
  perCapability: Backend | "";
  shared: Backend | "";
  envs: Record<string, boolean>;
  keylessFallback: boolean;
  keylessRescue: boolean;
  keyedFails: boolean;
}

export interface Outcome {
  source: string;
  backend: string;
  notes: string[];
}

export function supports(b: Backend, c: Capability): boolean {
  return c === "search" || !NO_EXTRACT.includes(b);
}

export function resolve(i: Input): Outcome {
  const notes: string[] = [];
  let backend: string;
  let source: string;
  let keyed = true;
  if (i.perCapability) {
    backend = i.perCapability;
    source = `web.${i.capability}_backend (per-capability)`;
  } else if (i.shared) {
    backend = i.shared;
    source = "web.backend (shared)";
  } else {
    const hit = AUTO_ORDER.find((a) => i.envs[a.env]);
    if (hit) {
      backend = hit.backend;
      source = `auto-detect: ${hit.env}`;
    } else {
      backend = "keyless ring (exa / parallel / firecrawl / keenable)";
      source = "auto-detect: কিছুই set নেই";
      keyed = false;
      if (!i.keylessFallback)
        notes.push("web.keyless_fallback=false — ring বন্ধ।");
    }
  }
  if (keyed && !supports(backend as Backend, i.capability)) {
    notes.push(
      `${backend} ${i.capability} সমর্থন করে না (docs table: search-only)।`,
    );
  }
  if (keyed && i.keyedFails) {
    notes.push(
      i.keylessRescue
        ? "Backend fail করল → web.keyless_rescue: ওই এক call keyless ring-এ retry হলো (rescued_from + backend_error থাকে)। পরের call আবার তোমার backend-এ।"
        : "Backend fail করল, web.keyless_rescue=false — rescue নেই।",
    );
  }
  return { source, backend, notes };
}

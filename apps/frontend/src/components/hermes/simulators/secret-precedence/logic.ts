export type Shape = "mapped" | "bulk";

export interface Source {
  name: string;
  has: boolean; // এই source-এ secret আছে?
  shape: Shape; // env: map (mapped) নাকি পুরো project inject (bulk)
  override: boolean; // override_existing
}

export interface Inputs {
  envHas: boolean; // .env / shell-এ আছে
  preserve: boolean; // secrets.preserve_existing-এ নাম আছে
  sources: [Source, Source]; // secrets.sources-এর ক্রম
  aliasHas: boolean; // শুধু OPENAI_API_KEY_WORK আছে
  profileAlias: boolean; // secrets.profile_alias (default on)
}

export interface Verdict {
  winner: string;
  steps: string[];
}

export function resolve(i: Inputs): Verdict {
  const steps: string[] = [];
  const claimants = i.sources.filter((s) => s.has);
  let top: Source | undefined;
  if (claimants.length > 0) {
    const mapped = claimants.filter((s) => s.shape === "mapped");
    top = (mapped.length > 0 ? mapped : claimants)[0];
    if (claimants.length > 1) {
      steps.push(
        mapped.length > 0 && mapped.length < claimants.length
          ? `দুই source-ই দাবি করছে → mapped (env: map) source বেশি শক্তিশালী, ক্রম যাই হোক: ${top.name} জেতে।`
          : `দুই source-ই একই shape → secrets.sources-এর ক্রমে প্রথমটা (${top.name}) জেতে, পরেরটা skip (startup warning)।`,
      );
    }
  }

  if (i.envHas) {
    if (i.preserve) {
      steps.push(
        "secrets.preserve_existing-এ নাম আছে → .env/shell সবসময় জেতে, override_existing: true হলেও।",
      );
      return { winner: ".env / shell", steps };
    }
    if (top && top.override) {
      steps.push(
        `${top.name}-এ override_existing: true → .env/shell-এর মান বদলে দেয়।`,
      );
      return { winner: top.name, steps };
    }
    steps.push(
      top
        ? `${top.name}-এ override_existing: false → .env/shell-এর মান থেকে যায়।`
        : "কোনো source-এ secret নেই → .env/shell-এর মান থাকে।",
    );
    return { winner: ".env / shell", steps };
  }

  if (top) {
    steps.push(`.env/shell-এ নেই, তাই ${top.name}-এর মান বসে।`);
    return { winner: top.name, steps };
  }
  if (i.aliasHas && i.profileAlias) {
    steps.push(
      "canonical নাম কোথাও নেই → profile alias (OPENAI_API_KEY_WORK) দিয়ে OPENAI_API_KEY ভরা হলো (_API_KEY suffix credential-shaped)।",
    );
    return { winner: "profile alias", steps };
  }
  steps.push("কোথাও secret পাওয়া গেল না।");
  return { winner: "কিছুই না (খালি)", steps };
}

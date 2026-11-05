export type Scenario =
  "normal" | "syntax-fail" | "feature-branch-dirty" | "local-main" | "docker";

export type StepState = "ok" | "skipped" | "failed" | "rolled-back" | "not-run";

export interface StepResult {
  id: number;
  title: string;
  what: string;
  state: StepState;
  note: string;
}

export interface Flags {
  noBackup: boolean;
  noGatewayRestart: boolean;
}

const STEPS = [
  [
    "Pre-update snapshot",
    "pairing data, cron jobs, config.yaml, .env, auth.json state-snapshots/ ফোল্ডারে সেভ হয়।",
  ],
  [
    "Code update",
    "নির্বাচিত release tag/branch pull হয়, submodule update হয়। Linux/macOS-এ checkout বদলানোর আগে gateway pause হয়।",
  ],
  ["Syntax validation", "৯টা critical startup file compile করে দেখা হয়।"],
  [
    "Dependency preparation (PM)",
    "নতুন lock file থেকে পুরো Python environment বানিয়ে validate করে, তারপর publish করে।",
  ],
  ["Config migration", "নতুন config option ধরে prompt করে।"],
  ["Desktop rebuild", "staging ফোল্ডারে build, verify, তারপর swap।"],
  [
    "Gateway restart",
    "paused gateway গুলো restart হয় (systemd/launchd বা manual relaunch)।",
  ],
  [
    "Multiplex migration",
    "multi-profile install হলে এক multiplexed gateway-এ আনার চেষ্টা।",
  ],
] as const;

const NOTES: Record<number, string> = {
  1: "snapshot তৈরি হলো।",
  2: "নতুন code এলো।",
  3: "সব file parse হলো।",
  4: "Environment তৈরি ও publish হলো। কোনো plugin না মিললে disabled হয়, update থামে না।",
  5: "নতুন option থাকলে prompt আসে; skip করলে পরে `hermes config check` ও `hermes config migrate` চালাও।",
  6: "Desktop app এই checkout থেকে build হয়ে থাকলে তবেই rebuild হয়।",
  7: "Gateway নতুন code-এ restart হলো (in-flight কাজ শেষ হওয়া পর্যন্ত drain)।",
  8: "Blocker (যেমন shared bot token) থাকলে তালিকা দেখায়, কিছু বদলায় না।",
};

function make(flags: Flags): StepResult[] {
  return STEPS.map(([title, what], i) => {
    const id = i + 1;
    let state: StepState = "ok";
    let note = NOTES[id];
    if (id === 1 && flags.noBackup) {
      state = "skipped";
      note =
        "--no-backup দেওয়া হয়েছে, তাই এই run-এ snapshot নেই (rollback-এর data থাকবে না)।";
    }
    if (id === 7 && flags.noGatewayRestart) {
      state = "skipped";
      note =
        "--no-gateway-restart: restart ও fleet verification বাদ। Gateway পুরোনো code-এ চলতে পারে — পরে `hermes gateway restart`।";
    }
    return { id, title, what, state, note };
  });
}

export function runPipeline(scenario: Scenario, flags: Flags): StepResult[] {
  if (scenario === "docker") {
    return make(flags).map((s) => ({
      ...s,
      state: "not-run",
      note:
        s.id === 1
          ? "Docker image install-এ `hermes update` exit code 2 দিয়ে refuse করে। `docker pull nousresearch/hermes-agent:<tag>` করে একই data mount দিয়ে container আবার বানাও।"
          : "চলেনি।",
    }));
  }
  const steps = make(flags);
  const stopAfter = (id: number, patch: Partial<StepResult>) =>
    steps.map((s) =>
      s.id === id
        ? { ...s, ...patch }
        : s.id > id
          ? { ...s, state: "not-run" as StepState, note: "চলেনি।" }
          : s,
    );

  if (scenario === "syntax-fail") {
    return stopAfter(3, {
      state: "rolled-back",
      note: "কোনো startup file parse হয়নি → `git reset --hard` দিয়ে আগের commit-এ ফেরা, যাতে `hermes` চালু থাকে। এটাই একমাত্র automatic rollback।",
    });
  }
  if (scenario === "feature-branch-dirty") {
    return stopAfter(2, {
      state: "skipped",
      note: "Checkout feature branch-এ parked আর tree dirty → code update SKIPPED। Commit/stash করো, নয়তো `updates.parked_branch_strategy: update_in_place`।",
    });
  }
  if (scenario === "local-main") {
    return steps.map((s) =>
      s.id === 2
        ? {
            ...s,
            note: "Local commit ছিল main-এ → main reset হয় origin/main-এ, পুরোনো HEAD সেভ থাকে `refs/hermes-update-backups/diverged-main-<stamp>-<sha>`-এ (`git cherry-pick` দিয়ে ফেরত আনা যায়)।",
          }
        : s,
    );
  }
  return steps;
}

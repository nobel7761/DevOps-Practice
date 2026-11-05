export type Command = "c" | "c-title" | "r-title" | "latest";

export interface Input {
  command: Command;
  breadcrumb: boolean;
  terminalContinue: boolean;
  configChanged: boolean;
  promptFilesEdited: boolean;
  refreshed: boolean;
}

export const SESSIONS = {
  thisTerminal: "my project #3",
  mostRecent: "refactoring auth",
};

export interface Carry {
  item: string;
  value: string;
}

export function resolve(i: Input): {
  target: string;
  why: string;
  carry: Carry[];
  cacheNote: string;
} {
  let target: string;
  let why: string;
  const bare = i.command === "c" || i.command === "latest";
  if (i.command === "c-title") {
    target = SESSIONS.thisTerminal;
    why = '"my project" নামে lineage-এর সবচেয়ে নতুন সদস্য।';
  } else if (i.command === "r-title") {
    target = SESSIONS.mostRecent;
    why = "title দিয়ে খুঁজে পাওয়া গেল।";
  } else if (bare && i.breadcrumb && i.terminalContinue && i.command === "c") {
    target = SESSIONS.thisTerminal;
    why =
      "terminal-aware -c: এই terminal-এর নিজের session (breadcrumb ৩০ দিনের মধ্যে)।";
  } else {
    target = SESSIONS.mostRecent;
    why = "breadcrumb নেই/বন্ধ (বা `latest`) — সবচেয়ে সাম্প্রতিক CLI session।";
  }
  const promptStale = i.promptFilesEdited && !i.refreshed;
  const carry: Carry[] = [
    { item: "History", value: "পুরো conversation load হয়" },
    { item: "Title ও session ID", value: "অপরিবর্তিত" },
    { item: "Model ও launch flags", value: "session-এর নিজেরটাই থাকে" },
    {
      item: "Config (toolsets, MCP, max_turns…)",
      value: "profile-এর বর্তমান config নেয়",
    },
    {
      item: "System prompt",
      value: promptStale
        ? "পুরনোটাই replay হয় — SOUL.md/skills-এর edit আসেনি (hermes sessions refresh-prompts লাগবে)"
        : i.promptFilesEdited
          ? "refresh-prompts-এর পর পরের turn-এ নতুন করে তৈরি; history/ID/tool list একই"
          : "stored prompt replay হয়",
    },
  ];
  return {
    target,
    why,
    carry,
    cacheNote:
      i.configChanged || (i.promptFilesEdited && i.refreshed)
        ? "config পাল্টেছে → নতুন prompt-cache prefix, resume-এর প্রথম turn-এ খরচ বেশি।"
        : "",
  };
}

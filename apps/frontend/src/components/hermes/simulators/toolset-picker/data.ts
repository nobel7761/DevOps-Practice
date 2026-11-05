export interface Toolset {
  name: string;
  tools: string[];
  hint: string;
}

/** Core toolsets from the official toolsets reference. */
export const TOOLSETS: Toolset[] = [
  {
    name: "file",
    tools: ["patch", "read_file", "search_files", "write_file"],
    hint: "ফাইল পড়া/লেখা",
  },
  {
    name: "terminal",
    tools: ["process_manage", "terminal"],
    hint: "shell command",
  },
  {
    name: "web",
    tools: ["web_extract", "web_search"],
    hint: "ওয়েব সার্চ ও page পড়া",
  },
  { name: "search", tools: ["web_search"], hint: "শুধু web search" },
  {
    name: "browser",
    tools: ["browser_cdp", "browser_dialog", "browser_exec", "browser_vault"],
    hint: "browser চালানো",
  },
  {
    name: "skills",
    tools: ["skill_manage", "skill_view", "skills_list"],
    hint: "skill ব্যবহার/তৈরি",
  },
  { name: "memory", tools: ["memory"], hint: "স্মৃতি" },
  {
    name: "session_search",
    tools: ["session_search"],
    hint: "আগের session খোঁজা",
  },
  { name: "todo", tools: ["todo_list"], hint: "কাজের তালিকা" },
  { name: "clarify", tools: ["clarify"], hint: "ইউজারকে প্রশ্ন করা" },
  { name: "code_execution", tools: ["execute_code"], hint: "code চালানো" },
  { name: "delegation", tools: ["delegate_task"], hint: "sub-agent" },
  { name: "vision", tools: ["vision_analyze"], hint: "ছবি বোঝা" },
  { name: "image_gen", tools: ["image_generate"], hint: "ছবি বানানো" },
  { name: "cronjob", tools: ["cronjob_manage"], hint: "schedule করা কাজ" },
  { name: "tts", tools: ["text_to_speech"], hint: "কথা বলা" },
];

/** Composite toolsets: they just include other toolsets. */
export const COMPOSITES: Record<string, string[]> = {
  debugging: ["file", "terminal", "web"],
  safe: ["image_gen", "vision", "web"],
  coding: [
    "file",
    "terminal",
    "search",
    "web",
    "skills",
    "browser",
    "todo",
    "memory",
    "session_search",
    "clarify",
    "code_execution",
    "delegation",
    "vision",
  ],
};

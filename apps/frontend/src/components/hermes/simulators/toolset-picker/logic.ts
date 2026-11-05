import { TOOLSETS } from "./data";

/** Union of the tools provided by the enabled toolsets. */
export function availableTools(enabled: string[]): string[] {
  const set = new Set<string>();
  for (const t of TOOLSETS)
    if (enabled.includes(t.name)) t.tools.forEach((x) => set.add(x));
  return [...set].sort();
}

export function toggle(enabled: string[], name: string): string[] {
  return enabled.includes(name)
    ? enabled.filter((n) => n !== name)
    : [...enabled, name];
}

export function cliCommand(enabled: string[]): string {
  return enabled.length
    ? `hermes chat --toolsets ${enabled.join(",")}`
    : "hermes chat --toolsets   # কিছু বাছা হয়নি";
}

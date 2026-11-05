export type Origin = "agent" | "hub";
export type Action =
  "create" | "use" | "patch" | "update" | "update-force" | "approve" | "reject";

export interface State {
  origin: Origin;
  installed: boolean;
  edited: boolean;
  pending: "create" | "patch" | null;
  log: string[];
}

export interface Settings {
  writeApproval: boolean;
  locked: boolean;
}

export function initial(origin: Origin): State {
  return {
    origin,
    installed: origin === "hub",
    edited: false,
    pending: null,
    log: [],
  };
}

export function available(s: State, set: Settings): Action[] {
  if (s.pending) return ["approve", "reject"];
  if (!s.installed) return s.origin === "agent" ? ["create"] : [];
  const base: Action[] = ["use", "patch"];
  if (s.origin === "hub") base.push("update", "update-force");
  return set.locked ? base.filter((a) => a !== "patch") : base;
}

export function step(s: State, a: Action, set: Settings): State {
  const say = (m: string, patch: Partial<State> = {}): State => ({
    ...s,
    ...patch,
    log: [...s.log, m],
  });
  switch (a) {
    case "create":
      return set.writeApproval
        ? say(
            "skill_manage create → skills.write_approval: true, তাই ~/.hermes/pending/skills/-এ staged। /skills approve দরকার।",
            { pending: "create" },
          )
        : say("skill_manage create → SKILL.md লেখা হলো ~/.hermes/skills/-এ।", {
            installed: true,
          });
    case "use":
      return say(
        "Level 0 skills_list() (নাম+description, ~3k token) → /skill-name → Level 1 skill_view(name) পুরো SKILL.md; দরকারে Level 2 skill_view(name, path)।",
      );
    case "patch":
      return set.writeApproval
        ? say(
            "skill_manage patch staged — /skills approve না দেওয়া পর্যন্ত বদলায়নি।",
            { pending: "patch" },
          )
        : say("skill_manage patch (targeted edit) প্রয়োগ হলো।", {
            edited: true,
          });
    case "update":
      return s.edited
        ? say(
            "hermes skills update → locally edited skill তাই skip করা হলো (--force লাগবে)।",
          )
        : say(
            "hermes skills update → hub থেকে নতুন version এলো; security scan হলো।",
          );
    case "update-force":
      return say(
        "hermes skills update --force → local edit-সহ skill overwrite হলো।",
        { edited: false },
      );
    case "approve":
      return say("/skills approve → staged write প্রয়োগ হলো।", {
        installed: true,
        edited: s.pending === "patch" ? true : s.edited,
        pending: null,
      });
    case "reject":
      return say("/skills reject → staged write বাতিল।", { pending: null });
  }
}

export const LABELS: Record<Action, string> = {
  create: "Agent skill তৈরি করুক (skill_manage create)",
  use: "/skill-name দিয়ে ব্যবহার",
  patch: "Agent patch করুক (skill_manage patch)",
  update: "hermes skills update",
  "update-force": "hermes skills update --force",
  approve: "/skills approve",
  reject: "/skills reject",
};

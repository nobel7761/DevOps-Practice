export type Source = "bundled" | "user" | "project" | "pip";
export type Kind = "general" | "backend";

export interface Input {
  source: Source;
  kind: Kind;
  hasManifest: boolean;
  hasRegister: boolean;
  enabled: boolean;
  disabled: boolean;
  gateway: boolean;
  slowLoad: boolean;
}

export interface Check {
  label: string;
  ok: boolean;
}

/** Walks the gates described on the plugins docs page, in order. */
export function evaluate(i: Input): { checks: Check[]; loaded: boolean } {
  const checks: Check[] = [];
  const add = (label: string, ok: boolean) => checks.push({ label, ok });

  add(
    i.gateway && i.source === "project"
      ? "Discovery: .hermes/plugins/ — gateway এটা load করে না"
      : "Discovery: plugin এমন জায়গায় আছে যেটা Hermes scan করে",
    !(i.gateway && i.source === "project"),
  );
  add("plugin.yaml আছে", i.hasManifest);
  add("__init__.py-তে register(ctx) আছে", i.hasRegister);

  // Bundled platforms/backends are not gated by plugins.enabled.
  const gated = !(i.source === "bundled" && i.kind === "backend");
  add(
    gated
      ? "plugins.enabled-এ নাম আছে (default-এ বন্ধ)"
      : "Bundled backend — plugins.enabled লাগে না (অন্য key দিয়ে চালু হয়)",
    gated ? i.enabled : true,
  );
  add("plugins.disabled-এ নাম নেই (deny-list জেতে)", !i.disabled);
  add("plugins.load_timeout_seconds (10s)-এর মধ্যে load হয়", !i.slowLoad);

  return { checks, loaded: checks.every((c) => c.ok) };
}

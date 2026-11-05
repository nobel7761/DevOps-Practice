import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import { AUTO_ORDER, type Backend, type Capability, type Input } from "./logic";

const BACKENDS: Backend[] = [
  "tavily",
  "perplexity",
  "exa",
  "parallel",
  "firecrawl",
  "searxng",
  "brave-free",
  "ddgs",
  "xai",
];
const opts = [
  { value: "", label: "(set নেই)" },
  ...BACKENDS.map((b) => ({ value: b, label: b })),
];

export default function Controls({
  input,
  set,
}: {
  input: Input;
  set: (p: Partial<Input>) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <ControlSelect<Capability>
          label="কোন কাজ?"
          value={input.capability}
          options={[
            { value: "search", label: "web_search" },
            { value: "extract", label: "web_extract" },
          ]}
          onChange={(capability) => set({ capability })}
        />
        <ControlSelect<string>
          label="web.backend (shared)"
          value={input.shared}
          options={opts}
          onChange={(v) => set({ shared: v as Backend | "" })}
        />
        <ControlSelect<string>
          label={`web.${input.capability}_backend`}
          value={input.perCapability}
          options={opts}
          onChange={(v) => set({ perCapability: v as Backend | "" })}
        />
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
        <span className="text-xs font-medium text-muted-foreground">
          .env-এ কী আছে? (auto-detect শুধু তখনই চলে যখন উপরের দুটো set নেই)
        </span>
        {AUTO_ORDER.map((a) => (
          <ControlSwitch
            key={a.env}
            label={a.env}
            checked={!!input.envs[a.env]}
            onChange={(c) => set({ envs: { ...input.envs, [a.env]: c } })}
          />
        ))}
      </div>
      <ControlSwitch
        label="web.keyless_fallback"
        description="false করলে free-tier ring বন্ধ"
        checked={input.keylessFallback}
        onChange={(keylessFallback) => set({ keylessFallback })}
      />
      <ControlSwitch
        label="Backend-এর call fail করছে"
        checked={input.keyedFails}
        onChange={(keyedFails) => set({ keyedFails })}
      />
      <ControlSwitch
        label="web.keyless_rescue"
        description="fail হলে ওই এক call keyless ring-এ retry"
        checked={input.keylessRescue}
        onChange={(keylessRescue) => set({ keylessRescue })}
      />
    </div>
  );
}

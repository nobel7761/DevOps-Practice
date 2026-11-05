import { ControlSwitch } from "@/components/shared/simulator";
import { CHAIN, pick, REQUIREMENT, type Provider } from "./logic";

export default function ChainPanel({
  enabled,
  ready,
  setEnabled,
  setReady,
}: {
  enabled: boolean;
  ready: Record<Provider, boolean>;
  setEnabled: (v: boolean) => void;
  setReady: (p: Provider, v: boolean) => void;
}) {
  const chosen = pick(enabled, ready);
  return (
    <div className="flex flex-col gap-2">
      <ControlSwitch
        label="stt.enabled"
        description="false হলে transcription হয়ই না"
        checked={enabled}
        onChange={setEnabled}
      />
      {CHAIN.map((p, i) => (
        <ControlSwitch
          key={p}
          label={`${i + 1}. ${p} প্রস্তুত`}
          description={REQUIREMENT[p]}
          checked={ready[p]}
          onChange={(v) => setReady(p, v)}
        />
      ))}
      <p className="rounded-lg border border-border bg-background/60 p-3 text-sm">
        {!enabled ? (
          "⏹️ Transcription বন্ধ।"
        ) : chosen ? (
          <>
            🎙️ ব্যবহৃত provider: <b>{chosen}</b>
          </>
        ) : (
          "❌ কোনো provider প্রস্তুত নেই।"
        )}
      </p>
    </div>
  );
}

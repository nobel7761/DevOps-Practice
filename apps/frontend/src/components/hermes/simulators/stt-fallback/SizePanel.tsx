import { ControlSelect } from "@/components/shared/simulator";
import { LIMIT_MB, sizeVerdict, type SizeProvider } from "./logic";

const SIZES = [10, 100, 1000].map((v) => ({
  value: String(v),
  label: `${v} MB`,
}));

export default function SizePanel({
  provider,
  mb,
  setProvider,
  setMb,
}: {
  provider: SizeProvider;
  mb: number;
  setProvider: (p: SizeProvider) => void;
  setMb: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <ControlSelect<SizeProvider>
          label="stt.provider"
          value={provider}
          options={(Object.keys(LIMIT_MB) as SizeProvider[]).map((p) => ({
            value: p,
            label: p,
          }))}
          onChange={setProvider}
        />
        <ControlSelect<string>
          label="Audio file"
          value={String(mb)}
          options={SIZES}
          onChange={(v) => setMb(Number(v))}
        />
      </div>
      <p className="rounded-lg border border-border bg-background/60 p-3 text-sm">
        📦 {sizeVerdict(provider, mb)}
      </p>
    </div>
  );
}

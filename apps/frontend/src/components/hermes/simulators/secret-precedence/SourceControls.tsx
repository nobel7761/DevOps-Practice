import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import type { Shape, Source } from "./logic";

export default function SourceControls({
  source,
  onChange,
}: {
  source: Source;
  onChange: (patch: Partial<Source>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <ControlSwitch
        label={`${source.name}-এ OPENAI_API_KEY আছে`}
        checked={source.has}
        onChange={(has) => onChange({ has })}
      />
      <ControlSelect<Shape>
        label="Shape"
        value={source.shape}
        options={[
          { value: "mapped", label: "mapped — env: map দিয়ে নির্দিষ্ট var" },
          { value: "bulk", label: "bulk — পুরো project inject" },
        ]}
        onChange={(shape) => onChange({ shape })}
      />
      <ControlSwitch
        label="override_existing"
        description="Bitwarden-এর default true"
        checked={source.override}
        onChange={(override) => onChange({ override })}
      />
    </div>
  );
}

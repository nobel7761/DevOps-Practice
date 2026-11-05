import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import { PLATFORMS, desktopAvailable, type Options } from "./logic";

export default function Controls({
  value,
  onChange,
}: {
  value: Options;
  onChange: (o: Options) => void;
}) {
  const canDesktop = desktopAvailable(value.platform);
  const cli =
    !(canDesktop && value.mode === "desktop") && value.platform !== "android";
  return (
    <div className="flex flex-col gap-3">
      <ControlSelect
        label="তোমার device/OS"
        value={value.platform}
        options={PLATFORMS}
        onChange={(platform) => onChange({ ...value, platform })}
      />
      {canDesktop && (
        <ControlSwitch
          label="Desktop app চাই (terminal ছাড়া)"
          description="বন্ধ করলে command-line install"
          checked={value.mode === "desktop"}
          onChange={(on) =>
            onChange({ ...value, mode: on ? "desktop" : "cli" })
          }
        />
      )}
      {cli && (
        <>
          <ControlSwitch
            label="main channel (stable-এর বদলে)"
            checked={value.channelMain}
            onChange={(channelMain) => onChange({ ...value, channelMain })}
          />
          <ControlSwitch
            label="Browser tools skip"
            checked={value.skipBrowser}
            onChange={(skipBrowser) => onChange({ ...value, skipBrowser })}
          />
          <ControlSwitch
            label="No prompts (non-interactive)"
            checked={value.nonInteractive}
            onChange={(nonInteractive) =>
              onChange({ ...value, nonInteractive })
            }
          />
        </>
      )}
    </div>
  );
}

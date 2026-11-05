import { ControlSelect, ControlSwitch } from "@/components/shared/simulator";
import type { AuthConfig, Command, Platform, UserId } from "./logic";

export default function AuthControls({
  config,
  onChange,
}: {
  config: AuthConfig;
  onChange: (patch: Partial<AuthConfig>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ControlSelect<Platform>
        label="Platform"
        value={config.platform}
        options={[
          { value: "telegram", label: "Telegram (DM)" },
          { value: "email", label: "Email" },
        ]}
        onChange={(platform) => onChange({ platform })}
      />
      <ControlSelect<UserId>
        label="কে message পাঠাচ্ছে?"
        value={config.user}
        options={[
          { value: "111", label: "111 — allowlist + admin" },
          { value: "222", label: "222 — allowlist, regular user" },
          { value: "999", label: "999 — অচেনা মানুষ" },
        ]}
        onChange={(user) => onChange({ user })}
      />
      <ControlSelect<Command>
        label="কোন slash command দিল?"
        value={config.command}
        options={[
          { value: "/help", label: "/help (always allowed)" },
          { value: "/whoami", label: "/whoami (always allowed)" },
          { value: "/status", label: "/status (user_allowed_commands-এ)" },
          { value: "/model", label: "/model (user_allowed_commands-এ)" },
          { value: "other", label: "অন্য কোনো registered command" },
        ]}
        onChange={(command) => onChange({ command })}
      />
      <div className="flex flex-col gap-3">
        <ControlSwitch
          label="GATEWAY_ALLOW_ALL_USERS=true"
          checked={config.allowAll}
          onChange={(allowAll) => onChange({ allowAll })}
        />
        <ControlSwitch
          label="999-কে pairing approve করা হয়েছে"
          checked={config.paired}
          onChange={(paired) => onChange({ paired })}
        />
        <ControlSwitch
          label="Email pairing চালু"
          checked={config.emailPairing}
          onChange={(emailPairing) => onChange({ emailPairing })}
        />
        <ControlSwitch
          label="allow_admin_from সেট আছে (admin/user tier)"
          description="বন্ধ থাকলে সবার full access"
          checked={config.adminSplit}
          onChange={(adminSplit) => onChange({ adminSplit })}
        />
      </div>
    </div>
  );
}

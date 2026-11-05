export type Platform =
  "macos-arm" | "macos-intel" | "windows" | "linux" | "wsl2" | "android";
export type Mode = "desktop" | "cli";

export interface Options {
  platform: Platform;
  mode: Mode;
  channelMain: boolean;
  skipBrowser: boolean;
  nonInteractive: boolean;
}

export interface Plan {
  steps: string[];
  commands: string[];
  notes: string[];
  layout?: string;
}

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "macos-arm", label: "macOS (Apple Silicon)" },
  { value: "macos-intel", label: "macOS (Intel)" },
  { value: "windows", label: "Windows (native)" },
  { value: "linux", label: "Linux" },
  { value: "wsl2", label: "Windows + WSL2" },
  { value: "android", label: "Android (Termux)" },
];

/** Desktop package exists only for Apple Silicon macOS and Windows. */
export function desktopAvailable(p: Platform): boolean {
  return p === "macos-arm" || p === "windows";
}

export function buildPlan(o: Options): Plan {
  if (o.platform === "android") {
    return {
      steps: [
        "Signed Termux APT repository configure করো",
        "প্যাকেজ install করো",
      ],
      commands: ["pkg install hermes-agent"],
      notes: [
        "Desktop/server script Termux-এর install path নয়। শুধু aarch64 Android।",
        "আপডেট: pkg update, তারপর pkg upgrade hermes-agent",
      ],
      layout: "Code: $PREFIX/lib/hermes-agent/ · data: ~/.hermes/",
    };
  }
  if (o.mode === "desktop" && desktopAvailable(o.platform)) {
    return o.platform === "windows"
      ? {
          steps: [
            "Website থেকে .appinstaller ফাইল নামাও",
            "Windows App Installer দিয়ে খোলো (signed MSIX bundle)",
          ],
          commands: [],
          notes: [
            "Agent, Python, dependency ও prebuilt UI সব bundle-এ আছে — আলাদা build লাগে না।",
            "Microsoft Store প্যাকেজ আলাদাভাবে manage হয়।",
          ],
        }
      : {
          steps: [
            "Website থেকে DMG নামাও",
            "Hermes.app কে Applications-এ কপি করো",
          ],
          commands: [],
          notes: [
            "Agent, Python, dependency ও prebuilt UI সব bundle-এ আছে।",
            "শুধু Apple Silicon সমর্থিত।",
          ],
        };
  }
  const win = o.platform === "windows";
  const flags: string[] = [];
  if (o.channelMain) flags.push(win ? "-Channel main" : "--channel main");
  if (o.skipBrowser) flags.push(win ? "-SkipBrowser" : "--skip-browser");
  if (o.nonInteractive)
    flags.push(win ? "-NonInteractive" : "--non-interactive");
  const base = win
    ? "iex (irm https://hermes-agent.nousresearch.com/install.ps1)"
    : "curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash";
  const notes = [
    "Installer source clone করে, uv bootstrap করে, Python/Node/ripgrep/FFmpeg দেয়। Default-এ latest stable release ট্র্যাক করে।",
    win
      ? "Git না থাকলে pinned Git for Windows নিজেই bootstrap করতে পারে।"
      : "Prerequisite: Git, curl, tar, SHA-256 utility।",
    "শেষে নতুন shell খোলো (বা source ~/.zshrc) তারপর `hermes` চালাও; সমস্যায় `hermes doctor`।",
  ];
  if (o.platform === "macos-intel")
    notes.unshift("Desktop package Intel Mac-এ নেই; তাই CLI পথ দেখানো হচ্ছে।");
  if (flags.length) notes.push(`Installer-এর flag: ${flags.join(" ")}`);
  if (o.channelMain)
    notes.push(`বিকল্প: environment variable HERMES_INSTALL_CHANNEL=main`);
  return {
    steps: ["Terminal খোলো", "নিচের command চালাও", "Setup wizard follow করো"],
    commands: [base],
    notes,
    layout: win
      ? "Code: %LOCALAPPDATA%\\hermes\\hermes-agent\\ · data: %LOCALAPPDATA%\\hermes\\"
      : "Code: ~/.hermes/hermes-agent/ · launcher: ~/.local/bin/hermes · data: ~/.hermes/",
  };
}

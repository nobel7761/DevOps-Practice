export type Platform = "telegram" | "email";
export type UserId = "111" | "222" | "999";
export type Command = "/help" | "/whoami" | "/status" | "/model" | "other";

export interface AuthConfig {
  platform: Platform;
  user: UserId;
  allowAll: boolean; // GATEWAY_ALLOW_ALL_USERS=true
  paired: boolean; // `hermes pairing approve` করা হয়েছে (শুধু 999 এর জন্য)
  emailPairing: boolean;
  adminSplit: boolean; // allow_admin_from সেট আছে কিনা
  command: Command;
}

// allowlist = TELEGRAM_ALLOWED_USERS=111,222 ; allow_admin_from = ["111"] ; user_allowed_commands = [status, model]
export const ALLOWLIST: UserId[] = ["111", "222"];
export const ADMINS: UserId[] = ["111"];
export const USER_COMMANDS: Command[] = ["/status", "/model"];
const FLOOR: Command[] = ["/help", "/whoami"];

export interface AuthResult {
  reach: "allowed" | "pairing-code" | "ignored";
  reachWhy: string;
  command: "ran" | "refused" | "n/a";
  commandWhy: string;
}

export function decide(c: AuthConfig): AuthResult {
  const allowlisted = ALLOWLIST.includes(c.user);
  const paired = c.user === "999" && c.paired;
  let reach: AuthResult["reach"];
  let reachWhy: string;
  if (c.allowAll) {
    reach = "allowed";
    reachWhy =
      "GATEWAY_ALLOW_ALL_USERS=true — সবাই ঢুকতে পারে (terminal access থাকলে ঝুঁকিপূর্ণ)।";
  } else if (allowlisted) {
    reach = "allowed";
    reachWhy = `ID ${c.user} allowlist-এ আছে।`;
  } else if (paired) {
    reach = "allowed";
    reachWhy = "আগে `hermes pairing approve` করা হয়েছে।";
  } else if (c.platform === "email" && !c.emailPairing) {
    reach = "ignored";
    reachWhy =
      "Email-এ অচেনা sender ignore হয়, যদি না email pairing চালু থাকে।";
  } else {
    reach = "pairing-code";
    reachWhy =
      "Allowlist-এ নেই → DM করলে one-time pairing code পায় (১ ঘণ্টায় expire)। Owner `hermes pairing approve <platform> <CODE>` চালালে ঢুকতে পারবে।";
  }
  if (reach !== "allowed")
    return {
      reach,
      reachWhy,
      command: "n/a",
      commandWhy: "বট পর্যন্তই পৌঁছায়নি, তাই command চালানোর প্রশ্ন নেই।",
    };

  if (!c.adminSplit)
    return {
      reach,
      reachWhy,
      command: "ran",
      commandWhy: "allow_admin_from সেট নেই → tier ভাগ বন্ধ, সবার full access।",
    };
  if (ADMINS.includes(c.user))
    return {
      reach,
      reachWhy,
      command: "ran",
      commandWhy: "Admin — সব registered slash command চালাতে পারে।",
    };
  const ok = FLOOR.includes(c.command) || USER_COMMANDS.includes(c.command);
  return {
    reach,
    reachWhy,
    command: ok ? "ran" : "refused",
    commandWhy: ok
      ? "Regular user — এই command user_allowed_commands বা always-allowed (/help, /whoami)-এ আছে।"
      : "Regular user — এই command তালিকায় নেই (tier শুধু slash command আটকায়, সাধারণ chat নয়)।",
  };
}

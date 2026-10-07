/**
 * Tiny bash-like shell simulator that powers interactive lab exams.
 * Supports the commands the Linux labs teach: pwd, cd, ls (-l/-a),
 * mkdir (-p), echo (with > and >>), touch, cat, find (-name/-type),
 * grep (-r), plus unquoted-glob expansion — enough to run every task
 * of a navigation lab deterministically in the browser. Also supports
 * user-modification depth: usermod -s/-l/-d/-m/-u/-c/-e, chage, passwd,
 * groupdel — enough to run a full user-lifecycle lab deterministically.
 */

/** Fixed fake "today" so chage/passwd -S output stays deterministic across ref-checks. */
const FAKE_LAST_CHANGE = "Jan 26, 2026";
const FAKE_LAST_CHANGE_SHORT = "01/26/2026";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Pre-seeded sample app log for the System Logging & Monitoring lab. */
const APPTRACK_LOG = [
  "2026-03-10 22:01:05 [INFO]  AppTrack v2.3.1 starting up",
  "2026-03-10 22:01:05 [INFO]  Loading configuration from /etc/apptrack/config.yaml",
  "2026-03-10 22:01:06 [INFO]  Database connection established (host=db-01, port=5432)",
  "2026-03-10 22:01:06 [INFO]  Cache layer initialized (Redis 127.0.0.1:6379)",
  "2026-03-10 22:01:07 [INFO]  HTTP server listening on 0.0.0.0:8080",
  "2026-03-10 22:01:07 [INFO]  Worker pool started (workers=8)",
  "2026-03-10 22:05:12 [INFO]  Processed 1200 requests (avg latency: 14ms)",
  "2026-03-10 22:15:44 [INFO]  Processed 5800 requests (avg latency: 16ms)",
  "2026-03-10 22:30:21 [INFO]  Processed 12400 requests (avg latency: 15ms)",
  "2026-03-10 23:00:09 [INFO]  Processed 28900 requests (avg latency: 17ms)",
  "2026-03-10 23:45:33 [WARN]  Memory usage at 72% (threshold: 80%)",
  "2026-03-10 23:45:33 [WARN]  Request queue depth increasing (depth=312)",
  "2026-03-10 23:51:07 [WARN]  Memory usage at 81% - exceeded soft threshold",
  "2026-03-10 23:51:07 [WARN]  Slow query detected: SELECT * FROM events WHERE user_id=? (took 4821ms)",
  "2026-03-10 23:51:45 [WARN]  Slow query detected: SELECT * FROM events WHERE user_id=? (took 5103ms)",
  "2026-03-10 23:52:10 [WARN]  Request queue depth critical (depth=1847)",
  "2026-03-10 23:52:33 [ERROR] Worker #3 timed out processing request (timeout=30s)",
  "2026-03-10 23:52:45 [ERROR] Worker #7 timed out processing request (timeout=30s)",
  "2026-03-10 23:53:01 [ERROR] Worker #1 timed out processing request (timeout=30s)",
  "2026-03-10 23:53:14 [ERROR] Database connection pool exhausted (pool_size=20, waiting=48)",
  "2026-03-10 23:53:14 [ERROR] Failed to acquire DB connection after 10s - dropping request",
  "2026-03-10 23:53:15 [ERROR] Failed to acquire DB connection after 10s - dropping request",
  "2026-03-10 23:53:20 [WARN]  Memory usage at 94% - approaching hard limit",
  "2026-03-10 23:53:29 [ERROR] Cache write failure: Redis connection refused (ECONNREFUSED)",
  "2026-03-10 23:53:29 [ERROR] Cache write failure: Redis connection refused (ECONNREFUSED)",
  "2026-03-10 23:53:31 [CRITICAL] Memory usage at 99% - emergency shutdown initiated",
  "2026-03-10 23:53:31 [CRITICAL] Flushing in-flight requests (in-flight=1204)",
  "2026-03-10 23:53:32 [CRITICAL] Flush incomplete - 847 requests lost",
  "2026-03-10 23:53:32 [CRITICAL] AppTrack terminated abnormally (exit code: 137)",
].join("\n");

/** "2025-12-31" -> "Dec 31, 2025" (matches real chage/usermod -e date display) */
function formatIsoDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const name = MONTH_NAMES[Number(mo) - 1] ?? mo;
  return `${name} ${Number(d)}, ${y}`;
}

import type { LabExamCheck } from "./types";

export interface AclEntry {
  kind: "u" | "g";
  name: string;
  /** rwx-style string, e.g. "r-x" */
  perms: string;
}

export interface FsNode {
  type: "dir" | "file";
  content?: string;
  /** octal permission digits, e.g. "644" (defaults: file 644, dir 755) */
  mode?: string;
  /** owner user name (default root) */
  owner?: string;
  /** owning group name (default root) */
  group?: string;
  /** named ACL entries added via setfacl -m */
  acl?: AclEntry[];
}

export function nodeMode(node: FsNode): string {
  return node.mode ?? (node.type === "dir" ? "755" : "644");
}

function modeToRwx(mode: string): string {
  return mode
    .split("")
    .map((d) => {
      const n = Number(d);
      return `${n & 4 ? "r" : "-"}${n & 2 ? "w" : "-"}${n & 1 ? "x" : "-"}`;
    })
    .join("");
}

/** Applies a symbolic chmod spec ("u+x", "go-w,a=r") to octal digits. */
function applySymbolic(mode: string, spec: string): string | null {
  const digits = mode.split("").map(Number);
  for (const clause of spec.split(",")) {
    const m = clause.match(/^([ugoa]*)([+\-=])([rwx]*)$/);
    if (!m) return null;
    const who = m[1] || "a";
    let bits = 0;
    if (m[3].includes("r")) bits |= 4;
    if (m[3].includes("w")) bits |= 2;
    if (m[3].includes("x")) bits |= 1;
    const idxMap: Record<string, number> = { u: 0, g: 1, o: 2 };
    const idxs = who.includes("a") ? [0, 1, 2] : [...who].map((c) => idxMap[c]);
    for (const i of idxs) {
      if (m[2] === "+") digits[i] |= bits;
      else if (m[2] === "-") digits[i] &= ~bits;
      else digits[i] = bits;
    }
  }
  return digits.join("");
}

export interface UserRec {
  uid: number;
  /** primary group name */
  primary: string;
  /** supplementary group names */
  supplementary: string[];
  locked: boolean;
  shell: string;
  /** custom home path (defaults to /root for root, /home/<name> otherwise) */
  home?: string;
  /** GECOS/comment field */
  comment?: string;
  /** account expiration date as typed, e.g. "2025-12-31" */
  expire?: string;
  /** password aging (chage) — defaults: min 0, max 99999, warn 7 */
  minDays?: number;
  maxDays?: number;
  warnDays?: number;
  /** true after `chage -d 0` — chage -l then shows "password must be changed" */
  mustChangePassword?: boolean;
  /** true once a `passwd` prompt has been completed successfully for this user */
  passwordSet?: boolean;
}

/** An in-progress multi-step prompt (e.g. `passwd`'s two masked entries). */
export interface PendingInput {
  kind: "passwd";
  targetUser: string;
  stage: "new" | "confirm";
  firstValue?: string;
}

/** Resolves a user's home directory, honoring a custom `-d` path. */
function userHome(name: string, user: UserRec): string {
  return user.home ?? (name === "root" ? "/root" : `/home/${name}`);
}

export interface ShellState {
  /** absolute path -> node ("/" and HOME always exist) */
  fs: Record<string, FsNode>;
  cwd: string;
  /** user name -> record (root always exists) */
  users: Record<string, UserRec>;
  /** group name -> GID */
  groups: Record<string, number>;
  /**
   * Login stack for `su -`/`login`/`exit` — last entry is the acting user.
   * Note: `~` always resolves to root's home (a known simplification —
   * none of the su-based labs use `~` as a non-root user).
   */
  userStack: string[];
  /** cwd to restore per stack level on `exit`, parallel to userStack[1:] */
  cwdStack: string[];
  /** current session umask, octal digits e.g. "022" — subtracted from 666/777 defaults */
  umask: string;
  /** fake systemd service registry, e.g. { sshd: { running: true, pid: 742 } } */
  services: Record<string, { running: boolean; pid: number }>;
  /** set while a multi-step prompt (e.g. `passwd`) is waiting on the next typed line */
  pendingInput?: PendingInput;
  /** which stress-ng scenario is "active" — drives canned perf-tool output */
  perfLoad: "idle" | "cpu" | "mem" | "mem-critical" | "disk" | "net";
  /** journal entries appended via `logger`, newest last */
  journal: { tag: string; priority: string; message: string }[];
}

/** Applies the current umask to a base mode (666 for files, 777 for dirs). */
function applyUmask(state: ShellState, base: 6 | 7): string {
  return state.umask
    .split("")
    .map((d) => (base & ~Number(d)).toString())
    .join("");
}

/** Copies every descendant of srcDir into destDir, re-owned to owner:group. */
function copyTree(
  state: ShellState,
  srcDir: string,
  destDir: string,
  owner: string,
  group: string,
): void {
  const prefix = srcDir === "/" ? "/" : srcDir + "/";
  for (const p of Object.keys(state.fs)) {
    if (p === srcDir || !p.startsWith(prefix)) continue;
    const rel = p.slice(prefix.length);
    const destPath = destDir === "/" ? "/" + rel : destDir + "/" + rel;
    state.fs[destPath] = { ...state.fs[p], owner, group };
  }
}

/** Newly created files/dirs are owned by whoever is actually creating them. */
function creatorOwnerGroup(
  state: ShellState,
  permUser: string,
  effectiveRoot: boolean,
): { owner: string; group: string } {
  if (effectiveRoot) return { owner: "root", group: "root" };
  const rec = state.users[permUser];
  return { owner: permUser, group: rec?.primary ?? permUser };
}

/** The user currently "logged in" (top of the su/login stack). */
export function currentUser(state: ShellState): string {
  return state.userStack[state.userStack.length - 1];
}

export interface ExecResult {
  state: ShellState;
  output: string;
  error: boolean;
}

export const HOME = "/root";

/** Regenerates /etc/passwd and /etc/group from the user/group tables. */
function syncEtcFiles(state: ShellState): void {
  state.fs["/etc"] = state.fs["/etc"] ?? { type: "dir" };
  const passwd = Object.entries(state.users)
    .sort((a, b) => a[1].uid - b[1].uid)
    .map(([name, u]) => {
      const home = userHome(name, u);
      return `${name}:x:${u.uid}:${state.groups[u.primary] ?? 0}:${u.comment ?? ""}:${home}:${u.shell}`;
    })
    .join("\n");
  const group = Object.entries(state.groups)
    .sort((a, b) => a[1] - b[1])
    .map(([gname, gid]) => {
      const members = Object.entries(state.users)
        .filter(([, u]) => u.supplementary.includes(gname))
        .map(([uname]) => uname)
        .join(",");
      return `${gname}:x:${gid}:${members}`;
    })
    .join("\n");
  const shadow = Object.entries(state.users)
    .sort((a, b) => a[1].uid - b[1].uid)
    .map(
      ([name, u]) =>
        `${name}:$6$fakesalt$fakehashfakehashfakehash:19700:${u.minDays ?? 0}:${u.maxDays ?? 99999}:${u.warnDays ?? 7}:::`,
    )
    .join("\n");
  state.fs["/etc/passwd"] = { type: "file", content: passwd };
  state.fs["/etc/group"] = { type: "file", content: group };
  // root-only in spirit — cat enforces this via effectiveRoot, not fs mode
  state.fs["/etc/shadow"] = { type: "file", content: shadow, mode: "640" };
}

export function createShell(): ShellState {
  const state: ShellState = {
    fs: {
      "/": { type: "dir" },
      "/etc": { type: "dir" },
      "/etc/sudoers": {
        type: "file",
        content: "root ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL",
        mode: "440",
      },
      "/etc/sudoers.d": { type: "dir" },
      "/etc/skel": { type: "dir" },
      "/etc/skel/.bashrc": {
        type: "file",
        content:
          "# ~/.bashrc: executed by bash for non-login shells\nexport PS1='\\u@\\h:\\w\\$ '\nalias ll='ls -la'\nalias grep='grep --color=auto'",
      },
      "/etc/skel/.profile": {
        type: "file",
        content:
          '# ~/.profile: executed by the command interpreter for login shells\nif [ -d "$HOME/bin" ] ; then\n  PATH="$HOME/bin:$PATH"\nfi',
      },
      "/etc/skel/.bash_logout": {
        type: "file",
        content:
          "# ~/.bash_logout: executed by bash when login shell exits\nclear",
      },
      "/home": { type: "dir" },
      "/tmp": { type: "dir", mode: "777" },
      "/var": { type: "dir" },
      "/var/log": { type: "dir" },
      "/var/log/apptrack": { type: "dir" },
      "/var/log/apptrack/apptrack.log": {
        type: "file",
        content: APPTRACK_LOG,
      },
      "/etc/logrotate.conf": {
        type: "file",
        content:
          "weekly\nsu root adm\nrotate 4\ncreate\n#dateext\n#compress\n\ninclude /etc/logrotate.d",
      },
      "/etc/logrotate.d": { type: "dir" },
      [HOME]: { type: "dir" },
    },
    cwd: HOME,
    users: {
      root: {
        uid: 0,
        primary: "root",
        supplementary: [],
        locked: false,
        shell: "/bin/bash",
        home: "/root",
      },
    },
    groups: { root: 0, sudo: 27, users: 100 },
    userStack: ["root"],
    cwdStack: [],
    umask: "022",
    services: { sshd: { running: true, pid: 742 } },
    perfLoad: "idle",
    journal: [],
  };
  syncEtcFiles(state);
  return state;
}

function nextUid(state: ShellState): number {
  return Math.max(1000, ...Object.values(state.users).map((u) => u.uid)) + 1;
}

function nextGid(state: ShellState): number {
  return Math.max(1000, ...Object.values(state.groups)) + 1;
}

export function displayCwd(cwd: string): string {
  if (cwd === HOME) return "~";
  if (cwd.startsWith(HOME + "/")) return "~" + cwd.slice(HOME.length);
  return cwd;
}

export function resolvePath(cwd: string, raw: string): string {
  let p = raw;
  if (p === "~") p = HOME;
  else if (p.startsWith("~/")) p = HOME + p.slice(1);
  const abs = p.startsWith("/") ? p : cwd + "/" + p;
  const out: string[] = [];
  for (const seg of abs.split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") out.pop();
    else out.push(seg);
  }
  return "/" + out.join("/");
}

function parentOf(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx <= 0 ? "/" : path.slice(0, idx);
}

function baseName(path: string): string {
  return path === "/" ? "/" : path.slice(path.lastIndexOf("/") + 1);
}

function childrenOf(fs: Record<string, FsNode>, dir: string): string[] {
  const prefix = dir === "/" ? "/" : dir + "/";
  return Object.keys(fs)
    .filter(
      (p) =>
        p !== "/" &&
        p.startsWith(prefix) &&
        !p.slice(prefix.length).includes("/"),
    )
    .sort();
}

function globToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$");
}

interface Token {
  text: string;
  quoted: boolean;
}

function tokenize(input: string): Token[] | null {
  const toks: Token[] = [];
  let i = 0;
  while (i < input.length) {
    while (i < input.length && input[i] === " ") i++;
    if (i >= input.length) break;
    let text = "";
    let quoted = false;
    while (i < input.length && input[i] !== " ") {
      const c = input[i];
      if (c === '"' || c === "'") {
        quoted = true;
        i++;
        while (i < input.length && input[i] !== c) text += input[i++];
        if (i >= input.length) return null; // unclosed quote
        i++;
      } else {
        text += c;
        i++;
      }
    }
    toks.push({ text, quoted });
  }
  return toks;
}

/** Expands an unquoted token containing * or ? against the fs (bash-style). */
function expandGlob(state: ShellState, tok: Token): string[] {
  if (tok.quoted || !/[*?]/.test(tok.text)) return [tok.text];
  let pattern = tok.text;
  if (pattern === "~" || pattern.startsWith("~/"))
    pattern = HOME + pattern.slice(1);
  const absolute = pattern.startsWith("/");
  const segs = pattern.split("/").filter((s) => s.length > 0);
  let candidates: { abs: string; disp: string }[] = absolute
    ? [{ abs: "/", disp: "" }]
    : [{ abs: state.cwd, disp: "" }];
  for (const seg of segs) {
    const next: { abs: string; disp: string }[] = [];
    for (const c of candidates) {
      if (/[*?]/.test(seg)) {
        const re = globToRegex(seg);
        for (const childAbs of childrenOf(state.fs, c.abs)) {
          const name = baseName(childAbs);
          if (re.test(name))
            next.push({
              abs: childAbs,
              disp: c.disp ? c.disp + "/" + name : absolute ? "/" + name : name,
            });
        }
      } else {
        const abs = resolvePath(c.abs, seg);
        if (state.fs[abs])
          next.push({
            abs,
            disp: c.disp ? c.disp + "/" + seg : absolute ? "/" + seg : seg,
          });
      }
    }
    candidates = next;
    if (!candidates.length) break;
  }
  if (!candidates.length) return [tok.text];
  return candidates
    .map((c) => (absolute && !c.disp.startsWith("/") ? "/" + c.disp : c.disp))
    .sort();
}

/**
 * Whether `user` has `action` (r/w/x) on `node`, honoring owner/group/other
 * mode bits and any named ACL entries (user entries win over group entries,
 * which win over the base group bits). root always passes.
 */
function hasPerm(
  state: ShellState,
  node: FsNode,
  user: string,
  action: "r" | "w" | "x",
): boolean {
  if (user === "root") return true;
  const bitIndex = { r: 4, w: 2, x: 1 }[action];
  const m = nodeMode(node);
  const rec = state.users[user];
  if (node.owner === user) return (Number(m[0]) & bitIndex) !== 0;
  const userAcl = (node.acl ?? []).find(
    (e) => e.kind === "u" && e.name === user,
  );
  if (userAcl) return userAcl.perms.includes(action);
  const memberGroups = rec ? [rec.primary, ...rec.supplementary] : [];
  const groupAcl = (node.acl ?? []).find(
    (e) => e.kind === "g" && memberGroups.includes(e.name),
  );
  if (groupAcl) return groupAcl.perms.includes(action);
  if (node.group && memberGroups.includes(node.group))
    return (Number(m[1]) & bitIndex) !== 0;
  return (Number(m[2]) & bitIndex) !== 0;
}

/** Real Linux requires +x on every ancestor directory to even reach a path. */
function canTraverseTo(state: ShellState, abs: string, user: string): boolean {
  if (user === "root") return true;
  const segs = abs.split("/").filter(Boolean);
  let cur = "";
  for (let i = 0; i < segs.length - 1; i++) {
    cur += "/" + segs[i];
    const node = state.fs[cur];
    if (node && !hasPerm(state, node, user, "x")) return false;
  }
  return true;
}

/**
 * Whether `user` has blanket sudo (ALL commands) via group membership —
 * scans /etc/sudoers for `%groupname ALL=(ALL...) ALL` lines matching any
 * of the user's groups (covers the default %sudo line and any custom one,
 * e.g. `%superadmin ALL=(ALL) ALL` added via visudo/tee in a lab).
 */
function hasBlanketSudo(state: ShellState, user: string): boolean {
  const u = state.users[user];
  if (!u) return false;
  const groups = [u.primary, ...u.supplementary];
  const content = state.fs["/etc/sudoers"]?.content ?? "";
  for (const line of content.split("\n")) {
    const m = line.trim().match(/^%([\w-]+)\s+ALL=\(ALL[^)]*\)\s+ALL$/);
    if (m && groups.includes(m[1])) return true;
  }
  return false;
}

/**
 * Scans /etc/sudoers + /etc/sudoers.d/* for narrow per-command grants like
 * `serviceop ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart sshd, /usr/bin/systemctl status sshd`
 * and returns the allowed command strings for `user` (path prefixes like
 * /usr/bin/ stripped, since commands are typed without them here).
 */
function getSudoAllowedCommands(state: ShellState, user: string): string[] {
  const files = [
    "/etc/sudoers",
    ...Object.keys(state.fs).filter((p) => p.startsWith("/etc/sudoers.d/")),
  ];
  const allowed: string[] = [];
  const re = new RegExp(
    `^${user}\\s+ALL=\\(ALL[^)]*\\)\\s+(NOPASSWD:\\s*)?(.+)$`,
  );
  for (const f of files) {
    const content = state.fs[f]?.content ?? "";
    for (const line of content.split("\n")) {
      const m = line.trim().match(re);
      if (!m) continue;
      for (const part of m[2].split(",")) {
        allowed.push(part.trim().replace(/^\/usr\/(bin|sbin)\//, ""));
      }
    }
  }
  return allowed;
}

/** Parses a leading sed address (N, N,M, $, or /regex/) off a command string. */
function parseSedAddress(cmd: string): { addr: string | null; rest: string } {
  if (cmd[0] === "/") {
    const end = cmd.indexOf("/", 1);
    if (end === -1) return { addr: null, rest: cmd };
    return { addr: cmd.slice(0, end + 1), rest: cmd.slice(end + 1) };
  }
  const m = cmd.match(/^(\$|\d+(?:,\d+)?)/);
  if (m) return { addr: m[0], rest: cmd.slice(m[0].length) };
  return { addr: null, rest: cmd };
}

function sedAddressMatches(
  addr: string | null,
  idx: number,
  total: number,
  line: string,
): boolean {
  if (addr === null) return true;
  if (addr === "$") return idx === total - 1;
  if (addr.startsWith("/")) {
    try {
      return new RegExp(addr.slice(1, -1)).test(line);
    } catch {
      return false;
    }
  }
  const m = addr.match(/^(\d+)(?:,(\d+))?$/);
  if (!m) return false;
  const n1 = Number(m[1]);
  const n2 = m[2] ? Number(m[2]) : n1;
  return idx + 1 >= n1 && idx + 1 <= n2;
}

/** Runs a `;`-joined sed script (s/// and d, with optional addresses) over lines. */
function applySedScript(
  lines: string[],
  script: string,
  quiet: boolean,
): string[] {
  let current = [...lines];
  const printed: string[] = [];
  for (const cmdStr of script
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)) {
    const { addr, rest: afterAddr } = parseSedAddress(cmdStr);
    const action = afterAddr[0];
    if (action === "s") {
      const delim = afterAddr[1];
      const parts = afterAddr.slice(2).split(delim);
      const pattern = parts[0] ?? "";
      const replacement = (parts[1] ?? "").replace(/\\(\d)/g, "$$$1");
      const flags = parts[2] ?? "";
      let re: RegExp;
      try {
        re = new RegExp(
          pattern,
          (flags.includes("g") ? "g" : "") +
            (flags.includes("I") || flags.includes("i") ? "i" : ""),
        );
      } catch {
        continue;
      }
      current = current.map((line, idx) =>
        sedAddressMatches(addr, idx, current.length, line)
          ? line.replace(re, replacement)
          : line,
      );
    } else if (action === "d") {
      const total = current.length;
      current = current.filter(
        (line, idx) => !sedAddressMatches(addr, idx, total, line),
      );
    } else if (action === "p") {
      current.forEach((line, idx) => {
        if (sedAddressMatches(addr, idx, current.length, line))
          printed.push(line);
      });
    }
  }
  return quiet ? printed : current;
}

/* ── Tiny awk interpreter ──────────────────────────────────────────────
 * Rather than a full awk-grammar parser, this transpiles the small set of
 * awk constructs these labs actually teach ($N/NR/NF, patterns, BEGIN/END,
 * associative arrays, print/printf, gsub, ~/!~) into equivalent JS source
 * and runs it via `new Function`. Good enough for one-liners; not a real
 * awk — no user-defined functions, no if/while control flow.
 */

function splitAwkFields(line: string, fs: string): string[] {
  const parts =
    fs === " "
      ? line
          .trim()
          .split(/\s+/)
          .filter((x) => x !== "")
      : line.split(fs);
  return [line, ...parts];
}

function awkPrintf(fmt: string, args: unknown[]): string {
  let i = 0;
  return fmt.replace(/%(-?\d+)?(\.\d+)?([sdf%])/g, (_m, width, prec, conv) => {
    if (conv === "%") return "%";
    const val = args[i++];
    let out: string;
    if (conv === "d") out = String(Math.trunc(Number(val)));
    else if (conv === "f")
      out = Number(val).toFixed(prec ? Number(prec.slice(1)) : 6);
    else out = String(val);
    if (width) {
      const w = Number(width);
      const pad = Math.abs(w) - out.length;
      if (pad > 0) out = w < 0 ? out + " ".repeat(pad) : " ".repeat(pad) + out;
    }
    return out;
  });
}

/** gsub(/pat/, repl) on $0 (F[0]), then re-splits F[1..] from the new $0. */
function awkGsub(
  F: string[],
  fs: string,
  pattern: RegExp,
  repl: string,
): number {
  const re = new RegExp(
    pattern.source,
    pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g",
  );
  let count = 0;
  F[0] = F[0].replace(re, () => {
    count++;
    return repl;
  });
  const rebuilt = splitAwkFields(F[0], fs);
  F.length = 0;
  F.push(...rebuilt);
  return count;
}

/** Splits on top-level commas (ignoring commas inside quotes/parens/brackets). */
function splitTopLevelCommas(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  let inQuote: string | null = null;
  for (const c of str) {
    if (inQuote) {
      cur += c;
      if (c === inQuote) inQuote = null;
    } else if (c === '"' || c === "'") {
      inQuote = c;
      cur += c;
    } else if (c === "(" || c === "[") {
      depth++;
      cur += c;
    } else if (c === ")" || c === "]") {
      depth--;
      cur += c;
    } else if (c === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/** Splits an awk program into top-level {pattern, action} clauses. */
function parseAwkProgram(
  program: string,
): { pattern: string; action: string }[] {
  const clauses: { pattern: string; action: string }[] = [];
  let i = 0;
  while (i < program.length) {
    while (i < program.length && /\s/.test(program[i])) i++;
    if (i >= program.length) break;
    const patStart = i;
    while (i < program.length && program[i] !== "{") i++;
    const pattern = program.slice(patStart, i).trim();
    if (i >= program.length) {
      clauses.push({ pattern, action: "print" });
      break;
    }
    let depth = 0;
    const actionOuterStart = i;
    do {
      if (program[i] === "{") depth++;
      else if (program[i] === "}") depth--;
      i++;
    } while (depth > 0 && i < program.length);
    clauses.push({
      pattern,
      action: program.slice(actionOuterStart + 1, i - 1).trim(),
    });
  }
  return clauses;
}

/** Rewrites $N / NR / NF / ~ / !~ into their JS equivalents. */
function transpileAwkTokens(src: string): string {
  return (
    src
      .replace(/\$0\b/g, "F[0]")
      .replace(/\$(\d+)/g, "F[$1]")
      .replace(/\bNF\b/g, "(F.length-1)")
      .replace(/\bNR\b/g, "ctx.NR")
      .replace(/\bgsub\(/g, "AWKGSUB(F, FS, ")
      .replace(/([^\s!]+)\s*!~\s*(\/(?:[^/\\]|\\.)*\/)/g, "!$2.test($1)")
      .replace(/([^\s]+)\s*~\s*(\/(?:[^/\\]|\\.)*\/)/g, "$2.test($1)")
      // `+=` on a field must add numerically — JS's `+` string-concatenates
      // if either side is a string, which F[n] always is.
      .replace(/\+=\s*(F\[\d+\])/g, "+= Number($1)")
  );
}

/** Turns one already-token-transpiled statement into valid JS (print/printf/for). */
function transpileAwkStatement(stmt: string): string {
  stmt = stmt.trim();
  if (!stmt) return "";
  const forMatch = stmt.match(
    /^for\s*\(\s*(\w+)\s+in\s+(\w+)\s*\)\s*([\s\S]+)$/,
  );
  if (forMatch) {
    const [, key, arr, body] = forMatch;
    return `for (var ${key} in ${arr}) { ${transpileAwkStatement(body)} }`;
  }
  const printfMatch = stmt.match(/^printf\s+([\s\S]+)$/);
  if (printfMatch) {
    const parts = splitTopLevelCommas(printfMatch[1]);
    return `OUT.push(AWKPRINTF(${parts[0]}, [${parts.slice(1).join(", ")}]))`;
  }
  const printMatch = stmt.match(/^print(?:\s+([\s\S]*))?$/);
  if (printMatch) {
    const argsStr = (printMatch[1] ?? "").trim();
    if (!argsStr) return `OUT.push(F[0])`;
    const parts = splitTopLevelCommas(argsStr);
    return `OUT.push([${parts.join(", ")}].join(" "))`;
  }
  return stmt;
}

function transpileAwkAction(action: string): string {
  return action
    .split(";")
    .map((s) => transpileAwkStatement(transpileAwkTokens(s.trim())))
    .filter(Boolean)
    .join(";\n");
}

/** Pre-declares any bareword scalar/array vars the program uses (awk auto-vivifies). */
/** awk arrays auto-vivify unset elements to 0 (needed for `count[k]++` on a new key). */
function awkArray(): Record<string, number> {
  return new Proxy(
    {},
    {
      get: (target: Record<string, number>, prop: string | symbol) =>
        typeof prop === "symbol" ? undefined : (target[prop] ?? 0),
      set: (target: Record<string, number>, prop: string | symbol, value) => {
        if (typeof prop !== "symbol") target[prop] = value;
        return true;
      },
    },
  ) as Record<string, number>;
}

function collectAwkVars(source: string): {
  arrays: string[];
  scalars: string[];
} {
  const arrays = new Set<string>();
  const scalars = new Set<string>();
  const arrRe = /\b([a-zA-Z_]\w*)\[/g;
  let m: RegExpExecArray | null;
  while ((m = arrRe.exec(source))) arrays.add(m[1]);
  const scalarRe = /\b([a-zA-Z_]\w*)\s*(\+\+|--|\+=|-=)/g;
  while ((m = scalarRe.exec(source))) {
    if (!arrays.has(m[1])) scalars.add(m[1]);
  }
  return { arrays: [...arrays], scalars: [...scalars] };
}

function runAwkProgram(lines: string[], program: string, fs: string): string {
  const clauses = parseAwkProgram(program);
  const beginClauses = clauses.filter((c) => c.pattern.trim() === "BEGIN");
  const endClauses = clauses.filter((c) => c.pattern.trim() === "END");
  const mainClauses = clauses.filter(
    (c) => c.pattern.trim() !== "BEGIN" && c.pattern.trim() !== "END",
  );

  const allActionSource = clauses
    .map((c) => transpileAwkTokens(c.action))
    .join(";\n");
  const { arrays, scalars } = collectAwkVars(allActionSource);
  const preamble =
    (arrays.length
      ? `var ${arrays.map((a) => `${a}=AWKARRAY()`).join(",")};`
      : "") +
    (scalars.length ? `var ${scalars.map((s) => `${s}=0`).join(",")};` : "");

  const mainBody = mainClauses
    .map((c) => {
      const trimmed = c.pattern.trim();
      let cond: string;
      if (!trimmed) {
        cond = "true";
      } else if (/^\/(?:[^/\\]|\\.)*\/$/.test(trimmed)) {
        // a bare /regex/ pattern (no ~ operator) implicitly tests against $0
        cond = `${trimmed}.test(F[0])`;
      } else {
        cond = transpileAwkTokens(trimmed);
      }
      return `if (${cond}) { ${transpileAwkAction(c.action)} }`;
    })
    .join("\n");

  const fnBody = [
    preamble,
    ...beginClauses.map((c) => transpileAwkAction(c.action)),
    `for (var __i = 0; __i < LINES.length; __i++) {
       ctx.NR = __i + 1;
       var F = splitFields(LINES[__i], FS);
       ${mainBody}
     }`,
    ...endClauses.map((c) => transpileAwkAction(c.action)),
  ].join("\n");

  const OUT: string[] = [];
  const ctx = { NR: 0 };
  try {
    const fn = new Function(
      "LINES",
      "FS",
      "ctx",
      "OUT",
      "AWKPRINTF",
      "splitFields",
      "AWKGSUB",
      "AWKARRAY",
      fnBody,
    );
    fn(lines, fs, ctx, OUT, awkPrintf, splitAwkFields, awkGsub, awkArray);
  } catch (e) {
    return `awk: ${(e as Error).message}`;
  }
  return OUT.join("\n");
}

function lsMetaLine(name: string, node: FsNode): string {
  const isDir = node.type === "dir";
  const perms = (isDir ? "d" : "-") + modeToRwx(nodeMode(node));
  const links = isDir ? 2 : 1;
  const size = isDir ? 4096 : (node.content ?? "").length + 1;
  const owner = node.owner ?? "root";
  const group = node.group ?? "root";
  return `${perms} ${links} ${owner} ${group} ${String(size).padStart(4)} Jan 26 20:42 ${name}`;
}

/** Splits on top-level `|` (never inside quotes) into pipeline stages. */
function splitPipeline(input: string): string[] {
  const stages: string[] = [];
  let cur = "";
  let quote: string | null = null;
  for (const c of input) {
    if (quote) {
      cur += c;
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if (c === "|") {
      stages.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  stages.push(cur);
  return stages.map((s) => s.trim());
}

interface Redir {
  stdout?: { append: boolean; target: string };
  stderrTarget?: { append: boolean; target: string };
  mergeStderr?: boolean;
  stdinFile?: string;
}

/**
 * Strips `>`, `>>`, `2>`, `2>>`, `2>&1`, and `<` redirection tokens out of a
 * command's argument list (never touching the command name itself, and
 * never touching `echo`, which handles its own `>`/`>>` inline). Returns the
 * cleaned tokens plus the redirection targets so `executeOne` can apply them
 * generically to any command's stdout/stderr/stdin.
 */
function extractRedirections(tokens: Token[]): { rest: Token[]; redir: Redir } {
  const redir: Redir = {};
  const kept: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.quoted) {
      kept.push(t);
      continue;
    }
    // Each operator may appear either space-separated ("2> file") or
    // attached directly to its target ("2>/dev/null", ">out.txt") — both
    // are valid bash, so a token starting with the operator is checked for
    // an attached remainder before falling back to the next token.
    if (t.text === "2>&1") {
      redir.mergeStderr = true;
      continue;
    }
    if (t.text.startsWith("2>>")) {
      const target = t.text.slice(3) || tokens[++i]?.text;
      if (target) redir.stderrTarget = { append: true, target };
      continue;
    }
    if (t.text.startsWith("2>")) {
      const target = t.text.slice(2) || tokens[++i]?.text;
      if (target) redir.stderrTarget = { append: false, target };
      continue;
    }
    if (t.text.startsWith(">>")) {
      const target = t.text.slice(2) || tokens[++i]?.text;
      if (target) redir.stdout = { append: true, target };
      continue;
    }
    if (t.text.startsWith(">")) {
      const target = t.text.slice(1) || tokens[++i]?.text;
      if (target) redir.stdout = { append: false, target };
      continue;
    }
    if (t.text.startsWith("<")) {
      const target = t.text.slice(1) || tokens[++i]?.text;
      if (target) redir.stdinFile = target;
      continue;
    }
    kept.push(t);
  }
  return { rest: kept, redir };
}

/** True while a multi-step prompt (e.g. `passwd`) is waiting on the next typed line. */
export function isAwaitingInput(state: ShellState): boolean {
  return !!state.pendingInput;
}

/**
 * Continues an in-progress multi-step prompt with the next typed line (e.g.
 * the new/retyped password for `passwd`). Call this instead of `execute()`
 * whenever `isAwaitingInput()` is true; `value` should be masked in the UI
 * since it's a simulated password entry, not a command.
 */
export function submitInput(prev: ShellState, value: string): ExecResult {
  const pending = prev.pendingInput;
  if (!pending) return { state: prev, output: "", error: true };

  const state: ShellState = JSON.parse(JSON.stringify(prev));

  if (pending.kind === "passwd") {
    if (pending.stage === "new") {
      state.pendingInput = { ...pending, stage: "confirm", firstValue: value };
      return { state, output: "Retype new password: ", error: false };
    }
    state.pendingInput = undefined;
    if (value !== pending.firstValue) {
      return {
        state,
        output:
          "Sorry, passwords do not match.\npasswd: Authentication token manipulation error\npasswd: password unchanged",
        error: true,
      };
    }
    const user = state.users[pending.targetUser];
    if (user) user.passwordSet = true;
    return {
      state,
      output: "passwd: password updated successfully",
      error: false,
    };
  }

  state.pendingInput = undefined;
  return { state, output: "", error: true };
}

/**
 * Executes a full command line, including `cmd1 | cmd2 | cmd3` pipelines —
 * each stage's stdout becomes the next stage's stdin (as plain text; stages
 * that don't accept stdin just ignore it, matching real shell behavior).
 */
export function execute(prev: ShellState, input: string): ExecResult {
  const stages = splitPipeline(input);
  if (stages.length <= 1) return executeOne(prev, input);
  let state = prev;
  let stdinText: string | undefined = undefined;
  let last: ExecResult = { state: prev, output: "", error: false };
  for (const stage of stages) {
    last = executeOne(state, stage, stdinText);
    if (last.error) return last;
    state = last.state;
    stdinText = last.output;
  }
  return last;
}

/** Executes one non-piped command line. Never mutates the given state. */
function executeOne(
  prev: ShellState,
  input: string,
  stdinText?: string,
): ExecResult {
  const state: ShellState = JSON.parse(JSON.stringify(prev));
  // Populated once `cmd`/`rest` are known, below — referenced (not read) by
  // ok()/fail() here, so the forward reference is safe: both are only ever
  // invoked from inside the switch, well after `redir` is assigned.
  let redir: Redir = {};
  const writeRedirectTarget = (
    target: string,
    append: boolean,
    text: string,
  ) => {
    if (target === "/dev/null") return;
    const abs = resolvePath(state.cwd, target);
    if (!state.fs[abs])
      state.fs[abs] = {
        type: "file",
        content: text,
        mode: applyUmask(state, 6),
        ...creatorOwnerGroup(state, permUser, effectiveRoot),
      };
    else if (!append) state.fs[abs] = { ...state.fs[abs], content: text };
    else
      state.fs[abs] = {
        ...state.fs[abs],
        content: (state.fs[abs].content ?? "") + "\n" + text,
      };
  };
  const fail = (output: string): ExecResult => {
    if (redir.stderrTarget) {
      writeRedirectTarget(
        redir.stderrTarget.target,
        redir.stderrTarget.append,
        output,
      );
      return { state, output: "", error: false };
    }
    if (redir.mergeStderr && redir.stdout) {
      writeRedirectTarget(redir.stdout.target, redir.stdout.append, output);
      return { state, output: "", error: false };
    }
    return { state: prev, output, error: true };
  };
  const ok = (output = ""): ExecResult => {
    if (redir.stdout) {
      writeRedirectTarget(redir.stdout.target, redir.stdout.append, output);
      return { state, output: "", error: false };
    }
    return { state, output, error: false };
  };

  let rawToks = tokenize(input.trim());
  if (!rawToks) return fail("bash: syntax error: unclosed quote");
  if (!rawToks.length) return ok();
  const actingUser = currentUser(state);
  // A leading `sudo` elevates for this one command — allowed unconditionally
  // for root, and for anyone else only if they're in the sudo group.
  let effectiveRoot = actingUser === "root";
  // The identity permission checks (cat/echo) run as — normally the acting
  // user, unless `sudo -u <name>` impersonates someone else for this command.
  let permUser = actingUser;
  if (rawToks[0].text === "sudo" && !rawToks[0].quoted) {
    rawToks = rawToks.slice(1);
    if (!rawToks.length) return fail("usage: sudo command");
    if (!effectiveRoot) {
      const inSudo = hasBlanketSudo(state, actingUser);
      if (inSudo) {
        effectiveRoot = true;
      } else {
        // not a blanket sudoer — maybe a narrow sudoers.d rule covers this
        // exact command (e.g. "systemctl restart sshd")
        const requested = rawToks.map((t) => t.text).join(" ");
        const allowed = getSudoAllowedCommands(state, actingUser);
        if (allowed.includes(requested)) {
          effectiveRoot = true;
        } else {
          return fail(
            `${actingUser} is not in the sudoers file.  This incident will be reported.`,
          );
        }
      }
    }
    if (rawToks[0]?.text === "-u" && !rawToks[0].quoted) {
      const target = rawToks[1]?.text;
      if (!target) return fail("usage: sudo -u user command");
      if (!state.users[target]) return fail(`sudo: unknown user ${target}`);
      permUser = target;
      effectiveRoot = target === "root";
      rawToks = rawToks.slice(2);
      if (!rawToks.length) return fail("usage: sudo -u user command");
    }
  }
  // `bash -c '<inner command>'` — unwrap so the inner command runs with the
  // same permUser/effectiveRoot already established (e.g. after sudo -u).
  if (rawToks[0]?.text === "bash" && rawToks[1]?.text === "-c") {
    const inner = rawToks[2]?.text;
    if (!inner) return fail("bash: -c: option requires an argument");
    const innerToks = tokenize(inner);
    if (!innerToks) return fail("bash: syntax error: unclosed quote");
    rawToks = innerToks;
  }
  const cmd = rawToks[0]?.text ?? "";
  let rest = rawToks.slice(1);
  if (!cmd) return ok();

  // `echo` parses its own `>`/`>>` inline (tied to its create/overwrite/
  // append semantics) — every other command's redirection is handled here,
  // generically, via `redir` + the ok()/fail() wrappers above.
  if (cmd !== "echo") {
    const extracted = extractRedirections(rest);
    rest = extracted.rest;
    redir = extracted.redir;
    if (redir.stdinFile) {
      const abs = resolvePath(state.cwd, redir.stdinFile);
      const node = state.fs[abs];
      if (!node)
        return fail(`bash: ${redir.stdinFile}: No such file or directory`);
      stdinText = node.content ?? "";
    }
  }

  switch (cmd) {
    case "pwd":
      return ok(state.cwd);

    case "whoami":
      return ok(actingUser);

    case "su": {
      const args = rest.filter((t) => t.quoted || t.text !== "-");
      const target = args[0]?.text;
      if (!target) return fail("su: missing operand");
      const user = state.users[target];
      if (!user) return fail(`su: user ${target} does not exist`);
      const home = userHome(target, user);
      state.cwdStack.push(state.cwd);
      state.userStack.push(target);
      if (state.fs[home]) {
        state.cwd = home;
        return ok();
      }
      // real su still logs in even when the home dir is missing — it just
      // can't cd into it, and warns instead
      return ok(
        `su: warning: cannot change directory to ${home}: No such file or directory`,
      );
    }

    case "exit": {
      if (state.userStack.length <= 1) return ok("");
      state.userStack.pop();
      state.cwd = state.cwdStack.pop() ?? HOME;
      return ok();
    }

    case "login": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const target = args[0]?.text;
      if (!target) return fail("login: missing operand");
      const user = state.users[target];
      if (!user) return fail(`login: invalid username`);
      if (user.locked) {
        // a locked account is a *demonstration*, not a shell error — the
        // task expects to see exactly this "Login incorrect" text
        return ok("Password: \n\nLogin incorrect\nlab login: ");
      }
      const home = userHome(target, user);
      state.cwdStack.push(state.cwd);
      state.userStack.push(target);
      if (state.fs[home]) state.cwd = home;
      return ok(
        `Password: \n\nWelcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.10.51 x86_64)\n\n${target}@lab:~$ `,
      );
    }

    case "groupadd": {
      let force = false;
      let gid: number | null = null;
      let name: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text.startsWith("-")) {
          const letters = t.text.slice(1);
          if (letters.includes("f")) force = true;
          if (letters.includes("g")) gid = Number(rest[++i]?.text ?? NaN);
        } else {
          name = t.text;
        }
      }
      if (!name) return fail("groupadd: missing operand");
      if (state.groups[name] !== undefined) {
        if (force) return ok();
        return fail(`groupadd: group '${name}' already exists`);
      }
      state.groups[name] = gid ?? nextGid(state);
      syncEtcFiles(state);
      return ok();
    }

    case "useradd": {
      let makeHome = false;
      let suppGroups: string[] = [];
      let primaryGroup: string | null = null;
      let shell = "/bin/sh";
      let homePath: string | null = null;
      let comment: string | null = null;
      let expire: string | null = null;
      let name: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text.startsWith("-")) {
          const letters = t.text.slice(1);
          if (letters.includes("m")) makeHome = true;
          if (letters.includes("G"))
            suppGroups = (rest[++i]?.text ?? "").split(",").filter(Boolean);
          else if (letters.includes("g"))
            primaryGroup = rest[++i]?.text ?? null;
          if (letters.includes("s")) shell = rest[++i]?.text ?? shell;
          if (letters.includes("d")) homePath = rest[++i]?.text ?? null;
          if (letters.includes("c")) comment = rest[++i]?.text ?? null;
          if (letters.includes("e")) expire = rest[++i]?.text ?? null;
        } else {
          name = t.text;
        }
      }
      if (!name) return fail("useradd: missing operand");
      if (state.users[name])
        return fail(`useradd: user '${name}' already exists`);
      for (const g of suppGroups) {
        if (state.groups[g] === undefined)
          return fail(`useradd: group '${g}' does not exist`);
      }
      if (primaryGroup && state.groups[primaryGroup] === undefined)
        return fail(`useradd: group '${primaryGroup}' does not exist`);
      const uid = nextUid(state);
      let primary = primaryGroup;
      if (!primary) {
        // user-private group, same name as the user
        primary = name;
        if (state.groups[name] === undefined)
          state.groups[name] = nextGid(state);
      }
      const home = homePath ?? `/home/${name}`;
      state.users[name] = {
        uid,
        primary,
        supplementary: suppGroups,
        locked: false,
        shell,
        home,
        ...(comment && { comment }),
        ...(expire && { expire }),
      };
      if (makeHome) {
        state.fs[home] = { type: "dir", owner: name, group: primary };
        // useradd -m copies /etc/skel's contents into the new home, chowned
        // to the new user — the same "class -> object" template pattern
        // taught in the User Management lesson.
        copyTree(state, "/etc/skel", home, name, primary);
      }
      syncEtcFiles(state);
      return ok();
    }

    case "usermod": {
      let primaryGroup: string | null = null;
      let gList: string[] | null = null;
      let append = false;
      let lock: boolean | null = null;
      let shell: string | null = null;
      let newLogin: string | null = null;
      let homePath: string | null = null;
      let moveHome = false;
      let newUid: number | null = null;
      let comment: string | null = null;
      let expire: string | null = null;
      let name: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text.startsWith("-")) {
          const letters = t.text.slice(1);
          if (letters.includes("a")) append = true;
          if (letters.includes("G"))
            gList = (rest[++i]?.text ?? "").split(",").filter(Boolean);
          else if (letters.includes("g"))
            primaryGroup = rest[++i]?.text ?? null;
          if (letters.includes("L")) lock = true;
          if (letters.includes("U")) lock = false;
          if (letters.includes("s")) shell = rest[++i]?.text ?? null;
          if (letters.includes("l")) newLogin = rest[++i]?.text ?? null;
          if (letters.includes("d")) homePath = rest[++i]?.text ?? null;
          if (letters.includes("m")) moveHome = true;
          if (letters.includes("u")) newUid = Number(rest[++i]?.text ?? NaN);
          if (letters.includes("c")) comment = rest[++i]?.text ?? null;
          if (letters.includes("e")) expire = rest[++i]?.text ?? null;
        } else {
          name = t.text;
        }
      }
      if (!name) return fail("usermod: missing operand");
      const user = state.users[name];
      if (!user) return fail(`usermod: user '${name}' does not exist`);
      if (primaryGroup !== null) {
        if (state.groups[primaryGroup] === undefined)
          return fail(`usermod: group '${primaryGroup}' does not exist`);
        user.primary = primaryGroup;
      }
      if (gList !== null) {
        for (const g of gList) {
          if (state.groups[g] === undefined)
            return fail(`usermod: group '${g}' does not exist`);
        }
        // -aG appends; -G without -a REPLACES the supplementary list (the classic trap)
        user.supplementary = append
          ? [...new Set([...user.supplementary, ...gList])]
          : [...gList];
      }
      if (lock !== null) user.locked = lock;
      if (shell !== null) user.shell = shell;
      if (newUid !== null) user.uid = newUid;
      if (comment !== null) user.comment = comment;
      if (expire !== null) user.expire = expire;
      if (homePath !== null) {
        // -d alone only changes the recorded path; -d -m also moves the
        // directory's contents (real usermod leaves stray files behind
        // without -m, exactly like this).
        if (moveHome) {
          const oldHome = userHome(name, user);
          if (oldHome !== homePath) {
            for (const p of Object.keys(state.fs)) {
              if (p === oldHome || p.startsWith(oldHome + "/")) {
                state.fs[homePath + p.slice(oldHome.length)] = state.fs[p];
                delete state.fs[p];
              }
            }
          }
        }
        user.home = homePath;
      }
      if (newLogin !== null && newLogin !== name) {
        if (state.users[newLogin])
          return fail(`usermod: user '${newLogin}' already exists`);
        delete state.users[name];
        state.users[newLogin] = user;
      }
      syncEtcFiles(state);
      return ok();
    }

    case "userdel": {
      const flags = rest.filter((t) => !t.quoted && t.text.startsWith("-"));
      const removeHome = flags.some((f) => /^-\w*r\w*$/.test(f.text));
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text;
      if (!name) return fail("userdel: missing operand");
      const target = state.users[name];
      if (!target) return fail(`userdel: user '${name}' does not exist`);
      const wasPrimary = target.primary;
      const home = userHome(name, target);
      delete state.users[name];
      // real userdel also removes the user-private group when unused
      if (
        wasPrimary === name &&
        !Object.values(state.users).some((u) => u.primary === name)
      ) {
        delete state.groups[name];
      }
      if (removeHome) {
        for (const p of Object.keys(state.fs)) {
          if (p === home || p.startsWith(home + "/")) delete state.fs[p];
        }
      }
      syncEtcFiles(state);
      return ok();
    }

    case "groupdel": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text;
      if (!name) return fail("groupdel: missing operand");
      if (state.groups[name] === undefined)
        return fail(`groupdel: group '${name}' does not exist`);
      if (Object.values(state.users).some((u) => u.primary === name))
        return fail(`groupdel: cannot remove the primary group of a user`);
      delete state.groups[name];
      for (const user of Object.values(state.users)) {
        user.supplementary = user.supplementary.filter((g) => g !== name);
      }
      syncEtcFiles(state);
      return ok();
    }

    case "passwd": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text ?? "root";
      const user = state.users[name];
      if (!user) return fail(`passwd: user '${name}' does not exist`);
      if (flags.includes("S")) {
        const statusLetter = user.locked ? "L" : "P";
        return ok(
          `${name} ${statusLetter} ${FAKE_LAST_CHANGE_SHORT} ${user.minDays ?? 0} ${user.maxDays ?? 99999} ${user.warnDays ?? 7} -1`,
        );
      }
      if (flags.includes("l")) {
        user.locked = true;
        return ok(`passwd: password expiry information changed.`);
      }
      if (flags.includes("u")) {
        user.locked = false;
        return ok(`passwd: password expiry information changed.`);
      }
      state.pendingInput = { kind: "passwd", targetUser: name, stage: "new" };
      return ok("New password: ");
    }

    case "chage": {
      let list = false;
      let setMax: number | null = null;
      let setMin: number | null = null;
      let setWarn: number | null = null;
      let setLastChange: string | null = null;
      let name: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text.startsWith("-")) {
          const letters = t.text.slice(1);
          if (letters.includes("l")) list = true;
          if (letters.includes("M")) setMax = Number(rest[++i]?.text ?? NaN);
          if (letters.includes("m")) setMin = Number(rest[++i]?.text ?? NaN);
          if (letters.includes("W")) setWarn = Number(rest[++i]?.text ?? NaN);
          if (letters.includes("d")) setLastChange = rest[++i]?.text ?? null;
        } else {
          name = t.text;
        }
      }
      if (!name) return fail("chage: missing operand");
      const user = state.users[name];
      if (!user) return fail(`chage: user '${name}' does not exist`);
      if (setMax !== null) user.maxDays = setMax;
      if (setMin !== null) user.minDays = setMin;
      if (setWarn !== null) user.warnDays = setWarn;
      if (setLastChange !== null)
        user.mustChangePassword = setLastChange === "0";
      if (list) {
        const dateOrChange = user.mustChangePassword
          ? "password must be changed"
          : FAKE_LAST_CHANGE;
        const expiresLine = user.mustChangePassword
          ? "password must be changed"
          : "never";
        const expireField = user.expire ? formatIsoDate(user.expire) : "never";
        return ok(
          [
            `Last password change\t\t\t\t\t: ${dateOrChange}`,
            `Password expires\t\t\t\t\t: ${expiresLine}`,
            `Password inactive\t\t\t\t\t: ${expiresLine}`,
            `Account expires\t\t\t\t\t\t: ${expireField}`,
            `Minimum number of days between password change\t: ${user.minDays ?? 0}`,
            `Maximum number of days between password change\t: ${user.maxDays ?? 99999}`,
            `Number of days of warning before password expires\t: ${user.warnDays ?? 7}`,
          ].join("\n"),
        );
      }
      return ok();
    }

    case "id": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text ?? "root";
      const user = state.users[name];
      if (!user) return fail(`id: '${name}': no such user`);
      const gid = state.groups[user.primary] ?? 0;
      const parts = [`${gid}(${user.primary})`];
      for (const g of user.supplementary)
        parts.push(`${state.groups[g]}(${g})`);
      return ok(
        `uid=${user.uid}(${name}) gid=${gid}(${user.primary}) groups=${parts.join(",")}`,
      );
    }

    case "groups": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text ?? "root";
      const user = state.users[name];
      if (!user) return fail(`groups: '${name}': no such user`);
      return ok(`${name} : ${[user.primary, ...user.supplementary].join(" ")}`);
    }

    case "chmod": {
      const flagToks = rest.filter(
        (t) =>
          !t.quoted && t.text.startsWith("-") && /^-[A-Za-z]+$/.test(t.text),
      );
      const recursive = flagToks.some((f) => /R/.test(f.text));
      const args = rest
        .filter((t) => !flagToks.includes(t))
        .flatMap((t) => expandGlob(state, t));
      if (args.length < 2) return fail("chmod: missing operand");
      const spec = args[0];
      const octal = /^[0-7]{3}$/.test(spec);
      if (!octal && !/^([ugoa]*[+\-=][rwx]*,?)+$/.test(spec))
        return fail(`chmod: invalid mode: '${spec}'`);
      for (const raw of args.slice(1)) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `chmod: cannot access '${raw}': No such file or directory`,
          );
        const targets = [abs];
        if (recursive && node.type === "dir") {
          targets.push(
            ...Object.keys(state.fs).filter((p) => p.startsWith(abs + "/")),
          );
        }
        for (const p of targets) {
          const n = state.fs[p];
          const next = octal ? spec : applySymbolic(nodeMode(n), spec);
          if (!next) return fail(`chmod: invalid mode: '${spec}'`);
          n.mode = next;
        }
      }
      return ok();
    }

    case "chown": {
      const flagToks = rest.filter(
        (t) =>
          !t.quoted && t.text.startsWith("-") && /^-[A-Za-z]+$/.test(t.text),
      );
      const recursive = flagToks.some((f) => /R/.test(f.text));
      const args = rest
        .filter((t) => !flagToks.includes(t))
        .flatMap((t) => expandGlob(state, t));
      if (args.length < 2) return fail("chown: missing operand");
      const [ownerSpec, ...paths] = args;
      const [ownerName, groupName] = ownerSpec.split(":");
      if (ownerName && !state.users[ownerName])
        return fail(`chown: invalid user: '${ownerSpec}'`);
      if (groupName && state.groups[groupName] === undefined)
        return fail(`chown: invalid group: '${ownerSpec}'`);
      for (const raw of paths) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `chown: cannot access '${raw}': No such file or directory`,
          );
        const targets = [abs];
        if (recursive && node.type === "dir") {
          targets.push(
            ...Object.keys(state.fs).filter((p) => p.startsWith(abs + "/")),
          );
        }
        for (const p of targets) {
          if (ownerName) state.fs[p].owner = ownerName;
          if (groupName) state.fs[p].group = groupName;
        }
      }
      return ok();
    }

    case "chgrp": {
      const flagToks = rest.filter(
        (t) =>
          !t.quoted && t.text.startsWith("-") && /^-[A-Za-z]+$/.test(t.text),
      );
      const recursive = flagToks.some((f) => /R/.test(f.text));
      const args = rest
        .filter((t) => !flagToks.includes(t))
        .flatMap((t) => expandGlob(state, t));
      if (args.length < 2) return fail("chgrp: missing operand");
      const [groupName, ...paths] = args;
      if (state.groups[groupName] === undefined)
        return fail(`chgrp: invalid group: '${groupName}'`);
      for (const raw of paths) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `chgrp: cannot access '${raw}': No such file or directory`,
          );
        const targets = [abs];
        if (recursive && node.type === "dir") {
          targets.push(
            ...Object.keys(state.fs).filter((p) => p.startsWith(abs + "/")),
          );
        }
        for (const p of targets) state.fs[p].group = groupName;
      }
      return ok();
    }

    case "setfacl": {
      const flagToks = rest.filter((t) => !t.quoted && t.text.startsWith("-"));
      const recursive = flagToks.some((t) => /R/.test(t.text));
      // -m can be its own token ("-m spec") or fused ("-Rm" spec) — after
      // stripping flags, the first remaining token is always the spec
      // (u:name:perms / g:name:perms), the rest are target paths.
      const nonFlag = rest
        .filter((t) => t.quoted || !t.text.startsWith("-"))
        .map((t) => t.text);
      const spec = nonFlag[0] ?? null;
      const paths = nonFlag.slice(1);
      if (!spec || !paths.length) return fail("setfacl: missing operand");
      const specMatch = spec.match(/^([ug]):([^:]*):([rwx-]{1,3})$/);
      if (!specMatch) return fail(`setfacl: invalid entry: '${spec}'`);
      const [, kindLetter, name, rawPerms] = specMatch;
      const kind = kindLetter as "u" | "g";
      // normalize to a padded 3-char rwx form (e.g. "rx" -> "r-x") so stored
      // ACL entries always compare/display consistently
      const perms = ["r", "w", "x"]
        .map((c) => (rawPerms.includes(c) ? c : "-"))
        .join("");
      if (kind === "u" && name && !state.users[name])
        return fail(`setfacl: user '${name}' does not exist`);
      if (kind === "g" && name && state.groups[name] === undefined)
        return fail(`setfacl: group '${name}' does not exist`);
      for (const raw of paths) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `setfacl: cannot access '${raw}': No such file or directory`,
          );
        const targets = [abs];
        if (recursive && node.type === "dir") {
          targets.push(
            ...Object.keys(state.fs).filter((p) => p.startsWith(abs + "/")),
          );
        }
        for (const p of targets) {
          const n = state.fs[p];
          n.acl = (n.acl ?? []).filter(
            (e) => !(e.kind === kind && e.name === name),
          );
          n.acl.push({ kind, name, perms });
        }
      }
      return ok();
    }

    case "getfacl": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const raw = args[0]?.text;
      if (!raw) return fail("getfacl: missing operand");
      const abs = resolvePath(state.cwd, raw);
      const node = state.fs[abs];
      if (!node) return fail(`getfacl: ${raw}: No such file or directory`);
      const m = nodeMode(node);
      const owner = node.owner ?? "root";
      const group = node.group ?? "root";
      const lines = [
        `# file: ${raw}`,
        `# owner: ${owner}`,
        `# group: ${group}`,
        `user::${modeToRwx(m[0])}`,
      ];
      for (const e of node.acl ?? []) {
        if (e.kind === "u") lines.push(`user:${e.name}:${e.perms}`);
      }
      lines.push(`group::${modeToRwx(m[1])}`);
      for (const e of node.acl ?? []) {
        if (e.kind === "g") lines.push(`group:${e.name}:${e.perms}`);
      }
      if ((node.acl ?? []).length) lines.push(`mask::rwx`);
      lines.push(`other::${modeToRwx(m[2])}`);
      return ok(lines.join("\n"));
    }

    case "umask": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return ok(state.umask);
      const val = args[0].text;
      if (!/^[0-7]{3}$/.test(val))
        return fail(`bash: umask: ${val}: octal number required`);
      state.umask = val;
      return ok();
    }

    case "apt":
    case "apt-get":
      // package install/update is out of scope for this simulator — treat
      // as a no-op success so labs that bootstrap tools (acl, sysstat...)
      // can move straight to the commands those tools provide.
      return ok();

    case "which": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return ok();
      return ok(args.map((a) => `/usr/bin/${a.text}`).join("\n"));
    }

    case "getent": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const [db, name] = args.map((a) => a.text);
      if (db === "group" && name) {
        if (state.groups[name] === undefined)
          return fail(`getent: '${name}': no such group`);
        const members = Object.entries(state.users)
          .filter(([, u]) => u.supplementary.includes(name))
          .map(([n]) => n)
          .join(",");
        return ok(`${name}:x:${state.groups[name]}:${members}`);
      }
      if (db === "passwd" && name) {
        const u = state.users[name];
        if (!u) return fail(`getent: '${name}': no such user`);
        return ok(
          `${name}:x:${u.uid}:${state.groups[u.primary] ?? 0}:${u.comment ?? ""}:${userHome(name, u)}:${u.shell}`,
        );
      }
      return fail(`getent: unknown database: '${db}'`);
    }

    case "systemctl": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const action = args[0]?.text;
      const rawName = args[1]?.text;
      if (!action || !rawName)
        return fail("usage: systemctl <restart|stop|start|status> <service>");
      const name = rawName.replace(/\.service$/, "");
      if (!effectiveRoot)
        return fail(
          `==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ===\nAuthentication is required to manage system services.\nsystemctl: Access denied`,
        );
      const svc = state.services[name];
      if (!svc) return fail(`Unit ${name}.service not loaded.`);
      if (action === "restart" || action === "start") {
        svc.running = true;
        svc.pid = svc.pid + 1;
        return ok();
      }
      if (action === "stop") {
        svc.running = false;
        return ok();
      }
      if (action === "status") {
        return ok(
          svc.running
            ? `● ${name}.service - ${name}\n   Active: active (running)\n Main PID: ${svc.pid} (${name})`
            : `● ${name}.service - ${name}\n   Active: inactive (dead)`,
        );
      }
      return fail(`systemctl: unknown action '${action}'`);
    }

    case "pidof": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const name = args[0]?.text;
      if (!name) return fail("usage: pidof <name>");
      const svc = state.services[name];
      return ok(svc?.running ? String(svc.pid) : "");
    }

    case "ps": {
      const rows = Object.entries(state.services).map(
        ([name, s]) =>
          `${s.pid} 00:${(s.pid % 60).toString().padStart(2, "0")}:00 /usr/sbin/${name}`,
      );
      return ok(
        [
          "    PID     ELAPSED CMD",
          "      1     10:00:00 /sbin/init",
          ...rows,
          "   1170     05:12:00 bash",
        ].join("\n"),
      );
    }

    case "nproc":
      return ok("4");

    case "uptime": {
      const line: Record<typeof state.perfLoad, string> = {
        idle: "16:49:09 up 10:36,  0 users,  load average: 0.19, 0.19, 0.47",
        cpu: "16:52:10 up 10:39,  0 users,  load average: 3.52, 1.71, 0.84",
        mem: "17:05:00 up 10:52,  0 users,  load average: 0.45, 0.60, 0.55",
        "mem-critical":
          "17:06:00 up 10:53,  0 users,  load average: 1.10, 0.90, 0.70",
        disk: "17:10:00 up 10:57,  0 users,  load average: 0.80, 0.65, 0.50",
        net: "17:15:00 up 11:02,  0 users,  load average: 0.30, 0.28, 0.31",
      };
      return ok(line[state.perfLoad]);
    }

    case "free": {
      const rows: Record<typeof state.perfLoad, string> = {
        idle: "              total        used        free      shared  buff/cache   available\nMem:           7963         462        2991           0        4509        7222\nSwap:             0           0           0",
        cpu: "              total        used        free      shared  buff/cache   available\nMem:           7963         520        2900           0        4543        7180\nSwap:             0           0           0",
        mem: "              total        used        free      shared  buff/cache   available\nMem:           7963        5995        1388           0         580        1736\nSwap:             0           0           0",
        "mem-critical":
          "              total        used        free      shared  buff/cache   available\nMem:           7963        7045         338           0         580         686\nSwap:             0           0           0",
        disk: "              total        used        free      shared  buff/cache   available\nMem:           7963         480        2960           0        4523        7200\nSwap:             0           0           0",
        net: "              total        used        free      shared  buff/cache   available\nMem:           7963         470        2985           0        4508        7215\nSwap:             0           0           0",
      };
      return ok(rows[state.perfLoad]);
    }

    case "vmstat": {
      const rows: Record<typeof state.perfLoad, string> = {
        idle: "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 0  0      0 3063820  55880 4561584    0    0     2     3    5    8  1  1 98  0  0",
        cpu: "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 4  0      0 3050120  55880 4561584    0    0     2     3   90  120 96  3  1  0  0",
        mem: "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 1  0      0 1421000  10240  590000    0    0    10    12   40   60  4  2 94  0  0",
        "mem-critical":
          "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 2  1      0  346000  10240  590000    0    0    20    24   50   70  5  5 88  2  0",
        disk: "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 0  2      0 7495000  34676 230244    0    0 42062 45978  400  600  2  8 53 37  0",
        net: "procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 0  0      0 3060000  55880 4561584    0    0     2     3   30  400  3  1 96  0  0",
      };
      return ok(rows[state.perfLoad]);
    }

    case "mpstat": {
      const rows: Record<typeof state.perfLoad, string> = {
        idle: "CPU  %usr %nice %sys %iowait %irq %soft %steal %guest %gnice %idle\nall  2.00  0.00 1.50   0.00  0.00 0.75  0.00   0.00   0.00   95.76",
        cpu: "CPU  %usr %nice %sys %iowait %irq %soft %steal %guest %gnice %idle\nall  98.50  0.00 1.50   0.00  0.00 0.00  0.00   0.00   0.00   0.00",
        mem: "CPU  %usr %nice %sys %iowait %irq %soft %steal %guest %gnice %idle\nall  4.00  0.00 2.00   0.00  0.00 0.50  0.00   0.00   0.00   93.50",
        "mem-critical":
          "CPU  %usr %nice %sys %iowait %irq %soft %steal %guest %gnice %idle\nall  5.00  0.00 5.00   0.50  0.00 0.50  0.00   0.00   0.00   88.00",
        disk: "CPU  %usr %nice %sys %iowait %irq %soft %steal %guest %gnice %idle\nall  2.00  0.00 8.00  37.00  0.00 0.00  0.00   0.00   0.00   53.00",
        net: "CPU  %usr %nice %sys %iowait %irq %soft %steal %guest %gnice %idle\nall  3.00  0.00 2.00   0.00  0.00 4.00  0.00   0.00   0.00   91.00",
      };
      return ok(rows[state.perfLoad]);
    }

    case "iostat": {
      const rows: Record<typeof state.perfLoad, string> = {
        idle: "avg-cpu:  %user %nice %system %iowait %steal %idle\n           2.12  0.00   2.46    0.13   0.00   95.28\nDevice  r/s   w/s   %util\nvda     14.87 785.99  1.97",
        cpu: "avg-cpu:  %user %nice %system %iowait %steal %idle\n          98.00  0.00   1.50    0.00   0.00    0.50\nDevice  r/s   w/s   %util\nvda     10.00 20.00  1.50",
        mem: "avg-cpu:  %user %nice %system %iowait %steal %idle\n           4.00  0.00   2.00    0.50   0.00   93.50\nDevice  r/s   w/s   %util\nvda     15.00 40.00   3.00",
        "mem-critical":
          "avg-cpu:  %user %nice %system %iowait %steal %idle\n           5.00  0.00   5.00    1.00   0.00   89.00\nDevice  r/s   w/s   %util\nvda     20.00 60.00   6.00",
        disk: "avg-cpu:  %user %nice %system %iowait %steal %idle\n           2.00  0.00   8.00   37.00   0.00   53.00\nDevice  r/s   w/s   %util\nvda     14.87 45978.00 100.00",
        net: "avg-cpu:  %user %nice %system %iowait %steal %idle\n           3.00  0.00   2.00    0.00   0.00   95.00\nDevice  r/s   w/s   %util\nvda     14.87 785.99  1.97",
      };
      return ok(rows[state.perfLoad]);
    }

    case "sar": {
      const args = rest.map((t) => t.text).join(" ");
      if (args.includes("TCP")) {
        const rows: Record<typeof state.perfLoad, string> = {
          idle: "active/s passive/s iseg/s oseg/s\n  0.00      0.00    19.00  15.00",
          cpu: "active/s passive/s iseg/s oseg/s\n  0.00      0.00    19.00  15.00",
          mem: "active/s passive/s iseg/s oseg/s\n  0.00      0.00    19.00  15.00",
          "mem-critical":
            "active/s passive/s iseg/s oseg/s\n  0.00      0.00    19.00  15.00",
          disk: "active/s passive/s iseg/s oseg/s\n  0.00      0.00    19.00  15.00",
          net: "active/s passive/s iseg/s oseg/s\n  0.00      0.00 19000.00 15200.00",
        };
        return ok(rows[state.perfLoad]);
      }
      const rows: Record<typeof state.perfLoad, string> = {
        idle: "IFACE   rxpck/s txpck/s rxkB/s txkB/s\nlo      0.00    0.00    0.00   0.00\neth0    16.00   12.00   1.64   1.03",
        cpu: "IFACE   rxpck/s txpck/s rxkB/s txkB/s\nlo      0.00    0.00    0.00   0.00\neth0    16.00   12.00   1.64   1.03",
        mem: "IFACE   rxpck/s txpck/s rxkB/s txkB/s\nlo      0.00    0.00    0.00   0.00\neth0    16.00   12.00   1.64   1.03",
        "mem-critical":
          "IFACE   rxpck/s txpck/s rxkB/s txkB/s\nlo      0.00    0.00    0.00   0.00\neth0    16.00   12.00   1.64   1.03",
        disk: "IFACE   rxpck/s txpck/s rxkB/s txkB/s\nlo      0.00    0.00    0.00   0.00\neth0    16.00   12.00   1.64   1.03",
        net: "IFACE   rxpck/s txpck/s rxkB/s txkB/s\nlo    77572.00 0.00 3539061.98 0.00\neth0    27.00   16.00   2.10   1.40",
      };
      return ok(rows[state.perfLoad]);
    }

    case "top": {
      const header: Record<typeof state.perfLoad, string> = {
        idle: "top - 17:02:24 up 10:49,  0 users,  load average: 0.20, 0.13, 0.24\n%Cpu(s): 2.4 us, 1.2 sy, 0.0 ni, 96.3 id, 0.0 wa",
        cpu: "top - 17:03:24 up 10:50,  0 users,  load average: 3.60, 1.80, 0.90\n%Cpu(s): 98.0 us, 1.5 sy, 0.0 ni, 0.5 id, 0.0 wa",
        mem: "top - 17:05:24 up 10:52,  0 users,  load average: 0.45, 0.60, 0.55\n%Cpu(s): 4.0 us, 2.0 sy, 0.0 ni, 93.5 id, 0.5 wa",
        "mem-critical":
          "top - 17:06:24 up 10:53,  0 users,  load average: 1.10, 0.90, 0.70\n%Cpu(s): 5.0 us, 5.0 sy, 0.0 ni, 88.0 id, 1.0 wa",
        disk: "top - 17:10:24 up 10:57,  0 users,  load average: 0.80, 0.65, 0.50\n%Cpu(s): 2.0 us, 8.0 sy, 0.0 ni, 53.0 id, 37.0 wa",
        net: "top - 17:15:24 up 11:02,  0 users,  load average: 0.30, 0.28, 0.31\n%Cpu(s): 3.0 us, 2.0 sy, 0.0 ni, 91.0 id, 0.0 wa",
      };
      const procLine =
        state.perfLoad === "idle"
          ? "  PID USER  PR  NI    VIRT    RES   SHR S %CPU %MEM  TIME+   COMMAND\n 1170 root  20  0  1352788 117468 28148 S  1.3  1.4  2:22.82 node"
          : "  PID USER  PR  NI    VIRT    RES   SHR S %CPU %MEM  TIME+   COMMAND\n15859 root  20  0  1352788 117468 28148 R 99.0  1.4  0:12.82 stress-ng-cpu";
      return ok(`${header[state.perfLoad]}\n\n${procLine}`);
    }

    case "dmesg": {
      return ok(
        [
          "[11858.264754] oom-kill:constraint=CONSTRAINT_NONE,nodemask=(null),cpuset=/,mems_allowed=0,global_oom,task_memcg=/system.slice,task=stress-ng-vm,pid=84005,uid=0",
          "[11858.264768] Out of memory: Killed process 84005 (stress-ng-vm) total-vm:3890692kB, anon-rss:3840804kB, file-rss:4kB, shmem-rss:48kB, UID:0 pgtables:7592kB oom_score_adj:1000",
          "[11858.407300] oom_reaper: reaped process 84005 (stress-ng-vm), now anon-rss:0kB, file-rss:0kB, shmem-rss:48kB",
        ].join("\n"),
      );
    }

    case "logger": {
      let tag = "logger";
      let priority = "user.notice";
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (t.quoted) continue;
        if (t.text === "-t") tag = rest[++i]?.text ?? tag;
        else if (t.text === "-p") priority = rest[++i]?.text ?? priority;
      }
      const messageTok = [...rest].reverse().find((t) => t.quoted);
      const message = messageTok?.text ?? "";
      state.journal.push({ tag, priority, message });
      return ok();
    }

    case "journalctl": {
      let n: number | null = null;
      let tagFilter: string | null = null;
      let prioFilter: string | null = null;
      let diskUsage = false;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (t.quoted) continue;
        if (t.text === "-n") n = Number(rest[++i]?.text ?? "10");
        else if (t.text === "-t") tagFilter = rest[++i]?.text ?? null;
        else if (t.text === "-p") prioFilter = rest[++i]?.text ?? null;
        else if (t.text === "--disk-usage") diskUsage = true;
      }
      if (diskUsage)
        return ok(
          "Archived and active journals take up 16.0M in the file system.",
        );
      let entries = state.journal;
      if (tagFilter) entries = entries.filter((e) => e.tag === tagFilter);
      if (prioFilter)
        entries = entries.filter((e) => e.priority.endsWith(`.${prioFilter}`));
      if (n !== null) entries = entries.slice(-n);
      if (!entries.length) return ok("-- No entries --");
      return ok(
        entries
          .map(
            (e, i) =>
              `Jan 26 20:${String(42 + i).padStart(2, "0")}:00 lab ${e.tag}[${1000 + i}]: ${e.message}`,
          )
          .join("\n"),
      );
    }

    case "logrotate": {
      const flagToks = rest.filter((t) => !t.quoted && t.text.startsWith("-"));
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (flagToks.some((t) => t.text === "--version"))
        return ok("logrotate 3.21.0");
      const configPath = args[0]?.text;
      if (!configPath) return fail("logrotate: missing config file");
      const abs = resolvePath(state.cwd, configPath);
      const config = state.fs[abs]?.content;
      if (config === undefined)
        return fail(`logrotate: ${configPath}: No such file or directory`);
      const logPathMatch = config.match(/^\s*(\/\S+)\s*\{/m);
      const logPath = logPathMatch?.[1];
      const force = flagToks.some((t) => t.text === "--force");
      const debug = flagToks.some((t) => t.text === "--debug");
      if (debug) {
        return ok(
          `WARNING: logrotate in debug mode does nothing except printing debug messages\nreading config file ${configPath}\nRotating pattern: ${logPath ?? "?"} after 1 days (7 rotations)\nlog does not need rotating (log has already been rotated)`,
        );
      }
      if (force && logPath) {
        const node = state.fs[logPath];
        if (node) {
          state.fs[`${logPath}.1`] = { ...node };
          state.fs[logPath] = { ...node, content: "" };
        }
        return ok();
      }
      return ok();
    }

    case "stress-ng": {
      const argsText = rest.map((t) => t.text).join(" ");
      let n = 0;
      if (argsText.includes("--cpu")) {
        state.perfLoad = "cpu";
        n = 4;
      } else if (argsText.includes("--vm")) {
        state.perfLoad = argsText.includes("95%") ? "mem-critical" : "mem";
        n = argsText.includes("--vm 2") ? 2 : 1;
      } else if (argsText.includes("--io")) {
        state.perfLoad = "disk";
        n = 4;
      } else if (argsText.includes("--sock")) {
        state.perfLoad = "net";
        n = 10;
      }
      const kind = argsText.includes("--cpu")
        ? "cpu"
        : argsText.includes("--vm")
          ? "vm"
          : argsText.includes("--io")
            ? "io"
            : "sock";
      return ok(`stress-ng: info: [49433] dispatching hogs: ${n} ${kind}`);
    }

    case "iperf3": {
      const argsText = rest.map((t) => t.text).join(" ");
      if (argsText.includes("-s")) return ok("Server listening on 5001");
      state.perfLoad = "net";
      return ok(
        "[  5]   0.00-1.00   sec   132 MBytes  1.11 Gbits/sec\n[SUM]   0.00-1.00   sec   528 MBytes  4.43 Gbits/sec",
      );
    }

    case "awk": {
      let fs = " ";
      const consumed = new Set<number>();
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (t.text.startsWith("-F")) {
          if (t.text.length > 2) {
            fs = t.text.slice(2);
          } else {
            fs = rest[i + 1]?.text ?? " ";
            consumed.add(i + 1);
          }
          consumed.add(i);
        }
      }
      const remaining = rest.filter((_, i) => !consumed.has(i));
      if (!remaining.length) return fail("usage: awk 'program' [file...]");
      const program = remaining[0].text;
      const fileToks = remaining.slice(1);

      let lines: string[];
      if (!fileToks.length) {
        if (stdinText === undefined) return fail("usage: awk 'program' file");
        lines = stdinText.split("\n");
      } else {
        const abs = resolvePath(state.cwd, fileToks[0].text);
        const node = state.fs[abs];
        if (!node) return fail(`awk: can't open file ${fileToks[0].text}`);
        lines = (node.content ?? "").split("\n");
      }
      return ok(runAwkProgram(lines, program, fs));
    }

    case "sed": {
      const consumed = new Set<number>();
      let scriptFile: string | null = null;
      let inPlace = false;
      let backupExt: string | null = null;
      let quiet = false;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (t.quoted) continue;
        if (t.text === "-f") {
          scriptFile = rest[i + 1]?.text ?? null;
          consumed.add(i);
          consumed.add(i + 1);
        } else if (t.text === "-n") {
          quiet = true;
          consumed.add(i);
        } else if (t.text === "-E" || t.text === "-r") {
          consumed.add(i);
        } else if (t.text.startsWith("-i")) {
          inPlace = true;
          if (t.text.length > 2) backupExt = t.text.slice(2);
          consumed.add(i);
        }
      }
      const remaining = rest.filter((_, i) => !consumed.has(i));
      const nonFlag = remaining.filter(
        (t) => t.quoted || !t.text.startsWith("-"),
      );

      let script: string;
      if (scriptFile) {
        const abs = resolvePath(state.cwd, scriptFile);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `sed: can't read ${scriptFile}: No such file or directory`,
          );
        script = (node.content ?? "")
          .split("\n")
          .filter((l) => l.trim().length)
          .join(";");
      } else {
        if (!nonFlag.length) return fail("usage: sed 'script' [file...]");
        script = nonFlag[0].text;
        nonFlag.shift();
      }
      const fileToks = nonFlag;

      if (!fileToks.length) {
        if (stdinText === undefined) return fail("usage: sed 'script' file");
        return ok(
          applySedScript(stdinText.split("\n"), script, quiet).join("\n"),
        );
      }
      const targets = fileToks.flatMap((t) => expandGlob(state, t));
      const outputs: string[] = [];
      for (const raw of targets) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node)
          return fail(`sed: can't read ${raw}: No such file or directory`);
        const result = applySedScript(
          (node.content ?? "").split("\n"),
          script,
          quiet,
        );
        if (inPlace) {
          if (backupExt) state.fs[abs + backupExt] = { ...node };
          state.fs[abs] = { ...node, content: result.join("\n") };
        } else {
          outputs.push(result.join("\n"));
        }
      }
      return ok(inPlace ? "" : outputs.join("\n"));
    }

    case "wc": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const countsFor = (text: string) => {
        const lines = text === "" ? 0 : text.split("\n").length;
        const words = text.split(/\s+/).filter(Boolean).length;
        const chars = text.length;
        return { lines, words, chars };
      };
      const fmt = (
        c: { lines: number; words: number; chars: number },
        name?: string,
      ) => {
        const parts: string[] = [];
        if (!flags || flags.includes("l")) parts.push(String(c.lines));
        if (flags.includes("w")) parts.push(String(c.words));
        if (flags.includes("c") || flags.includes("m"))
          parts.push(String(c.chars));
        if (!flags) parts.push(String(c.words), String(c.chars));
        return name ? `${parts.join(" ")} ${name}` : parts.join(" ");
      };
      if (!args.length && stdinText !== undefined)
        return ok(fmt(countsFor(stdinText)));
      if (!args.length) return fail("usage: wc [-lwc] FILE...");
      if (args.length === 1) {
        const abs = resolvePath(state.cwd, args[0].text);
        const node = state.fs[abs];
        if (!node)
          return fail(`wc: ${args[0].text}: No such file or directory`);
        return ok(fmt(countsFor(node.content ?? ""), args[0].text));
      }
      const lines: string[] = [];
      const total = { lines: 0, words: 0, chars: 0 };
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        const node = state.fs[abs];
        if (!node) return fail(`wc: ${a.text}: No such file or directory`);
        const c = countsFor(node.content ?? "");
        total.lines += c.lines;
        total.words += c.words;
        total.chars += c.chars;
        lines.push(fmt(c, a.text));
      }
      lines.push(fmt(total, "total"));
      return ok(lines.join("\n"));
    }

    case "head": {
      let n = 10;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (t.quoted) continue;
        if (t.text === "-n") n = Number(rest[i + 1]?.text ?? "10");
        else if (/^-\d+$/.test(t.text)) n = Number(t.text.slice(1));
      }
      const args = rest.filter(
        (t) => t.quoted || (!t.text.startsWith("-") && !/^\d+$/.test(t.text)),
      );
      if (!args.length && stdinText !== undefined)
        return ok(stdinText.split("\n").slice(0, n).join("\n"));
      if (!args.length) return fail("usage: head [-n N] FILE");
      const abs = resolvePath(state.cwd, args[0].text);
      const node = state.fs[abs];
      if (!node) return fail(`head: cannot open '${args[0].text}'`);
      return ok((node.content ?? "").split("\n").slice(0, n).join("\n"));
    }

    case "tail": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join(" ");
      const follow = flags.includes("f");
      let n = 10;
      let fromStart = false;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (t.quoted) continue;
        if (t.text === "-n") {
          const v = rest[i + 1]?.text ?? "10";
          if (v.startsWith("+")) {
            fromStart = true;
            n = Number(v.slice(1));
          } else n = Number(v);
        } else if (/^-\d+$/.test(t.text)) n = Number(t.text.slice(1));
      }
      const args = rest.filter(
        (t) =>
          t.quoted ||
          (!t.text.startsWith("-") &&
            !/^\d+$/.test(t.text) &&
            !t.text.startsWith("+")),
      );
      const getLines = (): string[] | null => {
        if (!args.length && stdinText !== undefined)
          return stdinText.split("\n");
        if (!args.length) return null;
        const abs = resolvePath(state.cwd, args[0].text);
        const node = state.fs[abs];
        if (!node) return null;
        return (node.content ?? "").split("\n");
      };
      const lines = getLines();
      if (lines === null) return fail("tail: missing operand");
      if (follow)
        return ok(
          lines.slice(-10).join("\n") +
            "\n(live follow — Ctrl+C বাস্তবে থামাতো)",
        );
      if (fromStart) return ok(lines.slice(n - 1).join("\n"));
      return ok(lines.slice(-n).join("\n"));
    }

    case "cd": {
      const args = rest.filter((t) => !t.text.startsWith("-") || t.quoted);
      if (args.length > 1) return fail("bash: cd: too many arguments");
      const raw = args[0]?.text ?? "~";
      const abs = resolvePath(state.cwd, raw);
      const node = state.fs[abs];
      if (!node) return fail(`bash: cd: ${raw}: No such file or directory`);
      if (node.type !== "dir") return fail(`bash: cd: ${raw}: Not a directory`);
      state.cwd = abs;
      return ok();
    }

    case "mkdir": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text);
      const parents = flags.some((f) => /^-\w*p\w*$/.test(f));
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return fail("mkdir: missing operand");
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        if (state.fs[abs]) {
          if (parents) continue;
          return fail(
            `mkdir: cannot create directory '${a.text}': File exists`,
          );
        }
        const missing: string[] = [];
        let cur = abs;
        while (!state.fs[cur]) {
          missing.unshift(cur);
          cur = parentOf(cur);
        }
        if (state.fs[cur].type !== "dir")
          return fail(
            `mkdir: cannot create directory '${a.text}': Not a directory`,
          );
        if (missing.length > 1 && !parents)
          return fail(
            `mkdir: cannot create directory '${a.text}': No such file or directory`,
          );
        for (const m of missing)
          state.fs[m] = {
            type: "dir",
            mode: applyUmask(state, 7),
            ...creatorOwnerGroup(state, permUser, effectiveRoot),
          };
      }
      return ok();
    }

    case "touch": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return fail("touch: missing file operand");
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        if (state.fs[abs]) continue;
        if (!state.fs[parentOf(abs)] || state.fs[parentOf(abs)].type !== "dir")
          return fail(
            `touch: cannot touch '${a.text}': No such file or directory`,
          );
        state.fs[abs] = {
          type: "file",
          content: "",
          mode: applyUmask(state, 6),
          ...creatorOwnerGroup(state, permUser, effectiveRoot),
        };
      }
      return ok();
    }

    case "echo": {
      const parts: string[] = [];
      let mode: ">" | ">>" | null = null;
      let target: string | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && (t.text === ">" || t.text === ">>")) {
          mode = t.text;
          target = rest[i + 1]?.text ?? null;
          if (!target)
            return fail("bash: syntax error near unexpected token `newline'");
          break;
        }
        parts.push(t.text);
      }
      const text = parts.join(" ");
      if (!mode) return ok(text);
      const abs = resolvePath(state.cwd, target!);
      const parent = state.fs[parentOf(abs)];
      if (!parent || parent.type !== "dir")
        return fail(`bash: ${target}: No such file or directory`);
      if (state.fs[abs]?.type === "dir")
        return fail(`bash: ${target}: Is a directory`);
      if (!effectiveRoot) {
        const existing = state.fs[abs];
        const writeTarget = existing ?? parent;
        if (
          !canTraverseTo(state, abs, permUser) ||
          !hasPerm(state, writeTarget, permUser, "w")
        )
          return fail(`bash: ${target}: Permission denied`);
      }
      if (!state.fs[abs])
        state.fs[abs] = {
          type: "file",
          content: text,
          mode: applyUmask(state, 6),
          ...creatorOwnerGroup(state, permUser, effectiveRoot),
        };
      else if (mode === ">")
        state.fs[abs] = { ...state.fs[abs], content: text };
      else
        state.fs[abs] = {
          ...state.fs[abs],
          content: (state.fs[abs].content ?? "") + "\n" + text,
        };
      return ok();
    }

    case "cat": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return fail("cat: missing operand");
      const out: string[] = [];
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        const node = state.fs[abs];
        if (!node) return fail(`cat: ${a.text}: No such file or directory`);
        if (node.type === "dir") return fail(`cat: ${a.text}: Is a directory`);
        // root (or plain `sudo` with no -u) bypasses permission checks
        // entirely; anyone else is checked against owner/group/ACL/other —
        // this is what makes /etc/shadow root-only and ACL labs meaningful.
        if (
          !effectiveRoot &&
          (!canTraverseTo(state, abs, permUser) ||
            !hasPerm(state, node, permUser, "r"))
        )
          return fail(`cat: ${a.text}: Permission denied`);
        out.push(node.content ?? "");
      }
      return ok(out.join("\n"));
    }

    case "ls": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const long = flags.includes("l");
      const all = flags.includes("a");
      const args = rest
        .filter((t) => t.quoted || !t.text.startsWith("-"))
        .flatMap((t) => expandGlob(state, t));
      const raw = args[0] ?? ".";
      const abs = resolvePath(state.cwd, raw);
      const node = state.fs[abs];
      if (!node)
        return fail(`ls: cannot access '${raw}': No such file or directory`);
      if (node.type === "file") return ok(long ? lsMetaLine(raw, node) : raw);
      const names = childrenOf(state.fs, abs).map(baseName);
      const entries = all ? [".", "..", ...names] : names;
      if (!long) return ok(entries.join("  "));
      const lines = [`total ${entries.length * 4}`];
      for (const name of entries) {
        const n =
          name === "."
            ? node
            : name === ".."
              ? (state.fs[parentOf(abs)] ?? node)
              : state.fs[abs === "/" ? "/" + name : abs + "/" + name];
        lines.push(lsMetaLine(name, n));
      }
      return ok(lines.join("\n"));
    }

    case "find": {
      let startTok: string | null = null;
      let namePat: string | null = null;
      let typeFilter: "f" | "d" | null = null;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && t.text === "-name") {
          namePat = rest[++i]?.text ?? null;
          if (namePat === null)
            return fail("find: missing argument to `-name'");
        } else if (!t.quoted && t.text === "-type") {
          const v = rest[++i]?.text;
          if (v !== "f" && v !== "d")
            return fail(
              `find: Arguments to -type should contain only one letter`,
            );
          typeFilter = v;
        } else if (!t.quoted && t.text.startsWith("-")) {
          return fail(`find: unknown predicate '${t.text}'`);
        } else if (startTok === null) {
          startTok = t.text;
        }
      }
      const raw = startTok ?? ".";
      const abs = resolvePath(state.cwd, raw);
      if (!state.fs[abs])
        return fail(`find: '${raw}': No such file or directory`);
      // ~ is expanded by the shell before find runs, so display it absolute
      const dispBase = raw === "~" || raw.startsWith("~/") ? abs : raw;
      const re = namePat ? globToRegex(namePat) : null;
      const results: string[] = [];
      const all = Object.keys(state.fs)
        .filter((p) => p === abs || p.startsWith(abs === "/" ? "/" : abs + "/"))
        .sort();
      for (const p of all) {
        const node = state.fs[p];
        if (typeFilter === "f" && node.type !== "file") continue;
        if (typeFilter === "d" && node.type !== "dir") continue;
        if (re && !re.test(baseName(p))) continue;
        results.push(p === abs ? dispBase : dispBase + p.slice(abs.length));
      }
      return ok(results.join("\n"));
    }

    case "grep": {
      const flagToks = rest.filter((t) => !t.quoted && t.text.startsWith("-"));
      const flags = flagToks.map((t) => t.text).join("");
      const recursive = flags.includes("r") || flags.includes("R");
      const invert = flags.includes("v");
      const countOnly = flags.includes("c");
      const wholeWord = flags.includes("w");
      const withLineNo = flags.includes("n");
      const extended = flags.includes("E");
      const ignoreCase = flags.includes("i");
      let before = 0;
      let after = 0;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (t.quoted) continue;
        if (t.text === "-A") after = Number(rest[i + 1]?.text ?? 0);
        else if (t.text === "-B") before = Number(rest[i + 1]?.text ?? 0);
        else if (t.text === "-C")
          before = after = Number(rest[i + 1]?.text ?? 0);
      }
      // simplest robust split: first non-flag token is the pattern, the
      // rest (after dropping any values consumed by -A/-B/-C) are files
      const nonFlagAll = rest.filter(
        (t) => t.quoted || !t.text.startsWith("-"),
      );
      const consumedNums = new Set<string>();
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (
          !t.quoted &&
          (t.text === "-A" || t.text === "-B" || t.text === "-C")
        )
          consumedNums.add(rest[i + 1]?.text ?? "");
      }
      const nonFlag = nonFlagAll.filter(
        (t) => !consumedNums.has(t.text) || t.quoted,
      );
      if (!nonFlag.length)
        return fail("usage: grep [options] PATTERN [FILE...]");
      const patternRaw = nonFlag[0].text;
      const fileToks = nonFlag.slice(1);
      const escapeRe = (s: string) => s.replace(/[.+^${}()|[\]\\]/g, "\\$&");
      let re: RegExp;
      try {
        const core = extended ? patternRaw : escapeRe(patternRaw);
        const body = wholeWord ? `\\b(?:${core})\\b` : core;
        re = new RegExp(body, ignoreCase ? "i" : "");
      } catch {
        return fail(`grep: invalid pattern: '${patternRaw}'`);
      }
      const matches = (line: string) => re.test(line) !== invert;

      // stdin mode: no file args given, and we're mid-pipeline
      if (!fileToks.length && stdinText !== undefined) {
        const lines = stdinText.split("\n");
        if (countOnly) return ok(String(lines.filter(matches).length));
        const out: string[] = [];
        lines.forEach((line, i) => {
          if (!matches(line)) return;
          const from = Math.max(0, i - before);
          const to = Math.min(lines.length - 1, i + after);
          for (let j = from; j <= to; j++) {
            const text = withLineNo ? `${j + 1}:${lines[j]}` : lines[j];
            if (!out.includes(text)) out.push(text);
          }
        });
        return ok(out.join("\n"));
      }

      if (!fileToks.length) return fail("usage: grep [-r] PATTERN FILE...");
      const targets = fileToks.flatMap((t) => expandGlob(state, t));
      const files: { abs: string; disp: string }[] = [];
      for (const raw of targets) {
        const abs = resolvePath(state.cwd, raw);
        const node = state.fs[abs];
        if (!node) return fail(`grep: ${raw}: No such file or directory`);
        const dispBase = raw === "~" || raw.startsWith("~/") ? abs : raw;
        if (node.type === "dir") {
          if (!recursive) return fail(`grep: ${raw}: Is a directory`);
          for (const p of Object.keys(state.fs)
            .filter((p) => p.startsWith(abs === "/" ? "/" : abs + "/"))
            .sort()) {
            if (state.fs[p].type === "file")
              files.push({ abs: p, disp: dispBase + p.slice(abs.length) });
          }
        } else {
          files.push({ abs, disp: dispBase });
        }
      }
      const prefix = recursive || files.length > 1;
      if (countOnly) {
        if (files.length === 1) {
          const lines = (state.fs[files[0].abs].content ?? "").split("\n");
          return ok(String(lines.filter(matches).length));
        }
        return ok(
          files
            .map((f) => {
              const lines = (state.fs[f.abs].content ?? "").split("\n");
              return `${f.disp}:${lines.filter(matches).length}`;
            })
            .join("\n"),
        );
      }
      const out: string[] = [];
      for (const f of files) {
        const lines = (state.fs[f.abs].content ?? "").split("\n");
        lines.forEach((line, i) => {
          if (!matches(line)) return;
          const from = Math.max(0, i - before);
          const to = Math.min(lines.length - 1, i + after);
          for (let j = from; j <= to; j++) {
            const text = withLineNo ? `${j + 1}:${lines[j]}` : lines[j];
            out.push(prefix ? `${f.disp}:${text}` : text);
          }
        });
      }
      return ok(out.join("\n"));
    }

    case "tee": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const append = flags.includes("a");
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const text = stdinText ?? "";
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        const existing = state.fs[abs];
        if (append && existing)
          state.fs[abs] = {
            ...existing,
            content: (existing.content ?? "") + "\n" + text,
          };
        else
          state.fs[abs] = {
            type: "file",
            content: text,
            mode: applyUmask(state, 6),
            ...creatorOwnerGroup(state, permUser, effectiveRoot),
          };
      }
      return ok(text);
    }

    case "sort": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const numeric = flags.includes("n");
      const reverse = flags.includes("r");
      const unique = flags.includes("u");
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      let text: string;
      if (!args.length && stdinText !== undefined) {
        text = stdinText;
      } else if (!args.length) {
        return fail("usage: sort [-nru] FILE...");
      } else {
        const abs = resolvePath(state.cwd, args[0].text);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `sort: cannot read: ${args[0].text}: No such file or directory`,
          );
        text = node.content ?? "";
      }
      let lines = text.split("\n");
      // GNU sort -n compares each line's *leading* numeric run (skipping
      // leading whitespace), ignoring whatever text follows — not the whole
      // line as a number. This is what makes `uniq -c | sort -rn` work,
      // since uniq -c prefixes each line with a padded count.
      const leadingNum = (s: string) => {
        const m = s.match(/^\s*(-?\d+(\.\d+)?)/);
        return m ? Number(m[1]) : 0;
      };
      // Negate the comparator for -r instead of sorting then reversing —
      // reversing the whole array would also flip the relative order of
      // tied elements, breaking the stable tie-break real `sort` gives.
      lines.sort((a, b) => {
        const cmp = numeric
          ? leadingNum(a) - leadingNum(b)
          : a < b
            ? -1
            : a > b
              ? 1
              : 0;
        return reverse ? -cmp : cmp;
      });
      if (unique) {
        const seen = new Set<string>();
        lines = lines.filter((l) =>
          seen.has(l) ? false : (seen.add(l), true),
        );
      }
      return ok(lines.join("\n"));
    }

    case "uniq": {
      const flags = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const withCount = flags.includes("c");
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      let text: string;
      if (!args.length && stdinText !== undefined) {
        text = stdinText;
      } else if (!args.length) {
        return fail("usage: uniq [-c] FILE...");
      } else {
        const abs = resolvePath(state.cwd, args[0].text);
        const node = state.fs[abs];
        if (!node)
          return fail(
            `uniq: cannot read: ${args[0].text}: No such file or directory`,
          );
        text = node.content ?? "";
      }
      const lines = text.split("\n");
      const out: string[] = [];
      const counts: number[] = [];
      for (const line of lines) {
        if (out.length && out[out.length - 1] === line) {
          counts[counts.length - 1]++;
        } else {
          out.push(line);
          counts.push(1);
        }
      }
      if (!withCount) return ok(out.join("\n"));
      return ok(
        out.map((l, i) => `${String(counts[i]).padStart(7)} ${l}`).join("\n"),
      );
    }

    case "cp": {
      const flagToks = rest.filter((t) => !t.quoted && t.text.startsWith("-"));
      const recursive = flagToks.some((t) => /[rR]/.test(t.text));
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (args.length < 2) return fail("cp: missing operand");
      const [srcRaw, destRaw] = [args[0].text, args[1].text];
      // "src/." means "copy the CONTENTS of src", not src itself
      const copyContentsOnly = srcRaw.endsWith("/.");
      const srcClean = copyContentsOnly ? srcRaw.slice(0, -2) : srcRaw;
      const srcAbs = resolvePath(state.cwd, srcClean);
      const destAbs = resolvePath(state.cwd, destRaw);
      const srcNode = state.fs[srcAbs];
      if (!srcNode)
        return fail(`cp: cannot stat '${srcRaw}': No such file or directory`);
      if (srcNode.type === "dir" && !recursive)
        return fail(`cp: -r not specified; omitting directory '${srcRaw}'`);
      const { owner, group } = creatorOwnerGroup(
        state,
        permUser,
        effectiveRoot,
      );
      if (srcNode.type === "file") {
        state.fs[destAbs] = { ...srcNode, owner, group };
      } else if (copyContentsOnly) {
        if (!state.fs[destAbs])
          return fail(`cp: target '${destRaw}': No such file or directory`);
        copyTree(state, srcAbs, destAbs, owner, group);
      } else {
        state.fs[destAbs] = { type: "dir", owner, group };
        copyTree(state, srcAbs, destAbs, owner, group);
      }
      return ok();
    }

    case "rm": {
      const flagToks = rest.filter((t) => !t.quoted && t.text.startsWith("-"));
      const recursive = flagToks.some((t) => /[rR]/.test(t.text));
      const force = flagToks.some((t) => /f/.test(t.text));
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (!args.length) return fail("rm: missing operand");
      for (const a of args) {
        const abs = resolvePath(state.cwd, a.text);
        const node = state.fs[abs];
        if (!node) {
          if (force) continue;
          return fail(
            `rm: cannot remove '${a.text}': No such file or directory`,
          );
        }
        if (node.type === "dir" && !recursive)
          return fail(`rm: cannot remove '${a.text}': Is a directory`);
        delete state.fs[abs];
        if (node.type === "dir") {
          for (const p of Object.keys(state.fs)) {
            if (p.startsWith(abs + "/")) delete state.fs[p];
          }
        }
      }
      return ok();
    }

    default:
      return fail(`bash: ${cmd}: command not found`);
  }
}

/** "-x" style requirements match a flag letter anywhere in a dash cluster. */
function matchesToken(command: string, token: string): boolean {
  if (/^-\w$/.test(token)) {
    return new RegExp(`(^|\\s)-\\w*${token[1]}\\w*(\\s|$)`).test(command);
  }
  return command.includes(token);
}

export interface CheckContext {
  input: string;
  prevState: ShellState;
  result: ExecResult;
}

/**
 * Runs a command to completion for `check.ref` comparisons, auto-answering
 * any interactive prompt it opens (e.g. `passwd`) with a fixed placeholder —
 * only used to compute the expected output, never for the learner's own
 * typed command, so the exact value doesn't matter as long as both entries
 * match and the flow actually completes.
 */
function executeToCompletion(state: ShellState, cmd: string): ExecResult {
  let result = execute(state, cmd);
  while (isAwaitingInput(result.state)) {
    result = submitInput(result.state, "refpass123");
  }
  return result;
}

export function evaluateCheck(
  check: LabExamCheck,
  ctx: CheckContext,
): { pass: boolean; reason?: string } {
  const command = ctx.input.trim().replace(/\s+/g, " ");
  if (ctx.result.error)
    return { pass: false, reason: "কমান্ডটা error দিয়েছে" };
  for (const req of check.require ?? []) {
    if (!matchesToken(command, req))
      return { pass: false, reason: `কমান্ডে ${req} ব্যবহার হওয়ার কথা` };
  }
  for (const bad of check.forbid ?? []) {
    if (matchesToken(command, bad))
      return { pass: false, reason: `এই প্রশ্নে ${bad} ব্যবহার করা যাবে না` };
  }
  if (check.style) {
    const arg = command
      .split(" ")
      .slice(1)
      .find((w) => !w.startsWith("-"));
    const isAbs = !!arg && /^[/~]/.test(arg);
    if (check.style === "relative" && isAbs)
      return {
        pass: false,
        reason: "path-টা relative হতে হবে (/ বা ~ দিয়ে শুরু না)",
      };
    if (check.style === "absolute" && !isAbs)
      return {
        pass: false,
        reason: "path-টা absolute হতে হবে (/ বা ~ দিয়ে শুরু)",
      };
  }
  if (check.paths) {
    for (const t of check.paths) {
      const abs = resolvePath(HOME, t.path);
      const node = ctx.result.state.fs[abs];
      if (!node || node.type !== t.type)
        return { pass: false, reason: `${t.path} এখনো তৈরি হয়নি` };
      if (t.content !== undefined && (node.content ?? "") !== t.content)
        return { pass: false, reason: `${t.path}-এর ভেতরের লেখা মিলছে না` };
      if (t.mode !== undefined && nodeMode(node) !== t.mode)
        return {
          pass: false,
          reason: `${t.path}-এর permission ${t.mode} হওয়ার কথা (এখন ${nodeMode(node)})`,
        };
      if (t.owner !== undefined && (node.owner ?? "root") !== t.owner)
        return {
          pass: false,
          reason: `${t.path}-এর owner ${t.owner} হওয়ার কথা`,
        };
      if (t.group !== undefined && (node.group ?? "root") !== t.group)
        return {
          pass: false,
          reason: `${t.path}-এর group ${t.group} হওয়ার কথা`,
        };
      for (const wantAcl of t.acl ?? []) {
        const has = (node.acl ?? []).some(
          (e) =>
            e.kind === wantAcl.kind &&
            e.name === wantAcl.name &&
            e.perms === wantAcl.perms,
        );
        if (!has)
          return {
            pass: false,
            reason: `${t.path}-এ ${wantAcl.kind}:${wantAcl.name}:${wantAcl.perms} ACL এখনো নেই`,
          };
      }
    }
  }
  if (check.cwd) {
    const expect = resolvePath(HOME, check.cwd);
    if (ctx.result.state.cwd !== expect)
      return { pass: false, reason: "ঠিক জায়গায় পৌঁছাওনি — pwd মিলছে না" };
  }
  if (check.ref) {
    const refRes = executeToCompletion(ctx.prevState, check.ref);
    if (ctx.result.output.trim() !== refRes.output.trim())
      return { pass: false, reason: "output-টা প্রত্যাশার সাথে মিলছে না" };
  }
  if (check.pathModes) {
    for (const pm of check.pathModes) {
      const abs = resolvePath(HOME, pm.path);
      const node = ctx.result.state.fs[abs];
      if (!node) return { pass: false, reason: `${pm.path} পাওয়া যাচ্ছে না` };
      if (pm.mode && nodeMode(node) !== pm.mode)
        return {
          pass: false,
          reason: `${pm.path}-এর permission ${pm.mode} হওয়ার কথা (এখন ${nodeMode(node)})`,
        };
      if (pm.owner && (node.owner ?? "root") !== pm.owner)
        return {
          pass: false,
          reason: `${pm.path}-এর owner ${pm.owner} হওয়ার কথা`,
        };
      if (pm.group && (node.group ?? "root") !== pm.group)
        return {
          pass: false,
          reason: `${pm.path}-এর group ${pm.group} হওয়ার কথা`,
        };
      for (const wantAcl of pm.acl ?? []) {
        const has = (node.acl ?? []).some(
          (e) =>
            e.kind === wantAcl.kind &&
            e.name === wantAcl.name &&
            e.perms === wantAcl.perms,
        );
        if (!has)
          return {
            pass: false,
            reason: `${pm.path}-এ ${wantAcl.kind}:${wantAcl.name}:${wantAcl.perms} ACL এখনো নেই`,
          };
      }
    }
  }
  if (check.groupsExist) {
    for (const g of check.groupsExist) {
      if (ctx.result.state.groups[g] === undefined)
        return { pass: false, reason: `${g} group-টা এখনো তৈরি হয়নি` };
    }
  }
  if (check.groupsNotExist) {
    for (const g of check.groupsNotExist) {
      if (ctx.result.state.groups[g] !== undefined)
        return { pass: false, reason: `${g} group-টা এখনো মুছে যায়নি` };
    }
  }
  if (check.usersState) {
    for (const expect of check.usersState) {
      const user = ctx.result.state.users[expect.name];
      if (expect.exists === false) {
        if (user)
          return { pass: false, reason: `${expect.name} এখনো মুছে যায়নি` };
        continue;
      }
      if (!user)
        return {
          pass: false,
          reason: `${expect.name} user-টা এখনো তৈরি হয়নি`,
        };
      if (expect.primary && user.primary !== expect.primary)
        return {
          pass: false,
          reason: `${expect.name}-এর primary group ${expect.primary} হওয়ার কথা`,
        };
      for (const g of expect.inGroups ?? []) {
        if (user.primary !== g && !user.supplementary.includes(g))
          return {
            pass: false,
            reason: `${expect.name} এখনো ${g} group-এ নেই`,
          };
      }
      for (const g of expect.notInGroups ?? []) {
        if (user.primary === g || user.supplementary.includes(g))
          return {
            pass: false,
            reason: `${expect.name}-এর ${g} group-এ থাকার কথা না`,
          };
      }
      if (expect.locked !== undefined && user.locked !== expect.locked)
        return {
          pass: false,
          reason: expect.locked
            ? `${expect.name} এখনো lock হয়নি`
            : `${expect.name} এখনো unlock হয়নি`,
        };
      if (expect.hasHome !== undefined) {
        const has = ctx.result.state.fs[`/home/${expect.name}`]?.type === "dir";
        if (has !== expect.hasHome)
          return {
            pass: false,
            reason: expect.hasHome
              ? `/home/${expect.name} তৈরি হয়নি — home-সহ বানাতে হবে`
              : `/home/${expect.name} থাকার কথা না`,
          };
      }
      if (expect.shell !== undefined && user.shell !== expect.shell)
        return {
          pass: false,
          reason: `${expect.name}-এর shell ${expect.shell} হওয়ার কথা`,
        };
      if (
        expect.comment !== undefined &&
        (user.comment ?? "") !== expect.comment
      )
        return {
          pass: false,
          reason: `${expect.name}-এর comment/GECOS ফিল্ড মিলছে না`,
        };
      if (
        expect.home !== undefined &&
        userHome(expect.name, user) !== expect.home
      )
        return {
          pass: false,
          reason: `${expect.name}-এর home directory ${expect.home} হওয়ার কথা`,
        };
      if (expect.uid !== undefined && user.uid !== expect.uid)
        return {
          pass: false,
          reason: `${expect.name}-এর UID ${expect.uid} হওয়ার কথা`,
        };
      if (expect.expire !== undefined && user.expire !== expect.expire)
        return {
          pass: false,
          reason: `${expect.name}-এর account expiration ${expect.expire} হওয়ার কথা`,
        };
      if (expect.maxDays !== undefined && user.maxDays !== expect.maxDays)
        return {
          pass: false,
          reason: `${expect.name}-এর password max age ${expect.maxDays} দিন হওয়ার কথা`,
        };
    }
  }
  return { pass: true };
}

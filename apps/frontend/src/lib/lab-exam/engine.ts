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
import { runBashScript, resumeBashRead } from "./bash-interpreter";
import type { BashHost } from "./bash-interpreter";

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

/** A variable scope frame for the bash-script interpreter (see bash-interpreter.ts). */
export interface BashScopeFrame {
  [name: string]: {
    kind: "scalar" | "indexed" | "assoc";
    value?: string;
    items?: Record<string, string>;
    readonly?: boolean;
    exported?: boolean;
  };
}

/** An in-progress multi-step prompt (e.g. `passwd`'s two masked entries, or a paused `read` mid-script). */
export type PendingInput =
  | {
      kind: "passwd";
      targetUser: string;
      stage: "new" | "confirm";
      firstValue?: string;
    }
  | {
      kind: "bash-read";
      source: string;
      ip: number;
      scopes: BashScopeFrame[];
      callStack: number[];
      positional: string[];
      scriptName: string;
      varName?: string;
      arrName?: string;
      ifs: string;
      randomSeed: number;
    };

/** An open `vim`/`vi`/`nano`/`visudo` session — a simplified stand-in for a real modal editor. */
export interface PendingEditor {
  path: string;
  content: string;
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
  /** set while a `vim`/`vi`/`nano`/`visudo` session is open */
  pendingEditor?: PendingEditor;
  /** which stress-ng scenario is "active" — drives canned perf-tool output */
  perfLoad: "idle" | "cpu" | "mem" | "mem-critical" | "disk" | "net";
  /** journal entries appended via `logger`, newest last */
  journal: { tag: string; priority: string; message: string }[];
  /** simulated git repo rooted wherever `git init` was run (null = no repo yet) */
  git: GitRepoState;
  /** simulated docker daemon state */
  docker: DockerState;
  /** simulated kubernetes cluster state */
  k8s: K8sState;
  /** the "host" network stack (interfaces/routes/neighbors) */
  network: NetworkStack;
  /** `ip netns add <name>` -> an isolated network stack */
  netns: Record<string, NetworkStack>;
  /** ss/netstat socket table */
  sockets: SocketEntry[];
  /** fixed, pre-seeded packets tcpdump filters from — not genuinely generated traffic */
  trafficLog: PacketRecord[];
  firewall: { ufw: UfwState; iptables: IptablesState };
  /** sysctl key -> value, e.g. { "net.ipv4.ip_forward": "0" } */
  sysctl: Record<string, string>;
  /** set while a `sudo mn ...` / `sudo python3 <topo-script>.py` Mininet session is open */
  mininet?: MininetState;
}

/** One OVS flow-table entry, as parsed from an `ovs-ofctl add-flow` spec string. */
export interface MininetFlow {
  priority: number;
  match: {
    inPort?: number;
    dlSrc?: string;
    dlDst?: string;
    /** "0x800" (IPv4) or "0x806" (ARP) — the `arp`/`ip` shorthand keywords normalize into this */
    dlType?: string;
    /** IP protocol number when dlType=0x800 (6=TCP, 1=ICMP), or ARP opcode when dlType=0x806 (1=request, 2=reply) */
    nwProto?: number;
    /** exact IP or CIDR */
    nwSrc?: string;
    /** exact IP or CIDR */
    nwDst?: string;
    tpDst?: number;
  };
  action:
    | { kind: "output"; ports: number[] }
    | { kind: "flood" }
    | { kind: "normal" }
    | { kind: "drop" };
  /** secondary actions that don't affect delivery (e.g. `mod_nw_tos:184`) — kept only for `dump-flows` display/checks */
  extraActions?: string[];
  /** the flow spec exactly as typed after `add-flow <switch> `, for `dump-flows` display and loose check matching */
  raw: string;
}

export interface MininetSwitch {
  name: string;
  /** "standalone" = acts as a normal L2 learning switch immediately (OVS's own default controller, or `failMode='standalone'`); "secure" = empty flow table drops everything until flows are added by hand (`--controller=none`) */
  failMode: "standalone" | "secure";
  flows: MininetFlow[];
  /** port number -> node name (host or router) directly attached to this switch */
  ports: Record<number, string>;
}

/** One IP-bearing attachment a host has to a switch (most hosts have exactly one; a router like `r1` has two). */
export interface MininetAttachment {
  switchName: string;
  port: number;
  /** CIDR, e.g. "10.0.1.1/24" — undefined for a router interface not yet configured */
  ip?: string;
}

export interface MininetHost {
  name: string;
  mac: string;
  attachments: MininetAttachment[];
  /** gateway IP for cross-subnet traffic, set via `ip route add default via <ip>` */
  defaultRoute?: string;
  /** set via `sysctl -w net.ipv4.ip_forward=1` — lets this host act as a router between its attachments */
  ipForward?: boolean;
  arpCache: Record<string, { mac: string; static?: boolean }>;
  /** VLAN tag (lab: Simulating VLAN Networks) — hosts with different tags can never reach each other, even on the same switch */
  vlan?: number;
  /** TCP port a `python -m SimpleHTTPServer <port> &` is listening on, if any */
  servingPort?: number;
}

export interface MininetState {
  /** which canned topology this session was built from, e.g. "single,3" | "simple_topo" | "arp_topo" | "advanced_arp_topo" | "vlan" — informational, drives `dump`/`net` headers */
  preset: string;
  switches: Record<string, MininetSwitch>;
  hosts: Record<string, MininetHost>;
}

export interface NetIface {
  name: string;
  state: "up" | "down";
  addresses: { cidr: string }[];
  mac?: string;
  /** veth partner interface name, if this is one end of a veth pair */
  peer?: string;
  /** "bridge" for an `ip link add type bridge` device; undefined = normal/veth */
  kind?: "bridge";
  /** name of the bridge this interface is enslaved to, via `ip link set <iface> master <bridge>` */
  master?: string;
}

export interface NetRoute {
  /** "default" or a destination CIDR */
  dest: string;
  via?: string;
  dev: string;
}

export interface NetworkStack {
  interfaces: Record<string, NetIface>;
  routes: NetRoute[];
  /** ip address -> ARP entry */
  neighbors: Record<string, { mac: string; state: string; dev: string }>;
}

export interface SocketEntry {
  proto: "tcp" | "udp";
  localAddr: string;
  localPort: number;
  remoteAddr?: string;
  remotePort?: number;
  state: string;
  pid?: number;
  program?: string;
}

export interface PacketRecord {
  iface: string;
  timestamp: string;
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  proto: "tcp" | "udp";
  flags?: string;
  seq?: number;
  length: number;
}

export interface UfwRule {
  action: "allow" | "deny" | "reject";
  port?: string;
  proto?: "tcp" | "udp";
  from?: string;
  appProfile?: string;
  seq: number;
}

export interface UfwState {
  enabled: boolean;
  defaultIncoming: "allow" | "deny";
  defaultOutgoing: "allow" | "deny";
  rules: UfwRule[];
  nextSeq: number;
}

export interface IptablesRule {
  target: "ACCEPT" | "DROP" | "REJECT" | "LOG" | "MASQUERADE";
  proto?: "tcp" | "udp";
  dport?: string;
  sport?: string;
  source?: string;
  /** outgoing interface, from `-o <iface>` (used by NAT/MASQUERADE rules) */
  outIface?: string;
  extra?: string[];
}

export interface IptablesChain {
  policy: "ACCEPT" | "DROP";
  rules: IptablesRule[];
}

export interface IptablesState {
  chains: Record<string, IptablesChain>;
}

export interface GitCommitRec {
  /** deterministic fake short hash, derived from `seq` */
  id: string;
  message: string;
  /** absolute paths included in this commit (the staged set at commit time) */
  files: string[];
  seq: number;
}

export interface GitRepoState {
  /** absolute path `git init` was run in; null = no repo yet */
  root: string | null;
  /** branch name -> ordered commit id list, oldest first */
  branches: Record<string, string[]>;
  currentBranch: string;
  /** flat commit store, keyed by id (no merge support, so no DAG needed) */
  commits: Record<string, GitCommitRec>;
  /** absolute paths staged for the next commit */
  staged: string[];
  /**
   * absolute path -> content as of the last commit, drives "modified"
   * detection in `git status`. Deliberately branch-agnostic — `checkout`
   * only flips `currentBranch` and never rewrites `fs` to a per-branch
   * snapshot (that would need full per-commit filesystem snapshots, out of
   * scope for this simulator).
   */
  tracked: Record<string, string>;
  nextSeq: number;
}

export interface DockerImage {
  tag: string;
  id: string;
  sourcePath: string;
  dockerfileContent: string;
  seq: number;
}

export interface DockerContainer {
  name: string;
  id: string;
  image: string;
  /**
   * Every `docker run` (detached or not) lands as "running" immediately —
   * there's no real process/exit-code model in this simulator.
   */
  status: "running" | "exited";
  ports: { host: number; container: number }[];
  /** set by `docker compose up`, read by `docker compose down` */
  composeProject?: string;
  seq: number;
}

export interface DockerState {
  images: Record<string, DockerImage>;
  containers: Record<string, DockerContainer>;
  nextSeq: number;
}

export interface K8sResource {
  kind: string;
  name: string;
  namespace: string;
  /** Deployment only */
  replicas?: number;
  /** mirrors replicas instantly — no rollout simulation */
  readyReplicas?: number;
  sourceFile?: string;
  raw: Record<string, string>;
}

export interface K8sState {
  /** keyed by `${namespace}/${kind}/${name}` */
  resources: Record<string, K8sResource>;
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
    git: {
      root: null,
      branches: {},
      currentBranch: "main",
      commits: {},
      staged: [],
      tracked: {},
      nextSeq: 1,
    },
    docker: { images: {}, containers: {}, nextSeq: 1 },
    k8s: { resources: {} },
    network: {
      interfaces: {
        lo: { name: "lo", state: "up", addresses: [{ cidr: "127.0.0.1/8" }] },
        eth0: {
          name: "eth0",
          state: "up",
          addresses: [{ cidr: "10.0.1.15/24" }],
          mac: "02:42:0a:00:01:0f",
        },
      },
      routes: [
        { dest: "10.0.1.0/24", dev: "eth0" },
        { dest: "default", via: "10.0.1.1", dev: "eth0" },
      ],
      neighbors: {},
    },
    netns: {},
    sockets: [
      {
        proto: "tcp",
        localAddr: "127.0.0.53",
        localPort: 53,
        state: "LISTEN",
        program: "systemd-resolve",
        pid: 520,
      },
      {
        proto: "tcp",
        localAddr: "127.0.0.54",
        localPort: 53,
        state: "LISTEN",
        program: "systemd-resolve",
        pid: 520,
      },
      {
        proto: "tcp",
        localAddr: "0.0.0.0",
        localPort: 22,
        state: "LISTEN",
        program: "sshd",
        pid: 742,
      },
      {
        proto: "tcp",
        localAddr: "0.0.0.0",
        localPort: 3000,
        state: "LISTEN",
        program: "node",
        pid: 1001,
      },
      {
        proto: "tcp",
        localAddr: "0.0.0.0",
        localPort: 7070,
        state: "LISTEN",
        program: "node",
        pid: 1002,
      },
    ],
    trafficLog: [],
    firewall: {
      ufw: {
        enabled: false,
        defaultIncoming: "allow",
        defaultOutgoing: "allow",
        rules: [],
        nextSeq: 1,
      },
      iptables: {
        chains: {
          INPUT: {
            policy: "ACCEPT",
            rules: [{ target: "ACCEPT", extra: ["NETBIRD-ACL-INPUT"] }],
          },
          OUTPUT: { policy: "ACCEPT", rules: [] },
          FORWARD: {
            policy: "ACCEPT",
            rules: [{ target: "ACCEPT", extra: ["DOCKER-FORWARD"] }],
          },
        },
      },
    },
    sysctl: {
      "net.ipv4.ip_forward": "0",
    },
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

/**
 * Deterministic fake hex id (git commit hashes, docker image/container ids):
 * derived purely from a monotonic `seq` counter already persisted on state,
 * so re-running the same command from the same starting state (the learner's
 * attempt vs. a `ref` check's reference run) always produces the same id.
 */
function fakeHex(seq: number, len: number): string {
  return seq.toString(16).padStart(len, "0").slice(0, len);
}

/** Parses "a.b.c.d" into a 32-bit integer, or null if malformed. */
function ipToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = n * 256 + v;
  }
  return n >>> 0;
}

/** True if `ip` falls within `cidr` ("a.b.c.d/prefix"). */
function cidrContains(cidr: string, ip: string): boolean {
  const [base, prefixRaw] = cidr.split("/");
  const prefix = Number(prefixRaw);
  const baseInt = ipToInt(base);
  const ipInt = ipToInt(ip);
  if (baseInt === null || ipInt === null || !Number.isInteger(prefix))
    return false;
  if (prefix === 0) return true;
  const mask = prefix >= 32 ? 0xffffffff : (0xffffffff << (32 - prefix)) >>> 0;
  return (baseInt & mask) === (ipInt & mask);
}

/** Strips the host bits off a CIDR's address, e.g. "10.0.1.15/24" -> "10.0.1.0/24". */
function cidrNetwork(cidr: string): string {
  const [base, prefixRaw] = cidr.split("/");
  const prefix = Number(prefixRaw);
  const baseInt = ipToInt(base);
  if (baseInt === null || !Number.isInteger(prefix)) return cidr;
  const mask = prefix >= 32 ? 0xffffffff : (0xffffffff << (32 - prefix)) >>> 0;
  const net = (baseInt & mask) >>> 0;
  return `${(net >>> 24) & 255}.${(net >>> 16) & 255}.${(net >>> 8) & 255}.${net & 255}/${prefix}`;
}

/** Longest-prefix-match lookup against a stack's routing table, falling back to default. */
function findRoute(stack: NetworkStack, destIp: string): NetRoute | null {
  let best: NetRoute | null = null;
  let bestPrefix = -1;
  for (const r of stack.routes) {
    if (r.dest === "default") continue;
    const prefix = Number(r.dest.split("/")[1] ?? 0);
    if (cidrContains(r.dest, destIp) && prefix > bestPrefix) {
      best = r;
      bestPrefix = prefix;
    }
  }
  if (best) return best;
  return stack.routes.find((r) => r.dest === "default") ?? null;
}

function formatRoute(r: NetRoute): string {
  if (r.dest === "default") return `default via ${r.via} dev ${r.dev}`;
  if (r.via) return `${r.dest} via ${r.via} dev ${r.dev}`;
  return `${r.dest} dev ${r.dev} scope link`;
}

/** Finds which interface on a stack has an address in the same subnet as `ip`. */
function findDeviceForGateway(
  stack: NetworkStack,
  viaIp: string,
): string | undefined {
  return Object.entries(stack.interfaces).find(([, iface]) =>
    iface.addresses.some((a) => cidrContains(a.cidr, viaIp)),
  )?.[0];
}

/** Value of a `--flag value` or `-f value` style option among unquoted tokens. */
function flagValue(tokens: Token[], name: string): string | undefined {
  const idx = tokens.findIndex((t) => !t.quoted && t.text === name);
  return idx >= 0 ? tokens[idx + 1]?.text : undefined;
}

/** `/etc/services`-style name -> "port/proto", for `ufw allow ssh` etc. */
const UFW_SERVICE_PORTS: Record<string, string> = {
  ssh: "22/tcp",
  telnet: "23/tcp",
  http: "80/tcp",
  https: "443/tcp",
};

/** Known `ufw` application profiles (normally under /etc/ufw/applications.d/). */
const UFW_APP_PROFILES: Record<
  string,
  { ports: string; proto?: "tcp" | "udp" }
> = {
  OpenSSH: { ports: "22", proto: "tcp" },
  Nginx: { ports: "80,443", proto: "tcp" },
  "Nginx Full": { ports: "80,443", proto: "tcp" },
  "Nginx HTTP": { ports: "80", proto: "tcp" },
};

/**
 * Parses the match/target flags of an `iptables -I/-A/-D ...` invocation
 * (everything after the chain name and optional position number) into a
 * rule object. Returns null when no `-j`/`--jump` target was given — every
 * real iptables rule needs one.
 */
function parseIptablesRule(tokens: Token[]): IptablesRule | null {
  let proto: "tcp" | "udp" | undefined;
  let dport: string | undefined;
  let sport: string | undefined;
  let source: string | undefined;
  let outIface: string | undefined;
  let target: IptablesRule["target"] | undefined;
  const extra: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.quoted) continue;
    if (t.text === "-p" || t.text === "--protocol") {
      proto = tokens[++i]?.text === "udp" ? "udp" : "tcp";
      continue;
    }
    if (t.text === "--dport") {
      dport = tokens[++i]?.text;
      continue;
    }
    if (t.text === "--sport") {
      sport = tokens[++i]?.text;
      continue;
    }
    if (t.text === "-s" || t.text === "--source") {
      source = tokens[++i]?.text;
      continue;
    }
    if (t.text === "-o" || t.text === "--out-interface") {
      outIface = tokens[++i]?.text;
      continue;
    }
    if (t.text === "-j" || t.text === "--jump") {
      const j = tokens[++i]?.text;
      if (
        j === "ACCEPT" ||
        j === "DROP" ||
        j === "REJECT" ||
        j === "LOG" ||
        j === "MASQUERADE"
      )
        target = j;
      continue;
    }
    if (t.text === "-m") {
      const mod = tokens[++i]?.text;
      if (mod) extra.push(`-m ${mod}`);
      continue;
    }
    if (t.text === "--limit") {
      const v = tokens[++i]?.text;
      if (v) extra.push(`limit: ${v}`);
      continue;
    }
    if (t.text === "--ctstate") {
      const v = tokens[++i]?.text;
      if (v) extra.push(`ctstate: ${v}`);
      continue;
    }
  }
  if (!target) return null;
  return {
    target,
    proto,
    dport,
    sport,
    source,
    outIface,
    extra: extra.length ? extra : undefined,
  };
}

/** Pulls every ":<port>" reference out of an `ss` bracket filter expression. */
function parseSsPortFilter(expr: string): number[] {
  return [...expr.matchAll(/:(\d+)/g)].map((m) => Number(m[1]));
}

// ---------------------------------------------------------------------------
// Mininet / Open vSwitch simulator
//
// A scoped, hand-rolled simulator covering exactly the topologies and
// `ovs-ofctl`/mininet-CLI vocabulary the "Mininet" module's 8 labs use — not
// a general SDN engine. See the 3 canned topology builders below for the
// exact hosts/IPs/switches each preset reproduces.
// ---------------------------------------------------------------------------

/** Parses an `ovs-ofctl add-flow <switch> <SPEC>` spec string into a MininetFlow. */
function parseOvsFlowSpec(specText: string): MininetFlow {
  const actionsIdx = specText.search(/(?:^|,)\s*actions?=/);
  const actionsRaw =
    actionsIdx >= 0
      ? specText.slice(specText.indexOf("=", actionsIdx) + 1).trim()
      : "";
  const matchPart = (
    actionsIdx >= 0 ? specText.slice(0, actionsIdx) : specText
  ).replace(/,$/, "");

  const match: MininetFlow["match"] = {};
  let priority = 32768;
  for (const field of matchPart
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    if (field === "arp") {
      match.dlType = "0x806";
      continue;
    }
    if (field === "ip") {
      match.dlType = "0x800";
      continue;
    }
    const eq = field.indexOf("=");
    if (eq === -1) continue;
    const key = field.slice(0, eq);
    const val = field.slice(eq + 1);
    switch (key) {
      case "priority":
        priority = Number(val);
        break;
      case "in_port":
        match.inPort = Number(val);
        break;
      case "dl_src":
        match.dlSrc = val;
        break;
      case "dl_dst":
        match.dlDst = val;
        break;
      case "dl_type":
        match.dlType = val;
        break;
      case "nw_proto":
        match.nwProto = Number(val);
        break;
      case "nw_src":
        match.nwSrc = val;
        break;
      case "nw_dst":
        match.nwDst = val;
        break;
      case "tp_dst":
        match.tpDst = Number(val);
        break;
    }
  }

  let action: MininetFlow["action"] = { kind: "drop" };
  const extraActions: string[] = [];
  for (const tok of actionsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)) {
    if (tok === "normal") {
      action = { kind: "normal" };
      continue;
    }
    if (tok === "flood") {
      action = { kind: "flood" };
      continue;
    }
    if (tok === "drop") {
      action = { kind: "drop" };
      continue;
    }
    const outputMatch = tok.match(/^output:(\d+)$/);
    if (outputMatch) {
      const port = Number(outputMatch[1]);
      if (action.kind === "output") action.ports.push(port);
      else action = { kind: "output", ports: [port] };
      continue;
    }
    // bare port number continuing a previous `output:N` token, as this
    // course's lab text writes `actions=output:1,2` (real ovs-ofctl expects
    // `output:1,output:2`, but we match what the labs actually show)
    if (/^\d+$/.test(tok) && action.kind === "output") {
      action.ports.push(Number(tok));
      continue;
    }
    extraActions.push(tok);
  }

  return {
    priority,
    match,
    action,
    extraActions: extraActions.length ? extraActions : undefined,
    raw: specText,
  };
}

/** Renders one flow the way `ovs-ofctl dump-flows` would (loosely — close enough for a lab terminal). */
function formatOvsFlow(f: MininetFlow): string {
  const matchParts: string[] = [];
  if (f.match.inPort !== undefined)
    matchParts.push(`in_port=${f.match.inPort}`);
  if (f.match.dlSrc) matchParts.push(`dl_src=${f.match.dlSrc}`);
  if (f.match.dlDst) matchParts.push(`dl_dst=${f.match.dlDst}`);
  if (f.match.dlType) matchParts.push(`dl_type=${f.match.dlType}`);
  if (f.match.nwProto !== undefined)
    matchParts.push(`nw_proto=${f.match.nwProto}`);
  if (f.match.nwSrc) matchParts.push(`nw_src=${f.match.nwSrc}`);
  if (f.match.nwDst) matchParts.push(`nw_dst=${f.match.nwDst}`);
  if (f.match.tpDst !== undefined) matchParts.push(`tp_dst=${f.match.tpDst}`);
  const actionStr =
    f.action.kind === "output"
      ? f.action.ports.map((p) => `output:${p}`).join(",")
      : f.action.kind;
  const actions = [...(f.extraActions ?? []), actionStr].join(",");
  return `priority=${f.priority},${matchParts.join(",")} actions=${actions}`;
}

interface MininetPacket {
  dlType: "0x806" | "0x800";
  nwProto?: number;
  nwSrc?: string;
  nwDst?: string;
  tpDst?: number;
  dlSrc?: string;
  dlDst?: string;
}

function mininetFlowMatches(
  f: MininetFlow,
  inPort: number,
  pkt: MininetPacket,
): boolean {
  const m = f.match;
  if (m.inPort !== undefined && m.inPort !== inPort) return false;
  if (m.dlType !== undefined && m.dlType !== pkt.dlType) return false;
  if (m.nwProto !== undefined && m.nwProto !== pkt.nwProto) return false;
  if (m.dlSrc !== undefined && m.dlSrc !== pkt.dlSrc) return false;
  if (m.dlDst !== undefined && m.dlDst !== pkt.dlDst) return false;
  if (m.nwSrc !== undefined && pkt.nwSrc !== undefined) {
    if (m.nwSrc.includes("/")) {
      if (!cidrContains(m.nwSrc, pkt.nwSrc)) return false;
    } else if (m.nwSrc !== pkt.nwSrc) return false;
  }
  if (m.nwDst !== undefined && pkt.nwDst !== undefined) {
    if (m.nwDst.includes("/")) {
      if (!cidrContains(m.nwDst, pkt.nwDst)) return false;
    } else if (m.nwDst !== pkt.nwDst) return false;
  }
  if (m.tpDst !== undefined && m.tpDst !== pkt.tpDst) return false;
  return true;
}

/**
 * Resolves which ports a packet entering `inPort` would be delivered to.
 * `normal` is simplified to "every other port" — a safe proxy in these
 * labs' small (2-4 host) single-switch topologies, where a settled L2
 * learning table and a flood are observationally identical for reachability.
 */
function mininetDeliver(
  sw: MininetSwitch,
  inPort: number,
  pkt: MininetPacket,
): number[] {
  const candidates = sw.flows.filter((f) => mininetFlowMatches(f, inPort, pkt));
  const allOtherPorts = Object.keys(sw.ports)
    .map(Number)
    .filter((p) => p !== inPort);
  if (!candidates.length) {
    // `failMode='standalone'` (or Mininet's own default controller, which
    // we model the same way) behaves as a normal learning switch even with
    // zero explicit flows — only `--controller=none` (failMode 'secure')
    // genuinely drops unmatched traffic.
    return sw.failMode === "standalone" ? allOtherPorts : [];
  }
  candidates.sort((a, b) => b.priority - a.priority);
  const best = candidates[0];
  switch (best.action.kind) {
    case "output":
      return best.action.ports;
    case "flood":
    case "normal":
      return allOtherPorts;
    case "drop":
      return [];
  }
}

/** ARP resolution (both directions) followed by IP delivery (both directions) between two ports on one switch. */
function mininetArpAndIp(
  sw: MininetSwitch,
  fromPort: number,
  toPort: number,
  fromMac: string,
  toMac: string,
  fromIp: string,
  toIp: string,
  nwProto?: number,
  tpDst?: number,
): boolean {
  const arpReq = mininetDeliver(sw, fromPort, {
    dlType: "0x806",
    nwProto: 1,
    nwDst: toIp,
    dlSrc: fromMac,
    dlDst: "ff:ff:ff:ff:ff:ff",
  });
  if (!arpReq.includes(toPort)) return false;
  const arpReply = mininetDeliver(sw, toPort, {
    dlType: "0x806",
    nwProto: 2,
    nwDst: fromIp,
    dlSrc: toMac,
    dlDst: fromMac,
  });
  if (!arpReply.includes(fromPort)) return false;
  const fwd = mininetDeliver(sw, fromPort, {
    dlType: "0x800",
    nwProto: nwProto ?? 1,
    nwSrc: fromIp,
    nwDst: toIp,
    tpDst,
    dlSrc: fromMac,
    dlDst: toMac,
  });
  if (!fwd.includes(toPort)) return false;
  const reply = mininetDeliver(sw, toPort, {
    dlType: "0x800",
    nwProto: nwProto ?? 1,
    nwSrc: toIp,
    nwDst: fromIp,
    dlSrc: toMac,
    dlDst: fromMac,
  });
  return reply.includes(fromPort);
}

function mininetHostIp(h: MininetHost): string | undefined {
  return h.attachments[0]?.ip?.split("/")[0];
}

function mininetFindByAttachmentIp(
  mn: MininetState,
  ip: string,
): { host: MininetHost; attachment: MininetAttachment } | null {
  for (const host of Object.values(mn.hosts)) {
    for (const att of host.attachments) {
      if (att.ip && att.ip.split("/")[0] === ip)
        return { host, attachment: att };
    }
  }
  return null;
}

/**
 * Whether `fromHostName` can reach `toHostNameOrIp` right now, given the
 * current flow tables, VLAN tags, and (for the router topology) default
 * routes + `ip_forward`. Used by both `ping`/`pingall`/`curl` and the
 * `mininetReachable` spec check, so the two always agree.
 */
function mininetReachable(
  mn: MininetState,
  fromHostName: string,
  toHostNameOrIp: string,
  nwProto?: number,
  tpDst?: number,
): boolean {
  const from = mn.hosts[fromHostName];
  const fromAtt = from?.attachments[0];
  if (!from || !fromAtt?.ip) return false;
  const toIp = mn.hosts[toHostNameOrIp]
    ? mininetHostIp(mn.hosts[toHostNameOrIp])
    : /^\d+\.\d+\.\d+\.\d+$/.test(toHostNameOrIp)
      ? toHostNameOrIp
      : undefined;
  if (!toIp) return false;
  const found = mininetFindByAttachmentIp(mn, toIp);
  if (!found) return false;
  const { host: toHost, attachment: toAtt } = found;
  if (
    from.vlan !== undefined &&
    toHost.vlan !== undefined &&
    from.vlan !== toHost.vlan
  )
    return false;

  if (cidrContains(fromAtt.ip, toIp)) {
    const sw = mn.switches[fromAtt.switchName];
    if (!sw || toAtt.switchName !== fromAtt.switchName) return false;
    return mininetArpAndIp(
      sw,
      fromAtt.port,
      toAtt.port,
      from.mac,
      toHost.mac,
      fromAtt.ip.split("/")[0],
      toIp,
      nwProto,
      tpDst,
    );
  }

  // Different subnet — only reachable via a default-routed gateway on the
  // same switch, which in turn must have `ip_forward` on and an egress
  // attachment whose subnet contains the destination.
  if (!from.defaultRoute) return false;
  const gw = mininetFindByAttachmentIp(mn, from.defaultRoute);
  if (!gw || gw.attachment.switchName !== fromAtt.switchName) return false;
  const swIn = mn.switches[fromAtt.switchName];
  if (!swIn) return false;
  if (
    !mininetArpAndIp(
      swIn,
      fromAtt.port,
      gw.attachment.port,
      from.mac,
      gw.host.mac,
      fromAtt.ip.split("/")[0],
      from.defaultRoute,
    )
  )
    return false;
  if (!gw.host.ipForward) return false;
  const egress = gw.host.attachments.find(
    (a) => a.ip && a.ip !== gw.attachment.ip && cidrContains(a.ip, toIp),
  );
  if (!egress || egress.switchName !== toAtt.switchName) return false;
  const swOut = mn.switches[egress.switchName];
  if (!swOut) return false;
  return mininetArpAndIp(
    swOut,
    egress.port,
    toAtt.port,
    gw.host.mac,
    toHost.mac,
    egress.ip!.split("/")[0],
    toIp,
    nwProto,
    tpDst,
  );
}

function mininetPingallOutput(mn: MininetState): string {
  const names = Object.keys(mn.hosts).sort();
  const lines = ["*** Ping: testing ping reachability"];
  let total = 0;
  let received = 0;
  for (const from of names) {
    const results: string[] = [];
    for (const to of names) {
      if (to === from) continue;
      total++;
      const reachable = mininetReachable(mn, from, to);
      if (reachable) received++;
      results.push(reachable ? to : "X");
    }
    lines.push(`${from} -> ${results.join(" ")} `);
  }
  const droppedPct =
    total === 0 ? 0 : Math.floor(((total - received) / total) * 100);
  lines.push(
    `*** Results: ${droppedPct}% dropped (${received}/${total} received)`,
  );
  return lines.join("\n");
}

function mininetFakeMac(seq: number): string {
  const hex = seq.toString(16).padStart(2, "0");
  return `00:00:00:00:00:${hex}`;
}

/** `--topo=single,N --controller=none --mac`: one switch, N hosts, empty (secure) flow table. */
function buildSingleTopo(n: number): MininetState {
  const switches: Record<string, MininetSwitch> = {
    s1: { name: "s1", failMode: "secure", flows: [], ports: {} },
  };
  const hosts: Record<string, MininetHost> = {};
  for (let i = 1; i <= n; i++) {
    switches.s1.ports[i] = `h${i}`;
    hosts[`h${i}`] = {
      name: `h${i}`,
      mac: mininetFakeMac(i),
      attachments: [{ switchName: "s1", port: i, ip: `10.0.0.${i}/8` }],
      arpCache: {},
    };
  }
  return { preset: `single,${n}`, switches, hosts };
}

/** `simple_topo.py`: standalone bridge `br0`, two isolated /24 subnets, no router. */
function buildSimpleTopoPreset(): MininetState {
  const switches: Record<string, MininetSwitch> = {
    br0: { name: "br0", failMode: "standalone", flows: [], ports: {} },
  };
  const order: [string, string][] = [
    ["h20", "192.168.1.20/24"],
    ["h21", "192.168.1.21/24"],
    ["h10", "192.168.0.10/24"],
    ["h11", "192.168.0.11/24"],
  ];
  const hosts: Record<string, MininetHost> = {};
  order.forEach(([name, ip], idx) => {
    const port = idx + 1;
    switches.br0.ports[port] = name;
    hosts[name] = {
      name,
      mac: mininetFakeMac(port),
      attachments: [{ switchName: "br0", port, ip }],
      arpCache: {},
    };
  });
  return { preset: "simple_topo", switches, hosts };
}

/** `arp_topo.py`: one switch, two hosts, Mininet's own default controller (acts as a normal switch immediately). */
function buildArpTopoPreset(): MininetState {
  return {
    preset: "arp_topo",
    switches: {
      s1: {
        name: "s1",
        failMode: "standalone",
        flows: [],
        ports: { 1: "h1", 2: "h2" },
      },
    },
    hosts: {
      h1: {
        name: "h1",
        mac: mininetFakeMac(1),
        attachments: [{ switchName: "s1", port: 1, ip: "10.0.0.1/24" }],
        arpCache: {},
      },
      h2: {
        name: "h2",
        mac: mininetFakeMac(2),
        attachments: [{ switchName: "s1", port: 2, ip: "10.0.0.2/24" }],
        arpCache: {},
      },
    },
  };
}

/** `advanced_arp_topo.py`: two switches, two 2-host subnets, router `r1` bridging them with ip_forward on. */
function buildAdvancedArpTopoPreset(): MininetState {
  return {
    preset: "advanced_arp_topo",
    switches: {
      s1: {
        name: "s1",
        failMode: "standalone",
        flows: [],
        ports: { 1: "h1", 2: "h2", 3: "r1" },
      },
      s2: {
        name: "s2",
        failMode: "standalone",
        flows: [],
        ports: { 1: "h3", 2: "h4", 3: "r1" },
      },
    },
    hosts: {
      h1: {
        name: "h1",
        mac: mininetFakeMac(1),
        attachments: [{ switchName: "s1", port: 1, ip: "10.0.1.1/24" }],
        defaultRoute: "10.0.1.254",
        arpCache: {},
      },
      h2: {
        name: "h2",
        mac: mininetFakeMac(2),
        attachments: [{ switchName: "s1", port: 2, ip: "10.0.1.2/24" }],
        defaultRoute: "10.0.1.254",
        arpCache: {},
      },
      h3: {
        name: "h3",
        mac: mininetFakeMac(3),
        attachments: [{ switchName: "s2", port: 1, ip: "10.0.2.1/24" }],
        defaultRoute: "10.0.2.254",
        arpCache: {},
      },
      h4: {
        name: "h4",
        mac: mininetFakeMac(4),
        attachments: [{ switchName: "s2", port: 2, ip: "10.0.2.2/24" }],
        defaultRoute: "10.0.2.254",
        arpCache: {},
      },
      r1: {
        name: "r1",
        mac: mininetFakeMac(5),
        attachments: [
          { switchName: "s1", port: 3, ip: "10.0.1.254/24" },
          { switchName: "s2", port: 3, ip: "10.0.2.254/24" },
        ],
        ipForward: true,
        arpCache: {},
      },
    },
  };
}

/** `simulate_vlan_network.py` + `vlanhost.py`: one switch, 2 VLANs x 2 hosts, VLAN-tagged isolation. */
function buildVlanPreset(): MininetState {
  const switches: Record<string, MininetSwitch> = {
    s1: { name: "s1", failMode: "standalone", flows: [], ports: {} },
  };
  const hosts: Record<string, MininetHost> = {};
  let port = 0;
  let mac = 0;
  for (const vlan of [100, 101]) {
    for (let j = 1; j <= 2; j++) {
      port++;
      mac++;
      const name = `h${j}_${vlan}`;
      switches.s1.ports[port] = name;
      hosts[name] = {
        name,
        mac: mininetFakeMac(mac),
        attachments: [{ switchName: "s1", port, ip: `10.0.0.${port}0/24` }],
        vlan,
        arpCache: {},
      };
    }
  }
  return { preset: "vlan", switches, hosts };
}

/** Maps a topology-script filename (as typed, e.g. `python3 simple_topo.py`) to its canned preset builder. */
const MININET_SCRIPT_PRESETS: Record<string, () => MininetState> = {
  "simple_topo.py": buildSimpleTopoPreset,
  "arp_topo.py": buildArpTopoPreset,
  "advanced_arp_topo.py": buildAdvancedArpTopoPreset,
  "simulate_vlan_network.py": buildVlanPreset,
};

/**
 * Appends a plausible SYN/SYN-ACK/ACK/data TCP handshake to `trafficLog` for
 * a new connection — this is the only source of `trafficLog` entries
 * (tcpdump has nothing to filter until a connection like this actually
 * happens), not genuinely generated traffic.
 */
function appendHandshakePackets(
  state: ShellState,
  iface: string,
  clientPort: number,
  serverPort: number,
): void {
  const ip = "127.0.0.1";
  const baseSeq = 1000000 + state.trafficLog.length * 37;
  const n = state.trafficLog.length;
  const mkTime = (offset: number) => {
    const sec = 56 + Math.floor((n + offset) / 10);
    const micro = ((n + offset) % 10) * 100000;
    return `12:34:${String(sec).padStart(2, "0")}.${String(micro).padStart(6, "0")}`;
  };
  state.trafficLog.push(
    {
      iface,
      timestamp: mkTime(0),
      srcIp: ip,
      srcPort: clientPort,
      dstIp: ip,
      dstPort: serverPort,
      proto: "tcp",
      flags: "S",
      seq: baseSeq,
      length: 0,
    },
    {
      iface,
      timestamp: mkTime(1),
      srcIp: ip,
      srcPort: serverPort,
      dstIp: ip,
      dstPort: clientPort,
      proto: "tcp",
      flags: "S.",
      seq: baseSeq + 5000,
      length: 0,
    },
    {
      iface,
      timestamp: mkTime(2),
      srcIp: ip,
      srcPort: clientPort,
      dstIp: ip,
      dstPort: serverPort,
      proto: "tcp",
      flags: ".",
      seq: baseSeq + 1,
      length: 0,
    },
    {
      iface,
      timestamp: mkTime(3),
      srcIp: ip,
      srcPort: clientPort,
      dstIp: ip,
      dstPort: serverPort,
      proto: "tcp",
      flags: "P.",
      seq: baseSeq + 1,
      length: 24,
    },
  );
}

/** BPF-ish filter match: supports `port N`, `host IP`, `tcp`, `udp`, `not`, implicit/explicit `and`. */
function matchesBpf(pkt: PacketRecord, tokens: string[]): boolean {
  if (!tokens.length) return true;
  let result = true;
  let negate = false;
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok === "and") continue;
    if (tok === "not") {
      negate = true;
      continue;
    }
    let term: boolean;
    if (tok === "port") {
      const port = Number(tokens[++i]);
      term = pkt.srcPort === port || pkt.dstPort === port;
    } else if (tok === "host") {
      const host = tokens[++i];
      term = pkt.srcIp === host || pkt.dstIp === host;
    } else if (tok === "tcp") {
      term = pkt.proto === "tcp";
    } else if (tok === "udp") {
      term = pkt.proto === "udp";
    } else {
      term = true;
    }
    if (negate) {
      term = !term;
      negate = false;
    }
    result = result && term;
  }
  return result;
}

function formatPacketLine(p: PacketRecord): string {
  const flagStr = p.flags ? ` Flags [${p.flags}],` : "";
  return `${p.timestamp} IP ${p.srcIp}.${p.srcPort} > ${p.dstIp}.${p.dstPort}:${flagStr} seq ${p.seq ?? 0}, length ${p.length}`;
}

/** Shared `ss`/`netstat` socket-table renderer — same source data, different column styles. */
function formatSockets(
  sockets: SocketEntry[],
  opts: {
    listenOnly?: boolean;
    stateFilter?: string;
    portFilter?: number[];
    showProcess: boolean;
    style: "ss" | "netstat";
  },
): string {
  let filtered = sockets;
  if (opts.listenOnly) filtered = filtered.filter((s) => s.state === "LISTEN");
  if (opts.stateFilter)
    filtered = filtered.filter(
      (s) => s.state.toLowerCase() === opts.stateFilter!.toLowerCase(),
    );
  if (opts.portFilter?.length)
    filtered = filtered.filter(
      (s) =>
        opts.portFilter!.includes(s.localPort) ||
        (s.remotePort !== undefined && opts.portFilter!.includes(s.remotePort)),
    );

  if (opts.style === "ss") {
    const lines = [
      "State      Recv-Q Send-Q   Local Address:Port    Peer Address:Port   Process",
    ];
    for (const s of filtered) {
      const local = `${s.localAddr}:${s.localPort}`;
      const peer = s.remoteAddr
        ? `${s.remoteAddr}:${s.remotePort}`
        : "0.0.0.0:*";
      const proc =
        opts.showProcess && s.program
          ? `users:(("${s.program}",pid=${s.pid ?? 0},fd=3))`
          : "";
      lines.push(
        `${s.state.padEnd(11)}0      0        ${local.padEnd(22)}${peer.padEnd(21)}${proc}`,
      );
    }
    return lines.join("\n");
  }

  const lines = [
    "Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name",
  ];
  for (const s of filtered) {
    const local = `${s.localAddr}:${s.localPort}`;
    const foreign = s.remoteAddr
      ? `${s.remoteAddr}:${s.remotePort}`
      : "0.0.0.0:*";
    const proc = opts.showProcess && s.program ? `${s.pid}/${s.program}` : "-";
    lines.push(
      `${s.proto.padEnd(5)}0      0 ${local.padEnd(23)} ${foreign.padEnd(23)} ${s.state.padEnd(11)} ${proc}`,
    );
  }
  return lines.join("\n");
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

/** One YAML "document" (k8s manifests may have several, split on `---`). */
interface YamlDoc {
  /** dotted-path -> scalar value, e.g. "metadata.name" -> "myapp" */
  flat: Record<string, string>;
}

/**
 * Minimal indentation-based scanner for the YAML subset docker-compose files
 * and k8s manifests need in these labs: top-level scalars, one level of
 * mapping nesting ("key:" then indented "child: value" lines), and
 * multi-document files split on a line that is exactly "---". Blank lines,
 * "#" comments, and "-"-prefixed list items are skipped entirely — list
 * values (e.g. compose's "ports:" lists) are intentionally unsupported.
 * This is NOT a general YAML parser.
 */
function scanYamlish(content: string): YamlDoc[] {
  const docs: YamlDoc[] = [];
  let flat: Record<string, string> = {};
  let stack: { indent: number; path: string }[] = [];

  const startDoc = () => {
    flat = {};
    stack = [];
    docs.push({ flat });
  };
  startDoc();

  for (const rawLine of content.split("\n")) {
    const line = rawLine.replace(/\r$/, "");
    if (/^---\s*$/.test(line)) {
      startDoc();
      continue;
    }
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-"))
      continue;

    const match = /^(\s*)([\w.-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const indent = match[1].length;
    const key = match[2];
    let value = match[3].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    while (stack.length && stack[stack.length - 1].indent >= indent)
      stack.pop();
    const parentPath = stack.length ? stack[stack.length - 1].path : null;
    const path = parentPath ? `${parentPath}.${key}` : key;

    if (value === "") {
      stack.push({ indent, path });
    } else {
      flat[path] = value;
    }
  }

  return docs;
}

/** Direct child service names under "services:" in a docker-compose file. */
export function composeServiceNames(content: string): string[] {
  const [doc] = scanYamlish(content);
  const prefix = "services.";
  const names = new Set<string>();
  for (const path of Object.keys(doc?.flat ?? {})) {
    if (!path.startsWith(prefix)) continue;
    names.add(path.slice(prefix.length).split(".")[0]);
  }
  return [...names];
}

/** A service's `image:` value from a docker-compose file, if set. */
export function composeServiceImage(
  content: string,
  service: string,
): string | undefined {
  const [doc] = scanYamlish(content);
  return doc?.flat[`services.${service}.image`];
}

export interface ParsedK8sDoc {
  kind: string;
  name: string;
  namespace: string;
  replicas?: number;
  raw: Record<string, string>;
}

/** One entry per `---`-separated doc that has both kind: and metadata.name:. */
export function parseK8sManifest(content: string): ParsedK8sDoc[] {
  return scanYamlish(content)
    .map((doc) => ({
      kind: doc.flat["kind"] ?? "",
      name: doc.flat["metadata.name"] ?? "",
      namespace: doc.flat["metadata.namespace"] ?? "default",
      replicas:
        doc.flat["spec.replicas"] !== undefined
          ? Number(doc.flat["spec.replicas"])
          : undefined,
      raw: doc.flat,
    }))
    .filter((d) => d.kind && d.name);
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
export function hasPerm(
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

/* ── Tiny jq interpreter ───────────────────────────────────────────────
 * Supports exactly the subset the jq lab teaches: `.`, dot-path navigation
 * (`.a.b.c`), array iteration (`.a[]`, `.a[].b`), and `select(.f == "v")`
 * chained with `|`. Not a real jq — no arithmetic, no `map`/`[...]`
 * construction, no `-r`.
 */

/** Splits on top-level `|` (ignoring `|` inside quotes), for jq filter chains. */
function splitJqPipe(filter: string): string[] {
  const parts: string[] = [];
  let cur = "";
  let quote: string | null = null;
  for (const c of filter) {
    if (quote) {
      cur += c;
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if (c === "|") {
      parts.push(cur.trim());
      cur = "";
    } else {
      cur += c;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

/** Walks a dot-path (segments like `a`, `a[]`) against a JSON value. */
function evalJqPath(path: string, input: unknown): unknown[] {
  if (path === "") return [input];
  const m = path.match(/^([a-zA-Z_]\w*)(\[\])?(?:\.(.*))?$/);
  if (!m) return [input];
  const [, key, iterate, restPath] = m;
  const obj =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : undefined;
  const cur = obj ? obj[key] : undefined;
  const values: unknown[] = iterate ? (Array.isArray(cur) ? cur : []) : [cur];
  if (restPath === undefined) return values;
  return values.flatMap((v) => evalJqPath(restPath, v));
}

/** `select(.field == "value")` — the only select form these labs use. */
function evalJqSelect(cond: string, input: unknown): boolean {
  const m = cond.match(/^\.([\w.]+)\s*==\s*"([^"]*)"$/);
  if (!m) return false;
  const [, path, expected] = m;
  const vals = evalJqPath(path, input);
  return vals[0] === expected;
}

function evalJqStage(stage: string, input: unknown): unknown[] {
  if (stage === "." || stage === "") return [input];
  const selectMatch = stage.match(/^select\((.+)\)$/);
  if (selectMatch) return evalJqSelect(selectMatch[1], input) ? [input] : [];
  if (stage.startsWith(".")) return evalJqPath(stage.slice(1), input);
  return [input];
}

/** Runs a full `a | b | c` jq filter chain against parsed JSON. */
function runJqFilter(filter: string, input: unknown): unknown[] {
  let values: unknown[] = [input];
  for (const stage of splitJqPipe(filter)) {
    values = values.flatMap((v) => evalJqStage(stage, v));
  }
  return values;
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
    if (t.text.startsWith("&>>")) {
      const target = t.text.slice(3) || tokens[++i]?.text;
      if (target) {
        redir.stdout = { append: true, target };
        redir.mergeStderr = true;
      }
      continue;
    }
    if (t.text.startsWith("&>")) {
      const target = t.text.slice(2) || tokens[++i]?.text;
      if (target) {
        redir.stdout = { append: false, target };
        redir.mergeStderr = true;
      }
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

  if (pending.kind === "bash-read") {
    return resumeBashRead(state, pending, value, bashHost);
  }

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

/** True while a `vim`/`vi`/`nano`/`visudo` session is open. */
export function isInEditor(state: ShellState): boolean {
  return !!state.pendingEditor;
}

/** Updates the in-progress editor draft — does not touch the filesystem yet. */
export function updateEditorDraft(
  prev: ShellState,
  content: string,
): ShellState {
  if (!prev.pendingEditor) return prev;
  return { ...prev, pendingEditor: { ...prev.pendingEditor, content } };
}

/** Saves the editor draft to the filesystem and closes the editor (`:wq`/`:x`). */
export function saveEditorAndExit(prev: ShellState): ExecResult {
  const pending = prev.pendingEditor;
  if (!pending) return { state: prev, output: "", error: true };

  const state: ShellState = JSON.parse(JSON.stringify(prev));
  const existing = state.fs[pending.path];
  if (existing) {
    state.fs[pending.path] = { ...existing, content: pending.content };
  } else {
    const owner = currentUser(state);
    const rec = state.users[owner];
    state.fs[pending.path] = {
      type: "file",
      content: pending.content,
      mode: applyUmask(state, 6),
      owner,
      group: rec?.primary ?? owner,
    };
  }
  state.pendingEditor = undefined;
  return { state, output: "", error: false };
}

/** Discards the editor draft and closes the editor without writing anything (`:q!`). */
export function discardEditorAndExit(prev: ShellState): ExecResult {
  const state: ShellState = JSON.parse(JSON.stringify(prev));
  state.pendingEditor = undefined;
  return { state, output: "", error: false };
}

/**
 * Executes a full command line, including `cmd1 | cmd2 | cmd3` pipelines —
 * each stage's stdout becomes the next stage's stdin (as plain text; stages
 * that don't accept stdin just ignore it, matching real shell behavior).
 */
/** Real Mininet/ifconfig-style textual listing of one host's interface(s). */
function mininetIfconfigOutput(h: MininetHost): string {
  return h.attachments
    .map((att, idx) => {
      const ifName = h.vlan
        ? `${h.name}-eth0.${h.vlan}`
        : `${h.name}-eth${idx}`;
      if (!att.ip) return `${ifName}   Link encap:Ethernet  HWaddr ${h.mac}`;
      const [ip, prefix] = att.ip.split("/");
      const net = cidrNetwork(att.ip).split("/")[0];
      const netParts = net.split(".").map(Number);
      const bcast = `${netParts[0]}.${netParts[1]}.${netParts[2]}.255`;
      return (
        `${ifName}   Link encap:Ethernet  HWaddr ${h.mac}\n` +
        `          inet addr:${ip}  Bcast:${bcast}  Mask:255.255.255.0 (/${prefix})\n` +
        `          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1`
      );
    })
    .join("\n");
}

function mininetArpTableOutput(h: MininetHost): string {
  const lines = [
    "Address                  HWtype  HWaddress           Flags Mask            Iface",
  ];
  for (const [ip, entry] of Object.entries(h.arpCache)) {
    lines.push(
      `${ip.padEnd(25)}ether   ${entry.mac}   ${entry.static ? "CM" : "C "}                     ${h.name}-eth0`,
    );
  }
  return lines.join("\n");
}

function mininetSinglePing(
  mn: MininetState,
  fromHostName: string,
  target: string,
  count: number,
): { output: string; reachable: boolean } {
  const from = mn.hosts[fromHostName];
  const toIp = mn.hosts[target] ? mininetHostIp(mn.hosts[target]) : target;
  const reachable = mininetReachable(mn, fromHostName, target);
  if (reachable && toIp) {
    // ARP now resolved — record it, same as the real thing would
    const found = mininetFindByAttachmentIp(mn, toIp);
    if (found) from.arpCache[toIp] = { mac: found.host.mac };
    const lines = [`PING ${toIp} (${toIp}) 56(84) bytes of data.`];
    for (let i = 1; i <= count; i++) {
      lines.push(
        `64 bytes from ${toIp}: icmp_seq=${i} ttl=64 time=0.0${i}0 ms`,
      );
    }
    lines.push(`--- ${toIp} ping statistics ---`);
    lines.push(
      `${count} packets transmitted, ${count} received, 0% packet loss, time ${count}ms`,
    );
    return { output: lines.join("\n"), reachable: true };
  }
  const dest = toIp ?? target;
  const lines = [`PING ${dest} (${dest}) 56(84) bytes of data.`];
  for (let i = 1; i <= count; i++) {
    lines.push(
      `From ${mininetHostIp(from) ?? ""} icmp_seq=${i} Destination Host Unreachable`,
    );
  }
  lines.push(`--- ${dest} ping statistics ---`);
  lines.push(
    `${count} packets transmitted, 0 received, +${count} errors, 100% packet loss, time ${count}ms`,
  );
  return { output: lines.join("\n"), reachable: false };
}

/** Dispatches one `<hostname> <command...>` line typed inside the Mininet CLI. */
function executeMininetHostCommand(
  state: ShellState,
  mn: MininetState,
  hostName: string,
  tokens: Token[],
): ExecResult {
  const host = mn.hosts[hostName];
  const cmd = tokens[0]?.text ?? "";
  const rest = tokens.slice(1);
  const ok = (output = ""): ExecResult => ({ state, output, error: false });
  const fail = (output: string): ExecResult => ({ state, output, error: true });

  if (cmd === "ifconfig") return ok(mininetIfconfigOutput(host));

  if (cmd === "ping") {
    const cIdx = rest.findIndex((t) => !t.quoted && t.text === "-c");
    const count = cIdx >= 0 ? Number(rest[cIdx + 1]?.text) || 1 : 4;
    const target = rest.find(
      (t, i) =>
        (t.quoted || !t.text.startsWith("-")) && (cIdx < 0 || i !== cIdx + 1),
    )?.text;
    if (!target) return fail("usage: ping [-c count] <destination>");
    const { output, reachable } = mininetSinglePing(
      mn,
      hostName,
      target,
      count,
    );
    return reachable ? ok(output) : fail(output);
  }

  if (cmd === "curl") {
    const target = rest.find((t) => t.quoted || !t.text.startsWith("-"))?.text;
    if (!target) return fail("usage: curl <destination>");
    const toHost = mn.hosts[target];
    const toIp = toHost ? mininetHostIp(toHost) : target;
    if (
      toHost &&
      toHost.servingPort &&
      mininetReachable(mn, hostName, target, 6, toHost.servingPort)
    ) {
      return ok(
        "<!DOCTYPE html>\n<html>\n<head><title>Directory listing</title></head>\n<body><h1>Directory listing</h1></body>\n</html>",
      );
    }
    return fail(
      `curl: (7) Failed to connect to ${toIp ?? target} port 80: Connection timed out`,
    );
  }

  if (cmd === "arp") {
    if (rest[0]?.text === "-n" || rest.length === 0) {
      return ok(mininetArpTableOutput(host));
    }
    if (rest[0]?.text === "-s") {
      const ip = rest[1]?.text;
      const mac = rest[2]?.text;
      if (!ip || !mac) return fail("usage: arp -s <ip> <mac>");
      host.arpCache[ip] = { mac, static: true };
      return ok();
    }
    return fail(`arp: unsupported invocation`);
  }

  if (cmd === "ip") {
    const action = rest[0]?.text;
    if (action === "neigh" && rest[1]?.text === "flush") {
      host.arpCache = {};
      return ok();
    }
    if (
      action === "route" &&
      rest[1]?.text === "add" &&
      rest[2]?.text === "default"
    ) {
      const via =
        rest[rest.findIndex((t) => !t.quoted && t.text === "via") + 1]?.text;
      if (!via) return fail("usage: ip route add default via <ip>");
      host.defaultRoute = via;
      return ok();
    }
    if (action === "addr" || action === "a")
      return ok(mininetIfconfigOutput(host));
    return fail(`ip: unsupported invocation inside mininet`);
  }

  if (cmd.startsWith(`${hostName}-eth`)) {
    // `r1.cmd('ifconfig r1-eth0 10.0.1.254/24')`-style direct interface
    // assignment, typed interactively — accept but this is already baked
    // into the router preset, so just acknowledge.
    return ok();
  }

  if (cmd === "python" || cmd === "python3") {
    const mIdx = rest.findIndex((t) => !t.quoted && t.text === "-m");
    const mod = mIdx >= 0 ? rest[mIdx + 1]?.text : undefined;
    if (mod === "SimpleHTTPServer" || mod === "http.server") {
      const portTok = rest[mIdx + 2];
      host.servingPort =
        portTok && !portTok.quoted && !portTok.text.startsWith("-")
          ? Number(portTok.text)
          : 8000;
      return ok(`Serving HTTP on 0.0.0.0 port ${host.servingPort} ...`);
    }
    return fail("python: unsupported invocation inside mininet");
  }

  if (cmd === "sysctl") {
    const kv = rest.find((t) => !t.quoted && t.text.includes("="));
    if (kv) {
      const [key, value] = kv.text.split("=");
      if (key === "net.ipv4.ip_forward") host.ipForward = value === "1";
      return ok(`${key} = ${value}`);
    }
    return fail("usage: sysctl -w <key>=<value>");
  }

  return fail(`${hostName}: ${cmd}: command not found`);
}

/** Handles `ovs-ofctl <verb> <switch> [spec]`, invoked inside mininet via `sh ovs-ofctl ...`. */
function executeOvsOfctl(
  state: ShellState,
  mn: MininetState,
  tokens: Token[],
): ExecResult {
  const ok = (output = ""): ExecResult => ({ state, output, error: false });
  const fail = (output: string): ExecResult => ({ state, output, error: true });
  // `ovs-ofctl [-t nat-style flags ignored] <verb> <switch> [rest...]`
  const verb = tokens[0]?.text;
  const switchName = tokens[1]?.text;
  const sw = switchName ? mn.switches[switchName] : undefined;
  if (!sw) return fail(`ovs-ofctl: ${switchName}: no such switch`);

  if (verb === "add-flow") {
    const specText = tokens
      .slice(2)
      .map((t) => t.text)
      .join(" ")
      .replace(/\s*,\s*/g, ",");
    if (!specText) return fail("usage: ovs-ofctl add-flow <switch> <spec>");
    const flow = parseOvsFlowSpec(specText);
    // real `add-flow` modifies an existing flow with the same match+priority
    // in place rather than adding a duplicate entry
    const existingIdx = sw.flows.findIndex(
      (f) =>
        f.priority === flow.priority &&
        JSON.stringify(f.match) === JSON.stringify(flow.match),
    );
    if (existingIdx >= 0) sw.flows[existingIdx] = flow;
    else sw.flows.push(flow);
    return ok();
  }
  if (verb === "del-flows") {
    sw.flows = [];
    return ok();
  }
  if (verb === "dump-flows") {
    return ok(sw.flows.map(formatOvsFlow).join("\n"));
  }
  if (verb === "show") {
    const portLines = Object.entries(sw.ports)
      .map(
        ([port, node]) =>
          `  ${port}(${sw.name}-eth${port}): connected to ${node}`,
      )
      .join("\n");
    return ok(
      `OFPT_FEATURES_REPLY: dpid:${sw.name}\nn_tables:254, n_buffers:0\n${portLines}`,
    );
  }
  return fail(`ovs-ofctl: unsupported verb "${verb}"`);
}

/** Entry point for every line typed while a Mininet CLI session (`state.mininet`) is open. */
function executeMininetLine(prev: ShellState, input: string): ExecResult {
  const state: ShellState = JSON.parse(JSON.stringify(prev));
  const mn = state.mininet!;
  let rawToks = tokenize(input.trim());
  if (!rawToks)
    return {
      state: prev,
      output: "bash: syntax error: unclosed quote",
      error: true,
    };
  if (
    rawToks.length &&
    !rawToks[rawToks.length - 1].quoted &&
    rawToks[rawToks.length - 1].text === "&"
  ) {
    rawToks = rawToks.slice(0, -1);
  }
  if (!rawToks.length) return { state, output: "", error: false };
  const cmd = rawToks[0].text;
  const rest = rawToks.slice(1);

  if (cmd === "exit") {
    state.mininet = undefined;
    return { state, output: "", error: false };
  }
  if (cmd === "pingall") {
    return { state, output: mininetPingallOutput(mn), error: false };
  }
  if (cmd === "nodes") {
    const names = [
      ...Object.keys(mn.hosts),
      ...Object.keys(mn.switches),
    ].sort();
    return {
      state,
      output: `available nodes are: \n${names.join(" ")}`,
      error: false,
    };
  }
  if (cmd === "net") {
    const lines: string[] = [];
    for (const h of Object.values(mn.hosts)) {
      const parts = h.attachments.map(
        (a, i) => `${h.name}-eth${i}:${a.switchName}-eth${a.port}`,
      );
      lines.push(`${h.name} ${parts.join(" ")}`);
    }
    for (const sw of Object.values(mn.switches)) {
      const parts = Object.entries(sw.ports).map(
        ([port, node]) => `${sw.name}-eth${port}:${node}-eth0`,
      );
      lines.push(`${sw.name} lo:  ${parts.join(" ")}`);
    }
    return { state, output: lines.join("\n"), error: false };
  }
  if (cmd === "dump") {
    const lines: string[] = [];
    for (const h of Object.values(mn.hosts)) {
      const ip = mininetHostIp(h) ?? "None";
      lines.push(`<Host ${h.name}: ${h.name}-eth0:${ip} pid=1000>`);
    }
    for (const sw of Object.values(mn.switches)) {
      lines.push(`<OVSSwitch ${sw.name}: lo:127.0.0.1 pid=2000>`);
    }
    return { state, output: lines.join("\n"), error: false };
  }
  if (cmd === "links") {
    const lines = Object.values(mn.hosts).map(
      (h) =>
        `${h.name}-eth0<->${h.attachments[0].switchName}-eth${h.attachments[0].port} (OK OK)`,
    );
    return { state, output: lines.join("\n"), error: false };
  }
  if (cmd === "sh") {
    const shTokens = rest;
    if (shTokens[0]?.text === "ovs-ofctl") {
      return executeOvsOfctl(state, mn, shTokens.slice(1));
    }
    return { state, output: "", error: false };
  }
  if (mn.hosts[cmd]) {
    return executeMininetHostCommand(state, mn, cmd, rest);
  }
  return {
    state,
    output: `*** Unknown command: '${input.trim()}'`,
    error: true,
  };
}

export function execute(
  prev: ShellState,
  input: string,
  initialStdin?: string,
): ExecResult {
  // While a Mininet CLI session is open, every typed line is a mininet-CLI
  // command (`h1 ping h2`, `pingall`, `sh ovs-ofctl ...`, `exit`, ...), not a
  // regular host shell command — route it to the dedicated dispatcher first.
  if (prev.mininet) return executeMininetLine(prev, input);
  // A typed heredoc (`cmd << EOF ... EOF`) spans multiple source lines and
  // can't be expressed as a single tokenize()-able command — hand the whole
  // thing to the bash-script interpreter, which understands heredoc bodies.
  // (A newline alone isn't enough to trigger this: existing specs/tests
  // embed literal "\n"s inside a single quoted argument, e.g.
  // `echo '<multi-line>' > file.yaml`, which must keep working as one
  // ordinary single-line command.)
  if (/<<(?!<)-?\s*['"]?\w+['"]?/.test(input)) {
    return runBashScript(prev, input, [], "bash", bashHost);
  }
  const stages = splitPipeline(input);
  if (stages.length <= 1) return executeOne(prev, input, initialStdin);
  let state = prev;
  let stdinText: string | undefined = initialStdin;
  let last: ExecResult = { state: prev, output: "", error: false };
  for (const stage of stages) {
    last = executeOne(state, stage, stdinText);
    if (last.error) return last;
    state = last.state;
    stdinText = last.output;
  }
  return last;
}

/** Dependency-injection bundle handed to the bash-script interpreter — see bash-interpreter.ts. */
const bashHost: BashHost = {
  execute,
  resolvePath,
  hasPerm,
  currentUser,
  nodeMode,
};

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
  // No real job control is simulated — a trailing `&` (background the
  // command) is simply stripped and the command runs synchronously, which is
  // sufficient for labs that only care about the resulting state (a socket
  // now listening, a service now running), not actual process backgrounding.
  if (
    !rawToks[rawToks.length - 1].quoted &&
    rawToks[rawToks.length - 1].text === "&"
  ) {
    rawToks = rawToks.slice(0, -1);
    if (!rawToks.length) return ok();
  }
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

  // `bash <file> [args...]` / `./<file> [args...]` — run a real bash script
  // through the dedicated interpreter (bash-interpreter.ts), not the
  // single-command switch below.
  if (cmd === "bash" && rest.length && rest[0].text !== "-c") {
    const scriptRaw = rest[0].text;
    const scriptArgs = rest.slice(1).map((t) => t.text);
    const abs = resolvePath(state.cwd, scriptRaw);
    const node = state.fs[abs];
    if (!node) return fail(`bash: ${scriptRaw}: No such file or directory`);
    if (node.type === "dir") return fail(`bash: ${scriptRaw}: Is a directory`);
    return runBashScript(
      state,
      node.content ?? "",
      scriptArgs,
      scriptRaw,
      bashHost,
    );
  }
  if (cmd.startsWith("./")) {
    const abs = resolvePath(state.cwd, cmd);
    const node = state.fs[abs];
    if (!node) return fail(`bash: ${cmd}: No such file or directory`);
    if (node.type === "dir") return fail(`bash: ${cmd}: Is a directory`);
    // Unlike read/write, the kernel still requires *some* execute bit to
    // run a file directly (`./foo`) even for root — root only bypasses the
    // owner/group/other permission check, not the "is this executable at
    // all" one.
    const mode = nodeMode(node);
    const hasAnyExecBit = [0, 1, 2].some((i) => Number(mode[i]) & 1);
    if (!hasAnyExecBit) return fail(`bash: ${cmd}: Permission denied`);
    const scriptArgs = rest.map((t) => t.text);
    return runBashScript(state, node.content ?? "", scriptArgs, cmd, bashHost);
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

    case "git": {
      const g = state.git;
      const action = rest[0]?.text;
      const NOT_A_REPO =
        "fatal: not a git repository (or any of the parent directories): .git";
      const inRepo = () => g.root !== null && g.root === state.cwd;
      const relTo = (abs: string) => abs.slice((g.root ?? "").length + 1);

      if (action === "init") {
        if (g.root === state.cwd) {
          return ok(
            `Reinitialized existing Git repository in ${state.cwd}/.git/`,
          );
        }
        g.root = state.cwd;
        g.branches = { main: [] };
        g.currentBranch = "main";
        g.commits = {};
        g.staged = [];
        g.tracked = {};
        g.nextSeq = 1;
        const gitDir = state.cwd === "/" ? "/.git" : state.cwd + "/.git";
        state.fs[gitDir] = {
          type: "dir",
          mode: "755",
          ...creatorOwnerGroup(state, permUser, effectiveRoot),
        };
        return ok(`Initialized empty Git repository in ${state.cwd}/.git/`);
      }

      if (!inRepo()) return fail(NOT_A_REPO);

      if (action === "add") {
        const args = rest
          .slice(1)
          .filter((t) => t.quoted || !t.text.startsWith("-"));
        if (!args.length) return fail("Nothing specified, nothing added.");
        for (const a of args) {
          if (!a.quoted && a.text === ".") {
            for (const p of Object.keys(state.fs)) {
              if (
                p !== g.root &&
                p.startsWith(g.root + "/") &&
                state.fs[p].type === "file" &&
                !g.staged.includes(p)
              ) {
                g.staged.push(p);
              }
            }
            continue;
          }
          const abs = resolvePath(state.cwd, a.text);
          if (!state.fs[abs])
            return fail(`fatal: pathspec '${a.text}' did not match any files`);
          if (state.fs[abs].type === "file" && !g.staged.includes(abs))
            g.staged.push(abs);
        }
        return ok();
      }

      if (action === "commit") {
        const mIdx = rest.findIndex((t) => !t.quoted && t.text === "-m");
        if (mIdx === -1) return fail("usage: git commit -m <message>");
        const message = rest[mIdx + 1]?.text;
        if (!message) return fail("error: switch `m' requires a value");
        if (!g.staged.length)
          return fail(
            `On branch ${g.currentBranch}\nnothing to commit, working tree clean`,
          );
        const seq = g.nextSeq++;
        const id = fakeHex(seq, 7);
        const files = [...g.staged];
        g.commits[id] = { id, message, files, seq };
        (g.branches[g.currentBranch] ??= []).push(id);
        for (const f of files) g.tracked[f] = state.fs[f]?.content ?? "";
        g.staged = [];
        return ok(
          `[${g.currentBranch} ${id}] ${message}\n ${files.length} file(s) changed`,
        );
      }

      if (action === "status") {
        const stagedSet = new Set(g.staged);
        const allFiles = Object.keys(state.fs).filter(
          (p) =>
            p !== g.root &&
            p.startsWith(g.root + "/") &&
            state.fs[p].type === "file",
        );
        const untracked = allFiles.filter(
          (p) => !(p in g.tracked) && !stagedSet.has(p),
        );
        const modified = allFiles.filter(
          (p) =>
            p in g.tracked &&
            g.tracked[p] !== (state.fs[p].content ?? "") &&
            !stagedSet.has(p),
        );
        const staged = [...stagedSet];
        const lines: string[] = [`On branch ${g.currentBranch}`];
        if (!staged.length && !modified.length && !untracked.length) {
          lines.push("nothing to commit, working tree clean");
        } else {
          if (staged.length) {
            lines.push("Changes to be committed:");
            for (const p of staged) lines.push(`\tnew file:   ${relTo(p)}`);
          }
          if (modified.length) {
            lines.push("Changes not staged for commit:");
            for (const p of modified) lines.push(`\tmodified:   ${relTo(p)}`);
          }
          if (untracked.length) {
            lines.push("Untracked files:");
            for (const p of untracked) lines.push(`\t${relTo(p)}`);
          }
        }
        return ok(lines.join("\n"));
      }

      if (action === "log") {
        const ids = g.branches[g.currentBranch] ?? [];
        if (!ids.length)
          return fail(
            `fatal: your current branch '${g.currentBranch}' does not have any commits yet`,
          );
        const oneline = rest.some((t) => !t.quoted && t.text === "--oneline");
        const ordered = [...ids].reverse();
        const lines = ordered.map((id) => {
          const c = g.commits[id];
          return oneline
            ? `${c.id} ${c.message}`
            : `commit ${c.id}\n\n    ${c.message}`;
        });
        return ok(lines.join("\n"));
      }

      if (action === "branch") {
        const args = rest
          .slice(1)
          .filter((t) => t.quoted || !t.text.startsWith("-"));
        const name = args[0]?.text;
        if (!name) {
          const names = Object.keys(g.branches);
          return ok(
            names
              .map((n) => (n === g.currentBranch ? `* ${n}` : `  ${n}`))
              .join("\n"),
          );
        }
        if (g.branches[name])
          return fail(`fatal: a branch named '${name}' already exists`);
        g.branches[name] = [...(g.branches[g.currentBranch] ?? [])];
        return ok();
      }

      if (action === "checkout") {
        const args = rest.slice(1);
        const hasB = args.some((t) => !t.quoted && t.text === "-b");
        const name = args.find(
          (t) => t.quoted || !t.text.startsWith("-"),
        )?.text;
        if (!name) return fail("usage: git checkout [-b] <branch>");
        if (hasB) {
          if (g.branches[name])
            return fail(`fatal: a branch named '${name}' already exists`);
          g.branches[name] = [...(g.branches[g.currentBranch] ?? [])];
          g.currentBranch = name;
          return ok(`Switched to a new branch '${name}'`);
        }
        if (!g.branches[name])
          return fail(
            `error: pathspec '${name}' did not match any file(s) known to git`,
          );
        g.currentBranch = name;
        return ok(`Switched to branch '${name}'`);
      }

      return fail(`git: '${action}' is not a git command. See 'git --help'.`);
    }

    case "docker":
    case "docker-compose": {
      const composeAlias = cmd === "docker-compose";
      const action = composeAlias ? "compose" : rest[0]?.text;
      const args = composeAlias ? rest : rest.slice(1);

      if (action === "build") {
        const tagIdx = args.findIndex((t) => !t.quoted && t.text === "-t");
        const rawTag = tagIdx >= 0 ? args[tagIdx + 1]?.text : undefined;
        if (!rawTag) return fail("docker build: missing required flag -t");
        const tag = rawTag.includes(":") ? rawTag : `${rawTag}:latest`;
        const positional = args.filter(
          (t, i) =>
            i !== tagIdx &&
            i !== tagIdx + 1 &&
            (t.quoted || !t.text.startsWith("-")),
        );
        const contextArg = positional[0]?.text ?? ".";
        const context = resolvePath(state.cwd, contextArg);
        const ctxNode = state.fs[context];
        if (!ctxNode || ctxNode.type !== "dir")
          return fail(
            `unable to prepare context: path "${contextArg}" not found`,
          );
        const dfPath =
          context === "/" ? "/Dockerfile" : context + "/Dockerfile";
        const df = state.fs[dfPath];
        if (!df)
          return fail(
            `unable to prepare context: unable to evaluate symlinks in Dockerfile path: lstat ${dfPath}: no such file or directory`,
          );
        const seq = state.docker.nextSeq++;
        state.docker.images[tag] = {
          tag,
          id: fakeHex(seq, 12),
          sourcePath: context,
          dockerfileContent: df.content ?? "",
          seq,
        };
        return ok(
          `[+] Building 1.0s (5/5) FINISHED\n => naming to docker.io/library/${tag}`,
        );
      }

      if (action === "images") {
        const imgs = Object.values(state.docker.images);
        const header = "REPOSITORY   TAG      IMAGE ID";
        if (!imgs.length) return ok(header);
        const lines = imgs.map((img) => {
          const [repo, t] = img.tag.split(":");
          return `${repo}   ${t}   ${img.id}`;
        });
        return ok([header, ...lines].join("\n"));
      }

      if (action === "run") {
        let detached = false;
        let name: string | undefined;
        const ports: { host: number; container: number }[] = [];
        let image: string | undefined;
        for (let i = 0; i < args.length; i++) {
          const t = args[i];
          if (t.quoted) {
            if (!image) image = t.text;
            continue;
          }
          if (t.text === "-d") {
            detached = true;
            continue;
          }
          if (t.text === "--name") {
            name = args[++i]?.text;
            continue;
          }
          if (t.text === "-p") {
            const raw = args[++i]?.text ?? "";
            const [h, c] = raw.split(":").map(Number);
            if (!Number.isNaN(h) && !Number.isNaN(c))
              ports.push({ host: h, container: c });
            continue;
          }
          if (t.text.startsWith("-")) continue;
          if (!image) {
            image = t.text;
            continue;
          }
        }
        if (!image)
          return fail('docker: "docker run" requires at least 1 argument.');
        const tag = image.includes(":") ? image : `${image}:latest`;
        if (!state.docker.images[tag])
          return fail(
            `Unable to find image '${image}' locally\ndocker: Error response from daemon: pull access denied for ${image}, repository does not exist or may require 'docker login'`,
          );
        const containerName = name ?? `container_${state.docker.nextSeq}`;
        if (state.docker.containers[containerName])
          return fail(
            `docker: Error response from daemon: Conflict. The container name "/${containerName}" is already in use by container. You have to remove (or rename) that container to reuse that name.`,
          );
        const seq = state.docker.nextSeq++;
        state.docker.containers[containerName] = {
          name: containerName,
          id: fakeHex(seq, 12),
          image: tag,
          status: "running",
          ports,
          seq,
        };
        return ok(detached ? fakeHex(seq, 64) : "");
      }

      if (action === "ps") {
        const all = args.some((t) => !t.quoted && t.text === "-a");
        const containers = Object.values(state.docker.containers).filter(
          (c) => all || c.status === "running",
        );
        const header = "CONTAINER ID   IMAGE     STATUS    NAMES";
        if (!containers.length) return ok(header);
        const lines = containers.map(
          (c) => `${c.id.slice(0, 12)}   ${c.image}   ${c.status}   ${c.name}`,
        );
        return ok([header, ...lines].join("\n"));
      }

      if (action === "stop" || action === "start") {
        const name = args.find(
          (t) => t.quoted || !t.text.startsWith("-"),
        )?.text;
        if (!name)
          return fail(`docker ${action}: requires at least 1 argument`);
        const c = state.docker.containers[name];
        if (!c) return fail(`Error: No such container: ${name}`);
        c.status = action === "stop" ? "exited" : "running";
        return ok(name);
      }

      if (action === "rm") {
        const force = args.some((t) => !t.quoted && t.text === "-f");
        const name = args.find(
          (t) => t.quoted || !t.text.startsWith("-"),
        )?.text;
        if (!name) return fail("docker rm: requires at least 1 argument");
        const c = state.docker.containers[name];
        if (!c) return fail(`Error: No such container: ${name}`);
        if (c.status === "running" && !force)
          return fail(
            `Error response from daemon: You cannot remove a running container ${c.id}. Stop the container before attempting removal or force remove`,
          );
        delete state.docker.containers[name];
        return ok(name);
      }

      if (action === "logs") {
        const name = args.find(
          (t) => t.quoted || !t.text.startsWith("-"),
        )?.text;
        if (!name) return fail("docker logs: requires at least 1 argument");
        const c = state.docker.containers[name];
        if (!c) return fail(`Error: No such container: ${name}`);
        return ok(`[app] Starting ${c.image}...\n[app] Listening for requests`);
      }

      if (action === "compose") {
        const sub = args[0]?.text;
        const project = baseName(state.cwd).toLowerCase() || "root";
        if (sub === "up") {
          const abs = resolvePath(state.cwd, "docker-compose.yml");
          const file = state.fs[abs];
          if (!file) return fail("no configuration file provided: not found");
          const names = composeServiceNames(file.content ?? "");
          if (!names.length)
            return fail("no services defined in docker-compose.yml");
          const lines: string[] = [];
          for (const svc of names) {
            const image =
              composeServiceImage(file.content ?? "", svc) ?? `${svc}:latest`;
            const containerName = `${project}_${svc}_1`;
            const seq = state.docker.nextSeq++;
            state.docker.containers[containerName] = {
              name: containerName,
              id: fakeHex(seq, 12),
              image,
              status: "running",
              ports: [],
              composeProject: project,
              seq,
            };
            lines.push(` Container ${containerName}  Started`);
          }
          return ok(lines.join("\n"));
        }
        if (sub === "down") {
          for (const [name, c] of Object.entries(state.docker.containers)) {
            if (c.composeProject === project)
              delete state.docker.containers[name];
          }
          return ok(`Removing containers for project "${project}"`);
        }
        return fail(`docker: 'compose ${sub}' is not a docker command.`);
      }

      return fail(
        `docker: '${action}' is not a docker command.\nSee 'docker --help'`,
      );
    }

    case "kubectl": {
      const action = rest[0]?.text;
      const args = rest.slice(1);
      const SUPPORTED_KINDS = new Set([
        "deployment",
        "deploy",
        "pod",
        "service",
        "svc",
        "configmap",
        "namespace",
      ]);
      const canonicalKind = (raw: string): string => {
        const lower = raw.toLowerCase();
        if (lower === "deploy") return "Deployment";
        if (lower === "svc") return "Service";
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      };
      const flagValue = (
        tokens: Token[],
        short?: string,
        long?: string,
      ): string | undefined => {
        for (let i = 0; i < tokens.length; i++) {
          const t = tokens[i];
          if (t.quoted) continue;
          if (short && t.text === short) return tokens[i + 1]?.text;
          if (long) {
            if (t.text === long) return tokens[i + 1]?.text;
            if (t.text.startsWith(long + "="))
              return t.text.slice(long.length + 1);
          }
        }
        return undefined;
      };

      if (action === "apply") {
        const fileArg = flagValue(args, "-f");
        if (!fileArg) return fail("error: must specify -f");
        const abs = resolvePath(state.cwd, fileArg);
        const node = state.fs[abs];
        if (!node) return fail(`error: the path "${fileArg}" does not exist`);
        const docs = parseK8sManifest(node.content ?? "");
        if (!docs.length)
          return fail(
            `error: unable to decode "${fileArg}": no kind/metadata.name found`,
          );
        const lines: string[] = [];
        for (const d of docs) {
          const key = `${d.namespace}/${d.kind}/${d.name}`;
          const existed = key in state.k8s.resources;
          const replicas =
            d.kind === "Deployment" ? (d.replicas ?? 1) : undefined;
          state.k8s.resources[key] = {
            kind: d.kind,
            name: d.name,
            namespace: d.namespace,
            replicas,
            readyReplicas: replicas,
            sourceFile: abs,
            raw: d.raw,
          };
          lines.push(
            `${d.kind.toLowerCase()}.apps/${d.name} ${existed ? "configured" : "created"}`,
          );
        }
        return ok(lines.join("\n"));
      }

      if (action === "get") {
        const kindArg = args.find(
          (t) => t.quoted || !t.text.startsWith("-"),
        )?.text;
        if (!kindArg)
          return fail("error: you must specify the type of resource to get");
        if (!SUPPORTED_KINDS.has(kindArg.toLowerCase()))
          return fail(
            `error: the server doesn't have a resource type "${kindArg}"`,
          );
        const kind = canonicalKind(kindArg);
        const ns = flagValue(args, "-n", "--namespace") ?? "default";
        const matches = Object.values(state.k8s.resources).filter(
          (r) => r.kind === kind && r.namespace === ns,
        );
        if (!matches.length)
          return ok(`No resources found in ${ns} namespace.`);
        const header = "NAME   READY   STATUS";
        const lines = matches.map(
          (r) =>
            `${r.name}   ${r.replicas !== undefined ? `${r.readyReplicas}/${r.replicas}` : "1/1"}   Running`,
        );
        return ok([header, ...lines].join("\n"));
      }

      if (action === "describe") {
        const positional = args.filter(
          (t) => t.quoted || !t.text.startsWith("-"),
        );
        const kindArg = positional[0]?.text;
        const name = positional[1]?.text;
        if (!kindArg || !name)
          return fail(
            "error: You must specify the type and name of the resource",
          );
        const kind = canonicalKind(kindArg);
        const ns = flagValue(args, "-n", "--namespace") ?? "default";
        const res = state.k8s.resources[`${ns}/${kind}/${name}`];
        if (!res)
          return fail(
            `Error from server (NotFound): ${kind.toLowerCase()}s.apps "${name}" not found`,
          );
        const lines = [
          `Name:         ${res.name}`,
          `Namespace:    ${res.namespace}`,
          `Kind:         ${res.kind}`,
        ];
        if (res.replicas !== undefined)
          lines.push(`Replicas:     ${res.replicas}`);
        return ok(lines.join("\n"));
      }

      if (action === "delete") {
        const fileArg = flagValue(args, "-f");
        if (fileArg) {
          const abs = resolvePath(state.cwd, fileArg);
          const node = state.fs[abs];
          if (!node) return fail(`error: the path "${fileArg}" does not exist`);
          const docs = parseK8sManifest(node.content ?? "");
          for (const d of docs) {
            const key = `${d.namespace}/${d.kind}/${d.name}`;
            if (!(key in state.k8s.resources))
              return fail(
                `Error from server (NotFound): ${d.kind.toLowerCase()}s.apps "${d.name}" not found`,
              );
          }
          for (const d of docs) {
            delete state.k8s.resources[`${d.namespace}/${d.kind}/${d.name}`];
          }
          return ok(
            docs
              .map((d) => `${d.kind.toLowerCase()}.apps "${d.name}" deleted`)
              .join("\n"),
          );
        }
        const positional = args.filter(
          (t) => t.quoted || !t.text.startsWith("-"),
        );
        const kindArg = positional[0]?.text;
        const name = positional[1]?.text;
        if (!kindArg || !name)
          return fail("error: must specify a resource type and name, or -f");
        const kind = canonicalKind(kindArg);
        const ns = flagValue(args, "-n", "--namespace") ?? "default";
        const key = `${ns}/${kind}/${name}`;
        if (!(key in state.k8s.resources))
          return fail(
            `Error from server (NotFound): ${kind.toLowerCase()}s.apps "${name}" not found`,
          );
        delete state.k8s.resources[key];
        return ok(`${kind.toLowerCase()}.apps "${name}" deleted`);
      }

      if (action === "scale") {
        const positional = args.filter(
          (t) => t.quoted || !t.text.startsWith("-"),
        );
        const kindArg = positional[0]?.text;
        if (
          !kindArg ||
          !["deployment", "deploy"].includes(kindArg.toLowerCase())
        )
          return fail(
            `error: the server doesn't have a resource type "${kindArg}"`,
          );
        const name = positional[1]?.text;
        const ns = flagValue(args, "-n", "--namespace") ?? "default";
        const replicasRaw = flagValue(args, undefined, "--replicas");
        if (
          !name ||
          replicasRaw === undefined ||
          Number.isNaN(Number(replicasRaw))
        )
          return fail('error: required flag(s) "replicas" not set');
        const key = `${ns}/Deployment/${name}`;
        const res = state.k8s.resources[key];
        if (!res)
          return fail(
            `Error from server (NotFound): deployments.apps "${name}" not found`,
          );
        res.replicas = Number(replicasRaw);
        res.readyReplicas = res.replicas;
        return ok(`deployment.apps/${name} scaled`);
      }

      if (action === "logs") {
        const name = args.find(
          (t) => t.quoted || !t.text.startsWith("-"),
        )?.text;
        if (!name) return fail("error: requires at least 1 argument");
        return ok(`[app] Starting...\n[app] Listening for requests`);
      }

      return fail(`error: unknown command "${action}" for "kubectl"`);
    }

    case "nc": {
      const flagsRaw = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const positional = rest
        .filter((t) => t.quoted || !t.text.startsWith("-"))
        .map((t) => t.text);

      if (flagsRaw.includes("l")) {
        const port = Number(positional[0]);
        if (!positional[0] || !Number.isInteger(port))
          return fail("nc: usage: nc -l [-k] port");
        const seq = state.sockets.length + 1;
        state.sockets.push({
          proto: "tcp",
          localAddr: "0.0.0.0",
          localPort: port,
          state: "LISTEN",
          program: "nc",
          pid: 2000 + seq,
        });
        return ok();
      }

      const host = positional[0];
      const port = Number(positional[1]);
      if (!host || !positional[1] || !Number.isInteger(port))
        return fail("nc: usage: nc <host> <port>");
      const listener = state.sockets.find(
        (s) =>
          s.proto === "tcp" && s.state === "LISTEN" && s.localPort === port,
      );
      if (!listener)
        return fail(
          `nc: connect to ${host} port ${port} (tcp) failed: Connection refused`,
        );
      const ephemeral = 40000 + state.sockets.length;
      state.sockets.push({
        proto: "tcp",
        localAddr: "127.0.0.1",
        localPort: ephemeral,
        remoteAddr: "127.0.0.1",
        remotePort: port,
        state: "ESTABLISHED",
        program: "nc",
        pid: 2000 + state.sockets.length + 1,
      });
      state.sockets.push({
        proto: "tcp",
        localAddr: "127.0.0.1",
        localPort: port,
        remoteAddr: "127.0.0.1",
        remotePort: ephemeral,
        state: "ESTABLISHED",
        program: listener.program,
        pid: listener.pid,
      });
      appendHandshakePackets(state, "lo", ephemeral, port);
      return ok();
    }

    case "python3": {
      const scriptName = rest[0]?.text;
      const presetBuilder = scriptName
        ? MININET_SCRIPT_PRESETS[scriptName]
        : undefined;
      if (presetBuilder) {
        state.mininet = presetBuilder();
        return ok("*** Starting CLI:");
      }
      const mIdx = rest.findIndex((t) => !t.quoted && t.text === "-m");
      const mod = mIdx >= 0 ? rest[mIdx + 1]?.text : undefined;
      if (mod === "http.server") {
        const portTok = rest[mIdx + 2];
        const port =
          portTok && !portTok.quoted && !portTok.text.startsWith("-")
            ? Number(portTok.text)
            : 8000;
        const seq = state.sockets.length + 1;
        state.sockets.push({
          proto: "tcp",
          localAddr: "0.0.0.0",
          localPort: port,
          state: "LISTEN",
          program: "python3",
          pid: 3000 + seq,
        });
        return ok(
          `Serving HTTP on 0.0.0.0 port ${port} (http://0.0.0.0:${port}/) ...`,
        );
      }
      return fail(`python3: unsupported invocation`);
    }

    case "mn": {
      const topoVal = rest
        .find((t) => !t.quoted && t.text.startsWith("--topo="))
        ?.text.slice("--topo=".length);
      const m = topoVal?.match(/^single,(\d+)$/);
      if (!m)
        return fail(`mn: unsupported --topo (only single,N is simulated)`);
      state.mininet = buildSingleTopo(Number(m[1]));
      return ok("*** Starting CLI:");
    }

    case "ss": {
      const flagsRaw = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      const listenOnly = flagsRaw.includes("l");
      const showProcess = flagsRaw.includes("p");
      const stateIdx = rest.findIndex((t) => !t.quoted && t.text === "state");
      const stateFilter = stateIdx >= 0 ? rest[stateIdx + 1]?.text : undefined;
      const filterToken = rest.find(
        (t) => t.quoted && /dport|sport/.test(t.text),
      );
      const portFilter = filterToken
        ? parseSsPortFilter(filterToken.text)
        : undefined;
      return ok(
        formatSockets(state.sockets, {
          listenOnly,
          stateFilter,
          portFilter,
          showProcess,
          style: "ss",
        }),
      );
    }

    case "netstat": {
      const flagsRaw = rest
        .filter((t) => !t.quoted && t.text.startsWith("-"))
        .map((t) => t.text)
        .join("");
      if (flagsRaw.includes("i")) {
        const lines = [
          "Kernel Interface table",
          "Iface      MTU    RX-OK RX-ERR RX-DRP RX-OVR    TX-OK TX-ERR TX-DRP TX-OVR Flg",
        ];
        for (const [name, iface] of Object.entries(state.network.interfaces)) {
          lines.push(
            `${name.padEnd(10)} 1500        0      0      0      0        0      0      0      0 ${iface.state === "up" ? "BMRU" : ""}`,
          );
        }
        return ok(lines.join("\n"));
      }
      if (flagsRaw.includes("r")) {
        const lines = [
          "Kernel IP routing table",
          "Destination     Gateway         Genmask         Flags Iface",
        ];
        for (const r of state.network.routes) {
          const dest = r.dest === "default" ? "0.0.0.0" : r.dest.split("/")[0];
          const gw = r.via ?? "0.0.0.0";
          lines.push(
            `${dest.padEnd(16)}${gw.padEnd(16)}${"".padEnd(16)}${r.via ? "UG" : "U"}    ${r.dev}`,
          );
        }
        return ok(lines.join("\n"));
      }
      const listenOnly = flagsRaw.includes("l") && !flagsRaw.includes("a");
      const showProcess = flagsRaw.includes("p");
      return ok(
        formatSockets(state.sockets, {
          listenOnly,
          showProcess,
          style: "netstat",
        }),
      );
    }

    case "tcpdump": {
      const readFile = flagValue(rest, "-r");
      if (readFile) {
        const abs = resolvePath(state.cwd, readFile);
        const node = state.fs[abs];
        if (!node)
          return fail(`tcpdump: ${readFile}: No such file or directory`);
        return ok(node.content ?? "");
      }

      const iface = flagValue(rest, "-i");
      const writeFile = flagValue(rest, "-w");
      const bpfTokens: string[] = [];
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && (t.text === "-i" || t.text === "-w")) {
          i++;
          continue;
        }
        if (!t.quoted && t.text === "-n") continue;
        bpfTokens.push(t.text);
      }

      const matches = state.trafficLog.filter(
        (p) => (!iface || p.iface === iface) && matchesBpf(p, bpfTokens),
      );
      const output = matches.map(formatPacketLine).join("\n");

      if (writeFile) {
        const abs = resolvePath(state.cwd, writeFile);
        state.fs[abs] = {
          type: "file",
          content: output,
          mode: applyUmask(state, 6),
          ...creatorOwnerGroup(state, permUser, effectiveRoot),
        };
        return ok(`${matches.length} packets captured`);
      }

      return ok(output);
    }

    case "netfilter-persistent": {
      const sub = rest[0]?.text;
      if (sub === "save")
        return ok(
          "run-parts: executing /usr/share/netfilter-persistent/plugins.d/15-ip4tables save",
        );
      if (sub === "reload" || sub === "flush") return ok();
      return fail(`netfilter-persistent: unknown subcommand "${sub}"`);
    }

    case "iptables": {
      const fw = state.firewall.iptables;
      const hasFlag = (f: string) =>
        rest.some((t) => !t.quoted && t.text === f);

      if (hasFlag("-L")) {
        const lIdx = rest.findIndex((t) => !t.quoted && t.text === "-L");
        const next = rest[lIdx + 1];
        const chainArg =
          next && !next.quoted && !next.text.startsWith("-")
            ? next.text
            : undefined;
        const verbose = hasFlag("-v");
        const lineNumbers = hasFlag("--line-numbers");
        if (chainArg && !fw.chains[chainArg])
          return fail(`iptables: No chain/target/match by that name.`);
        const chainsToShow = chainArg ? [chainArg] : Object.keys(fw.chains);
        const lines: string[] = [];
        for (const chainName of chainsToShow) {
          const chain = fw.chains[chainName];
          lines.push(`Chain ${chainName} (policy ${chain.policy})`);
          lines.push(
            verbose
              ? "num   pkts bytes target     prot opt in     out     source               destination"
              : "num   target     prot opt source               destination",
          );
          chain.rules.forEach((r, i) => {
            const num = lineNumbers ? `${i + 1}    ` : "";
            const parts = [
              num,
              r.target.padEnd(10),
              (r.proto ?? "all").padEnd(5),
              "--",
              (r.source ?? "anywhere").padEnd(20),
              "anywhere",
            ];
            if (r.extra?.length) parts.push(r.extra.join(" "));
            lines.push(parts.join(" "));
          });
          lines.push("");
        }
        return ok(lines.join("\n").trimEnd());
      }

      if (hasFlag("-P")) {
        const pIdx = rest.findIndex((t) => !t.quoted && t.text === "-P");
        const chainName = rest[pIdx + 1]?.text;
        const policy = rest[pIdx + 2]?.text;
        if (!chainName || !fw.chains[chainName])
          return fail(`iptables: No chain/target/match by that name.`);
        if (policy !== "ACCEPT" && policy !== "DROP")
          return fail(`iptables: Bad built-in chain name.`);
        fw.chains[chainName].policy = policy;
        return ok();
      }

      if (hasFlag("-I")) {
        const iIdx = rest.findIndex((t) => !t.quoted && t.text === "-I");
        const chainName = rest[iIdx + 1]?.text;
        if (!chainName)
          return fail("iptables: No chain/target/match by that name.");
        if (!fw.chains[chainName])
          fw.chains[chainName] = { policy: "ACCEPT", rules: [] };
        const posTok = rest[iIdx + 2];
        const posArg =
          posTok && !posTok.quoted && /^\d+$/.test(posTok.text)
            ? posTok.text
            : undefined;
        const rule = parseIptablesRule(rest.slice(iIdx + 2));
        if (!rule)
          return fail(
            "iptables: Bad rule (does a matching rule exist in that chain?).",
          );
        const chainRules = fw.chains[chainName].rules;
        const pos = posArg ? Number(posArg) - 1 : 0;
        chainRules.splice(
          Math.max(0, Math.min(pos, chainRules.length)),
          0,
          rule,
        );
        return ok();
      }

      if (hasFlag("-A")) {
        const aIdx = rest.findIndex((t) => !t.quoted && t.text === "-A");
        const chainName = rest[aIdx + 1]?.text;
        if (!chainName)
          return fail("iptables: No chain/target/match by that name.");
        if (!fw.chains[chainName])
          fw.chains[chainName] = { policy: "ACCEPT", rules: [] };
        const rule = parseIptablesRule(rest.slice(aIdx + 2));
        if (!rule)
          return fail(
            "iptables: Bad rule (does a matching rule exist in that chain?).",
          );
        fw.chains[chainName].rules.push(rule);
        return ok();
      }

      if (hasFlag("-D")) {
        const dIdx = rest.findIndex((t) => !t.quoted && t.text === "-D");
        const chainName = rest[dIdx + 1]?.text;
        if (!chainName || !fw.chains[chainName])
          return fail("iptables: No chain/target/match by that name.");
        const posTok = rest[dIdx + 2];
        const posArg =
          posTok && !posTok.quoted && /^\d+$/.test(posTok.text)
            ? posTok.text
            : undefined;
        if (posArg) {
          const idx = Number(posArg) - 1;
          const chainRules = fw.chains[chainName].rules;
          if (idx < 0 || idx >= chainRules.length)
            return fail("iptables: Index of deletion too big.");
          chainRules.splice(idx, 1);
          return ok();
        }
        const rule = parseIptablesRule(rest.slice(dIdx + 2));
        if (!rule)
          return fail(
            "iptables: Bad rule (does a matching rule exist in that chain?).",
          );
        const chainRules = fw.chains[chainName].rules;
        const matchIdx = chainRules.findIndex(
          (r) =>
            r.target === rule.target &&
            r.proto === rule.proto &&
            r.dport === rule.dport &&
            r.sport === rule.sport &&
            r.source === rule.source,
        );
        if (matchIdx === -1)
          return fail(
            "iptables: Bad rule (does a matching rule exist in that chain?).",
          );
        chainRules.splice(matchIdx, 1);
        return ok();
      }

      if (hasFlag("-N")) {
        const nIdx = rest.findIndex((t) => !t.quoted && t.text === "-N");
        const chainName = rest[nIdx + 1]?.text;
        if (!chainName)
          return fail("iptables: No chain/target/match by that name.");
        if (fw.chains[chainName])
          return fail(`iptables: Chain already exists.`);
        fw.chains[chainName] = { policy: "ACCEPT", rules: [] };
        return ok();
      }

      if (hasFlag("-F")) {
        const fIdx = rest.findIndex((t) => !t.quoted && t.text === "-F");
        const next = rest[fIdx + 1];
        const chainName =
          next && !next.quoted && !next.text.startsWith("-")
            ? next.text
            : undefined;
        if (chainName) {
          if (!fw.chains[chainName])
            return fail("iptables: No chain/target/match by that name.");
          fw.chains[chainName].rules = [];
        } else {
          for (const c of Object.values(fw.chains)) c.rules = [];
        }
        return ok();
      }

      return fail(`iptables: unknown invocation`);
    }

    case "ufw": {
      const action = rest[0]?.text;
      const args = rest.slice(1);
      const ufw = state.firewall.ufw;

      const formatRuleTarget = (r: UfwRule): string => {
        if (r.appProfile) return r.appProfile;
        if (r.port) return r.proto ? `${r.port}/${r.proto}` : r.port;
        return "Anywhere";
      };
      const formatRuleFrom = (r: UfwRule): string => r.from ?? "Anywhere";

      if (action === "status") {
        if (!ufw.enabled) return ok("Status: inactive");
        const verbose = args.some((t) => !t.quoted && t.text === "verbose");
        const numbered = args.some((t) => !t.quoted && t.text === "numbered");
        const lines: string[] = ["Status: active"];
        if (verbose) {
          lines.push("Logging: on (low)");
          lines.push(
            `Default: ${ufw.defaultIncoming} (incoming), ${ufw.defaultOutgoing} (outgoing)`,
          );
        }
        lines.push("");
        lines.push("To                         Action      From");
        lines.push("--                         ------      ----");
        ufw.rules.forEach((r, i) => {
          const prefix = numbered ? `[${String(i + 1).padStart(2)}] ` : "";
          lines.push(
            `${prefix}${formatRuleTarget(r).padEnd(27)}${r.action.toUpperCase().padEnd(12)}${formatRuleFrom(r)}`,
          );
        });
        return ok(lines.join("\n"));
      }

      if (action === "show") {
        const sub = args[0]?.text;
        if (sub === "added") {
          if (!ufw.rules.length) return ok("");
          const lines = [
            "Added user rules (see 'ufw status' for running firewall):",
            "",
          ];
          for (const r of ufw.rules)
            lines.push(`ufw ${r.action} ${formatRuleTarget(r)}`);
          return ok(lines.join("\n"));
        }
        return fail(`ufw: show: unknown subcommand "${sub}"`);
      }

      if (action === "default") {
        const policy = args[0]?.text;
        const direction = args[1]?.text;
        if (policy !== "allow" && policy !== "deny")
          return fail("ERROR: Must specify 'allow' or 'deny'");
        if (direction === "incoming") ufw.defaultIncoming = policy;
        else if (direction === "outgoing") ufw.defaultOutgoing = policy;
        else return fail('ERROR: Need to specify "incoming" or "outgoing"');
        return ok(`Default ${direction} policy changed to '${policy}'`);
      }

      if (action === "enable") {
        ufw.enabled = true;
        return ok("Firewall is active and enabled on system startup");
      }
      if (action === "disable") {
        ufw.enabled = false;
        return ok("Firewall stopped and disabled on system startup");
      }
      if (action === "reset") {
        ufw.enabled = false;
        ufw.rules = [];
        ufw.defaultIncoming = "allow";
        ufw.defaultOutgoing = "allow";
        return ok("Resetting all rules to installed defaults.");
      }

      if (action === "allow" || action === "deny" || action === "reject") {
        const fromIdx = args.findIndex((t) => !t.quoted && t.text === "from");
        let from: string | undefined;
        let port: string | undefined;
        let proto: "tcp" | "udp" | undefined;
        let appProfile: string | undefined;

        if (fromIdx >= 0) {
          from = args[fromIdx + 1]?.text;
          if (!from) return fail("ERROR: Invalid syntax");
          const toIdx = args.findIndex((t) => !t.quoted && t.text === "to");
          if (toIdx >= 0) {
            const portIdx = args.findIndex(
              (t) => !t.quoted && t.text === "port",
            );
            port = portIdx >= 0 ? args[portIdx + 1]?.text : undefined;
          }
        } else {
          const spec = args[0]?.text;
          if (!spec) return fail("ERROR: Invalid syntax");
          if (UFW_APP_PROFILES[spec]) {
            appProfile = spec;
          } else if (spec.includes("/")) {
            const [p, pr] = spec.split("/");
            port = p;
            proto = pr === "udp" ? "udp" : "tcp";
          } else if (UFW_SERVICE_PORTS[spec]) {
            const [p, pr] = UFW_SERVICE_PORTS[spec].split("/");
            port = p;
            proto = pr as "tcp" | "udp";
          } else {
            port = spec;
          }
        }

        const seq = ufw.nextSeq++;
        ufw.rules.push({ action, port, proto, from, appProfile, seq });
        return ok("Rule added");
      }

      if (action === "delete") {
        const numArg = args[0]?.text;
        const asNumber = Number(numArg);
        if (
          numArg &&
          Number.isInteger(asNumber) &&
          String(asNumber) === numArg
        ) {
          const idx = asNumber - 1;
          if (idx < 0 || idx >= ufw.rules.length)
            return fail(`ERROR: Could not delete non-existent rule`);
          ufw.rules.splice(idx, 1);
          return ok("Rule deleted");
        }
        const specAction = args[0]?.text;
        const specArgs = args.slice(1);
        const fromIdx = specArgs.findIndex(
          (t) => !t.quoted && t.text === "from",
        );
        let from: string | undefined;
        let port: string | undefined;
        let proto: "tcp" | "udp" | undefined;
        let appProfile: string | undefined;
        if (fromIdx >= 0) {
          from = specArgs[fromIdx + 1]?.text;
          const toIdx = specArgs.findIndex((t) => !t.quoted && t.text === "to");
          if (toIdx >= 0) {
            const portIdx = specArgs.findIndex(
              (t) => !t.quoted && t.text === "port",
            );
            port = portIdx >= 0 ? specArgs[portIdx + 1]?.text : undefined;
          }
        } else {
          const spec = specArgs[0]?.text;
          if (spec && UFW_APP_PROFILES[spec]) appProfile = spec;
          else if (spec?.includes("/")) {
            const [p, pr] = spec.split("/");
            port = p;
            proto = pr === "udp" ? "udp" : "tcp";
          } else if (spec && UFW_SERVICE_PORTS[spec]) {
            const [p, pr] = UFW_SERVICE_PORTS[spec].split("/");
            port = p;
            proto = pr as "tcp" | "udp";
          } else {
            port = spec;
          }
        }
        const matchIdx = ufw.rules.findIndex(
          (r) =>
            r.action === specAction &&
            r.port === port &&
            r.proto === proto &&
            r.from === from &&
            r.appProfile === appProfile,
        );
        if (matchIdx === -1)
          return fail(`ERROR: Could not delete non-existent rule`);
        ufw.rules.splice(matchIdx, 1);
        return ok("Rule deleted");
      }

      if (action === "app") {
        const sub = args[0]?.text;
        if (sub === "list") {
          return ok(
            [
              "Available applications:",
              ...Object.keys(UFW_APP_PROFILES).map((n) => `  ${n}`),
            ].join("\n"),
          );
        }
        if (sub === "info") {
          const name = args[1]?.text;
          const profile = name ? UFW_APP_PROFILES[name] : undefined;
          if (!name || !profile)
            return fail(`ERROR: Could not find a profile matching '${name}'`);
          return ok(
            `Profile: ${name}\nPorts: ${profile.ports}${profile.proto ? "/" + profile.proto : ""}`,
          );
        }
        return fail(`ufw: app: unknown subcommand "${sub}"`);
      }

      return fail(`ERROR: unknown command "${action}"`);
    }

    case "ping": {
      const countArg = flagValue(rest, "-c");
      const count = countArg ? Number(countArg) : 4;
      let dest: string | undefined;
      for (let i = 0; i < rest.length; i++) {
        const t = rest[i];
        if (!t.quoted && (t.text === "-c" || t.text === "-w")) {
          i++; // skip this flag's value too
          continue;
        }
        if (!t.quoted && t.text.startsWith("-")) continue;
        dest = t.text;
        break;
      }
      if (!dest) return fail("usage: ping [-c count] <destination>");
      const match = findRoute(state.network, dest);
      if (!match) return fail(`ping: connect: Network is unreachable`);
      if (!match.via) {
        state.network.neighbors[dest] = {
          mac: `02:00:00:00:${fakeHex(Object.keys(state.network.neighbors).length + 1, 2)}:00`,
          state: "REACHABLE",
          dev: match.dev,
        };
      }
      const lines: string[] = [`PING ${dest} 56(84) bytes of data.`];
      for (let i = 1; i <= count; i++) {
        lines.push(
          `64 bytes from ${dest}: icmp_seq=${i} ttl=64 time=0.0${i}0 ms`,
        );
      }
      lines.push(`--- ${dest} ping statistics ---`);
      lines.push(
        `${count} packets transmitted, ${count} received, 0% packet loss, time ${count}ms`,
      );
      return ok(lines.join("\n"));
    }

    case "sysctl": {
      const writeFlag = rest.some((t) => !t.quoted && t.text === "-w");
      const kv = rest.find((t) => !t.quoted && t.text.includes("="));
      if (kv) {
        const [key, value] = kv.text.split("=");
        if (!key || value === undefined)
          return fail(`sysctl: error parsing setting "${kv.text}"`);
        state.sysctl[key] = value;
        return ok(`${key} = ${value}`);
      }
      if (writeFlag) return fail("sysctl: no variables specified");
      const key = rest.find((t) => !t.quoted)?.text;
      if (!key) return fail("usage: sysctl [-w] <key>[=<value>]");
      const value = state.sysctl[key];
      if (value === undefined)
        return fail(
          `sysctl: cannot stat /proc/sys/${key.replace(/\./g, "/")}: No such file or directory`,
        );
      return ok(`${key} = ${value}`);
    }

    case "ip": {
      const action = rest[0]?.text;
      const args = rest.slice(1);

      if (action === "link") {
        const sub = args[0]?.text;
        if (sub === "show" || sub === undefined) {
          const typeFilter = flagValue(args, "type");
          const filterName =
            typeFilter === undefined
              ? args.slice(1).find((t) => t.quoted || !t.text.startsWith("-"))
                  ?.text
              : undefined;
          let allNames = Object.keys(state.network.interfaces);
          if (typeFilter === "veth")
            allNames = allNames.filter((n) => state.network.interfaces[n].peer);
          const names = filterName
            ? allNames.filter((n) => n === filterName)
            : allNames;
          if (filterName && !names.length)
            return fail(`Device "${filterName}" does not exist.`);
          const lines: string[] = [];
          for (const name of names) {
            const idx = allNames.indexOf(name) + 1;
            const iface = state.network.interfaces[name];
            const flags =
              name === "lo"
                ? iface.state === "up"
                  ? "LOOPBACK,UP,LOWER_UP"
                  : "LOOPBACK"
                : iface.state === "up"
                  ? "BROADCAST,MULTICAST,UP,LOWER_UP"
                  : "BROADCAST,MULTICAST";
            const masterSuffix = iface.master ? ` master ${iface.master}` : "";
            lines.push(`${idx}: ${name}: <${flags}> mtu 1500${masterSuffix}`);
            if (iface.mac)
              lines.push(`    link/ether ${iface.mac} brd ff:ff:ff:ff:ff:ff`);
            else if (name === "lo")
              lines.push(
                `    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00`,
              );
          }
          return ok(lines.join("\n"));
        }
        if (sub === "set") {
          const name = args[1]?.text;
          const verb = args[2]?.text;
          const iface = name ? state.network.interfaces[name] : undefined;
          if (!name || !iface) return fail(`Cannot find device "${name}"`);
          if (verb === "up") {
            iface.state = "up";
            return ok();
          }
          if (verb === "down") {
            iface.state = "down";
            return ok();
          }
          if (verb === "netns") {
            const nsName = args[3]?.text;
            if (!nsName) return fail("usage: ip link set <iface> netns <name>");
            const ns = state.netns[nsName];
            if (!ns)
              return fail(
                `Cannot open network namespace "${nsName}": No such file or directory`,
              );
            delete state.network.interfaces[name];
            ns.interfaces[name] = iface;
            return ok();
          }
          if (verb === "master") {
            const bridgeName = args[3]?.text;
            if (!bridgeName)
              return fail("usage: ip link set <iface> master <bridge>");
            const bridge = state.network.interfaces[bridgeName];
            if (!bridge || bridge.kind !== "bridge")
              return fail(`Cannot find bridge device "${bridgeName}"`);
            iface.master = bridgeName;
            return ok();
          }
          if (verb === "nomaster") {
            delete iface.master;
            return ok();
          }
          return fail(`ip link set: unknown verb "${verb}"`);
        }
        if (sub === "add") {
          const name = args[1]?.text;
          const typeIdx = args.findIndex((t) => !t.quoted && t.text === "type");
          const kind = typeIdx >= 0 ? args[typeIdx + 1]?.text : undefined;
          if (kind === "veth") {
            const peerIdx = args.findIndex(
              (t) => !t.quoted && t.text === "name",
            );
            const peerName = peerIdx >= 0 ? args[peerIdx + 1]?.text : undefined;
            if (!name || !peerName)
              return fail("usage: ip link add <a> type veth peer name <b>");
            if (
              state.network.interfaces[name] ||
              state.network.interfaces[peerName]
            )
              return fail(`RTNETLINK answers: File exists`);
            state.network.interfaces[name] = {
              name,
              state: "down",
              addresses: [],
              peer: peerName,
            };
            state.network.interfaces[peerName] = {
              name: peerName,
              state: "down",
              addresses: [],
              peer: name,
            };
            return ok();
          }
          if (kind === "bridge") {
            if (!name) return fail("usage: ip link add <name> type bridge");
            if (state.network.interfaces[name])
              return fail(`RTNETLINK answers: File exists`);
            state.network.interfaces[name] = {
              name,
              state: "down",
              addresses: [],
              kind: "bridge",
            };
            return ok();
          }
          return fail(`ip link add: unsupported type "${kind}"`);
        }
        return fail(`Object "${sub}" is unknown, try "ip help".`);
      }

      if (action === "addr" || action === "a") {
        const sub = args[0]?.text ?? "show";
        if (sub === "show") {
          const filterName = args
            .slice(1)
            .find((t) => t.quoted || !t.text.startsWith("-"))?.text;
          const allNames = Object.keys(state.network.interfaces);
          const names = filterName
            ? allNames.filter((n) => n === filterName)
            : allNames;
          if (filterName && !names.length)
            return fail(`Device "${filterName}" does not exist.`);
          const lines: string[] = [];
          for (const name of names) {
            const idx = allNames.indexOf(name) + 1;
            const iface = state.network.interfaces[name];
            const flags = iface.state === "up" ? "UP,LOWER_UP" : "DOWN";
            lines.push(`${idx}: ${name}: <${flags}> mtu 1500`);
            for (const a of iface.addresses)
              lines.push(`    inet ${a.cidr} scope global ${name}`);
          }
          return ok(lines.join("\n"));
        }
        if (sub === "add") {
          const cidr = args[1]?.text;
          const devName = flagValue(args, "dev");
          if (!cidr || !devName)
            return fail("usage: ip addr add <cidr> dev <iface>");
          const iface = state.network.interfaces[devName];
          if (!iface) return fail(`Cannot find device "${devName}"`);
          iface.addresses.push({ cidr });
          // Real Linux auto-creates a "scope link" route for the interface's
          // subnet the moment an address is assigned — without this, nothing
          // on that subnet would be reachable until a route was added by hand.
          const network = cidrNetwork(cidr);
          if (
            !state.network.routes.some(
              (r) => r.dest === network && r.dev === devName,
            )
          ) {
            state.network.routes.push({ dest: network, dev: devName });
          }
          return ok();
        }
        if (sub === "del") {
          const cidr = args[1]?.text;
          const devName = flagValue(args, "dev");
          if (!cidr || !devName)
            return fail("usage: ip addr del <cidr> dev <iface>");
          const iface = state.network.interfaces[devName];
          if (!iface) return fail(`Cannot find device "${devName}"`);
          const before = iface.addresses.length;
          iface.addresses = iface.addresses.filter((a) => a.cidr !== cidr);
          if (iface.addresses.length === before)
            return fail(`Cannot assign requested address`);
          return ok();
        }
        return fail(`Object "${sub}" is unknown, try "ip help".`);
      }

      if (action === "route" || action === "r") {
        const sub = args[0]?.text ?? "show";
        if (sub === "show") {
          return ok(state.network.routes.map(formatRoute).join("\n"));
        }
        if (sub === "add") {
          const destArg = args[1]?.text;
          const via = flagValue(args, "via");
          let dev = flagValue(args, "dev");
          if (!destArg)
            return fail('Error: an inet prefix is expected rather than "".');
          if (!dev) {
            if (!via)
              return fail(
                'Error: either "dev" is duplicate, or "via" is a garbage.',
              );
            dev = findDeviceForGateway(state.network, via);
            if (!dev) return fail("Error: Nexthop has invalid gateway.");
          }
          if (!state.network.interfaces[dev])
            return fail(`Cannot find device "${dev}"`);
          state.network.routes.push({ dest: destArg, via, dev });
          return ok();
        }
        if (sub === "del") {
          const destArg = args[1]?.text;
          if (!destArg)
            return fail('Error: an inet prefix is expected rather than "".');
          const before = state.network.routes.length;
          state.network.routes = state.network.routes.filter(
            (r) => r.dest !== destArg,
          );
          if (state.network.routes.length === before)
            return fail(`RTNETLINK answers: No such process`);
          return ok();
        }
        if (sub === "get") {
          const dest = args[1]?.text;
          if (!dest) return fail("usage: ip route get <address>");
          const match = findRoute(state.network, dest);
          if (!match) return fail(`RTNETLINK answers: Network is unreachable`);
          const srcIface = state.network.interfaces[match.dev];
          const src = srcIface?.addresses[0]?.cidr.split("/")[0];
          if (match.via)
            return ok(`${dest} via ${match.via} dev ${match.dev} src ${src}`);
          return ok(`${dest} dev ${match.dev} src ${src}`);
        }
        return fail(`Object "${sub}" is unknown, try "ip help".`);
      }

      if (
        action === "neigh" ||
        action === "neighbor" ||
        action === "neighbour"
      ) {
        const sub = args[0]?.text ?? "show";
        if (sub === "show") {
          const devFilter = flagValue(args, "dev");
          const lines = Object.entries(state.network.neighbors)
            .filter(([, n]) => !devFilter || n.dev === devFilter)
            .map(([ip, n]) => `${ip} dev ${n.dev} lladdr ${n.mac} ${n.state}`);
          return ok(lines.join("\n"));
        }
        if (sub === "flush") {
          const devFilter = flagValue(args, "dev");
          for (const ip of Object.keys(state.network.neighbors)) {
            if (!devFilter || state.network.neighbors[ip].dev === devFilter)
              delete state.network.neighbors[ip];
          }
          return ok();
        }
        return fail(`Object "${sub}" is unknown, try "ip help".`);
      }

      if (action === "netns") {
        const sub = args[0]?.text;
        if (sub === "add") {
          const name = args[1]?.text;
          if (!name) return fail("usage: ip netns add <name>");
          if (state.netns[name])
            return fail(
              `Cannot create namespace file "/var/run/netns/${name}": File exists`,
            );
          state.netns[name] = {
            interfaces: { lo: { name: "lo", state: "down", addresses: [] } },
            routes: [],
            neighbors: {},
          };
          return ok();
        }
        if (sub === "list" || sub === "show" || sub === undefined) {
          return ok(Object.keys(state.netns).join("\n"));
        }
        if (sub === "exec") {
          const nsName = args[1]?.text;
          if (!nsName) return fail("usage: ip netns exec <name> <command>");
          const ns = state.netns[nsName];
          if (!ns)
            return fail(
              `Cannot open network namespace "${nsName}": No such file or directory`,
            );
          const innerTokens = args.slice(2);
          if (!innerTokens.length)
            return fail("ip netns exec: missing command");
          const innerCmd = innerTokens
            .map((t) => (t.quoted ? `"${t.text}"` : t.text))
            .join(" ");
          // Temporarily repoint the "current" network stack at the namespace's,
          // run the inner command through the full dispatcher (so `ip`/`ping`
          // inside it naturally operate on the namespace), then persist the
          // namespace's resulting state back and restore the host's network.
          const savedNetwork = state.network;
          state.network = ns;
          const innerResult = execute(state, innerCmd);
          // innerResult.state is a fresh clone from the recursive execute()
          // call, distinct from `state` — mutate (and return) that one, not
          // `state`, or the namespace update would be silently discarded.
          innerResult.state.netns[nsName] = innerResult.state.network;
          innerResult.state.network = savedNetwork;
          return innerResult;
        }
        if (sub === "delete" || sub === "del") {
          const name = args[1]?.text;
          if (!name || !state.netns[name])
            return fail(
              `Cannot remove namespace file "/var/run/netns/${name}": No such file or directory`,
            );
          delete state.netns[name];
          return ok();
        }
        return fail(`Object "${sub}" is unknown, try "ip help".`);
      }

      return fail(`Object "${action}" is unknown, try "ip help".`);
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
      if (target === "/dev/null") return ok();
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
      if (!args.length) {
        if (stdinText !== undefined) return ok(stdinText);
        return fail("cat: missing operand");
      }
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

    case "jq": {
      const filterTok = rest.find((t) => t.quoted || !t.text.startsWith("-"));
      if (!filterTok) return fail("usage: jq 'filter' [file]");
      const fileTok = rest.find((t) => t !== filterTok);
      let text: string | undefined;
      if (fileTok) {
        const abs = resolvePath(state.cwd, fileTok.text);
        const node = state.fs[abs];
        if (!node)
          return fail(`jq: error: ${fileTok.text}: No such file or directory`);
        text = node.content;
      } else {
        text = stdinText;
      }
      if (text === undefined) return fail("usage: jq 'filter' [file]");
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        return fail("jq: error: Invalid JSON text passed to jq");
      }
      const results = runJqFilter(filterTok.text, data);
      if (!results.length) return ok("");
      return ok(results.map((r) => JSON.stringify(r, null, 2)).join("\n"));
    }

    case "date": {
      const fmtTok = rest.find((t) => !t.quoted && t.text.startsWith("+"));
      // Fixed fake "now" so command-substitution timestamps stay deterministic.
      if (fmtTok) {
        const f = fmtTok.text.slice(1);
        return ok(
          f
            .replace(/%Y/g, "2026")
            .replace(/%m/g, "03")
            .replace(/%d/g, "10")
            .replace(/%H/g, "22")
            .replace(/%M/g, "01")
            .replace(/%S/g, "05"),
        );
      }
      return ok("Tue Mar 10 22:01:05 UTC 2026");
    }

    // A real modal editor is out of scope here — opening one hands control
    // to the UI (a simple editable draft + :wq/:x/:q!), matching the one
    // thing learners actually need to practice: making an edit and saving it.
    case "vim":
    case "vi":
    case "nano": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      const raw = args[0]?.text;
      if (!raw) return fail(`${cmd}: missing file operand`);
      const abs = resolvePath(state.cwd, raw);
      const existing = state.fs[abs];
      if (existing && existing.type === "dir")
        return fail(`${cmd}: ${raw}: Is a directory`);
      if (existing) {
        if (
          !effectiveRoot &&
          (!canTraverseTo(state, abs, permUser) ||
            !hasPerm(state, existing, permUser, "w"))
        )
          return fail(`${cmd}: ${raw}: Permission denied`);
      } else {
        const parent = state.fs[parentOf(abs)];
        if (!parent || parent.type !== "dir")
          return fail(`${cmd}: ${raw}: No such file or directory`);
        if (!effectiveRoot && !hasPerm(state, parent, permUser, "w"))
          return fail(`${cmd}: ${raw}: Permission denied`);
      }
      state.pendingEditor = { path: abs, content: existing?.content ?? "" };
      return ok();
    }

    case "visudo": {
      if (!effectiveRoot) return fail("visudo: you must be root to run visudo");
      const abs = "/etc/sudoers";
      state.pendingEditor = {
        path: abs,
        content: state.fs[abs]?.content ?? "",
      };
      return ok();
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
      const allNames = childrenOf(state.fs, abs).map(baseName);
      // Real `ls` hides dotfiles unless `-a` is given.
      const names = all ? allNames : allNames.filter((n) => !n.startsWith("."));
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

    case "mv": {
      const args = rest.filter((t) => t.quoted || !t.text.startsWith("-"));
      if (args.length < 2) return fail("mv: missing operand");
      const [srcRaw, destRaw] = [args[0].text, args[1].text];
      const srcAbs = resolvePath(state.cwd, srcRaw);
      let destAbs = resolvePath(state.cwd, destRaw);
      const srcNode = state.fs[srcAbs];
      if (!srcNode)
        return fail(`mv: cannot stat '${srcRaw}': No such file or directory`);
      // moving into an existing directory keeps the source's base name
      if (state.fs[destAbs]?.type === "dir") {
        destAbs = resolvePath(destAbs, baseName(srcAbs));
      }
      if (srcNode.type === "dir") {
        for (const p of Object.keys(state.fs)) {
          if (p.startsWith(srcAbs + "/")) {
            state.fs[destAbs + p.slice(srcAbs.length)] = state.fs[p];
            delete state.fs[p];
          }
        }
      }
      state.fs[destAbs] = srcNode;
      delete state.fs[srcAbs];
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
  if (check.gitState) {
    const g = ctx.result.state.git;
    const gs = check.gitState;
    if (gs.initialized && g.root === null)
      return { pass: false, reason: "এখনো git init করোনি" };
    if (gs.currentBranch !== undefined && g.currentBranch !== gs.currentBranch)
      return {
        pass: false,
        reason: `এখনো ${gs.currentBranch} branch-এ যাওনি`,
      };
    for (const b of gs.branchesExist ?? []) {
      if (!g.branches[b])
        return { pass: false, reason: `${b} branch-টা এখনো তৈরি হয়নি` };
    }
    const commitIds = g.branches[g.currentBranch] ?? [];
    if (gs.minCommits !== undefined && commitIds.length < gs.minCommits)
      return {
        pass: false,
        reason: `কমপক্ষে ${gs.minCommits}টা commit থাকার কথা`,
      };
    if (gs.lastCommitMessage !== undefined) {
      const lastId = commitIds[commitIds.length - 1];
      const last = lastId ? g.commits[lastId] : undefined;
      if (!last || last.message !== gs.lastCommitMessage)
        return {
          pass: false,
          reason: `শেষ commit message "${gs.lastCommitMessage}" হওয়ার কথা`,
        };
    }
    if (gs.lastCommitIncludes) {
      const lastId = commitIds[commitIds.length - 1];
      const last = lastId ? g.commits[lastId] : undefined;
      for (const p of gs.lastCommitIncludes) {
        const abs = resolvePath(HOME, p);
        if (!last || !last.files.includes(abs))
          return {
            pass: false,
            reason: `শেষ commit-এ ${p} থাকার কথা`,
          };
      }
    }
    for (const p of gs.staged ?? []) {
      const abs = resolvePath(HOME, p);
      if (!g.staged.includes(abs))
        return { pass: false, reason: `${p} এখনো stage করোনি` };
    }
    if (gs.clean && g.staged.length > 0)
      return { pass: false, reason: "working tree clean থাকার কথা না" };
  }
  if (check.dockerImages) {
    for (const want of check.dockerImages) {
      const image = ctx.result.state.docker.images[want.tag];
      if (want.exists === false) {
        if (image)
          return { pass: false, reason: `${want.tag} ইমেজটা এখনো আছে` };
        continue;
      }
      if (!image)
        return { pass: false, reason: `${want.tag} ইমেজ এখনো build হয়নি` };
    }
  }
  if (check.dockerContainers) {
    for (const want of check.dockerContainers) {
      const c = ctx.result.state.docker.containers[want.name];
      if (want.exists === false) {
        if (c)
          return { pass: false, reason: `${want.name} container-টা এখনো আছে` };
        continue;
      }
      if (!c)
        return {
          pass: false,
          reason: `${want.name} container-টা এখনো চালু হয়নি`,
        };
      if (want.status !== undefined && c.status !== want.status)
        return {
          pass: false,
          reason: `${want.name}-এর status ${want.status} হওয়ার কথা (এখন ${c.status})`,
        };
      if (want.image !== undefined && c.image !== want.image)
        return {
          pass: false,
          reason: `${want.name}-এর image ${want.image} হওয়ার কথা`,
        };
      if (want.ports !== undefined) {
        for (const p of want.ports) {
          const has = c.ports.some(
            (cp) => cp.host === p.host && cp.container === p.container,
          );
          if (!has)
            return {
              pass: false,
              reason: `${want.name}-এ ${p.host}:${p.container} port mapping নেই`,
            };
        }
      }
    }
  }
  if (check.k8sResources) {
    for (const want of check.k8sResources) {
      const ns = want.namespace ?? "default";
      const res =
        ctx.result.state.k8s.resources[`${ns}/${want.kind}/${want.name}`];
      if (want.exists === false) {
        if (res)
          return { pass: false, reason: `${want.kind}/${want.name} এখনো আছে` };
        continue;
      }
      if (!res)
        return {
          pass: false,
          reason: `${want.kind}/${want.name} এখনো তৈরি হয়নি`,
        };
      if (want.replicas !== undefined && res.replicas !== want.replicas)
        return {
          pass: false,
          reason: `${want.name}-এর replicas ${want.replicas} হওয়ার কথা (এখন ${res.replicas})`,
        };
    }
  }
  if (check.netIfaceState) {
    for (const want of check.netIfaceState) {
      const stack =
        want.context && want.context !== "host"
          ? ctx.result.state.netns[want.context]
          : ctx.result.state.network;
      const iface = stack?.interfaces[want.name];
      if (!iface)
        return { pass: false, reason: `${want.name} interface-টা এখনো নেই` };
      if (want.state !== undefined && iface.state !== want.state)
        return {
          pass: false,
          reason: `${want.name}-এর state ${want.state} হওয়ার কথা (এখন ${iface.state})`,
        };
      if (
        want.hasAddress !== undefined &&
        !iface.addresses.some((a) => a.cidr === want.hasAddress)
      )
        return {
          pass: false,
          reason: `${want.name}-এ ${want.hasAddress} address নেই`,
        };
      if (want.master !== undefined && iface.master !== want.master)
        return {
          pass: false,
          reason: `${want.name}-কে এখনো ${want.master} bridge-এ যোগ করোনি`,
        };
    }
  }
  if (check.routeExists) {
    for (const want of check.routeExists) {
      const stack =
        want.context && want.context !== "host"
          ? ctx.result.state.netns[want.context]
          : ctx.result.state.network;
      const route = stack?.routes.find(
        (r) =>
          r.dest === want.dest &&
          (want.via === undefined || r.via === want.via) &&
          (want.dev === undefined || r.dev === want.dev),
      );
      if (want.exists === false) {
        if (route)
          return { pass: false, reason: `${want.dest}-এর route এখনো আছে` };
        continue;
      }
      if (!route)
        return { pass: false, reason: `${want.dest}-এর route এখনো তৈরি হয়নি` };
    }
  }
  if (check.netnsExists) {
    for (const name of check.netnsExists) {
      if (!ctx.result.state.netns[name])
        return {
          pass: false,
          reason: `${name} network namespace এখনো তৈরি হয়নি`,
        };
    }
  }
  if (check.ufwState) {
    const ufw = ctx.result.state.firewall.ufw;
    const want = check.ufwState;
    if (want.enabled !== undefined && ufw.enabled !== want.enabled)
      return {
        pass: false,
        reason: want.enabled
          ? "ufw এখনো enable করোনি"
          : "ufw এখনো disable করোনি",
      };
    if (
      want.defaultIncoming !== undefined &&
      ufw.defaultIncoming !== want.defaultIncoming
    )
      return {
        pass: false,
        reason: `default incoming policy ${want.defaultIncoming} হওয়ার কথা`,
      };
    if (
      want.defaultOutgoing !== undefined &&
      ufw.defaultOutgoing !== want.defaultOutgoing
    )
      return {
        pass: false,
        reason: `default outgoing policy ${want.defaultOutgoing} হওয়ার কথা`,
      };
    for (const r of want.ruleExists ?? []) {
      const match = ufw.rules.some(
        (rule) =>
          rule.action === r.action &&
          (r.port === undefined || rule.port === r.port) &&
          (r.from === undefined || rule.from === r.from),
      );
      if (r.exists === false) {
        if (match)
          return { pass: false, reason: "এই rule-টা এখনো আছে, মুছতে হবে" };
        continue;
      }
      if (!match)
        return { pass: false, reason: "এই ufw rule-টা এখনো তৈরি হয়নি" };
    }
  }
  if (check.iptablesRuleExists) {
    for (const want of check.iptablesRuleExists) {
      const chain = ctx.result.state.firewall.iptables.chains[want.chain];
      const match = chain?.rules.some(
        (r) =>
          r.target === want.target &&
          (want.dport === undefined || r.dport === want.dport) &&
          (want.outIface === undefined || r.outIface === want.outIface),
      );
      if (want.exists === false) {
        if (match)
          return { pass: false, reason: `${want.chain}-এ এই rule-টা এখনো আছে` };
        continue;
      }
      if (!match)
        return {
          pass: false,
          reason: `${want.chain}-এ এই rule-টা এখনো তৈরি হয়নি`,
        };
    }
  }
  if (check.sysctlState) {
    for (const want of check.sysctlState) {
      const value = ctx.result.state.sysctl[want.key];
      if (value !== want.value)
        return {
          pass: false,
          reason: `${want.key}-এর মান এখনো ${want.value} করোনি`,
        };
    }
  }
  if (check.mininetFlowExists) {
    const mn = ctx.result.state.mininet;
    for (const want of check.mininetFlowExists) {
      const sw = mn?.switches[want.switch];
      const match = sw?.flows.some((f) => {
        const actionStr =
          f.action.kind === "output"
            ? f.action.ports.map((p) => `output:${p}`).join(",")
            : f.action.kind;
        if (want.action !== undefined && actionStr !== want.action)
          return false;
        if (want.match) {
          const asRecord: Record<string, string> = {};
          if (f.match.inPort !== undefined)
            asRecord.in_port = String(f.match.inPort);
          if (f.match.dlSrc) asRecord.dl_src = f.match.dlSrc;
          if (f.match.dlDst) asRecord.dl_dst = f.match.dlDst;
          if (f.match.dlType) asRecord.dl_type = f.match.dlType;
          if (f.match.nwProto !== undefined)
            asRecord.nw_proto = String(f.match.nwProto);
          if (f.match.nwSrc) asRecord.nw_src = f.match.nwSrc;
          if (f.match.nwDst) asRecord.nw_dst = f.match.nwDst;
          if (f.match.tpDst !== undefined)
            asRecord.tp_dst = String(f.match.tpDst);
          for (const [k, v] of Object.entries(want.match)) {
            if (asRecord[k] !== v) return false;
          }
        }
        return true;
      });
      if (want.exists === false) {
        if (match)
          return {
            pass: false,
            reason: `${want.switch}-এ এই flow-টা এখনো আছে`,
          };
        continue;
      }
      if (!match)
        return {
          pass: false,
          reason: `${want.switch}-এ এই flow-টা এখনো তৈরি হয়নি`,
        };
    }
  }
  if (check.mininetReachable) {
    const mn = ctx.result.state.mininet;
    for (const want of check.mininetReachable) {
      const actual = mn ? mininetReachable(mn, want.from, want.to) : false;
      if (actual !== want.reachable)
        return {
          pass: false,
          reason: want.reachable
            ? `${want.from} থেকে ${want.to}-এ এখনো পৌঁছানো যাচ্ছে না`
            : `${want.from} থেকে ${want.to}-এ এখনো পৌঁছানো যাচ্ছে (isolate হওয়ার কথা ছিল)`,
        };
    }
  }
  if (check.socketExists) {
    for (const want of check.socketExists) {
      const match = ctx.result.state.sockets.some(
        (s) =>
          s.localPort === want.localPort &&
          (want.proto === undefined || s.proto === want.proto) &&
          (want.state === undefined || s.state === want.state),
      );
      if (want.exists === false) {
        if (match)
          return {
            pass: false,
            reason: `পোর্ট ${want.localPort}-এ এখনো socket আছে`,
          };
        continue;
      }
      if (!match)
        return {
          pass: false,
          reason: `পোর্ট ${want.localPort}-এ এখনো কোনো socket নেই`,
        };
    }
  }
  return { pass: true };
}

/**
 * Spec format for interactive lab exams.
 * A poridhi lab gets one at lib/lab-exam/data/<labId>.json —
 * loaded server-side and rendered via <LabExam /> when present.
 */

/** A node the exam expects the learner to create (drives the tree viz) */
export interface LabExamTarget {
  /** Path with ~ allowed, e.g. "~/code/lab/projects/website" */
  path: string;
  type: "dir" | "file";
  /** Required file content (exact match) for file targets */
  content?: string;
  /** Expected octal permission, e.g. "775" — shows a badge that turns green */
  mode?: string;
  /** Expected owner user */
  owner?: string;
  /** Expected owning group */
  group?: string;
  /** Expected ACL entries (setfacl), each must be present */
  acl?: { kind: "u" | "g"; name: string; perms: string }[];
}

export interface LabExamCheck {
  /** All of these must exist (with matching content) after the command */
  paths?: LabExamTarget[];
  /** The shell's cwd must equal this path after the command */
  cwd?: string;
  /** Command output must equal the output of this reference command */
  ref?: string;
  /** Tokens that must appear in the typed command ("-x" = flag letter) */
  require?: string[];
  /** Tokens that must NOT appear in the typed command */
  forbid?: string[];
  /** For cd tasks: the path argument must be written in this style */
  style?: "relative" | "absolute";
  /** These groups must exist after the command */
  groupsExist?: string[];
  /** These groups must NOT exist after the command (e.g. after groupdel) */
  groupsNotExist?: string[];
  /** Expected permission/ownership of paths after the command */
  pathModes?: {
    path: string;
    mode?: string;
    owner?: string;
    group?: string;
    /** Expected ACL entries (setfacl), each must be present */
    acl?: { kind: "u" | "g"; name: string; perms: string }[];
  }[];
  /** Expected state of users after the command */
  usersState?: {
    name: string;
    /** set false to require the user to be deleted */
    exists?: boolean;
    /** required primary group */
    primary?: string;
    /** must be a member (primary or supplementary) of each */
    inGroups?: string[];
    /** must NOT be a member of any of these */
    notInGroups?: string[];
    locked?: boolean;
    /** /home/<name> must exist (true) or not (false) */
    hasHome?: boolean;
    /** required login shell, e.g. "/bin/bash" */
    shell?: string;
    /** required GECOS/comment field */
    comment?: string;
    /** required home directory path */
    home?: string;
    /** required UID */
    uid?: number;
    /** required account expiration date, as typed (e.g. "2025-12-31") */
    expire?: string;
    /** required chage max-days value */
    maxDays?: number;
  }[];
  /** Expected state of the (single, global) git repo after the command */
  gitState?: {
    /** `git init` must have been run */
    initialized?: boolean;
    /** current branch name must equal this */
    currentBranch?: string;
    /** these branches must exist (regardless of current branch) */
    branchesExist?: string[];
    /** current branch must have at least this many commits */
    minCommits?: number;
    /** the most recent commit's message on the current branch must equal this */
    lastCommitMessage?: string;
    /** these paths (as typed in the lab, ~-relative ok) must be in the most recent commit's file list */
    lastCommitIncludes?: string[];
    /** these paths must currently be staged (index), not yet committed */
    staged?: string[];
    /** working tree must have nothing staged and nothing modified since last commit */
    clean?: boolean;
  };
  /** Expected docker images after the command */
  dockerImages?: {
    tag: string;
    /** set false to require the image NOT to exist */
    exists?: boolean;
  }[];
  /** Expected docker containers after the command */
  dockerContainers?: {
    name: string;
    /** set false to require the container NOT to exist */
    exists?: boolean;
    status?: "running" | "exited";
    image?: string;
    ports?: { host: number; container: number }[];
  }[];
  /** Expected kubernetes resources after the command */
  k8sResources?: {
    kind: string;
    name: string;
    /** defaults to "default" */
    namespace?: string;
    /** set false to require the resource NOT to exist */
    exists?: boolean;
    replicas?: number;
  }[];
  /** Expected network interface state, host stack or inside a netns */
  netIfaceState?: {
    name: string;
    /** "host" (default) or a netns name */
    context?: string;
    state?: "up" | "down";
    /** a CIDR this interface must have an address matching */
    hasAddress?: string;
  }[];
  /** Expected routing table entries */
  routeExists?: {
    /** "default" or a CIDR */
    dest: string;
    via?: string;
    dev?: string;
    context?: string;
    /** set false to require this route NOT to exist */
    exists?: boolean;
  }[];
  /** These network namespaces must exist */
  netnsExists?: string[];
  /** Expected sockets in the ss/netstat table */
  socketExists?: {
    localPort: number;
    proto?: "tcp" | "udp";
    state?: string;
    /** set false to require no matching socket exists */
    exists?: boolean;
  }[];
  /** Expected ufw firewall state */
  ufwState?: {
    enabled?: boolean;
    defaultIncoming?: "allow" | "deny";
    defaultOutgoing?: "allow" | "deny";
    ruleExists?: {
      action: "allow" | "deny";
      port?: string;
      from?: string;
      /** set false to require this rule NOT to exist */
      exists?: boolean;
    }[];
  };
  /** Expected iptables rules */
  iptablesRuleExists?: {
    chain: string;
    target: "ACCEPT" | "DROP" | "REJECT" | "LOG";
    dport?: string;
    /** set false to require no matching rule exists */
    exists?: boolean;
  }[];
}

export interface LabExamTask {
  id: string;
  points: number;
  /** What to do (Bengali) — never contains the command itself */
  prompt: string;
  check: LabExamCheck;
  /**
   * Progressive nudges, vaguest first. Revealed one at a time via the "Tips"
   * button; the first one also auto-shows after 2 failed attempts. Never the
   * literal answer command.
   */
  hints?: string[];
  /** The literal correct command — only ever shown after 10 failed attempts. */
  answer?: string;
  /** Starts a new lab section: shown as a header + explanation above the task */
  section?: { title: string; note?: string };
}

/** One group box in the users/groups visualization panel */
export interface LabExamGroupTarget {
  group: string;
  /** users expected to become members of this group */
  users: string[];
}

export interface LabExamSpec {
  labId: string;
  title: string;
  /** Score (out of 100) needed to pass */
  passPercent: number;
  intro: string;
  /** Every node of the target structure, used for the tree visualization */
  targets: LabExamTarget[];
  /** Groups/users panel targets (user-management labs) */
  groupTargets?: LabExamGroupTarget[];
  tasks: LabExamTask[];
}

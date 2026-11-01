/**
 * A small, resumable bash-script interpreter layered on top of engine.ts's
 * single-command dispatcher. Not real bash — it supports exactly the subset
 * the "Bash Scripting & Automation" labs teach: variables (scalar/indexed
 * array/associative array), parameter expansion, arithmetic, command and
 * here-doc/here-string substitution, if/for/while/until, functions, and an
 * interactive `read` that can pause mid-script (see `PendingBashRead`).
 *
 * Dependency-injected (via `BashHost`) rather than importing engine.ts's
 * runtime values directly, so this file only ever needs `import type` from
 * engine.ts — no runtime circular import between the two modules.
 */
import type { ExecResult, FsNode, ShellState } from "./engine";

export interface BashHost {
  execute: (
    state: ShellState,
    input: string,
    initialStdin?: string,
  ) => ExecResult;
  resolvePath: (cwd: string, raw: string) => string;
  hasPerm: (
    state: ShellState,
    node: FsNode,
    user: string,
    action: "r" | "w" | "x",
  ) => boolean;
  currentUser: (state: ShellState) => string;
  nodeMode: (node: FsNode) => string;
}

export interface BashVar {
  kind: "scalar" | "indexed" | "assoc";
  value?: string;
  items?: Record<string, string>;
  readonly?: boolean;
  exported?: boolean;
}

export type BashScope = Record<string, BashVar>;

/** Resumable state for an interactive `read` mid-script — stored in ShellState.pendingInput. */
export interface PendingBashRead {
  kind: "bash-read";
  source: string;
  ip: number;
  scopes: BashScope[];
  callStack: number[];
  positional: string[];
  scriptName: string;
  varName?: string;
  arrName?: string;
  ifs: string;
  randomSeed: number;
}

// ─── AST ────────────────────────────────────────────────────────────────

type Stmt =
  | { t: "cmd"; text: string; heredoc?: string }
  | { t: "assign"; name: string; expr: string; modifier: Modifier }
  | { t: "arrayAssign"; name: string; itemsRaw: string; modifier: Modifier }
  | { t: "arrayAppend"; name: string; itemsRaw: string }
  | { t: "arrayIndexAssign"; name: string; indexRaw: string; expr: string }
  | { t: "arrayUnset"; name: string; indexRaw: string }
  | { t: "declare"; name: string; assoc: boolean }
  | {
      t: "if";
      branches: { condRaw: string; body: Stmt[] }[];
      elseBody?: Stmt[];
    }
  | { t: "for"; varName: string; itemsRaw: string; body: Stmt[] }
  | { t: "while"; condRaw: string; body: Stmt[] }
  | { t: "until"; condRaw: string; body: Stmt[] }
  | { t: "break" }
  | { t: "continue" }
  | { t: "funcDef"; name: string; body: Stmt[] }
  | { t: "return"; codeRaw?: string }
  | { t: "read"; raw: string }
  | { t: "arith"; expr: string };

type Modifier = "plain" | "local" | "readonly" | "export";

// ─── Bytecode ───────────────────────────────────────────────────────────

type Instr =
  | { op: "cmd"; text: string; heredoc?: string }
  | { op: "assign"; name: string; expr: string; modifier: Modifier }
  | { op: "arrayAssign"; name: string; itemsRaw: string; modifier: Modifier }
  | { op: "arrayAppend"; name: string; itemsRaw: string }
  | { op: "arrayIndexAssign"; name: string; indexRaw: string; expr: string }
  | { op: "arrayUnset"; name: string; indexRaw: string }
  | { op: "declare"; name: string; assoc: boolean }
  | { op: "jumpIfFalse"; condRaw: string; target: number }
  | { op: "jump"; target: number }
  | { op: "read"; raw: string }
  | { op: "arith"; expr: string }
  | { op: "funcDef"; name: string; bodyStart: number; skipTo: number }
  | { op: "return"; codeRaw?: string }
  | { op: "callReturn" }
  | { op: "nop" };

interface FuncTable {
  [name: string]: { bodyStart: number };
}

// ─── Parser: script text -> lines -> Stmt[] ────────────────────────────

/**
 * Strips an unquoted trailing `# comment`, honoring quote state AND
 * `${...}`/`$((...))` nesting — a `#` inside `${#varname}` or similar is
 * part of the expansion, never a comment.
 */
function stripTrailingComment(line: string): string {
  let out = "";
  let quote: string | null = null;
  let depth = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      out += c;
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      out += c;
      continue;
    }
    if ((c === "{" || c === "(") && line[i - 1] === "$") {
      depth++;
      out += c;
      continue;
    }
    if ((c === "}" || c === ")") && depth > 0) {
      depth--;
      out += c;
      continue;
    }
    if (c === "#" && depth === 0) break;
    out += c;
  }
  return out;
}

/** Depth change an unquoted `(`/`)` contributes, tracking quote state across the whole line. */
function parenDelta(line: string): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(") depth++;
    else if (c === ")") depth--;
  }
  return depth;
}

/**
 * Preprocesses raw script source into logical lines: strips the shebang,
 * blank lines and full-line comments; merges heredoc bodies and multi-line
 * array literals (unbalanced parens) into their owning line.
 */
function preprocessLines(source: string): string[] {
  const raw = source.split("\n");
  const out: string[] = [];
  let i = 0;
  if (raw[0]?.trim().startsWith("#!")) i = 1;
  for (; i < raw.length; i++) {
    const stripped = stripTrailingComment(raw[i]);
    if (!stripped.trim()) continue;
    if (stripped.trim().startsWith("#")) continue;

    const heredocMatch = stripped.match(/<<(?!<)-?\s*(['"]?)(\w+)\1/);
    if (heredocMatch) {
      const delim = heredocMatch[2];
      // the `<< DELIM` marker can appear anywhere on the line (e.g.
      // `cat << EOF > out.txt`, not just at the end) — drop just the marker
      // itself, keeping whatever comes before and after it.
      const before = stripped.slice(0, heredocMatch.index);
      const after = stripped.slice(
        (heredocMatch.index ?? 0) + heredocMatch[0].length,
      );
      const cmdPart = (before + after).trim();
      const body: string[] = [];
      i++;
      while (i < raw.length && raw[i].trim() !== delim) {
        body.push(raw[i]);
        i++;
      }
      // encode the heredoc body into the line using a sentinel the statement
      // parser recognizes, since Stmt carries it as a separate `heredoc` field
      out.push(`${cmdPart}${HEREDOC_SENTINEL}${body.join("\n")}`);
      continue;
    }

    let merged = stripped;
    let depth = parenDelta(merged);
    while (depth > 0 && i + 1 < raw.length) {
      i++;
      const next = stripTrailingComment(raw[i]);
      merged += "\n" + next;
      depth += parenDelta(next);
    }
    out.push(merged);
  }
  return out;
}

function firstWord(line: string): string {
  const m = line.trim().match(/^([^\s]+)/);
  return m ? m[1] : "";
}

const HEREDOC_SENTINEL = "\u0000HEREDOC\u0000";

/** Splits `cmdline\u0000HEREDOC\u0000body` back into its parts, if present. */
function splitHeredocLine(line: string): { text: string; heredoc?: string } {
  const idx = line.indexOf(HEREDOC_SENTINEL);
  if (idx === -1) return { text: line };
  return {
    text: line.slice(0, idx),
    heredoc: line.slice(idx + HEREDOC_SENTINEL.length),
  };
}

const BLOCK_STOP = new Set(["elif", "else", "fi", "done", "}"]);

function parseBlock(
  lines: string[],
  i: number,
): { stmts: Stmt[]; nextI: number } {
  const stmts: Stmt[] = [];
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    const fw = firstWord(trimmed);
    if (BLOCK_STOP.has(fw)) return { stmts, nextI: i };

    if (fw === "if") {
      const r = parseIf(lines, i);
      stmts.push(r.stmt);
      i = r.nextI;
      continue;
    }
    if (fw === "for") {
      const r = parseFor(lines, i);
      stmts.push(r.stmt);
      i = r.nextI;
      continue;
    }
    if (fw === "while" || fw === "until") {
      const r = parseWhileUntil(lines, i, fw);
      stmts.push(r.stmt);
      i = r.nextI;
      continue;
    }
    if (
      /^(?:function\s+)?[\w-]+\s*\(\)\s*\{?\s*$/.test(trimmed) ||
      /^function\s+[\w-]+\s*\{?\s*$/.test(trimmed)
    ) {
      const r = parseFunc(lines, i);
      stmts.push(r.stmt);
      i = r.nextI;
      continue;
    }
    if (fw === "break") {
      stmts.push({ t: "break" });
      i++;
      continue;
    }
    if (fw === "continue") {
      stmts.push({ t: "continue" });
      i++;
      continue;
    }
    if (fw === "return") {
      const rest = trimmed.slice("return".length).trim();
      stmts.push({ t: "return", codeRaw: rest || undefined });
      i++;
      continue;
    }
    if (/^\(\(.*\)\)$/.test(trimmed)) {
      stmts.push({ t: "arith", expr: trimmed.slice(2, -2) });
      i++;
      continue;
    }
    // `VAR=value read ...` — a command-scoped env-var prefix (the only form
    // of this bash idiom these labs use). Real bash only sets VAR for the
    // duration of that one command; these labs never check it reverts
    // afterward, so a plain persistent assignment ahead of the read is an
    // adequate simplification.
    const prefixedRead = trimmed.match(
      /^([A-Za-z_]\w*)=((?:"[^"]*")|(?:'[^']*')|(?:\S+))\s+(read\b.*)$/,
    );
    if (prefixedRead) {
      stmts.push({
        t: "assign",
        name: prefixedRead[1],
        expr: prefixedRead[2],
        modifier: "plain",
      });
      stmts.push({ t: "read", raw: prefixedRead[3].trim() });
      i++;
      continue;
    }
    if (fw === "read") {
      stmts.push({ t: "read", raw: trimmed });
      i++;
      continue;
    }
    if (fw === "unset") {
      const m = trimmed.match(/^unset\s+([\w-]+)\[(.+)\]$/);
      if (m) {
        stmts.push({ t: "arrayUnset", name: m[1], indexRaw: m[2] });
        i++;
        continue;
      }
    }
    if (fw === "declare") {
      const m = trimmed.match(/^declare\s+-([aA])\s+([\w-]+)(?:=(.*))?$/);
      if (m) {
        const [, flag, name, valuePart] = m;
        if (valuePart !== undefined) {
          const trimmedVal = valuePart.trim();
          const inner =
            trimmedVal.startsWith("(") && trimmedVal.endsWith(")")
              ? trimmedVal.slice(1, -1)
              : trimmedVal;
          stmts.push({
            t: "arrayAssign",
            name,
            itemsRaw: inner,
            modifier: "plain",
          });
        } else {
          stmts.push({ t: "declare", name, assoc: flag === "A" });
        }
        i++;
        continue;
      }
    }

    const assignResult = parseAssignmentLine(trimmed);
    if (assignResult) {
      stmts.push(assignResult);
      i++;
      continue;
    }

    const { text, heredoc } = splitHeredocLine(line);
    stmts.push({ t: "cmd", text: text.trim(), heredoc });
    i++;
  }
  return { stmts, nextI: i };
}

/** Recognizes every assignment-ish statement form on a single (already-merged) line. */
function parseAssignmentLine(trimmed: string): Stmt | null {
  let modifier: Modifier = "plain";
  let rest = trimmed;
  const modMatch = rest.match(/^(local|readonly|export)\s+([\s\S]+)$/);
  if (modMatch) {
    modifier = modMatch[1] as Modifier;
    rest = modMatch[2];
  }

  // name+=(...)
  let m = rest.match(/^([\w-]+)\+=\(([\s\S]*)\)$/);
  if (m) return { t: "arrayAppend", name: m[1], itemsRaw: m[2] };

  // name[idx]=value
  m = rest.match(/^([\w-]+)\[(.+?)\]=(.*)$/);
  if (m)
    return { t: "arrayIndexAssign", name: m[1], indexRaw: m[2], expr: m[3] };

  // name=(...)  -- array literal (possibly multi-line, already merged)
  m = rest.match(/^([\w-]+)=\(([\s\S]*)\)$/);
  if (m) return { t: "arrayAssign", name: m[1], itemsRaw: m[2], modifier };

  // plain scalar: name=value (value may be empty, quoted, or contain spaces if quoted)
  m = rest.match(/^([A-Za-z_]\w*)=([\s\S]*)$/);
  if (m) return { t: "assign", name: m[1], expr: m[2], modifier };

  // bare `readonly NAME` / `export NAME` / `local NAME` (no value) — rare, harmless to support
  if (modifier !== "plain" && /^[\w-]+$/.test(rest.trim())) {
    return { t: "assign", name: rest.trim(), expr: "", modifier };
  }

  return null;
}

function extractInlineKeyword(
  line: string,
  kw: string,
): { head: string; hasInline: boolean } {
  const re = new RegExp(`;\\s*${kw}\\s*$`);
  if (re.test(line)) return { head: line.replace(re, ""), hasInline: true };
  const re2 = new RegExp(`\\s+${kw}\\s*$`);
  if (re2.test(line) && line.trim() !== kw)
    return { head: line.replace(re2, ""), hasInline: true };
  return { head: line, hasInline: false };
}

function parseIf(lines: string[], i: number): { stmt: Stmt; nextI: number } {
  let line = lines[i].trim();
  const { head, hasInline } = extractInlineKeyword(line, "then");
  let condRaw = head.replace(/^if\s+/, "").trim();
  i++;
  if (!hasInline) {
    while (lines[i].trim() === "") i++;
    i++; // consume "then"
  }
  const branches: { condRaw: string; body: Stmt[] }[] = [];
  let elseBody: Stmt[] | undefined;
  let curCond = condRaw;
  for (;;) {
    const { stmts, nextI } = parseBlock(lines, i);
    branches.push({ condRaw: curCond, body: stmts });
    i = nextI;
    const fw = firstWord(lines[i]);
    if (fw === "elif") {
      line = lines[i].trim();
      const r = extractInlineKeyword(line, "then");
      curCond = r.head.replace(/^elif\s+/, "").trim();
      i++;
      if (!r.hasInline) {
        while (lines[i].trim() === "") i++;
        i++;
      }
      continue;
    }
    if (fw === "else") {
      i++;
      const r2 = parseBlock(lines, i);
      elseBody = r2.stmts;
      i = r2.nextI;
      // consume "fi"
      i++;
      break;
    }
    if (fw === "fi") {
      i++;
      break;
    }
    break;
  }
  return { stmt: { t: "if", branches, elseBody }, nextI: i };
}

function parseFor(lines: string[], i: number): { stmt: Stmt; nextI: number } {
  const line = lines[i].trim();
  const { head, hasInline } = extractInlineKeyword(line, "do");
  const m = head.match(/^for\s+([\w-]+)\s+in\s+([\s\S]+)$/);
  const varName = m ? m[1] : "_";
  const itemsRaw = m ? m[2].trim() : "";
  i++;
  if (!hasInline) {
    while (lines[i].trim() === "") i++;
    i++;
  }
  const { stmts, nextI } = parseBlock(lines, i);
  i = nextI;
  i++; // consume "done"
  return { stmt: { t: "for", varName, itemsRaw, body: stmts }, nextI: i };
}

function parseWhileUntil(
  lines: string[],
  i: number,
  kind: "while" | "until",
): { stmt: Stmt; nextI: number } {
  const line = lines[i].trim();
  const { head, hasInline } = extractInlineKeyword(line, "do");
  const condRaw = head.replace(new RegExp(`^${kind}\\s+`), "").trim();
  i++;
  if (!hasInline) {
    while (lines[i].trim() === "") i++;
    i++;
  }
  const { stmts, nextI } = parseBlock(lines, i);
  i = nextI;
  i++; // consume "done"
  return {
    stmt:
      kind === "while"
        ? { t: "while", condRaw, body: stmts }
        : { t: "until", condRaw, body: stmts },
    nextI: i,
  };
}

function parseFunc(lines: string[], i: number): { stmt: Stmt; nextI: number } {
  const line = lines[i].trim();
  const m =
    line.match(/^(?:function\s+)?([\w-]+)\s*\(\)\s*\{?\s*$/) ||
    line.match(/^function\s+([\w-]+)\s*\{?\s*$/);
  const name = m ? m[1] : "_";
  const hasInlineBrace = /\{\s*$/.test(line);
  i++;
  if (!hasInlineBrace) {
    while (lines[i].trim() === "") i++;
    i++; // consume "{"
  }
  const { stmts, nextI } = parseBlock(lines, i);
  i = nextI;
  i++; // consume "}"
  return { stmt: { t: "funcDef", name, body: stmts }, nextI: i };
}

function parseScript(source: string): Stmt[] {
  const lines = preprocessLines(source);
  return parseBlock(lines, 0).stmts;
}

// ─── Compiler: Stmt[] -> Instr[] ───────────────────────────────────────

function compile(stmts: Stmt[]): { instrs: Instr[]; funcs: FuncTable } {
  const instrs: Instr[] = [];
  const funcs: FuncTable = {};
  const loopStack: { startLabel: number; endPatchSites: number[] }[] = [];

  function emit(instr: Instr): number {
    instrs.push(instr);
    return instrs.length - 1;
  }

  function compileBlock(block: Stmt[]) {
    for (const s of block) compileStmt(s);
  }

  function compileStmt(s: Stmt) {
    switch (s.t) {
      case "cmd":
        emit({ op: "cmd", text: s.text, heredoc: s.heredoc });
        return;
      case "assign":
        emit({
          op: "assign",
          name: s.name,
          expr: s.expr,
          modifier: s.modifier,
        });
        return;
      case "arrayAssign":
        emit({
          op: "arrayAssign",
          name: s.name,
          itemsRaw: s.itemsRaw,
          modifier: s.modifier,
        });
        return;
      case "arrayAppend":
        emit({ op: "arrayAppend", name: s.name, itemsRaw: s.itemsRaw });
        return;
      case "arrayIndexAssign":
        emit({
          op: "arrayIndexAssign",
          name: s.name,
          indexRaw: s.indexRaw,
          expr: s.expr,
        });
        return;
      case "arrayUnset":
        emit({ op: "arrayUnset", name: s.name, indexRaw: s.indexRaw });
        return;
      case "declare":
        emit({ op: "declare", name: s.name, assoc: s.assoc });
        return;
      case "read":
        emit({ op: "read", raw: s.raw });
        return;
      case "arith":
        emit({ op: "arith", expr: s.expr });
        return;
      case "if": {
        const endJumps: number[] = [];
        for (const branch of s.branches) {
          const jifIdx = emit({
            op: "jumpIfFalse",
            condRaw: branch.condRaw,
            target: -1,
          });
          compileBlock(branch.body);
          endJumps.push(emit({ op: "jump", target: -1 }));
          (instrs[jifIdx] as { target: number }).target = instrs.length;
        }
        if (s.elseBody) compileBlock(s.elseBody);
        const after = instrs.length;
        for (const j of endJumps)
          (instrs[j] as { target: number }).target = after;
        return;
      }
      case "for": {
        // compiled as: assign iterator var each pass via a synthetic preface
        // handled at runtime by the VM's "for" materialization — represented
        // here as a special cmd-less loop using jumpIfFalse over a sentinel
        // condition the VM recognizes via __forState.
        const startLabel = emit({ op: "nop" });
        const jif = emit({ op: "jumpIfFalse", condRaw: `__for__`, target: -1 });
        loopStack.push({ startLabel, endPatchSites: [] });
        instrForFor.set(jif, {
          varName: s.varName,
          itemsRaw: s.itemsRaw,
          startLabel,
        });
        compileBlock(s.body);
        emit({ op: "jump", target: startLabel });
        const after = instrs.length;
        (instrs[jif] as { target: number }).target = after;
        const frame = loopStack.pop()!;
        for (const site of frame.endPatchSites)
          (instrs[site] as { target: number }).target = after;
        return;
      }
      case "while":
      case "until": {
        const startLabel = emit({ op: "nop" });
        const negate = s.t === "until";
        const condRaw = negate ? `! ( ${s.condRaw} )` : s.condRaw;
        const jif = emit({ op: "jumpIfFalse", condRaw, target: -1 });
        loopStack.push({ startLabel, endPatchSites: [] });
        compileBlock(s.body);
        emit({ op: "jump", target: startLabel });
        const after = instrs.length;
        (instrs[jif] as { target: number }).target = after;
        const frame = loopStack.pop()!;
        for (const site of frame.endPatchSites)
          (instrs[site] as { target: number }).target = after;
        return;
      }
      case "break": {
        const frame = loopStack[loopStack.length - 1];
        if (frame) frame.endPatchSites.push(emit({ op: "jump", target: -1 }));
        return;
      }
      case "continue": {
        const frame = loopStack[loopStack.length - 1];
        if (frame) emit({ op: "jump", target: frame.startLabel });
        return;
      }
      case "funcDef": {
        const bodyStart = instrs.length + 1;
        const skip = emit({
          op: "funcDef",
          name: s.name,
          bodyStart,
          skipTo: -1,
        });
        funcs[s.name] = { bodyStart };
        compileBlock(s.body);
        emit({ op: "callReturn" });
        (instrs[skip] as { skipTo: number }).skipTo = instrs.length;
        return;
      }
      case "return":
        emit({ op: "return", codeRaw: s.codeRaw });
        return;
    }
  }

  compileBlock(stmts);
  return { instrs, funcs };
}

/** Side-table: for-loop jumpIfFalse instruction index -> its loop spec (kept out of Instr so it stays plain-string-only). */
const instrForFor = new Map<
  number,
  { varName: string; itemsRaw: string; startLabel: number }
>();

// ─── Runtime: variable env, expansion, arithmetic, tests ───────────────

interface RunCtx {
  state: ShellState;
  host: BashHost;
  scopes: BashScope[];
  positional: string[];
  scriptName: string;
  exitCode: number;
  randomSeed: number;
  output: string[];
}

function nextRandom(ctx: RunCtx): number {
  ctx.randomSeed = (ctx.randomSeed * 1103515245 + 12345) & 0x7fffffff;
  return ctx.randomSeed % 32768;
}

function findScopeWith(ctx: RunCtx, name: string): BashScope | undefined {
  for (let i = ctx.scopes.length - 1; i >= 0; i--) {
    if (ctx.scopes[i][name] !== undefined) return ctx.scopes[i];
  }
  return undefined;
}

function getVar(ctx: RunCtx, name: string): BashVar | undefined {
  return findScopeWith(ctx, name)?.[name];
}

const SPECIAL_SCALARS: Record<string, (ctx: RunCtx) => string> = {
  HOME: () => "/root",
  USER: (ctx) => ctx.host.currentUser(ctx.state),
  SHELL: () => "/bin/bash",
  PWD: (ctx) => ctx.state.cwd,
  PATH: () => "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  RANDOM: (ctx) => String(nextRandom(ctx)),
};

function getScalar(ctx: RunCtx, name: string): string {
  if (/^\d+$/.test(name)) {
    const idx = Number(name);
    if (idx === 0) return ctx.scriptName;
    return ctx.positional[idx - 1] ?? "";
  }
  if (name === "@" || name === "*") return ctx.positional.join(" ");
  if (name === "#") return String(ctx.positional.length);
  if (name === "?") return String(ctx.exitCode);
  if (name === "$") return "4242";
  if (name === "!") return "4243";
  if (SPECIAL_SCALARS[name]) return SPECIAL_SCALARS[name](ctx);
  const v = getVar(ctx, name);
  if (!v) return "";
  if (v.kind === "scalar") return v.value ?? "";
  return v.items?.["0"] ?? "";
}

function getArrayValues(ctx: RunCtx, name: string): string[] {
  const v = getVar(ctx, name);
  if (!v || !v.items) return [];
  if (v.kind === "indexed") {
    const keys = Object.keys(v.items)
      .map(Number)
      .sort((a, b) => a - b);
    return keys.map((k) => v.items![String(k)]);
  }
  return Object.values(v.items);
}

function getArrayIndices(ctx: RunCtx, name: string): string[] {
  const v = getVar(ctx, name);
  if (!v || !v.items) return [];
  if (v.kind === "indexed") {
    return Object.keys(v.items)
      .map(Number)
      .sort((a, b) => a - b)
      .map(String);
  }
  return Object.keys(v.items);
}

function getArrayLength(ctx: RunCtx, name: string): number {
  return Object.keys(getVar(ctx, name)?.items ?? {}).length;
}

function getArrayElement(ctx: RunCtx, name: string, key: string): string {
  return getVar(ctx, name)?.items?.[key] ?? "";
}

function setScalar(
  ctx: RunCtx,
  name: string,
  value: string,
  modifier: Modifier,
): string | null {
  const existing = getVar(ctx, name);
  if (existing?.readonly && modifier === "plain") {
    return `bash: ${name}: readonly variable`;
  }
  const scope =
    modifier === "local"
      ? ctx.scopes[ctx.scopes.length - 1]
      : existing
        ? findScopeWith(ctx, name)!
        : ctx.scopes[0];
  scope[name] = {
    kind: "scalar",
    value,
    readonly: modifier === "readonly" || existing?.readonly,
    exported: modifier === "export" || existing?.exported,
  };
  return null;
}

/**
 * Removes quote characters from a word, preserving their content — handles
 * both a single outer pair ("5" -> 5) and quotes embedded mid-word
 * (*"is"* -> *is*, as real bash field-splitting produces for a test like
 * `[[ "$str" == *"is"* ]]`).
 */
function stripOuterQuotes(s: string): string {
  const t = s.trim();
  let out = "";
  let quote: string | null = null;
  for (const c of t) {
    if (quote) {
      if (c === quote) quote = null;
      else out += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    out += c;
  }
  return out;
}

/** Splits array-literal inner text ("a" "b" "c" or ["k"]="v" ["k2"]="v2") into word tokens, honoring quotes/whitespace/newlines. */
function splitWords(text: string): string[] {
  const words: string[] = [];
  let cur = "";
  let quote: string | null = null;
  let hasContent = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      cur += c;
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      hasContent = true;
      continue;
    }
    if (/\s/.test(c)) {
      if (hasContent) {
        words.push(cur);
        cur = "";
        hasContent = false;
      }
      continue;
    }
    cur += c;
    hasContent = true;
  }
  if (hasContent) words.push(cur);
  return words;
}

function escapeRegex(s: string): string {
  return s
    .replace(/[.*+?^${}()|[\]\\]/g, (m) =>
      m === "*" ? "\u0000STAR\u0000" : "\\" + m,
    )
    .replace(/\u0000STAR\u0000/g, ".*");
}

function removeSuffixGlob(
  val: string,
  pattern: string,
  longest: boolean,
): string {
  const body = escapeRegex(pattern);
  try {
    const re = new RegExp(`^(${longest ? ".*" : ".*?"})(?:${body})$`);
    const m = val.match(re);
    return m ? m[1] : val;
  } catch {
    return val;
  }
}

// ─── Arithmetic evaluator ───────────────────────────────────────────────

function evalArith(expr: string, ctx: RunCtx): number {
  const trimmed = expr.trim();
  const incDec = trimmed.match(/^(\+\+|--)?([A-Za-z_]\w*)(\+\+|--)?$/);
  if (incDec && (incDec[1] || incDec[3])) {
    const name = incDec[2];
    const cur = Number(getScalar(ctx, name) || "0");
    const next = incDec[1] === "++" || incDec[3] === "++" ? cur + 1 : cur - 1;
    setScalar(ctx, name, String(next), "plain");
    return incDec[1] ? next : cur;
  }
  const substituted = substituteArithVars(trimmed, ctx);
  try {
    return evalArithExpr(substituted);
  } catch {
    return 0;
  }
}

function substituteArithVars(expr: string, ctx: RunCtx): string {
  return expr.replace(/[A-Za-z_]\w*/g, (name) => {
    if (["true", "false"].includes(name)) return name;
    const v = getScalar(ctx, name);
    return v === "" ? "0" : v;
  });
}

/** Tiny recursive-descent arithmetic evaluator: + - * / % ( ) and comparisons. No eval()/Function(). */
function evalArithExpr(src: string): number {
  let i = 0;
  function skip() {
    while (i < src.length && /\s/.test(src[i])) i++;
  }
  function parsePrimary(): number {
    skip();
    if (src[i] === "(") {
      i++;
      const v = parseCompare();
      skip();
      if (src[i] === ")") i++;
      return v;
    }
    if (src[i] === "-") {
      i++;
      return -parsePrimary();
    }
    if (src[i] === "!") {
      i++;
      return parsePrimary() === 0 ? 1 : 0;
    }
    const m = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (!m) return 0;
    i += m[0].length;
    return Number(m[0]);
  }
  function parseTerm(): number {
    let v = parsePrimary();
    for (;;) {
      skip();
      const c = src[i];
      if (c === "*") {
        i++;
        v *= parsePrimary();
      } else if (c === "/") {
        i++;
        const d = parsePrimary();
        v = d === 0 ? 0 : Math.trunc(v / d);
      } else if (c === "%") {
        i++;
        const d = parsePrimary();
        v = d === 0 ? 0 : v % d;
      } else break;
    }
    return v;
  }
  function parseAdd(): number {
    let v = parseTerm();
    for (;;) {
      skip();
      const c = src[i];
      if (c === "+") {
        i++;
        v += parseTerm();
      } else if (c === "-") {
        i++;
        v -= parseTerm();
      } else break;
    }
    return v;
  }
  function parseCompare(): number {
    let v = parseAdd();
    skip();
    const rest = src.slice(i);
    const op = ["<=", ">=", "==", "!=", "<", ">"].find((o) =>
      rest.startsWith(o),
    );
    if (op) {
      i += op.length;
      const rhs = parseAdd();
      switch (op) {
        case "<=":
          return v <= rhs ? 1 : 0;
        case ">=":
          return v >= rhs ? 1 : 0;
        case "==":
          return v === rhs ? 1 : 0;
        case "!=":
          return v !== rhs ? 1 : 0;
        case "<":
          return v < rhs ? 1 : 0;
        case ">":
          return v > rhs ? 1 : 0;
      }
    }
    return v;
  }
  return parseCompare();
}

// ─── Expansion: $var, ${...}, $(...), $((...)) ─────────────────────────

function findMatching(
  text: string,
  start: number,
  open: string,
  close: string,
): number {
  let depth = 1;
  let i = start;
  let quote: string | null = null;
  while (i < text.length) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      i++;
      continue;
    }
    if (text.startsWith(open, i)) {
      depth++;
      i += open.length;
      continue;
    }
    if (text.startsWith(close, i)) {
      depth--;
      i += close.length;
      if (depth === 0) return i;
      continue;
    }
    i++;
  }
  return -1;
}

interface RunCommandFn {
  (
    ctx: RunCtx,
    text: string,
    stdin?: string,
  ): { output: string; error: boolean };
}

function expandDollar(
  text: string,
  i: number,
  ctx: RunCtx,
  runCommand: RunCommandFn,
): [string, number] {
  // $((...)) arithmetic
  if (text.startsWith("$((", i)) {
    const close = findMatching(text, i + 3, "((", "))");
    if (close !== -1) {
      const inner = text.slice(i + 3, close - 2);
      return [String(evalArith(inner, ctx)), close - i];
    }
  }
  // $(...) command substitution
  if (text.startsWith("$(", i)) {
    const close = findMatching(text, i + 2, "(", ")");
    if (close !== -1) {
      const inner = text.slice(i + 2, close - 1);
      const expandedInner = expandText(inner, ctx, runCommand);
      const { output } = runCommand(ctx, expandedInner);
      return [output.replace(/\n+$/, ""), close - i];
    }
  }
  // ${...}
  if (text.startsWith("${", i)) {
    const close = findMatching(text, i + 2, "{", "}");
    if (close !== -1) {
      const spec = text.slice(i + 2, close - 1);
      return [expandBraceExpr(spec, ctx, runCommand), close - i];
    }
  }
  // $name / $0..$9 / $@ $# $? $$ $!
  const m = /^\$([A-Za-z_]\w*|\d|[@#?$!*])/.exec(text.slice(i));
  if (m) {
    return [getScalar(ctx, m[1]), m[0].length];
  }
  return ["$", 1];
}

function expandBraceExpr(
  spec: string,
  ctx: RunCtx,
  runCommand: RunCommandFn,
): string {
  if (spec.startsWith("#")) {
    const rest = spec.slice(1);
    const arrMatch = rest.match(/^([\w-]+)\[@\]$/);
    if (arrMatch) return String(getArrayLength(ctx, arrMatch[1]));
    return String(getScalar(ctx, rest).length);
  }
  if (spec.startsWith("!")) {
    const rest = spec.slice(1);
    const m = rest.match(/^([\w-]+)\[@\]$/);
    if (m) return getArrayIndices(ctx, m[1]).join(" ");
    return "";
  }
  let m = spec.match(/^([\w-]+)\[(.+)\]$/);
  if (m) {
    const [, name, idxRaw] = m;
    if (idxRaw === "@" || idxRaw === "*")
      return getArrayValues(ctx, name).join(" ");
    const idxExpanded = expandText(idxRaw, ctx, runCommand);
    const idxKey = stripOuterQuotes(idxExpanded);
    const v = getVar(ctx, name);
    const key = v?.kind === "indexed" ? String(Number(idxKey)) : idxKey;
    return getArrayElement(ctx, name, key);
  }
  m = spec.match(/^([A-Za-z_]\w*):(-?\d+)(?::(\d+))?$/);
  if (m) {
    const [, name, startStr, lenStr] = m;
    const val = getScalar(ctx, name);
    let start = Number(startStr);
    if (start < 0) start = Math.max(0, val.length + start);
    return lenStr !== undefined
      ? val.substr(start, Number(lenStr))
      : val.slice(start);
  }
  m = spec.match(/^([A-Za-z_]\w*)\/\/([^/]*)\/(.*)$/);
  if (m) {
    const [, name, pat, repl] = m;
    return getScalar(ctx, name).split(pat).join(repl);
  }
  m = spec.match(/^([A-Za-z_]\w*)\/([^/]*)\/(.*)$/);
  if (m) {
    const [, name, pat, repl] = m;
    const val = getScalar(ctx, name);
    const idx = val.indexOf(pat);
    return idx === -1
      ? val
      : val.slice(0, idx) + repl + val.slice(idx + pat.length);
  }
  m = spec.match(/^([A-Za-z_]\w*)%%(.*)$/);
  if (m) return removeSuffixGlob(getScalar(ctx, m[1]), m[2], true);
  m = spec.match(/^([A-Za-z_]\w*)%(.*)$/);
  if (m) return removeSuffixGlob(getScalar(ctx, m[1]), m[2], false);
  m = spec.match(/^([A-Za-z_]\w*)\^\^$/);
  if (m) return getScalar(ctx, m[1]).toUpperCase();
  m = spec.match(/^([A-Za-z_]\w*),,$/);
  if (m) return getScalar(ctx, m[1]).toLowerCase();
  m = spec.match(/^([A-Za-z_]\w*)\^$/);
  if (m) {
    const v = getScalar(ctx, m[1]);
    return v.charAt(0).toUpperCase() + v.slice(1);
  }
  m = spec.match(/^([A-Za-z_]\w*):-(.*)$/);
  if (m) {
    const v = getScalar(ctx, m[1]);
    return v || expandText(m[2], ctx, runCommand);
  }
  m = spec.match(/^([A-Za-z_]\w*)$/);
  if (m) return getScalar(ctx, m[1]);
  return "";
}

function expandText(
  text: string,
  ctx: RunCtx,
  runCommand: RunCommandFn,
): string {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "'") {
      out += c;
      i++;
      while (i < text.length && text[i] !== "'") out += text[i++];
      if (i < text.length) {
        out += text[i];
        i++;
      }
      continue;
    }
    if (c === '"') {
      out += c;
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "$") {
          const [expanded, consumed] = expandDollar(text, i, ctx, runCommand);
          out += expanded;
          i += consumed;
        } else {
          out += text[i];
          i++;
        }
      }
      if (i < text.length) {
        out += text[i];
        i++;
      }
      continue;
    }
    if (c === "$") {
      const [expanded, consumed] = expandDollar(text, i, ctx, runCommand);
      out += expanded;
      i += consumed;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

// ─── `[ ]` / `[[ ]]` test evaluator ─────────────────────────────────────

function globMatch(pattern: string, value: string): boolean {
  const re = new RegExp(
    "^" + pattern.split("*").map(escapeRegex).join(".*") + "$",
  );
  return re.test(value);
}

function evalSingleTest(rawTokens: string[], ctx: RunCtx): boolean {
  const tokens = rawTokens.map((t) => (t === "!" ? t : stripOuterQuotes(t)));
  if (tokens[0] === "!") return !evalSingleTest(rawTokens.slice(1), ctx);
  if (tokens.length === 1) return tokens[0] !== "";
  if (tokens.length === 2) {
    const [op, val] = tokens;
    if (op === "-z") return val === "";
    if (op === "-n") return val !== "";
    if (op === "-f") return !!fsNodeForTest(ctx, val, false);
    if (op === "-d") return !!fsNodeForTest(ctx, val, true);
    if (op === "!") return val === "";
  }
  if (tokens.length === 3) {
    const [a, op, b] = tokens;
    const na = Number(a);
    const nb = Number(b);
    switch (op) {
      case "-gt":
        return na > nb;
      case "-lt":
        return na < nb;
      case "-ge":
        return na >= nb;
      case "-le":
        return na <= nb;
      case "-eq":
        return na === nb;
      case "-ne":
        return na !== nb;
      case "==":
      case "=":
        return b.includes("*") ? globMatch(b, a) : a === b;
      case "!=":
        return b.includes("*") ? !globMatch(b, a) : a !== b;
    }
  }
  return false;
}

let fsNodeForTest: (ctx: RunCtx, path: string, wantDir: boolean) => unknown;

/** True only when `cond` is exactly one `[ ... ]`/`[[ ... ]]` group — i.e. the
 * first bracket's matching close is also the string's last character — not
 * two groups chained with `&&`/`||` (which also happen to start/end with
 * brackets, e.g. `[ a ] && [ b ]`). */
function isSoleBracketGroup(
  cond: string,
  open: string,
  close: string,
): boolean {
  if (!cond.startsWith(open)) return false;
  let depth = 0;
  for (let i = 0; i < cond.length; i++) {
    if (cond.startsWith(open, i)) {
      depth++;
      i += open.length - 1;
      continue;
    }
    if (cond.startsWith(close, i)) {
      depth--;
      i += close.length - 1;
      if (depth === 0) return i === cond.length - 1;
      continue;
    }
  }
  return false;
}

function evalTest(expandedCond: string, ctx: RunCtx): boolean {
  const cond = expandedCond.trim();

  // Chained groups take precedence over single-bracket stripping — a naive
  // startsWith("[")/endsWith("]") check can't tell `[ a ] && [ b ]` apart
  // from a single `[ ... ]`, since both start and end with a bracket.
  if (
    !isSoleBracketGroup(cond, "[[", "]]") &&
    !isSoleBracketGroup(cond, "[", "]")
  ) {
    const andGroups = splitTopLevel(cond, "&&");
    if (andGroups.length > 1)
      return andGroups.every((g) => evalTest(g.trim(), ctx));
    const orGroups = splitTopLevel(cond, "||");
    if (orGroups.length > 1)
      return orGroups.some((g) => evalTest(g.trim(), ctx));
    if (cond === "true") return true;
    if (cond === "false") return false;
    // bare command as a condition (rare in these labs) — treat as truthy if non-empty
    return cond.trim() !== "";
  }

  const isDouble = cond.startsWith("[[");
  const inner = isDouble ? cond.slice(2, -2).trim() : cond.slice(1, -1).trim();
  const andParts = splitTopLevel(inner, "&&");
  if (andParts.length > 1) {
    return andParts.every((p) =>
      isDouble
        ? evalTest(`[[ ${p} ]]`, ctx)
        : evalSingleTest(splitWords(p), ctx),
    );
  }
  const orParts = splitTopLevel(inner, "||");
  if (orParts.length > 1) {
    return orParts.some((p) =>
      isDouble
        ? evalTest(`[[ ${p} ]]`, ctx)
        : evalSingleTest(splitWords(p), ctx),
    );
  }
  return evalSingleTest(splitWords(inner), ctx);
}

function splitTopLevel(text: string, sep: string): string[] {
  const parts: string[] = [];
  let cur = "";
  let quote: string | null = null;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (quote) {
      cur += c;
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      i++;
      continue;
    }
    if (text.startsWith(sep, i)) {
      parts.push(cur.trim());
      cur = "";
      i += sep.length;
      continue;
    }
    cur += c;
    i++;
  }
  parts.push(cur.trim());
  return parts;
}

// ─── VM ──────────────────────────────────────────────────────────────────

interface ForRuntimeState {
  [jifIndex: number]: { values: string[]; pos: number };
}

function expandItemWords(
  itemsRaw: string,
  ctx: RunCtx,
  runCommand: RunCommandFn,
): string[] {
  // "${arr[@]}" / "${!arr[@]}" alone -> array expansion to multiple words
  const arrAt = itemsRaw.match(/^"?\$\{(!?[\w-]+)\[@\]\}"?$/);
  if (arrAt) {
    const spec = arrAt[1];
    if (spec.startsWith("!")) return getArrayIndices(ctx, spec.slice(1));
    return getArrayValues(ctx, spec);
  }
  const brace = itemsRaw.match(/^\{(-?\d+)\.\.(-?\d+)\}$/);
  if (brace) {
    const a = Number(brace[1]);
    const b = Number(brace[2]);
    const out: string[] = [];
    if (a <= b) for (let n = a; n <= b; n++) out.push(String(n));
    else for (let n = a; n >= b; n--) out.push(String(n));
    return out;
  }
  return splitWords(itemsRaw).map((w) =>
    stripOuterQuotes(expandText(w, ctx, runCommand)),
  );
}

function parseArrayLiteral(
  itemsRaw: string,
  ctx: RunCtx,
  runCommand: RunCommandFn,
): { kind: "indexed" | "assoc"; items: Record<string, string> } {
  const words = splitWords(itemsRaw);
  const kvRe = /^\[([\s\S]+)\]=([\s\S]*)$/;
  const isAssoc = words.some((w) => kvRe.test(w));
  const items: Record<string, string> = {};
  if (isAssoc) {
    for (const w of words) {
      const m = w.match(kvRe);
      if (!m) continue;
      const key = stripOuterQuotes(expandText(m[1], ctx, runCommand));
      const val = stripOuterQuotes(expandText(m[2], ctx, runCommand));
      items[key] = val;
    }
    return { kind: "assoc", items };
  }
  words.forEach((w, idx) => {
    items[String(idx)] = stripOuterQuotes(expandText(w, ctx, runCommand));
  });
  return { kind: "indexed", items };
}

function runVM(
  ctx: RunCtx,
  instrs: Instr[],
  funcs: FuncTable,
  startIp: number,
  runCommand: RunCommandFn,
): {
  pausedAt?: { ip: number; varName?: string; arrName?: string; ifs: string };
  output: string;
  error: boolean;
} {
  const callStack: number[] = [];
  const forState: ForRuntimeState = {};
  let ip = startIp;
  let lastError = false;
  // Hard safety cap: a buggy or genuinely-infinite loop in student-written
  // script text must never hang the browser tab (or this test process).
  const MAX_STEPS = 200_000;
  let steps = 0;

  while (ip < instrs.length) {
    if (++steps > MAX_STEPS) {
      ctx.output.push(
        "bash: script aborted — too many steps (possible infinite loop)",
      );
      return { output: ctx.output.join("\n"), error: true };
    }
    const instr = instrs[ip];
    switch (instr.op) {
      case "nop":
        ip++;
        break;

      case "cmd": {
        const expanded = expandText(instr.text, ctx, runCommand);
        const { output, error } = runCommand(ctx, expanded, instr.heredoc);
        if (output) ctx.output.push(output);
        lastError = error;
        ctx.exitCode = error ? 1 : 0;
        ip++;
        break;
      }

      case "assign": {
        const value = expandText(instr.expr, ctx, runCommand);
        const err = setScalar(
          ctx,
          instr.name,
          stripOuterQuotes(value),
          instr.modifier,
        );
        if (err) ctx.output.push(err);
        ip++;
        break;
      }

      case "arrayAssign": {
        const { kind, items } = parseArrayLiteral(
          instr.itemsRaw,
          ctx,
          runCommand,
        );
        const scope =
          instr.modifier === "local"
            ? ctx.scopes[ctx.scopes.length - 1]
            : ctx.scopes[0];
        const existing = getVar(ctx, instr.name);
        scope[instr.name] = {
          kind: existing?.kind === "assoc" ? "assoc" : kind,
          items,
          readonly: instr.modifier === "readonly" || existing?.readonly,
          exported: instr.modifier === "export" || existing?.exported,
        };
        ip++;
        break;
      }

      case "arrayAppend": {
        const v = getVar(ctx, instr.name);
        const words = splitWords(instr.itemsRaw).map((w) =>
          stripOuterQuotes(expandText(w, ctx, runCommand)),
        );
        const items = v?.items ? { ...v.items } : {};
        const base = Object.keys(items).length;
        words.forEach((w, idx) => {
          items[String(base + idx)] = w;
        });
        const scope = findScopeWith(ctx, instr.name) ?? ctx.scopes[0];
        scope[instr.name] = { kind: "indexed", items };
        ip++;
        break;
      }

      case "arrayIndexAssign": {
        const idxExpanded = stripOuterQuotes(
          expandText(instr.indexRaw, ctx, runCommand),
        );
        const value = stripOuterQuotes(expandText(instr.expr, ctx, runCommand));
        const existing = getVar(ctx, instr.name);
        const scope = findScopeWith(ctx, instr.name) ?? ctx.scopes[0];
        const items = existing?.items ? { ...existing.items } : {};
        const key =
          existing?.kind === "assoc"
            ? idxExpanded
            : String(Number(idxExpanded));
        items[key] = value;
        scope[instr.name] = { kind: existing?.kind ?? "indexed", items };
        ip++;
        break;
      }

      case "arrayUnset": {
        const idxExpanded = stripOuterQuotes(
          expandText(instr.indexRaw, ctx, runCommand),
        );
        const scope = findScopeWith(ctx, instr.name);
        if (scope?.[instr.name]?.items) {
          const v = scope[instr.name];
          const key =
            v.kind === "assoc" ? idxExpanded : String(Number(idxExpanded));
          delete v.items![key];
        }
        ip++;
        break;
      }

      case "declare": {
        const scope = ctx.scopes[ctx.scopes.length - 1];
        if (!getVar(ctx, instr.name)) {
          scope[instr.name] = {
            kind: instr.assoc ? "assoc" : "indexed",
            items: {},
          };
        }
        ip++;
        break;
      }

      case "arith": {
        evalArith(instr.expr, ctx);
        ip++;
        break;
      }

      case "jumpIfFalse": {
        if (instr.condRaw === "__for__") {
          const spec = instrForFor.get(ip);
          if (!spec) {
            ip = instr.target;
            break;
          }
          let st = forState[ip];
          if (!st) {
            st = {
              values: expandItemWords(spec.itemsRaw, ctx, runCommand),
              pos: 0,
            };
            forState[ip] = st;
          }
          if (st.pos >= st.values.length) {
            delete forState[ip];
            ip = instr.target;
          } else {
            setScalar(ctx, spec.varName, st.values[st.pos], "plain");
            st.pos++;
            ip++;
          }
          break;
        }
        const negate =
          instr.condRaw.startsWith("! (") && instr.condRaw.endsWith(")");
        const rawCond = negate
          ? instr.condRaw.slice(3, -1).trim()
          : instr.condRaw;
        const expandedCond = expandText(rawCond, ctx, runCommand);
        let truthy = evalTest(expandedCond, ctx);
        if (negate) truthy = !truthy;
        ip = truthy ? ip + 1 : instr.target;
        break;
      }

      case "jump":
        ip = instr.target;
        break;

      case "read": {
        const m = instr.raw.match(/^read\s+(.*)$/);
        const argsRaw = m ? m[1] : "";
        const hereStringMatch = argsRaw.match(/^(.*?)<<<\s*(.+)$/);
        const isArrayRead =
          /(^|\s)-ra?\s/.test(" " + argsRaw + " ") ||
          /(^|\s)-a\s/.test(" " + argsRaw + " ");
        const promptMatch = argsRaw.match(/-p\s+"([^"]*)"|-p\s+'([^']*)'/);
        const prompt = promptMatch
          ? (promptMatch[1] ?? promptMatch[2] ?? "")
          : undefined;

        let argsForName = (hereStringMatch ? hereStringMatch[1] : argsRaw)
          .replace(/-p\s+"[^"]*"|-p\s+'[^']*'/, "")
          .replace(/-ra?\b/g, "")
          .replace(/-a\b/g, "")
          .replace(/-r\b/g, "")
          .trim();
        const varOrArrName = splitWords(argsForName)[0] || "REPLY";

        if (hereStringMatch) {
          const raw = stripOuterQuotes(
            expandText(hereStringMatch[2].trim(), ctx, runCommand),
          );
          const ifs = getScalar(ctx, "IFS") || " ";
          if (isArrayRead) {
            const parts =
              ifs === " " ? raw.trim().split(/\s+/) : raw.split(ifs);
            const items: Record<string, string> = {};
            parts.forEach((p, idx) => (items[String(idx)] = p));
            ctx.scopes[ctx.scopes.length - 1][varOrArrName] = {
              kind: "indexed",
              items,
            };
          } else {
            setScalar(ctx, varOrArrName, raw, "plain");
          }
          ip++;
          break;
        }

        if (prompt) ctx.output.push(prompt);
        return {
          pausedAt: {
            ip,
            varName: isArrayRead ? undefined : varOrArrName,
            arrName: isArrayRead ? varOrArrName : undefined,
            ifs: getScalar(ctx, "IFS") || " ",
          },
          output: ctx.output.join("\n"),
          error: false,
        };
      }

      case "funcDef":
        ip = instr.skipTo;
        break;

      case "return": {
        const code = instr.codeRaw
          ? evalArith(instr.codeRaw, ctx)
          : ctx.exitCode;
        ctx.exitCode = code;
        if (callStack.length) {
          ctx.scopes.pop();
          ip = callStack.pop()!;
        } else {
          ip = instrs.length;
        }
        break;
      }

      case "callReturn": {
        if (callStack.length) {
          ctx.scopes.pop();
          ip = callStack.pop()!;
        } else {
          ip = instrs.length;
        }
        break;
      }
    }

    // function-call interception for "cmd" instructions is handled inside
    // runCommand via the funcs table (see makeRunCommand below), which pushes
    // callStack/ip itself — so nothing further needed here.
    void funcs;
    void callStack;
  }

  return { output: ctx.output.join("\n"), error: lastError };
}

// ─── Public entry points ────────────────────────────────────────────────

function newScalar(value: string): BashVar {
  return { kind: "scalar", value };
}

/** Matches `./<path>` or `bash <path> [args...]` (not `bash -c`), for nested script calls. */
function matchScriptInvocation(
  trimmed: string,
  words: string[],
): { scriptPath: string; args: string[] } | null {
  if (words[0]?.startsWith("./"))
    return { scriptPath: words[0], args: words.slice(1) };
  if (words[0] === "bash" && words[1] && words[1] !== "-c") {
    return { scriptPath: words[1], args: words.slice(2) };
  }
  void trimmed;
  return null;
}

function exportedScopeOf(scope: BashScope): BashScope {
  const out: BashScope = {};
  for (const [k, v] of Object.entries(scope)) if (v.exported) out[k] = v;
  return out;
}

function makeRunCommand(
  host: BashHost,
  funcs: FuncTable,
  instrs: Instr[],
  getStateRef: () => ShellState,
  setStateRef: (s: ShellState) => void,
): RunCommandFn {
  const runCommand: RunCommandFn = (ctx, text, stdin) => {
    const trimmed = text.trim();
    if (!trimmed) return { output: "", error: false };
    const words = splitWords(trimmed).map(stripOuterQuotes);
    const fnName = words[0];

    if (funcs[fnName]) {
      const args = words.slice(1);
      const savedPositional = ctx.positional;
      const savedOutput = ctx.output;
      ctx.positional = args;
      ctx.output = [];
      ctx.scopes.push({});
      const result = runVM(
        ctx,
        instrs,
        funcs,
        funcs[fnName].bodyStart,
        runCommand,
      );
      ctx.scopes.pop();
      ctx.positional = savedPositional;
      const fnOutput = ctx.output.join("\n");
      ctx.output = savedOutput;
      return { output: fnOutput, error: result.error };
    }

    const scriptCall = matchScriptInvocation(trimmed, words);
    if (scriptCall) {
      const state = getStateRef();
      const abs = host.resolvePath(state.cwd, scriptCall.scriptPath);
      const node = state.fs[abs];
      if (!node)
        return {
          output: `bash: ${scriptCall.scriptPath}: No such file or directory`,
          error: true,
        };
      if (node.type === "dir")
        return {
          output: `bash: ${scriptCall.scriptPath}: Is a directory`,
          error: true,
        };
      if (scriptCall.scriptPath.startsWith("./")) {
        const mode = host.nodeMode(node);
        const hasAnyExecBit = [0, 1, 2].some((i) => Number(mode[i]) & 1);
        if (!hasAnyExecBit) {
          return {
            output: `bash: ${scriptCall.scriptPath}: Permission denied`,
            error: true,
          };
        }
      }
      const exported = exportedScopeOf(ctx.scopes[0]);
      const result = runBashScript(
        state,
        node.content ?? "",
        scriptCall.args,
        scriptCall.scriptPath,
        host,
        exported,
      );
      setStateRef(result.state);
      return { output: result.output, error: result.error };
    }

    const state = getStateRef();
    const result = host.execute(state, trimmed, stdin);
    setStateRef(result.state);
    return { output: result.output, error: result.error };
  };
  return runCommand;
}

function scopesToJson(scopes: BashScope[]): BashScope[] {
  return JSON.parse(JSON.stringify(scopes));
}

function buildFsTestHelper(host: BashHost, getStateRef: () => ShellState) {
  return (_ctx: RunCtx, path: string, wantDir: boolean) => {
    const state = getStateRef();
    const abs = host.resolvePath(state.cwd, path);
    const node = state.fs[abs];
    if (!node) return null;
    if (wantDir ? node.type !== "dir" : node.type !== "file") return null;
    return node;
  };
}

export function runBashScript(
  state: ShellState,
  source: string,
  args: string[],
  scriptPath: string,
  host: BashHost,
  exportedFromParent?: BashScope,
): ExecResult {
  let liveState = state;
  const getStateRef = () => liveState;
  const setStateRef = (s: ShellState) => {
    liveState = s;
  };

  fsNodeForTest = buildFsTestHelper(host, getStateRef) as typeof fsNodeForTest;

  const stmts = parseScript(source);
  const { instrs, funcs } = compile(stmts);

  const globalScope: BashScope = exportedFromParent
    ? { ...exportedFromParent }
    : {};
  globalScope.IFS = newScalar(" ");

  const ctx: RunCtx = {
    state: liveState,
    host,
    scopes: [globalScope],
    positional: args,
    scriptName: scriptPath,
    exitCode: 0,
    randomSeed: Date.now() & 0x7fffffff,
    output: [],
  };

  const runCommand = makeRunCommand(
    host,
    funcs,
    instrs,
    getStateRef,
    setStateRef,
  );
  const result = runVM(ctx, instrs, funcs, 0, runCommand);
  ctx.state = liveState;

  if (result.pausedAt) {
    const finalState: ShellState = JSON.parse(JSON.stringify(liveState));
    finalState.pendingInput = {
      kind: "bash-read",
      source,
      ip: result.pausedAt.ip,
      scopes: scopesToJson(ctx.scopes),
      callStack: [],
      positional: args,
      scriptName: scriptPath,
      varName: result.pausedAt.varName,
      arrName: result.pausedAt.arrName,
      ifs: result.pausedAt.ifs,
      randomSeed: ctx.randomSeed,
    } as PendingBashRead;
    return { state: finalState, output: result.output, error: false };
  }

  return { state: liveState, output: result.output, error: result.error };
}

export function resumeBashRead(
  state: ShellState,
  pending: PendingBashRead,
  typedValue: string,
  host: BashHost,
): ExecResult {
  let liveState: ShellState = JSON.parse(JSON.stringify(state));
  const getStateRef = () => liveState;
  const setStateRef = (s: ShellState) => {
    liveState = s;
  };
  fsNodeForTest = buildFsTestHelper(host, getStateRef) as typeof fsNodeForTest;

  const stmts = parseScript(pending.source);
  const { instrs, funcs } = compile(stmts);

  const scopes: BashScope[] = JSON.parse(JSON.stringify(pending.scopes));
  const ctx: RunCtx = {
    state: liveState,
    host,
    scopes,
    positional: pending.positional,
    scriptName: pending.scriptName,
    exitCode: 0,
    randomSeed: pending.randomSeed,
    output: [],
  };

  if (pending.arrName) {
    const ifs = pending.ifs || " ";
    const parts =
      ifs === " " ? typedValue.trim().split(/\s+/) : typedValue.split(ifs);
    const items: Record<string, string> = {};
    parts.forEach((p, idx) => (items[String(idx)] = p));
    ctx.scopes[ctx.scopes.length - 1][pending.arrName] = {
      kind: "indexed",
      items,
    };
  } else if (pending.varName) {
    setScalar(ctx, pending.varName, typedValue, "plain");
  }

  const runCommand = makeRunCommand(
    host,
    funcs,
    instrs,
    getStateRef,
    setStateRef,
  );
  const result = runVM(ctx, instrs, funcs, pending.ip + 1, runCommand);
  ctx.state = liveState;

  if (result.pausedAt) {
    const finalState: ShellState = JSON.parse(JSON.stringify(liveState));
    finalState.pendingInput = {
      kind: "bash-read",
      source: pending.source,
      ip: result.pausedAt.ip,
      scopes: scopesToJson(ctx.scopes),
      callStack: [],
      positional: pending.positional,
      scriptName: pending.scriptName,
      varName: result.pausedAt.varName,
      arrName: result.pausedAt.arrName,
      ifs: result.pausedAt.ifs,
      randomSeed: ctx.randomSeed,
    } as PendingBashRead;
    return { state: finalState, output: result.output, error: false };
  }

  const finalState: ShellState = JSON.parse(JSON.stringify(liveState));
  finalState.pendingInput = undefined;
  return { state: finalState, output: result.output, error: result.error };
}

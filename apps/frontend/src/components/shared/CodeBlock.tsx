"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const SHELL_LANGUAGES = new Set([
  "bash",
  "sh",
  "shell",
  "zsh",
  "console",
  "terminal",
]);

export default function CodeBlock({
  language,
  code,
}: {
  language?: string;
  code: string;
}) {
  const isShell = !language || SHELL_LANGUAGES.has(language.toLowerCase());

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-1.5 bg-[#2d2d2d] px-3 py-2">
        <span className="size-3 rounded-full bg-[#ff5f56]" />
        <span className="size-3 rounded-full bg-[#ffbd2e]" />
        <span className="size-3 rounded-full bg-[#27c93f]" />
        <span className="ml-2 font-mono text-xs text-neutral-400">
          {isShell ? "bash" : language}
        </span>
      </div>
      <SyntaxHighlighter
        language={isShell ? "bash" : language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "1rem",
          fontSize: "0.8125rem",
          background: "#1e1e1e",
        }}
        wrapLongLines
      >
        {code.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
}

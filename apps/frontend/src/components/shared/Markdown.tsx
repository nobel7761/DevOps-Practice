import { isValidElement, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/shared/CodeBlock";

function extractCodeBlock(
  node: ReactNode,
): { language?: string; code: string } | null {
  if (!isValidElement<{ className?: string; children?: ReactNode }>(node)) {
    return null;
  }
  const match = /language-(\w+)/.exec(node.props.className ?? "");
  return { language: match?.[1], code: String(node.props.children ?? "") };
}

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => (
          <h1 className="mt-6 mb-3 text-2xl font-bold first:mt-0" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2
            className="mt-6 mb-3 text-xl font-semibold first:mt-0"
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3 className="mt-5 mb-2 text-lg font-semibold" {...props} />
        ),
        p: ({ ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
        ul: ({ ...props }) => (
          <ul className="mb-3 list-disc space-y-1 pl-6" {...props} />
        ),
        ol: ({ ...props }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-6" {...props} />
        ),
        a: ({ ...props }) => (
          <a
            className="text-primary underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
            {...props}
          />
        ),
        img: ({ ...props }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="my-4 max-w-full rounded-lg border border-border"
            alt={props.alt ?? ""}
            {...props}
          />
        ),
        code: ({ className, children, ...props }) => (
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm" {...props}>
            {children}
          </code>
        ),
        pre: ({ children }) => {
          const block = extractCodeBlock(children);
          if (!block) {
            return (
              <pre className="mb-3 overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                {children}
              </pre>
            );
          }
          return <CodeBlock language={block.language} code={block.code} />;
        },
        blockquote: ({ ...props }) => (
          <blockquote
            className="mb-3 border-l-4 border-border pl-4 text-muted-foreground"
            {...props}
          />
        ),
        table: ({ ...props }) => (
          <div className="mb-3 overflow-x-auto">
            <table className="w-full border-collapse text-sm" {...props} />
          </div>
        ),
        th: ({ ...props }) => (
          <th
            className="border border-border bg-muted px-3 py-2 text-left"
            {...props}
          />
        ),
        td: ({ ...props }) => (
          <td className="border border-border px-3 py-2" {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

import { Fragment } from "react";

/** Renders `backtick` spans in a plain string as <code>, for titles, quiz text and other one-line copy. */
export default function InlineCode({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code
            key={index}
            className="rounded bg-muted px-1 py-0.5 text-[0.9em] break-words [overflow-wrap:anywhere]"
          >
            {part}
          </code>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

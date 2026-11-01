/** Splits a buffered chunk of raw SSE text into complete `data: ...` event payloads, keeping any trailing incomplete event for the next chunk. */
export function parseSseStream(buffer: string): {
  events: string[];
  remainder: string;
} {
  const parts = buffer.split("\n\n");
  const remainder = parts.pop() ?? "";

  const events = parts
    .map((part) =>
      part
        .split("\n")
        .find((line) => line.startsWith("data: "))
        ?.slice("data: ".length),
    )
    .filter((payload): payload is string => payload !== undefined);

  return { events, remainder };
}

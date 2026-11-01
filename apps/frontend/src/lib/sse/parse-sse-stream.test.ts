import { describe, expect, it } from "vitest";
import { parseSseStream } from "./parse-sse-stream";

describe("parseSseStream", () => {
  it("extracts a single complete SSE event and leaves no remainder", () => {
    const { events, remainder } = parseSseStream('data: {"delta":"Hello"}\n\n');
    expect(events).toEqual(['{"delta":"Hello"}']);
    expect(remainder).toBe("");
  });

  it("extracts multiple complete events from one chunk, in order", () => {
    const { events, remainder } = parseSseStream(
      'data: {"delta":"Hello "}\n\ndata: {"delta":"world"}\n\n',
    );
    expect(events).toEqual(['{"delta":"Hello "}', '{"delta":"world"}']);
    expect(remainder).toBe("");
  });

  it("keeps a trailing incomplete event in remainder instead of emitting it", () => {
    const { events, remainder } = parseSseStream(
      'data: {"delta":"Hello"}\n\ndata: {"delta":"wor',
    );
    expect(events).toEqual(['{"delta":"Hello"}']);
    expect(remainder).toBe('data: {"delta":"wor');
  });

  it("combines a remainder with the next chunk into a full event", () => {
    const first = parseSseStream('data: {"delta":"Hel');
    expect(first.events).toEqual([]);
    expect(first.remainder).toBe('data: {"delta":"Hel');

    const second = parseSseStream(first.remainder + 'lo"}\n\n');
    expect(second.events).toEqual(['{"delta":"Hello"}']);
    expect(second.remainder).toBe("");
  });
});

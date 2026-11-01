import { describe, expect, it } from "vitest";
import { createShell, execute } from "./engine";
import type { ShellState } from "./engine";

const DATA = JSON.stringify({
  company: {
    name: "Poridhi",
    address: { city: "Dhaka" },
    employees: [
      { id: 1, name: "Nabil", position: "Junior Software Engineer" },
      { id: 2, name: "Minhaz", position: "Data Scientist" },
    ],
  },
});

function withDataFile(): ShellState {
  const state = createShell();
  state.fs["/root/data.json"] = {
    type: "file",
    content: DATA,
    mode: "644",
    owner: "root",
    group: "root",
  };
  return state;
}

describe("jq", () => {
  it("'.' pretty-prints the whole document", () => {
    const result = execute(withDataFile(), "cat data.json | jq '.'");
    expect(result.error).toBe(false);
    expect(JSON.parse(result.output)).toEqual(JSON.parse(DATA));
  });

  it("dot-path navigation", () => {
    const result = execute(
      withDataFile(),
      "cat data.json | jq '.company.name'",
    );
    expect(result.error).toBe(false);
    expect(result.output).toBe('"Poridhi"');
  });

  it("nested dot-path navigation", () => {
    const result = execute(
      withDataFile(),
      "cat data.json | jq '.company.address.city'",
    );
    expect(result.output).toBe('"Dhaka"');
  });

  it("array iteration with a trailing field", () => {
    const result = execute(
      withDataFile(),
      "cat data.json | jq '.company.employees[].name'",
    );
    expect(result.output).toBe('"Nabil"\n"Minhaz"');
  });

  it("array iteration emitting whole objects", () => {
    const result = execute(
      withDataFile(),
      "cat data.json | jq '.company.employees[]'",
    );
    const blocks = result.output
      .split("\n}\n")
      .map((b, i, arr) => (i < arr.length - 1 ? b + "\n}" : b));
    expect(blocks.length).toBe(2);
    expect(JSON.parse(blocks[0])).toEqual({
      id: 1,
      name: "Nabil",
      position: "Junior Software Engineer",
    });
  });

  it("select() filters a stream by equality", () => {
    const result = execute(
      withDataFile(),
      `cat data.json | jq '.company.employees[] | select(.position == "Junior Software Engineer")'`,
    );
    expect(result.error).toBe(false);
    const parsed = JSON.parse(result.output);
    expect(parsed.name).toBe("Nabil");
  });

  it("select() with no match returns empty output", () => {
    const result = execute(
      withDataFile(),
      `cat data.json | jq '.company.employees[] | select(.position == "CEO")'`,
    );
    expect(result.error).toBe(false);
    expect(result.output).toBe("");
  });

  it("fails cleanly on invalid JSON", () => {
    const state = createShell();
    state.fs["/root/bad.json"] = {
      type: "file",
      content: "{not json",
      mode: "644",
      owner: "root",
      group: "root",
    };
    const result = execute(state, "cat bad.json | jq '.'");
    expect(result.error).toBe(true);
  });
});

describe("date", () => {
  it("supports +FORMAT", () => {
    const result = execute(createShell(), "date +%Y%m%d-%H%M%S");
    expect(result.error).toBe(false);
    expect(result.output).toBe("20260310-220105");
  });

  it("bare date returns a fixed string", () => {
    const result = execute(createShell(), "date");
    expect(result.error).toBe(false);
    expect(result.output.length).toBeGreaterThan(0);
  });
});

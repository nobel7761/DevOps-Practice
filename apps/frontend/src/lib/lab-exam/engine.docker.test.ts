import { describe, expect, it } from "vitest";
import { createShell, evaluateCheck, execute } from "./engine";
import type { ShellState } from "./engine";

function run(state: ShellState, cmd: string) {
  return execute(state, cmd);
}

function runAll(cmds: string[]): ShellState {
  let state = createShell();
  for (const cmd of cmds) {
    state = run(state, cmd).state;
  }
  return state;
}

const DOCKERFILE = [
  "FROM node:20-alpine",
  "COPY . .",
  'CMD ["node", "app.js"]',
].join("\n");

describe("docker build", () => {
  it("fails without a Dockerfile in the build context", () => {
    const result = run(createShell(), "docker build -t myapp .");
    expect(result.error).toBe(true);
  });

  it("succeeds and records an image when a Dockerfile is present", () => {
    const state = runAll([`echo '${DOCKERFILE}' > Dockerfile`]);
    const result = run(state, "docker build -t myapp .");
    expect(result.error).toBe(false);
    expect(result.state.docker.images["myapp:latest"]).toBeDefined();
  });

  it("fails without -t", () => {
    const state = runAll([`echo '${DOCKERFILE}' > Dockerfile`]);
    const result = run(state, "docker build .");
    expect(result.error).toBe(true);
  });
});

describe("docker images", () => {
  it("lists built images", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
    ]);
    const result = run(state, "docker images");
    expect(result.output).toContain("myapp");
  });
});

describe("docker run", () => {
  it("fails on an unbuilt image", () => {
    const result = run(createShell(), "docker run myapp");
    expect(result.error).toBe(true);
  });

  it("creates a running, named container with -d --name", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
    ]);
    const result = run(state, "docker run -d --name web myapp");
    expect(result.error).toBe(false);
    expect(result.state.docker.containers["web"]).toMatchObject({
      image: "myapp:latest",
      status: "running",
    });
  });

  it("fails on a duplicate --name", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
      "docker run -d --name web myapp",
    ]);
    const result = run(state, "docker run -d --name web myapp");
    expect(result.error).toBe(true);
  });

  it("records a -p port mapping on the container", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
    ]);
    const result = run(state, "docker run -d -p 8080:80 --name web myapp");
    expect(result.state.docker.containers["web"].ports).toEqual([
      { host: 8080, container: 80 },
    ]);
  });
});

describe("docker ps", () => {
  function setupRunningAndStopped(): ShellState {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
      "docker run -d --name web myapp",
      "docker run -d --name worker myapp",
      "docker stop worker",
    ]);
    return state;
  }

  it("lists only running containers by default", () => {
    const state = setupRunningAndStopped();
    const result = run(state, "docker ps");
    expect(result.output).toContain("web");
    expect(result.output).not.toContain("worker");
  });

  it("lists running and exited containers with -a", () => {
    const state = setupRunningAndStopped();
    const result = run(state, "docker ps -a");
    expect(result.output).toContain("web");
    expect(result.output).toContain("worker");
  });
});

describe("docker stop/start/rm", () => {
  function setupOneContainer(): ShellState {
    return runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
      "docker run -d --name web myapp",
    ]);
  }

  it("stop marks a container exited without removing it", () => {
    const state = setupOneContainer();
    const result = run(state, "docker stop web");
    expect(result.error).toBe(false);
    expect(result.state.docker.containers["web"].status).toBe("exited");
  });

  it("start marks an exited container running again", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
      "docker run -d --name web myapp",
      "docker stop web",
    ]);
    const result = run(state, "docker start web");
    expect(result.error).toBe(false);
    expect(result.state.docker.containers["web"].status).toBe("running");
  });

  it("rm fails on a running container without -f", () => {
    const state = setupOneContainer();
    const result = run(state, "docker rm web");
    expect(result.error).toBe(true);
  });

  it("rm removes an exited container", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
      "docker run -d --name web myapp",
      "docker stop web",
    ]);
    const result = run(state, "docker rm web");
    expect(result.error).toBe(false);
    expect(result.state.docker.containers["web"]).toBeUndefined();
  });
});

describe("docker logs", () => {
  it("fails for an unknown container", () => {
    const result = run(createShell(), "docker logs nope");
    expect(result.error).toBe(true);
  });

  it("returns output for a known container", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
      "docker run -d --name web myapp",
    ]);
    const result = run(state, "docker logs web");
    expect(result.error).toBe(false);
  });
});

const COMPOSE_FILE = [
  "version: '3'",
  "services:",
  "  web:",
  "    image: myapp:latest",
  "  db:",
  "    image: postgres:16",
].join("\n");

describe("docker compose", () => {
  it("up fails without a docker-compose.yml", () => {
    const result = run(createShell(), "docker compose up");
    expect(result.error).toBe(true);
  });

  it("up creates one running container per service", () => {
    const state = runAll([`echo '${COMPOSE_FILE}' > docker-compose.yml`]);
    const result = run(state, "docker compose up");
    expect(result.error).toBe(false);
    const containers = Object.values(result.state.docker.containers);
    expect(containers).toHaveLength(2);
    expect(containers.every((c) => c.status === "running")).toBe(true);
  });

  it("up -d behaves the same as up for container state", () => {
    const state = runAll([`echo '${COMPOSE_FILE}' > docker-compose.yml`]);
    const result = run(state, "docker compose up -d");
    expect(result.error).toBe(false);
    expect(Object.values(result.state.docker.containers)).toHaveLength(2);
  });

  it("down removes only containers from the current project", () => {
    const state = runAll([
      `echo '${COMPOSE_FILE}' > docker-compose.yml`,
      "docker compose up",
    ]);
    const result = run(state, "docker compose down");
    expect(result.error).toBe(false);
    expect(Object.keys(result.state.docker.containers)).toHaveLength(0);
  });

  it("docker-compose (hyphenated alias) up behaves identically", () => {
    const state = runAll([`echo '${COMPOSE_FILE}' > docker-compose.yml`]);
    const result = run(state, "docker-compose up");
    expect(result.error).toBe(false);
    expect(Object.values(result.state.docker.containers)).toHaveLength(2);
  });
});

describe("evaluateCheck dockerImages/dockerContainers", () => {
  it("passes/fails on dockerImages exists", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
    ]);
    const ctx = {
      input: "docker build -t myapp .",
      prevState: state,
      result: { state, output: "", error: false },
    };

    expect(
      evaluateCheck({ dockerImages: [{ tag: "myapp:latest" }] }, ctx).pass,
    ).toBe(true);
    expect(
      evaluateCheck({ dockerImages: [{ tag: "other:latest" }] }, ctx).pass,
    ).toBe(false);
  });

  it("passes/fails on dockerContainers status", () => {
    const state = runAll([
      `echo '${DOCKERFILE}' > Dockerfile`,
      "docker build -t myapp .",
      "docker run -d --name web myapp",
    ]);
    const ctx = {
      input: "docker run -d --name web myapp",
      prevState: state,
      result: { state, output: "", error: false },
    };

    expect(
      evaluateCheck(
        { dockerContainers: [{ name: "web", status: "running" }] },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        { dockerContainers: [{ name: "web", status: "exited" }] },
        ctx,
      ).pass,
    ).toBe(false);
  });
});

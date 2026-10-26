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

const DEPLOYMENT_YAML = [
  "apiVersion: apps/v1",
  "kind: Deployment",
  "metadata:",
  "  name: web",
  "spec:",
  "  replicas: 3",
].join("\n");

const SERVICE_YAML = [
  "kind: Service",
  "metadata:",
  "  name: web-svc",
  "  namespace: prod",
].join("\n");

const MULTI_DOC_YAML = [
  "kind: Deployment",
  "metadata:",
  "  name: web",
  "---",
  "kind: Service",
  "metadata:",
  "  name: web-svc",
].join("\n");

describe("kubectl apply", () => {
  it("fails without -f", () => {
    const result = run(createShell(), "kubectl apply");
    expect(result.error).toBe(true);
  });

  it("fails for a missing file", () => {
    const result = run(createShell(), "kubectl apply -f missing.yaml");
    expect(result.error).toBe(true);
  });

  it("creates a resource with default namespace and replicas from a single-Deployment manifest", () => {
    const state = runAll([`echo '${DEPLOYMENT_YAML}' > deploy.yaml`]);
    const result = run(state, "kubectl apply -f deploy.yaml");
    expect(result.error).toBe(false);
    const res = result.state.k8s.resources["default/Deployment/web"];
    expect(res).toMatchObject({
      kind: "Deployment",
      name: "web",
      namespace: "default",
      replicas: 3,
    });
  });

  it("respects an explicit namespace", () => {
    const state = runAll([`echo '${SERVICE_YAML}' > svc.yaml`]);
    const result = run(state, "kubectl apply -f svc.yaml");
    expect(result.error).toBe(false);
    expect(result.state.k8s.resources["prod/Service/web-svc"]).toBeDefined();
  });

  it("creates multiple resources from a multi-document manifest", () => {
    const state = runAll([`echo '${MULTI_DOC_YAML}' > multi.yaml`]);
    const result = run(state, "kubectl apply -f multi.yaml");
    expect(result.error).toBe(false);
    expect(result.state.k8s.resources["default/Deployment/web"]).toBeDefined();
    expect(result.state.k8s.resources["default/Service/web-svc"]).toBeDefined();
  });

  it("prints 'configured' on a re-apply of the same resource", () => {
    const state = runAll([
      `echo '${DEPLOYMENT_YAML}' > deploy.yaml`,
      "kubectl apply -f deploy.yaml",
    ]);
    const result = run(state, "kubectl apply -f deploy.yaml");
    expect(result.output).toContain("configured");
  });
});

describe("kubectl get", () => {
  it("lists resources of a kind in the default namespace", () => {
    const state = runAll([
      `echo '${DEPLOYMENT_YAML}' > deploy.yaml`,
      "kubectl apply -f deploy.yaml",
    ]);
    const result = run(state, "kubectl get deployment");
    expect(result.error).toBe(false);
    expect(result.output).toContain("web");
  });

  it("filters by namespace with -n", () => {
    const state = runAll([
      `echo '${SERVICE_YAML}' > svc.yaml`,
      "kubectl apply -f svc.yaml",
    ]);
    const defaultNs = run(state, "kubectl get service");
    expect(defaultNs.output).not.toContain("web-svc");
    const prodNs = run(state, "kubectl get service -n prod");
    expect(prodNs.output).toContain("web-svc");
  });

  it("succeeds with 'No resources found' for zero matches", () => {
    const result = run(createShell(), "kubectl get deployment");
    expect(result.error).toBe(false);
    expect(result.output).toContain("No resources found");
  });

  it("fails for an unsupported resource type", () => {
    const result = run(createShell(), "kubectl get bogus");
    expect(result.error).toBe(true);
  });
});

describe("kubectl describe", () => {
  it("succeeds for an existing resource", () => {
    const state = runAll([
      `echo '${DEPLOYMENT_YAML}' > deploy.yaml`,
      "kubectl apply -f deploy.yaml",
    ]);
    const result = run(state, "kubectl describe deployment web");
    expect(result.error).toBe(false);
    expect(result.output).toContain("web");
  });

  it("fails for a missing resource", () => {
    const result = run(createShell(), "kubectl describe deployment nope");
    expect(result.error).toBe(true);
  });
});

describe("kubectl delete", () => {
  it("-f removes every resource declared in that file", () => {
    const state = runAll([
      `echo '${MULTI_DOC_YAML}' > multi.yaml`,
      "kubectl apply -f multi.yaml",
    ]);
    const result = run(state, "kubectl delete -f multi.yaml");
    expect(result.error).toBe(false);
    expect(
      result.state.k8s.resources["default/Deployment/web"],
    ).toBeUndefined();
    expect(
      result.state.k8s.resources["default/Service/web-svc"],
    ).toBeUndefined();
  });

  it("-f fails if a declared resource was never applied", () => {
    const state = runAll([`echo '${DEPLOYMENT_YAML}' > deploy.yaml`]);
    const result = run(state, "kubectl delete -f deploy.yaml");
    expect(result.error).toBe(true);
  });

  it("<kind> <name> removes a single resource", () => {
    const state = runAll([
      `echo '${DEPLOYMENT_YAML}' > deploy.yaml`,
      "kubectl apply -f deploy.yaml",
    ]);
    const result = run(state, "kubectl delete deployment web");
    expect(result.error).toBe(false);
    expect(
      result.state.k8s.resources["default/Deployment/web"],
    ).toBeUndefined();
  });

  it("<kind> <name> fails for a missing resource", () => {
    const result = run(createShell(), "kubectl delete deployment nope");
    expect(result.error).toBe(true);
  });
});

describe("kubectl scale", () => {
  it("updates replicas on an existing deployment", () => {
    const state = runAll([
      `echo '${DEPLOYMENT_YAML}' > deploy.yaml`,
      "kubectl apply -f deploy.yaml",
    ]);
    const result = run(state, "kubectl scale deployment web --replicas=5");
    expect(result.error).toBe(false);
    expect(result.state.k8s.resources["default/Deployment/web"].replicas).toBe(
      5,
    );
  });

  it("fails for a missing deployment", () => {
    const result = run(
      createShell(),
      "kubectl scale deployment nope --replicas=5",
    );
    expect(result.error).toBe(true);
  });

  it("fails without --replicas", () => {
    const state = runAll([
      `echo '${DEPLOYMENT_YAML}' > deploy.yaml`,
      "kubectl apply -f deploy.yaml",
    ]);
    const result = run(state, "kubectl scale deployment web");
    expect(result.error).toBe(true);
  });
});

describe("kubectl logs", () => {
  it("returns canned output for any pod name", () => {
    const result = run(createShell(), "kubectl logs some-pod");
    expect(result.error).toBe(false);
  });
});

describe("evaluateCheck k8sResources", () => {
  it("passes/fails on existence", () => {
    const state = runAll([
      `echo '${DEPLOYMENT_YAML}' > deploy.yaml`,
      "kubectl apply -f deploy.yaml",
    ]);
    const ctx = {
      input: "kubectl apply -f deploy.yaml",
      prevState: state,
      result: { state, output: "", error: false },
    };

    expect(
      evaluateCheck(
        { k8sResources: [{ kind: "Deployment", name: "web" }] },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        { k8sResources: [{ kind: "Deployment", name: "missing" }] },
        ctx,
      ).pass,
    ).toBe(false);
  });

  it("passes/fails on replicas", () => {
    const state = runAll([
      `echo '${DEPLOYMENT_YAML}' > deploy.yaml`,
      "kubectl apply -f deploy.yaml",
    ]);
    const ctx = {
      input: "kubectl apply -f deploy.yaml",
      prevState: state,
      result: { state, output: "", error: false },
    };

    expect(
      evaluateCheck(
        { k8sResources: [{ kind: "Deployment", name: "web", replicas: 3 }] },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        { k8sResources: [{ kind: "Deployment", name: "web", replicas: 5 }] },
        ctx,
      ).pass,
    ).toBe(false);
  });
});

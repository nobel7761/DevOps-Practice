import { describe, expect, it } from "vitest";
import {
  composeServiceImage,
  composeServiceNames,
  parseK8sManifest,
} from "./engine";

describe("composeServiceNames", () => {
  it("returns the direct child keys under services: and ignores grandchildren", () => {
    const content = [
      "version: '3'",
      "services:",
      "  web:",
      "    image: myapp:latest",
      "    ports:",
      "      - 8080:80",
      "  db:",
      "    image: postgres:16",
    ].join("\n");

    expect(composeServiceNames(content)).toEqual(["web", "db"]);
  });

  it("returns an empty array for a file with no services: block", () => {
    expect(composeServiceNames("version: '3'\n")).toEqual([]);
  });

  it("ignores blank lines and comment lines", () => {
    const content = [
      "# top comment",
      "",
      "services:",
      "  # a comment inside services",
      "  web:",
      "    image: myapp:latest",
      "",
    ].join("\n");

    expect(composeServiceNames(content)).toEqual(["web"]);
  });
});

describe("composeServiceImage", () => {
  it("returns a service's image: value when present", () => {
    const content = ["services:", "  web:", "    image: myapp:latest"].join(
      "\n",
    );

    expect(composeServiceImage(content, "web")).toBe("myapp:latest");
  });

  it("returns undefined when the service has no image: field", () => {
    const content = ["services:", "  web:", "    build: ."].join("\n");

    expect(composeServiceImage(content, "web")).toBeUndefined();
  });

  it("returns undefined for a service that doesn't exist", () => {
    const content = ["services:", "  web:", "    image: myapp:latest"].join(
      "\n",
    );

    expect(composeServiceImage(content, "db")).toBeUndefined();
  });
});

describe("parseK8sManifest", () => {
  it("returns one entry for a single-document manifest with kind and metadata.name", () => {
    const content = [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata:",
      "  name: web",
      "spec:",
      "  replicas: 3",
    ].join("\n");

    const docs = parseK8sManifest(content);

    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({
      kind: "Deployment",
      name: "web",
      namespace: "default",
      replicas: 3,
    });
  });

  it("respects an explicit metadata.namespace", () => {
    const content = [
      "kind: Service",
      "metadata:",
      "  name: web-svc",
      "  namespace: prod",
    ].join("\n");

    const docs = parseK8sManifest(content);

    expect(docs[0]).toMatchObject({
      kind: "Service",
      name: "web-svc",
      namespace: "prod",
    });
  });

  it("parses multiple --- separated documents into multiple entries", () => {
    const content = [
      "kind: Deployment",
      "metadata:",
      "  name: web",
      "---",
      "kind: Service",
      "metadata:",
      "  name: web-svc",
    ].join("\n");

    const docs = parseK8sManifest(content);

    expect(docs).toHaveLength(2);
    expect(docs.map((d) => d.kind)).toEqual(["Deployment", "Service"]);
  });

  it("skips a document that has metadata but no kind", () => {
    const content = ["metadata:", "  name: orphan"].join("\n");

    expect(parseK8sManifest(content)).toEqual([]);
  });

  it("leaves replicas undefined when spec.replicas is absent", () => {
    const content = ["kind: Pod", "metadata:", "  name: standalone"].join("\n");

    const docs = parseK8sManifest(content);

    expect(docs[0].replicas).toBeUndefined();
  });
});

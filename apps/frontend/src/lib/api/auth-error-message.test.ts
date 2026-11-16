import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./auth";

const httpError = (status: number, data: unknown = "<h1>gateway</h1>") =>
  new AxiosError("fail", "ERR_BAD_RESPONSE", undefined, {}, {
    status,
    data,
  } as AxiosResponse);

const noResponse = (code: string) =>
  new AxiosError("fail", code, undefined, {} /* request sent, no response */);

describe("authErrorMessage — says exactly what went wrong", () => {
  it.each([502, 503, 504])(
    "%i from a gateway names the status and says the server is down",
    (status) => {
      const msg = authErrorMessage(httpError(status));
      expect(msg).toContain(String(status));
      expect(msg).toMatch(/server .*(unavailable|down)/i);
      expect(msg).not.toBe("Something went wrong");
    },
  );

  it("no response at all (network/CORS/server off) says the server can't be reached", () => {
    expect(authErrorMessage(noResponse("ERR_NETWORK"))).toMatch(
      /can't reach the server/i,
    );
  });

  it("timeout says the server took too long", () => {
    expect(authErrorMessage(noResponse("ECONNABORTED"))).toMatch(
      /took too long/i,
    );
  });

  it("500 with a generic body mentions the internal server error and the code", () => {
    const msg = authErrorMessage(
      httpError(500, { message: "Internal server error" }),
    );
    expect(msg).toContain("500");
    expect(msg).toMatch(/internal/i);
  });

  it("an unexpected status without any message still shows the status code", () => {
    expect(authErrorMessage(httpError(418))).toContain("418");
  });

  it("keeps the backend's own message when it sent one (403 pending approval)", () => {
    expect(
      authErrorMessage(
        httpError(403, {
          message: "Your account is awaiting super admin approval.",
        }),
      ),
    ).toBe("Your account is awaiting super admin approval.");
  });

  it("joins class-validator message arrays and keeps the 429 rate-limit text", () => {
    expect(
      authErrorMessage(
        httpError(400, { message: ["email must be an email", "x"] }),
      ),
    ).toBe("email must be an email, x");
    expect(authErrorMessage(httpError(429))).toMatch(/too many attempts/i);
  });

  it("a plain Error shows its own message instead of a generic one", () => {
    expect(authErrorMessage(new Error("boom"))).toContain("boom");
  });
});

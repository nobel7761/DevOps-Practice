import { isAxiosError } from "axios";
import client from "@/lib/api/client";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "superadmin";
  status: "pending" | "approved" | "rejected";
  courseIds: string[];
  askAiEnabled: boolean;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

type UserResponse = { user: AuthUser };

export const authApi = {
  register: (input: RegisterInput) =>
    client
      .post<{ message: string }>("/auth/register", input)
      .then((r) => r.data.message),
  login: (email: string, password: string) =>
    client
      .post<UserResponse>("/auth/login", { email, password })
      .then((r) => r.data.user),
  logout: () => client.post("/auth/logout"),
  me: () => client.get<UserResponse>("/auth/me").then((r) => r.data.user),
  forgotPassword: (email: string) =>
    client
      .post<{ message: string }>("/auth/forgot-password", { email })
      .then((r) => r.data.message),
  resetPassword: (token: string, password: string) =>
    client
      .post<UserResponse>("/auth/reset-password", { token, password })
      .then((r) => r.data.user),
};

const GENERIC_BODY = /^internal server error$/i;

/** What the backend said (class-validator arrays joined), if it sent a JSON message. */
function backendMessage(data: unknown): string | null {
  const message = (data as { message?: string | string[] } | undefined)
    ?.message;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" && message ? message : null;
}

function httpStatusMessage(status: number, data: unknown): string {
  if (status === 429) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if ([502, 503, 504].includes(status)) {
    return `The server is unavailable (${status}). It may be down or restarting. Please try again in a minute.`;
  }
  const message = backendMessage(data);
  if (status >= 500) {
    const detail = message && !GENERIC_BODY.test(message) ? ` ${message}.` : "";
    return `The server hit an internal error (${status}).${detail} Please try again, and tell the admin if it keeps happening.`;
  }
  return message ?? `Request failed (${status}).`;
}

/** Exactly what went wrong: the backend's own message, or a specific description of the failure. */
export function authErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    if (err.response) {
      return httpStatusMessage(err.response.status, err.response.data);
    }
    if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
      return "The server took too long to respond. Please try again.";
    }
    return "Can't reach the server. Check your internet connection. The server may also be down.";
  }
  if (err instanceof Error) return `Unexpected error: ${err.message}`;
  return `Unexpected error: ${String(err)}`;
}

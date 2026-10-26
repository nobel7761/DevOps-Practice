import { isAxiosError } from "axios";
import client from "@/lib/api/client";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
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
    client.post<UserResponse>("/auth/register", input).then((r) => r.data.user),
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

/** Backend error message (class-validator arrays joined), or a fallback. */
export function authErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
) {
  if (isAxiosError(err)) {
    if (err.response?.status === 429) {
      return "Too many attempts. Please wait a minute and try again.";
    }
    const message = (err.response?.data as { message?: string | string[] })
      ?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }
  return fallback;
}

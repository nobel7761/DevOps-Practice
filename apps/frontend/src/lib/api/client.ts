import axios, { AxiosInstance } from "axios";
import { isAuthPath } from "@/lib/auth/auth-paths";

const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname === "192.168.0.102") {
      return "http://192.168.0.102:3001/api";
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api`;
    }
  }

  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api`;
};

const client: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  // Session lives in the backend's httpOnly `access_token` cookie.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Log error details in development
      // (auth 4xx like a wrong password are expected and shown in the form, not logged)
      const expectedAuthError =
        status < 500 && String(error.config?.url ?? "").startsWith("/auth/");
      if (process.env.NODE_ENV === "development" && !expectedAuthError) {
        console.error(`API Error [${status}]:`, {
          url: error.config?.url,
          method: error.config?.method,
          data: data,
        });
      }

      // Handle specific error statuses
      switch (status) {
        case 401:
          // Unauthorized - session missing/expired, send to login (auth pages handle their own 401s)
          if (
            typeof window !== "undefined" &&
            !isAuthPath(window.location.pathname)
          ) {
            const next = encodeURIComponent(
              window.location.pathname + window.location.search,
            );
            window.location.href = `/login?next=${next}`;
          }
          break;
        case 403:
          // Forbidden
          console.error(
            "Access forbidden: You don't have permission to access this resource",
          );
          break;
        case 404:
          // Not found
          console.error("Resource not found");
          break;
        case 500:
          // Internal server error
          console.error("Internal server error: Please try again later");
          break;
        default:
          // Other errors
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error(
        "Network Error: Could not connect to backend. Is the server running on",
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
        "?",
      );
    } else {
      // Something else happened
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default client;

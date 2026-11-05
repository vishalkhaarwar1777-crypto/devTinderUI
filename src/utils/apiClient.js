import axios from "axios";
import { BASE_URL } from "./constants";
import appStore from "./appStore";
import { removeUser } from "./userSlice";

/**
 * One Axios instance for every API call:
 * - `baseURL` keeps the environment configuration in one place.
 * - `withCredentials: true` makes the browser send/receive the HTTP-only
 *   `token` cookie on every request, including cross-origin (Vercel -> Render).
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * If the session has expired or the cookie was rejected, clear the Redux user.
 * `Body` then redirects to /login instead of leaving a protected page showing
 * a confusing "Please login!" error.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const config = error?.config ?? {};
    const url = typeof config.url === "string" ? config.url : "";
    const isAuthAttempt = url.includes("/login") || url.includes("/signup");

    // Do not wipe the session for a failed login/signup, and let the initial
    // "is there a session?" probe opt out. On a cold Render instance that
    // probe can answer 401 long after the visitor has already logged in, and
    // clearing the user here would bounce them straight back to /login.
    if (status === 401 && !config.skipAuthClear && !isAuthAttempt) {
      appStore.dispatch(removeUser());
    }

    return Promise.reject(error);
  },
);

export default apiClient;

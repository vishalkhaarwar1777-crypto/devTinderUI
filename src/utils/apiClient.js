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
    if (error?.response?.status === 401) {
      appStore.dispatch(removeUser());
    }

    return Promise.reject(error);
  },
);

export default apiClient;

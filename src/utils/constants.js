// Local development talks to the backend on your machine. A production build
// must never fall back to localhost: on Vercel that would send every request to
// the visitor's own computer and make the whole app look broken.
const LOCAL_API_URL = "http://localhost:3000";
const PRODUCTION_API_URL = "https://codemate-wn1u.onrender.com";

const configuredBaseUrl = import.meta.env.VITE_BASE_URL?.trim();

const pointsAtLocalhost = (url) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(url ?? "");

// Ignore a localhost value in a production build even if it was accidentally
// added to the Vercel environment variables.
const safeConfiguredBaseUrl =
  configuredBaseUrl &&
  !(import.meta.env.PROD && pointsAtLocalhost(configuredBaseUrl))
    ? configuredBaseUrl
    : "";

// Remove any trailing slash so `${BASE_URL}/login` never becomes `//login`.
export const BASE_URL = (
  safeConfiguredBaseUrl ||
  (import.meta.env.PROD ? PRODUCTION_API_URL : LOCAL_API_URL)
).replace(/\/+$/, "");

export const DEFAULT_AVATAR = "";

export const GENDER_LABELS = {
  male: "Male",
  female: "Female",
  other: "Other",
};

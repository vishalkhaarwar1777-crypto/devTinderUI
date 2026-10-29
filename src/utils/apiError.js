const cleanMessage = (message) =>
  typeof message === "string"
    ? message.replace(/^ERROR\s*:\s*/i, "").trim()
    : "";

/**
 * Backend stack traces and driver errors should never reach the UI. These
 * patterns catch the common shapes returned by Express/Mongoose when an
 * unexpected exception escapes the API error handler.
 */
const INTERNAL_ERROR_PATTERNS = [
  /is not a function/i,
  /is not defined/i,
  /cannot read propert/i,
  /cannot set propert/i,
  /\b(?:TypeError|ReferenceError|SyntaxError|RangeError)\b/,
  /\bMongo(?:Server|Network)?Error\b/,
  /Cast to ObjectId/i,
  /duplicate key error/i,
  /node_modules[\\/]/i,
  /^\s*at\s+\S+/m,
];

const looksInternal = (message) =>
  INTERNAL_ERROR_PATTERNS.some((pattern) => pattern.test(message));

const friendlyDuplicateEmail = (message) =>
  /duplicate key/i.test(message) && /email/i.test(message)
    ? "An account with that email already exists. Try logging in instead."
    : "";

/**
 * The Express API responds with a mix of `{ error }`, `{ message }`, and plain
 * strings. Reduce all of those shapes to a readable sentence for the UI, and
 * replace internal implementation details with the caller's fallback copy.
 */
export const getErrorMessage = (error, fallback = "Something went wrong.") => {
  if (!error) return fallback;

  if (!error.response) {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return "Can't reach the DevTinder API. Make sure the backend is running on localhost:3000.";
    }
    const message = cleanMessage(error.message);
    return message && !looksInternal(message) ? message : fallback;
  }

  const data = error.response.data;

  const raw =
    typeof data === "string"
      ? cleanMessage(data)
      : cleanMessage(data?.error) ||
        cleanMessage(data?.message) ||
        cleanMessage(error.message);

  const duplicateEmail = friendlyDuplicateEmail(raw);

  if (duplicateEmail) return duplicateEmail;
  if (!raw || looksInternal(raw)) return fallback;

  return raw;
};

export const isUnauthorizedError = (error) =>
  error?.response?.status === 401 || error?.response?.status === 403;

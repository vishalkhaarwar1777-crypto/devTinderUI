const rawBaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

// Remove any trailing slash so `${BASE_URL}/login` never becomes `//login`.
export const BASE_URL = rawBaseUrl.trim().replace(/\/+$/, "");

export const DEFAULT_AVATAR = "";

export const GENDER_LABELS = {
  male: "Male",
  female: "Female",
  other: "Other",
};

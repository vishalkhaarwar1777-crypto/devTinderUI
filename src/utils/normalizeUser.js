/**
 * The backend is not fully consistent between responses yet:
 * /login returns `photoUrl`/`skills`, while /profile/view, /feed, and
 * /user/connection return `profilePhoto`/`skill`. Normalize once here so every
 * component can rely on the current schema and no sensitive fields (such as the
 * hashed password returned by /profile/view) end up in Redux.
 */
export const normalizeUser = (rawUser) => {
  if (!rawUser || typeof rawUser !== "object") return null;

  const skill = Array.isArray(rawUser.skill)
    ? rawUser.skill
    : Array.isArray(rawUser.skills)
      ? rawUser.skills
      : [];

  return {
    _id: rawUser._id ?? rawUser.id ?? "",
    firstName: rawUser.firstName ?? "",
    lastName: rawUser.lastName ?? "",
    emailId: rawUser.emailId ?? "",
    age: rawUser.age ?? "",
    gender: rawUser.gender ?? "",
    about: rawUser.about ?? "",
    profilePhoto: rawUser.profilePhoto || rawUser.photoUrl || "",
    skill: skill.filter((item) => typeof item === "string" && item.trim()),
    createdAt: rawUser.createdAt ?? null,
  };
};

/**
 * Endpoints are not consistent about wrapping the user: `/profile/view` returns
 * the object directly, `/profile/edit` returns `{ data }`, and `/login` returns
 * `{ user }`. Accept all three shapes so a response change cannot silently wipe
 * the Redux user (which is what made the navbar/profile appear empty).
 */
export const normalizeUserPayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const nested =
    payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)
      ? payload.data
      : payload.user &&
          typeof payload.user === "object" &&
          !Array.isArray(payload.user)
        ? payload.user
        : null;

  return normalizeUser(nested ?? payload);
};

export const normalizeUsers = (users) => {
  if (!Array.isArray(users)) return [];

  return users.map(normalizeUser).filter(Boolean);
};

/**
 * `/user/requests/received` returns `{ data: [{ fromUserId: <user> }] }`.
 * Normalize the nested sender once so the requests page and the navbar badge
 * always read the same data.
 */
export const normalizeRequests = (requests) => {
  if (!Array.isArray(requests)) return [];

  return requests
    .map((request) => {
      const sender = normalizeUser(request?.fromUserId);

      return sender ? { ...request, fromUserId: sender } : null;
    })
    .filter(Boolean);
};

export const getFullName = (user) => {
  if (!user) return "";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
};

export const getInitials = (user) => {
  const name = getFullName(user);
  if (!name) return "DT";

  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

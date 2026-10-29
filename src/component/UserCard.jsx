import Avatar from "./ui/Avatar";
import Icon from "./ui/Icon";
import SkillBadge from "./ui/SkillBadge";
import { GENDER_LABELS } from "../utils/constants";
import { getFullName } from "../utils/normalizeUser";

const UserCard = ({
  user,
  onConnect,
  onIgnore,
  busyStatus = null,
  disabled = false,
}) => {
  const fullName = getFullName(user) || "Developer";
  const skills = Array.isArray(user.skill) ? user.skill : [];
  const visibleSkills = skills.slice(0, 6);
  const hiddenSkills = skills.length - visibleSkills.length;

  const meta = [
    user.age ? `${user.age} years` : "",
    GENDER_LABELS[user.gender] || "",
  ]
    .filter(Boolean)
    .join(" · ");

  const connecting = busyStatus === "interested";
  const ignoring = busyStatus === "ignored";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-base-300 bg-base-200/60 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
      <div className="flex items-start gap-4 p-5">
        <Avatar
          src={user.profilePhoto}
          user={user}
          size="lg"
          className="ring-2 ring-primary/20 transition group-hover:ring-primary/40"
        />

        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="truncate text-lg font-semibold tracking-tight text-base-content">
            {fullName}
          </h2>

          <p className="mt-1 text-xs text-base-content/60">
            {meta || "Developer on DevTinder"}
          </p>
        </div>
      </div>

      <div className="px-5">
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-base-content/60">
          {user.about || "This developer has not added a bio yet."}
        </p>
      </div>

      <div className="mt-3 flex min-h-14 flex-wrap content-start gap-1.5 px-5">
        {visibleSkills.length > 0 ? (
          <>
            {visibleSkills.map((skill) => (
              <SkillBadge key={skill}>{skill}</SkillBadge>
            ))}
            {hiddenSkills > 0 && (
              <span
                className="inline-flex items-center rounded-full border border-base-300 bg-base-300/40 px-2.5 py-1 font-mono text-[11px] leading-none text-base-content/50"
                title={skills.slice(6).join(", ")}
              >
                +{hiddenSkills}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-base-content/50">
            No skills listed yet
          </span>
        )}
      </div>

      <div className="mt-auto flex gap-2 border-t border-base-300/60 p-4">
        <button
          type="button"
          onClick={() => onIgnore(user._id)}
          disabled={disabled}
          className="btn btn-outline btn-sm flex-1 gap-1.5 border-base-300 text-base-content/60 hover:border-error/40 hover:bg-error/10 hover:text-error disabled:opacity-50"
          aria-label={`Ignore ${fullName}`}
        >
          {ignoring ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Icon name="x" size={15} />
          )}
          {ignoring ? "Ignoring…" : "Ignore"}
        </button>

        <button
          type="button"
          onClick={() => onConnect(user._id)}
          disabled={disabled}
          className="btn btn-primary btn-sm flex-1 gap-1.5 disabled:opacity-60"
          aria-label={`Send a connection request to ${fullName}`}
        >
          {connecting ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Icon name="userPlus" size={15} />
          )}
          {connecting ? "Sending…" : "Connect"}
        </button>
      </div>
    </article>
  );
};

export default UserCard;

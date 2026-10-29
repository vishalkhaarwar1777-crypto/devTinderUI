import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Avatar from "./ui/Avatar";
import EmptyState from "./ui/EmptyState";
import Icon from "./ui/Icon";
import SkillBadge from "./ui/SkillBadge";
import { GENDER_LABELS } from "../utils/constants";
import { getFullName } from "../utils/normalizeUser";

const formatMonthYear = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(date);
};

const Profile = () => {
  const user = useSelector((store) => store.user);

  if (!user) {
    return (
      <EmptyState
        icon="lock"
        title="Please sign in"
        description="You need to be signed in to view your profile."
        action={
          <Link to="/login" className="btn btn-primary btn-sm">
            Go to login
          </Link>
        }
      />
    );
  }

  const fullName = getFullName(user) || "Developer";
  const joined = formatMonthYear(user.createdAt);
  const skills = Array.isArray(user.skill) ? user.skill : [];

  const completenessChecks = [
    { label: "Profile photo", done: Boolean(user.profilePhoto) },
    { label: "About section", done: Boolean(user.about) },
    { label: "At least 3 skills", done: skills.length >= 3 },
    { label: "Age", done: Boolean(user.age) },
    { label: "Gender", done: Boolean(user.gender) },
    { label: "Last name", done: Boolean(user.lastName) },
  ];

  const completed = completenessChecks.filter((check) => check.done).length;
  const percent = Math.round((completed / completenessChecks.length) * 100);
  const missing = completenessChecks
    .filter((check) => !check.done)
    .map((check) => check.label);

  return (
    <div className="page-enter mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-200/60 shadow-sm">
        <div className="relative h-36 overflow-hidden bg-base-300/40 bg-[radial-gradient(120%_150%_at_8%_0%,rgba(139,92,246,0.35),transparent_60%)] sm:h-44">
          <Icon
            name="code"
            size={150}
            className="absolute -right-5 -top-5 text-primary/10"
            strokeWidth={1.2}
          />
          <div className="absolute bottom-4 left-5 font-mono text-[10px] uppercase tracking-[0.22em] text-base-content/60 sm:left-8">
            Developer profile
          </div>
        </div>

        <div className="px-5 pb-8 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                src={user.profilePhoto}
                user={user}
                size="2xl"
                ring
                className="ring-offset-base-200"
              />

              <div className="min-w-0 pb-1.5">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-base-content sm:text-3xl">
                  {fullName}
                </h1>
                <p className="mt-1 truncate text-sm text-base-content/50">
                  {user.emailId || "Developer on DevTinder"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pb-1">
              <Link
                to="/edit-profile"
                className="btn btn-primary btn-sm gap-2"
              >
                <Icon name="edit" size={15} />
                Edit profile
              </Link>

              <Link
                to="/"
                className="btn btn-outline btn-sm gap-2 border-base-300 text-base-content/65"
              >
                <Icon name="sparkles" size={15} />
                Back to feed
              </Link>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {user.age ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs text-base-content/60">
                <Icon name="user" size={13} />
                {user.age} years
              </span>
            ) : null}

            {user.gender ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs text-base-content/60">
                <Icon name="users" size={13} />
                {GENDER_LABELS[user.gender] || user.gender}
              </span>
            ) : null}

            {joined ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-base-300 bg-base-200 px-3 py-1 text-xs text-base-content/60">
                <Icon name="calendar" size={13} />
                Joined {joined}
              </span>
            ) : null}

            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs text-success">
              <span className="size-1.5 rounded-full bg-success" />
              Active developer
            </span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
            <div className="space-y-8">
              <section aria-labelledby="about-heading">
                <h2
                  id="about-heading"
                  className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-base-content/55"
                >
                  About
                </h2>

                <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-base-content/70">
                  {user.about || (
                    <span className="text-base-content/55">
                      You haven&apos;t written a bio yet. Tell other developers
                      what you build and what you&apos;re looking for.{" "}
                      <Link
                        to="/edit-profile"
                        className="font-medium text-primary hover:underline"
                      >
                        Add a bio
                      </Link>
                    </span>
                  )}
                </p>
              </section>

              <section aria-labelledby="skills-heading">
                <div className="flex items-center justify-between gap-3">
                  <h2
                    id="skills-heading"
                    className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-base-content/55"
                  >
                    Skills
                  </h2>

                  <Link
                    to="/edit-profile"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Edit skills
                  </Link>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => (
                      <SkillBadge key={skill} className="px-3 py-1.5 text-xs">
                        {skill}
                      </SkillBadge>
                    ))
                  ) : (
                    <p className="text-sm text-base-content/55">
                      No skills added yet. Add the tools and languages you work
                      with.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section
                aria-labelledby="strength-heading"
                className="rounded-2xl border border-base-300 bg-base-100/40 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2
                    id="strength-heading"
                    className="text-sm font-medium text-base-content"
                  >
                    Profile strength
                  </h2>
                  <span className="font-mono text-sm font-semibold text-primary">
                    {percent}%
                  </span>
                </div>

                <progress
                  className="progress progress-primary mt-3 h-1.5 w-full"
                  value={percent}
                  max="100"
                  aria-label={`Profile ${percent}% complete`}
                />

                <p className="mt-3 text-xs leading-5 text-base-content/60">
                  {missing.length === 0
                    ? "Your profile is complete. Nice work."
                    : `Add ${missing.join(", ").toLowerCase()} to make a stronger first impression.`}
                </p>

                {missing.length > 0 && (
                  <Link
                    to="/edit-profile"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    Complete profile
                    <Icon name="arrowRight" size={13} />
                  </Link>
                )}
              </section>

              <section
                aria-labelledby="details-heading"
                className="rounded-2xl border border-base-300 bg-base-100/40 p-5"
              >
                <h2
                  id="details-heading"
                  className="text-sm font-medium text-base-content"
                >
                  Details
                </h2>

                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-base-content/60">
                      <Icon name="mail" size={14} />
                      Email
                    </dt>
                    <dd className="max-w-[60%] break-all text-right text-base-content/75">
                      {user.emailId || "Not added"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-base-content/60">
                      <Icon name="user" size={14} />
                      Age
                    </dt>
                    <dd className="text-right text-base-content/75">
                      {user.age || "Not added"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-base-content/60">
                      <Icon name="users" size={14} />
                      Gender
                    </dt>
                    <dd className="text-right text-base-content/75">
                      {GENDER_LABELS[user.gender] || "Not added"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <dt className="inline-flex items-center gap-2 text-base-content/60">
                      <Icon name="calendar" size={14} />
                      Member since
                    </dt>
                    <dd className="text-right text-base-content/75">
                      {joined || "—"}
                    </dd>
                  </div>
                </dl>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Alert from "./ui/Alert";
import Avatar from "./ui/Avatar";
import EmptyState from "./ui/EmptyState";
import Icon from "./ui/Icon";
import PageHeader from "./ui/PageHeader";
import SkillBadge from "./ui/SkillBadge";
import { BASE_URL, GENDER_LABELS } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { normalizeUser } from "../utils/normalizeUser";
import { getErrorMessage } from "../utils/apiError";

const toFormData = (user) => ({
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  age: user?.age ? String(user.age) : "",
  gender: user?.gender ?? "",
  profilePhoto: user?.profilePhoto ?? "",
  about: user?.about ?? "",
  skill: Array.isArray(user?.skill) ? user.skill.join(", ") : "",
});

const parseSkills = (value) => [
  ...new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  ),
];

const inputClass = (hasError) =>
  `input input-bordered h-11 w-full border-base-300 bg-base-100/50 text-sm placeholder:text-base-content/40 focus:border-primary/60 ${
    hasError ? "border-error/60" : ""
  }`;

const EditProfile = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(() => toFormData(user));
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const redirectTimer = useRef(null);

  useEffect(
    () => () => {
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    },
    [],
  );

  if (!user) {
    return (
      <EmptyState
        icon="lock"
        title="Please sign in"
        description="You need to be signed in to edit your profile."
        action={
          <Link to="/login" className="btn btn-primary btn-sm">
            Go to login
          </Link>
        }
      />
    );
  }

  const skillsPreview = parseSkills(formData.skill);
  const previewName =
    [formData.firstName, formData.lastName].filter(Boolean).join(" ").trim() ||
    "Your name";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    const firstName = formData.firstName.trim();

    if (!firstName) {
      nextErrors.firstName = "First name is required.";
    } else if (firstName.length < 4) {
      nextErrors.firstName = "Use at least 4 characters.";
    }

    if (formData.age !== "") {
      const age = Number(formData.age);

      if (!Number.isFinite(age) || age < 18 || age > 120) {
        nextErrors.age = "Age must be between 18 and 120.";
      }
    }

    const photo = formData.profilePhoto.trim();

    if (photo) {
      try {
        const url = new URL(photo);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Unsupported protocol");
        }
      } catch {
        nextErrors.profilePhoto =
          "Enter a valid image URL starting with http:// or https://.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      setFeedback({
        type: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        about: formData.about.trim(),
        profilePhoto: formData.profilePhoto.trim(),
        skill: skillsPreview,
      };

      if (formData.age !== "") payload.age = Number(formData.age);
      if (formData.gender) payload.gender = formData.gender;

      const res = await axios.patch(`${BASE_URL}/profile/edit`, payload, {
        withCredentials: true,
      });

      const updatedUser = normalizeUser(res.data?.data);

      if (updatedUser) {
        dispatch(addUser(updatedUser));
      }

      setFeedback({
        type: "success",
        message: "Profile updated successfully. Taking you to your feed…",
      });

      redirectTimer.current = window.setTimeout(() => {
        navigate("/");
      }, 900);
    } catch (err) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Could not update your profile."),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Account"
        title="Edit your profile"
        description="A clear, honest profile helps the right developers find you. Changes are saved to your DevTinder account."
        actions={
          <Link
            to="/profile"
            className="btn btn-ghost btn-sm gap-2 text-base-content/60"
          >
            <Icon name="arrowRight" size={15} className="rotate-180" />
            View profile
          </Link>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_0.8fr] lg:gap-8">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-3xl border border-base-300 bg-base-200/60 p-5 shadow-sm sm:p-7"
        >
          <div className="space-y-6">
            <fieldset className="space-y-4">
              <legend className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-base-content/55">
                Identity
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="field-label">
                    First name <span className="text-error">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={
                      errors.firstName ? "firstName-error" : undefined
                    }
                    className={inputClass(errors.firstName)}
                    placeholder="Alex"
                  />
                  {errors.firstName ? (
                    <p id="firstName-error" className="field-error">
                      {errors.firstName}
                    </p>
                  ) : (
                    <p className="field-hint">At least 4 characters.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="field-label">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputClass(false)}
                    placeholder="Chen"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="age" className="field-label">
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="120"
                    inputMode="numeric"
                    value={formData.age}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.age)}
                    aria-describedby={errors.age ? "age-error" : undefined}
                    className={inputClass(errors.age)}
                    placeholder="24"
                  />
                  {errors.age && (
                    <p id="age-error" className="field-error">
                      {errors.age}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="field-label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="select select-bordered h-11 w-full border-base-300 bg-base-100/50 text-sm focus:border-primary/60"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="male">{GENDER_LABELS.male}</option>
                    <option value="female">{GENDER_LABELS.female}</option>
                    <option value="other">{GENDER_LABELS.other}</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <div className="border-t border-base-300/60 pt-6">
              <label htmlFor="profilePhoto" className="field-label">
                Profile photo URL
              </label>
              <input
                id="profilePhoto"
                name="profilePhoto"
                type="url"
                value={formData.profilePhoto}
                onChange={handleChange}
                aria-invalid={Boolean(errors.profilePhoto)}
                aria-describedby={
                  errors.profilePhoto ? "profilePhoto-error" : "photo-hint"
                }
                className={inputClass(errors.profilePhoto)}
                placeholder="https://example.com/your-photo.jpg"
              />
              {errors.profilePhoto ? (
                <p id="profilePhoto-error" className="field-error">
                  {errors.profilePhoto}
                </p>
              ) : (
                <p id="photo-hint" className="field-hint">
                  Paste a direct link to an image. Leave empty to use your
                  initials.
                </p>
              )}
            </div>

            <div className="border-t border-base-300/60 pt-6">
              <label htmlFor="about" className="field-label">
                About
              </label>
              <textarea
                id="about"
                name="about"
                rows={5}
                value={formData.about}
                onChange={handleChange}
                className="textarea textarea-bordered min-h-32 w-full border-base-300 bg-base-100/50 text-sm leading-6 placeholder:text-base-content/40 focus:border-primary/60"
                placeholder="Full-stack developer focused on React and Node.js. Currently building developer tools and looking for collaborators."
              />
              <p className="field-hint">
                {formData.about.length} characters · Keep it short and specific.
              </p>
            </div>

            <div className="border-t border-base-300/60 pt-6">
              <label htmlFor="skill" className="field-label">
                Skills
              </label>
              <input
                id="skill"
                name="skill"
                type="text"
                value={formData.skill}
                onChange={handleChange}
                className={inputClass(false)}
                placeholder="React, Node.js, TypeScript, MongoDB"
              />
              <p className="field-hint">
                Separate skills with commas. These appear as badges on your
                profile.
              </p>

              {skillsPreview.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skillsPreview.map((skill) => (
                    <SkillBadge key={skill}>{skill}</SkillBadge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {feedback && (
            <Alert
              type={feedback.type}
              message={feedback.message}
              onDismiss={() => setFeedback(null)}
              className="mt-6"
            />
          )}

          <div className="mt-7 flex flex-col gap-2.5 border-t border-base-300/60 pt-6 sm:flex-row-reverse">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary gap-2 sm:min-w-40"
            >
              {loading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Icon name="check" size={16} />
              )}
              {loading ? "Saving…" : "Save profile"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              disabled={loading}
              className="btn btn-ghost border border-base-300 text-base-content/60"
            >
              Cancel
            </button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-base-300 bg-base-200/60 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-base-content/55">
                Live preview
              </p>
              <Icon name="eye" size={15} className="text-base-content/60" />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Avatar
                src={formData.profilePhoto.trim()}
                name={previewName}
                size="lg"
                className="ring-2 ring-primary/20"
              />

              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-tight">
                  {previewName}
                </p>
                <p className="mt-0.5 text-xs text-base-content/60">
                  {[
                    formData.age ? `${formData.age} years` : "",
                    GENDER_LABELS[formData.gender] || "",
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Developer on DevTinder"}
                </p>
              </div>
            </div>

            <p className="mt-4 line-clamp-4 min-h-16 text-sm leading-6 text-base-content/55">
              {formData.about.trim() ||
                "Your bio will appear here. Write a sentence or two about what you build."}
            </p>

            <div className="mt-4 flex min-h-12 flex-wrap content-start gap-1.5">
              {skillsPreview.length > 0 ? (
                skillsPreview.slice(0, 8).map((skill) => (
                  <SkillBadge key={skill}>{skill}</SkillBadge>
                ))
              ) : (
                <span className="text-xs text-base-content/50">
                  Skill badges will appear here
                </span>
              )}
              {skillsPreview.length > 8 && (
                <span className="inline-flex items-center rounded-full border border-base-300 bg-base-300/40 px-2.5 py-1 font-mono text-[11px] leading-none text-base-content/50">
                  +{skillsPreview.length - 8}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-base-300 bg-base-100/40 p-5">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-base-content">
              <Icon name="sparkles" size={15} className="text-primary" />
              Make it count
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-base-content/60">
              <li>• Lead with what you build, not a job title.</li>
              <li>• List 4–6 skills you would happily work with.</li>
              <li>• A real photo or clean avatar builds trust.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditProfile;

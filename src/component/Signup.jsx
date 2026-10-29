import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "./ui/AuthLayout";
import Alert from "./ui/Alert";
import Icon from "./ui/Icon";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { normalizeUser } from "../utils/normalizeUser";
import { getErrorMessage } from "../utils/apiError";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
    if (apiError) setApiError("");
  };

  const validate = () => {
    const nextErrors = {};
    const firstName = formData.firstName.trim();

    if (!firstName) {
      nextErrors.firstName = "First name is required.";
    } else if (firstName.length < 4) {
      nextErrors.firstName = "Use at least 4 characters.";
    }

    if (!formData.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    const email = formData.emailId.trim();

    if (!email) {
      nextErrors.emailId = "Email is required.";
    } else if (!emailPattern.test(email)) {
      nextErrors.emailId = "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (formData.password.length < 8) {
      nextErrors.password = "Use at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError("");

    const credentials = {
      emailId: formData.emailId.trim(),
      password: formData.password,
    };

    try {
      await axios.post(
        `${BASE_URL}/signup`,
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          ...credentials,
        },
        { withCredentials: true },
      );

      // The API does not set a cookie on /signup, so sign in right after
      // creating the account for a smooth first-run experience.
      try {
        const loginRes = await axios.post(`${BASE_URL}/login`, credentials, {
          withCredentials: true,
        });

        let profile = normalizeUser(loginRes.data?.user);

        try {
          const profileRes = await axios.get(`${BASE_URL}/profile/view`, {
            withCredentials: true,
          });
          profile = normalizeUser(profileRes.data) || profile;
        } catch {
          // The login payload is enough to enter the app.
        }

        if (profile) dispatch(addUser(profile));
        navigate("/", { replace: true });
      } catch {
        navigate("/login", {
          replace: true,
          state: { message: "Account created. Please sign in." },
        });
      }
    } catch (err) {
      setApiError(
        getErrorMessage(err, "Could not create your account. Try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `input input-bordered h-11 w-full border-base-300 bg-base-100/50 text-sm placeholder:text-base-content/40 focus:border-primary/60 ${
      hasError ? "border-error/60" : ""
    }`;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join a focused network of developers who build things together."
    >
      <div className="space-y-4">
        {apiError && (
          <Alert
            type="error"
            title="Could not create your account"
            message={apiError}
            onDismiss={() => setApiError("")}
          />
        )}

        <form onSubmit={handleSignup} noValidate className="space-y-4">
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
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={
                  errors.firstName ? "firstName-error" : "firstName-hint"
                }
                className={inputClass(errors.firstName)}
                placeholder="Alex"
              />
              {errors.firstName ? (
                <p id="firstName-error" className="field-error">
                  {errors.firstName}
                </p>
              ) : (
                <p id="firstName-hint" className="field-hint">
                  At least 4 characters.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="field-label">
                Last name <span className="text-error">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={
                  errors.lastName ? "lastName-error" : undefined
                }
                className={inputClass(errors.lastName)}
                placeholder="Chen"
              />
              {errors.lastName && (
                <p id="lastName-error" className="field-error">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="emailId" className="field-label">
              Email address <span className="text-error">*</span>
            </label>
            <input
              id="emailId"
              name="emailId"
              type="email"
              autoComplete="email"
              value={formData.emailId}
              onChange={handleChange}
              aria-invalid={Boolean(errors.emailId)}
              aria-describedby={errors.emailId ? "emailId-error" : undefined}
              className={inputClass(errors.emailId)}
              placeholder="you@example.com"
            />
            {errors.emailId && (
              <p id="emailId-error" className="field-error">
                {errors.emailId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="field-label">
              Password <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : "password-hint"
                }
                className={`${inputClass(errors.password)} pr-11`}
                placeholder="At least 8 characters"
              />

              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-base-content/55 transition-colors hover:bg-base-300/60 hover:text-base-content/70"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon name={showPassword ? "eyeOff" : "eye"} size={16} />
              </button>
            </div>
            {errors.password ? (
              <p id="password-error" className="field-error">
                {errors.password}
              </p>
            ) : (
              <p id="password-hint" className="field-hint">
                Use at least 8 characters.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="field-label">
              Confirm password <span className="text-error">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              className={inputClass(errors.confirmPassword)}
              placeholder="Repeat your password"
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="field-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary h-11 w-full gap-2"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Icon name="userPlus" size={16} />
            )}
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="border-t border-base-300/60 pt-4 text-center text-sm text-base-content/50">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;

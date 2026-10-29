import { useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthLayout from "./ui/AuthLayout";
import Alert from "./ui/Alert";
import Icon from "./ui/Icon";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { normalizeUser } from "../utils/normalizeUser";
import { getErrorMessage } from "../utils/apiError";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [formData, setFormData] = useState({ emailId: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const infoMessage =
    typeof location.state?.message === "string" ? location.state.message : "";

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
    const email = formData.emailId.trim();

    if (!email) {
      nextErrors.emailId = "Email is required.";
    } else if (!emailPattern.test(email)) {
      nextErrors.emailId = "Enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        {
          emailId: formData.emailId.trim(),
          password: formData.password,
        },
        { withCredentials: true },
      );

      // /login returns a partial user with legacy field names. Fetch the
      // canonical profile so Redux always has profilePhoto/skill.
      let profile = normalizeUser(res.data?.user);

      try {
        const profileRes = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        profile = normalizeUser(profileRes.data) || profile;
      } catch {
        // Keep the login payload as a fallback; the cookie is already set.
      }

      if (profile) dispatch(addUser(profile));

      const requestedPath =
        typeof location.state?.from === "string" &&
        location.state.from.startsWith("/") &&
        !["/login", "/signup"].includes(location.state.from)
          ? location.state.from
          : "/";

      navigate(requestedPath, { replace: true });
    } catch (err) {
      setApiError(
        getErrorMessage(err, "Login failed. Check your email and password."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see your feed, requests, and connections."
    >
      <div className="space-y-4">
        {infoMessage && <Alert type="success" message={infoMessage} />}
        {apiError && (
          <Alert
            type="error"
            title="Could not sign you in"
            message={apiError}
            onDismiss={() => setApiError("")}
          />
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label htmlFor="emailId" className="field-label">
              Email address
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
              className={`input input-bordered h-11 w-full border-base-300 bg-base-100/50 text-sm placeholder:text-base-content/40 focus:border-primary/60 ${
                errors.emailId ? "border-error/60" : ""
              }`}
              placeholder="you@example.com"
            />
            {errors.emailId && (
              <p id="emailId-error" className="field-error">
                {errors.emailId}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-base-content/80"
              >
                Password
              </label>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className={`input input-bordered h-11 w-full border-base-300 bg-base-100/50 pr-11 text-sm placeholder:text-base-content/40 focus:border-primary/60 ${
                  errors.password ? "border-error/60" : ""
                }`}
                placeholder="Enter your password"
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

            {errors.password && (
              <p id="password-error" className="field-error">
                {errors.password}
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
              <Icon name="arrowRight" size={16} />
            )}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="flex items-center gap-2 pt-1 text-[11px] text-base-content/50">
          <Icon name="shield" size={13} />
          Secure session via an HTTP-only cookie.
        </div>

        <p className="border-t border-base-300/60 pt-4 text-center text-sm text-base-content/50">
          New to DevTinder?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;

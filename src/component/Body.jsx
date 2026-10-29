import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "./Navbar";
import Logo from "./ui/Logo";
import Icon from "./ui/Icon";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import { normalizeUser } from "../utils/normalizeUser";
import { getErrorMessage, isUnauthorizedError } from "../utils/apiError";

const FullPageLoader = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-base-100 px-6">
    <Logo compact />
    <div className="flex items-center gap-2.5 text-sm text-base-content/55">
      <span className="loading loading-spinner loading-sm text-primary" />
      Loading your profile…
    </div>
  </div>
);

const StartupError = ({ message, onRetry }) => (
  <div className="flex min-h-screen items-center justify-center bg-base-100 px-4 py-10">
    <div className="w-full max-w-md rounded-3xl border border-base-300 bg-base-200/70 p-7 text-center shadow-2xl shadow-black/25 sm:p-9">
      <Logo compact className="justify-center" />

      <div className="mx-auto mt-6 grid size-12 place-items-center rounded-2xl border border-error/25 bg-error/10 text-error">
        <Icon name="alertCircle" size={22} />
      </div>

      <h1 className="mt-5 text-xl font-semibold tracking-tight">
        The API is not responding
      </h1>
      <p className="mt-2 text-sm leading-6 text-base-content/55">{message}</p>

      <p className="mt-4 rounded-xl border border-base-300 bg-base-100/60 px-3 py-2 font-mono text-[11px] text-base-content/60">
        Expected backend: {BASE_URL}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="btn btn-primary mt-6 w-full gap-2"
      >
        <Icon name="refresh" size={16} />
        Try again
      </button>
    </div>
  </div>
);

const CURRENT_YEAR = new Date().getFullYear();

const Footer = () => (
  <footer className="mt-14 border-t border-base-300/60">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-7 text-xs text-base-content/55 sm:flex-row sm:px-6 lg:px-8">
      <p>© {CURRENT_YEAR} DevTinder. Built for developers.</p>
      <p className="font-mono tracking-wide">connect · collaborate · ship</p>
    </div>
  </footer>
);

const Body = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector((store) => store.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });

        if (!cancelled) {
          dispatch(addUser(normalizeUser(res.data)));
        }
      } catch (err) {
        if (cancelled) return;

        dispatch(addUser(null));

        if (isUnauthorizedError(err) || err.response?.status === 400) {
          setLoading(false);
          return;
        }

        setError(
          getErrorMessage(
            err,
            "We could not load your profile. Please try again.",
          ),
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      cancelled = true;
    };
  }, [dispatch, retryCount]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/signup";

  if (loading) return <FullPageLoader />;

  if (error && !user) {
    return <StartupError message={error} onRetry={retry} />;
  }

  if (!user && !isAuthRoute) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (user && isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base-100">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-content focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
      >
        Skip to content
      </a>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-[26rem] bg-[radial-gradient(58%_55%_at_50%_0%,rgba(139,92,246,0.13),transparent_72%)]"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 outline-none sm:px-6 md:py-10 lg:px-8"
        >
          <Outlet />
        </main>

        {user && <Footer />}
      </div>
    </div>
  );
};

export default Body;

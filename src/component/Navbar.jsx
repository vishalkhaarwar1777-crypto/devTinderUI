import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "./ui/Avatar";
import Icon from "./ui/Icon";
import Logo from "./ui/Logo";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import { removeFeed } from "../utils/feedSlice";
import { removeConnections } from "../utils/connectionSlice";
import { removeRequests } from "../utils/requestSlice";
import { getErrorMessage } from "../utils/apiError";

const navItems = [
  { to: "/", label: "Feed", icon: "sparkles", end: true },
  { to: "/connections", label: "Connections", icon: "users" },
  { to: "/requests", label: "Requests", icon: "inbox" },
];

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const mobileRef = useRef(null);
  const profileRef = useRef(null);

  const closeMenus = () => {
    setMobileOpen(false);
    setProfileOpen(false);
  };

  useEffect(() => {
    if (!mobileOpen && !profileOpen) return undefined;

    const handlePointerDown = (event) => {
      if (mobileOpen && !mobileRef.current?.contains(event.target)) {
        setMobileOpen(false);
      }
      if (profileOpen && !profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, profileOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError("");

    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });

      dispatch(removeUser());
      dispatch(removeFeed());
      dispatch(removeConnections());
      dispatch(removeRequests());

      closeMenus();
      navigate("/login", { replace: true });
    } catch (err) {
      setLogoutError(getErrorMessage(err, "Could not log out. Try again."));
    } finally {
      setLoggingOut(false);
    }
  };

  const pendingCount = Array.isArray(requests) ? requests.length : 0;

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-base-content/55 hover:bg-base-200/80 hover:text-base-content"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary/10 text-primary"
        : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-base-300/60 bg-base-100/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Logo />

        {user && (
          <nav
            className="ml-5 hidden items-center gap-1 lg:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
                {item.to === "/requests" && pendingCount > 0 && (
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] leading-none text-primary">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setMobileOpen(false);
                  setLogoutError("");
                }}
                className="flex items-center gap-2 rounded-full border border-transparent p-1 transition-colors hover:border-base-300 hover:bg-base-200/70 lg:pr-2.5"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                aria-label="Open profile menu"
              >
                <Avatar
                  src={user.profilePhoto}
                  user={user}
                  size="sm"
                  className="ring-2 ring-primary/30"
                />
                <span className="hidden max-w-28 truncate text-sm font-medium text-base-content/80 lg:block">
                  {user.firstName || "Profile"}
                </span>
                <Icon
                  name="chevronDown"
                  size={14}
                  className={`hidden text-base-content/55 transition-transform duration-200 lg:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+0.6rem)] w-64 overflow-hidden rounded-2xl border border-base-300 bg-base-200 shadow-2xl shadow-black/40"
                  role="menu"
                  aria-label="Profile menu"
                >
                  <div className="flex items-center gap-3 border-b border-base-300/70 px-4 py-3.5">
                    <Avatar
                      src={user.profilePhoto}
                      user={user}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-base-content">
                        {[user.firstName, user.lastName]
                          .filter(Boolean)
                          .join(" ") || "Developer"}
                      </p>
                      <p className="truncate text-xs text-base-content/60">
                        {user.emailId || "Signed in"}
                      </p>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-base-content/70 transition-colors hover:bg-base-300/60 hover:text-base-content"
                    >
                      <Icon name="user" size={16} />
                      My profile
                    </Link>

                    <Link
                      to="/edit-profile"
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-base-content/70 transition-colors hover:bg-base-300/60 hover:text-base-content"
                    >
                      <Icon name="edit" size={16} />
                      Edit profile
                    </Link>

                    <div className="my-1 border-t border-base-300/60" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-error transition-colors hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Icon name="logout" size={16} />
                      {loggingOut ? "Logging out…" : "Log out"}
                    </button>
                  </div>

                  {logoutError && (
                    <p
                      role="alert"
                      className="border-t border-base-300/60 px-4 py-2.5 text-xs leading-5 text-error"
                    >
                      {logoutError}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="btn btn-ghost btn-sm text-base-content/70"
              >
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}

          <div className="relative" ref={mobileRef}>
            <button
              type="button"
              onClick={() => {
                setMobileOpen((open) => !open);
                setProfileOpen(false);
                setLogoutError("");
              }}
              className="btn btn-ghost btn-square btn-sm lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              <Icon name={mobileOpen ? "x" : "menu"} size={20} />
            </button>

            {mobileOpen && (
              <div
                id="mobile-navigation"
                className="absolute right-0 top-[calc(100%+0.6rem)] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-2 shadow-2xl shadow-black/40 lg:hidden"
              >
                {user ? (
                  <>
                    <div className="mb-2 flex items-center gap-3 rounded-xl bg-base-300/40 px-3 py-2.5">
                      <Avatar src={user.profilePhoto} user={user} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {[user.firstName, user.lastName]
                            .filter(Boolean)
                            .join(" ") || "Developer"}
                        </p>
                        <p className="truncate text-xs text-base-content/60">
                          {user.emailId}
                        </p>
                      </div>
                    </div>

                    <nav className="space-y-1" aria-label="Mobile navigation">
                      {navItems.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.end}
                          onClick={closeMenus}
                          className={mobileNavLinkClass}
                        >
                          <Icon name={item.icon} size={17} />
                          {item.label}
                          {item.to === "/requests" && pendingCount > 0 && (
                            <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary">
                              {pendingCount}
                            </span>
                          )}
                        </NavLink>
                      ))}
                    </nav>

                    <div className="my-2 border-t border-base-300/60" />

                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className={mobileNavLinkClass({ isActive: false })}
                    >
                      <Icon name="user" size={17} />
                      My profile
                    </Link>

                    <Link
                      to="/edit-profile"
                      onClick={closeMenus}
                      className={mobileNavLinkClass({ isActive: false })}
                    >
                      <Icon name="edit" size={17} />
                      Edit profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-60"
                    >
                      <Icon name="logout" size={17} />
                      {loggingOut ? "Logging out…" : "Log out"}
                    </button>

                    {logoutError && (
                      <p role="alert" className="px-3 py-2 text-xs text-error">
                        {logoutError}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="space-y-1">
                    <Link
                      to="/login"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-base-content/70 transition-colors hover:bg-base-300/60 hover:text-base-content"
                    >
                      <Icon name="lock" size={17} />
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMenus}
                      className="btn btn-primary mt-1 w-full"
                    >
                      Create an account
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Alert from "./ui/Alert";
import Avatar from "./ui/Avatar";
import EmptyState from "./ui/EmptyState";
import Icon from "./ui/Icon";
import PageHeader from "./ui/PageHeader";
import SkillBadge from "./ui/SkillBadge";
import { CardSkeleton } from "./ui/Skeletons";
import { BASE_URL, GENDER_LABELS } from "../utils/constants";
import { addConnections } from "../utils/connectionSlice";
import {
  getFullName,
  normalizeUsers,
} from "../utils/normalizeUser";
import { getErrorMessage } from "../utils/apiError";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState("");

  const didFetchRef = useRef(false);

  const fetchConnections = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const res = await axios.get(`${BASE_URL}/user/connection`, {
          withCredentials: true,
        });

        const users = normalizeUsers(res.data?.data ?? []);
        dispatch(addConnections(users));
      } catch (err) {
        setError(
          getErrorMessage(err, "Could not load your connections."),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchConnections();
  }, [fetchConnections]);

  const list = useMemo(
    () => (Array.isArray(connections) ? connections : []),
    [connections],
  );

  const availableSkills = useMemo(() => {
    const counts = new Map();

    list.forEach((connection) => {
      (connection.skill ?? []).forEach((skill) => {
        counts.set(skill, (counts.get(skill) ?? 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([skill]) => skill);
  }, [list]);

  const effectiveSkill =
    activeSkill && availableSkills.includes(activeSkill) ? activeSkill : "";

  const filteredList = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return list.filter((connection) => {
      const skills = connection.skill ?? [];

      if (effectiveSkill && !skills.includes(effectiveSkill)) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        connection.firstName,
        connection.lastName,
        connection.about,
        ...skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [list, query, effectiveSkill]);

  const hasFilters = Boolean(query.trim() || effectiveSkill);

  const clearFilters = () => {
    setQuery("");
    setActiveSkill("");
  };

  const showSkeleton = loading && list.length === 0;
  const showErrorState = Boolean(error) && list.length === 0;

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Network"
        title="Your connections"
        description="Developers who accepted your request, and the ones you accepted. Keep the conversation going and build something together."
        actions={
          <button
            type="button"
            onClick={() => fetchConnections({ refresh: true })}
            disabled={loading || refreshing}
            className="btn btn-outline btn-sm gap-2 border-base-300 text-base-content/70"
          >
            {loading || refreshing ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Icon name="refresh" size={15} />
            )}
            Refresh
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Icon
                name="search"
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/50"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search connections by name, skill, or bio…"
                aria-label="Search your connections"
                className="input input-bordered h-11 w-full border-base-300 bg-base-200/60 pl-10 pr-10 text-sm placeholder:text-base-content/60 focus:border-primary/50"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-base-content/55 transition-colors hover:bg-base-300 hover:text-base-content"
                  aria-label="Clear search"
                >
                  <Icon name="x" size={14} />
                </button>
              )}
            </div>

            {availableSkills.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:pb-0">
                <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-wider text-base-content/50 sm:inline">
                  Skills
                </span>

                {availableSkills.map((skill) => {
                  const isActive = effectiveSkill === skill;

                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setActiveSkill(isActive ? "" : skill)}
                      aria-pressed={isActive}
                      className={`shrink-0 rounded-full border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                        isActive
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-base-300 bg-base-200/50 text-base-content/50 hover:border-primary/30 hover:text-base-content/80"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {list.length > 0 && (
            <div className="flex items-center justify-between gap-3 text-xs text-base-content/55">
              <p>
                {filteredList.length}{" "}
                {filteredList.length === 1 ? "connection" : "connections"}
                {hasFilters ? ` of ${list.length}` : ""}
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-primary transition-colors hover:bg-primary/10"
                >
                  <Icon name="x" size={13} />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </PageHeader>

      {error && list.length > 0 && (
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Alert
            type="error"
            message={error}
            onDismiss={() => setError("")}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => fetchConnections({ refresh: true })}
            className="btn btn-outline btn-sm shrink-0 border-base-300"
          >
            Try again
          </button>
        </div>
      )}

      {showSkeleton ? (
        <CardSkeleton count={6} />
      ) : showErrorState ? (
        <EmptyState
          icon="alertCircle"
          title="We couldn't load your connections"
          description={error}
          action={
            <button
              type="button"
              onClick={() => fetchConnections()}
              className="btn btn-primary btn-sm gap-2"
            >
              <Icon name="refresh" size={15} />
              Try again
            </button>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon="users"
          title="No connections yet"
          description="When you and another developer both accept a request, they'll show up here. Head to the feed to find your first connection."
          action={
            <Link to="/" className="btn btn-primary btn-sm gap-2">
              <Icon name="sparkles" size={15} />
              Explore the feed
            </Link>
          }
        />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon="search"
          title="No connections match those filters"
          description="Try a different skill or a shorter search term. You can also clear everything and browse your full network."
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="btn btn-primary btn-sm gap-2"
            >
              <Icon name="x" size={15} />
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredList.map((connection) => {
            const fullName = getFullName(connection) || "Developer";
            const meta = [
              connection.age ? `${connection.age} years` : "",
              GENDER_LABELS[connection.gender] || "",
            ]
              .filter(Boolean)
              .join(" · ");

            return (
              <article
                key={connection._id}
                className="group flex h-full flex-col rounded-2xl border border-base-300 bg-base-200/60 p-5 transition duration-200 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    src={connection.profilePhoto}
                    user={connection}
                    size="lg"
                    className="ring-2 ring-primary/20 transition group-hover:ring-primary/40"
                  />

                  <div className="min-w-0 flex-1 pt-0.5">
                    <h2 className="truncate text-lg font-semibold tracking-tight">
                      {fullName}
                    </h2>
                    <p className="mt-1 text-xs text-base-content/60">
                      {meta || "Connected developer"}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
                      <Icon name="checkCircle" size={13} />
                      Connected
                    </p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-base-content/60">
                  {connection.about || "This developer has not added a bio yet."}
                </p>

                <div className="mt-3 flex min-h-14 flex-wrap content-start gap-1.5">
                  {connection.skill.length > 0 ? (
                    <>
                      {connection.skill.slice(0, 6).map((skill) => (
                        <SkillBadge key={skill}>{skill}</SkillBadge>
                      ))}
                      {connection.skill.length > 6 && (
                        <span className="inline-flex items-center rounded-full border border-base-300 bg-base-300/40 px-2.5 py-1 font-mono text-[11px] leading-none text-base-content/50">
                          +{connection.skill.length - 6}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-base-content/50">
                      No skills listed yet
                    </span>
                  )}
                </div>

                <div className="mt-auto border-t border-base-300/60 pt-4">
                  <Link
                    to={`/chat/${connection._id}`}
                    className="btn btn-primary btn-sm w-full gap-2"
                  >
                    <Icon name="message" size={15} />
                    Message {connection.firstName || "developer"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Connections;

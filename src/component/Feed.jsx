import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Alert from "./ui/Alert";
import EmptyState from "./ui/EmptyState";
import Icon from "./ui/Icon";
import PageHeader from "./ui/PageHeader";
import { CardSkeleton } from "./ui/Skeletons";
import UserCard from "./UserCard";
import { BASE_URL } from "../utils/constants";
import { addFeed, appendFeed, removeUserFromFeed } from "../utils/feedSlice";
import { normalizeUsers } from "../utils/normalizeUser";
import { getErrorMessage } from "../utils/apiError";

const PAGE_SIZE = 24;

const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((store) => store.feed);
  const currentUser = useSelector((store) => store.user);

  const [loading, setLoading] = useState(!feed);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [action, setAction] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSkill, setActiveSkill] = useState("");

  const initialFetchRef = useRef(false);
  const currentUserId = currentUser?._id;

  const loadPage = useCallback(
    async (nextPage, { append = false } = {}) => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`${BASE_URL}/feed`, {
          withCredentials: true,
          params: { page: nextPage, limit: PAGE_SIZE },
        });

        if (!Array.isArray(res.data)) {
          throw new Error("The feed API returned an unexpected response.");
        }

        // The backend also hides users you already interacted with. Filtering
        // your own profile here is a defensive fix for a backend query typo.
        const users = normalizeUsers(res.data).filter(
          (user) => user._id && user._id !== currentUserId,
        );

        if (append) {
          dispatch(appendFeed(users));
        } else {
          dispatch(addFeed(users));
        }

        setPage(nextPage);
        setHasMore(users.length === PAGE_SIZE);
      } catch (err) {
        setError(getErrorMessage(err, "Could not load the developer feed."));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, currentUserId],
  );

  useEffect(() => {
    if (feed === null && !initialFetchRef.current) {
      initialFetchRef.current = true;
      loadPage(1);
    }
  }, [feed, loadPage]);

  useEffect(() => {
    if (!feedback || feedback.type === "error") return undefined;

    const timer = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const availableSkills = useMemo(() => {
    const counts = new Map();

    (feed ?? []).forEach((user) => {
      user.skill.forEach((skill) => {
        counts.set(skill, (counts.get(skill) ?? 0) + 1);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([skill]) => skill);
  }, [feed]);

  const effectiveSkill =
    activeSkill && availableSkills.includes(activeSkill) ? activeSkill : "";

  const filteredFeed = useMemo(() => {
    const users = Array.isArray(feed) ? feed : [];
    const normalizedQuery = query.trim().toLowerCase();

    return users.filter((user) => {
      if (effectiveSkill && !user.skill.includes(effectiveSkill)) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        user.firstName,
        user.lastName,
        user.about,
        ...user.skill,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [feed, query, effectiveSkill]);

  const hasFilters = Boolean(query.trim() || effectiveSkill);
  const showSkeleton = loading && (!feed || feed.length === 0);
  const hasErrorWithoutData = Boolean(error) && (!feed || feed.length === 0);

  const clearFilters = () => {
    setQuery("");
    setActiveSkill("");
  };

  const handleRequest = async (status, userId) => {
    if (action) return;

    setAction({ id: userId, status });
    setFeedback(null);

    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true },
      );

      dispatch(removeUserFromFeed(userId));
      setFeedback({
        type: "success",
        message:
          status === "interested"
            ? "Connection request sent. We'll let you know when they respond."
            : "Developer ignored. They won't appear in your feed again.",
      });
    } catch (err) {
      const message = getErrorMessage(err, "Could not update the feed.");

      if (/already/i.test(message)) {
        dispatch(removeUserFromFeed(userId));
        setFeedback({
          type: "info",
          message:
            "You've already interacted with this developer, so we removed them from your feed.",
        });
      } else {
        setFeedback({ type: "error", message });
      }
    } finally {
      setAction(null);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Discover"
        title="Find your next collaborator"
        description="Browse developers across the community. Filter by skill, read their story, and start a connection that matters."
        actions={
          <button
            type="button"
            onClick={() => loadPage(1)}
            disabled={loading}
            className="btn btn-outline btn-sm gap-2 border-base-300 text-base-content/70"
          >
            {loading ? (
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
                placeholder="Search name, skill, or bio…"
                aria-label="Search developers"
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
                      onClick={() =>
                        setActiveSkill(isActive ? "" : skill)
                      }
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

          <div className="flex items-center justify-between gap-3 text-xs text-base-content/55">
            <p>
              {loading && feed?.length
                ? "Refreshing feed…"
                : `${filteredFeed.length} ${
                    filteredFeed.length === 1 ? "developer" : "developers"
                  }`}
              {hasFilters && feed?.length
                ? ` of ${feed.length} loaded`
                : ""}
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
        </div>
      </PageHeader>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          className="mb-6"
        />
      )}

      {error && feed?.length > 0 && (
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Alert
            type="error"
            message={error}
            onDismiss={() => setError("")}
            className="flex-1"
          />
          <button
            type="button"
            onClick={() => loadPage(1)}
            className="btn btn-outline btn-sm shrink-0 border-base-300"
          >
            Try again
          </button>
        </div>
      )}

      {showSkeleton ? (
        <CardSkeleton count={6} />
      ) : hasErrorWithoutData ? (
        <EmptyState
          icon="alertCircle"
          title="We couldn't load the feed"
          description={error}
          action={
            <button
              type="button"
              onClick={() => loadPage(1)}
              className="btn btn-primary btn-sm gap-2"
            >
              <Icon name="refresh" size={15} />
              Try again
            </button>
          }
        />
      ) : feed?.length === 0 ? (
        <EmptyState
          icon="users"
          title="Your feed is quiet right now"
          description="There are no new developers to show. Check back later or refresh to see if someone new joined."
          action={
            <button
              type="button"
              onClick={() => loadPage(1)}
              className="btn btn-primary btn-sm gap-2"
            >
              <Icon name="refresh" size={15} />
              Refresh feed
            </button>
          }
        />
      ) : filteredFeed.length === 0 ? (
        <EmptyState
          icon="search"
          title="No developers match those filters"
          description="Try a different skill or a shorter search term. You can also clear everything and browse the full feed."
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
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredFeed.map((developer) => (
              <UserCard
                key={developer._id}
                user={developer}
                onConnect={(id) => handleRequest("interested", id)}
                onIgnore={(id) => handleRequest("ignored", id)}
                busyStatus={
                  action?.id === developer._id ? action.status : null
                }
                disabled={Boolean(action)}
              />
            ))}
          </div>

          {hasMore && !hasFilters && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => loadPage(page + 1, { append: true })}
                disabled={loading}
                className="btn btn-outline btn-sm gap-2 border-base-300 text-base-content/70"
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Icon name="arrowRight" size={15} />
                )}
                {loading ? "Loading…" : "Load more developers"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;

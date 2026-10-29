import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Alert from "./ui/Alert";
import Avatar from "./ui/Avatar";
import EmptyState from "./ui/EmptyState";
import Icon from "./ui/Icon";
import PageHeader from "./ui/PageHeader";
import SkillBadge from "./ui/SkillBadge";
import { RowSkeleton } from "./ui/Skeletons";
import { BASE_URL, GENDER_LABELS } from "../utils/constants";
import { addRequests, removeRequest } from "../utils/requestSlice";
import { removeConnections } from "../utils/connectionSlice";
import { getFullName, normalizeUser } from "../utils/normalizeUser";
import { getErrorMessage } from "../utils/apiError";

const formatReceivedAt = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

const Requests = () => {
  const requests = useSelector((store) => store.requests);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [reviewing, setReviewing] = useState(null);

  const didFetchRef = useRef(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${BASE_URL}/user/requests/received`, {
        withCredentials: true,
      });

      const normalized = (Array.isArray(res.data?.data) ? res.data.data : [])
        .map((request) => {
          const sender = normalizeUser(request.fromUserId);
          return sender ? { ...request, fromUserId: sender } : null;
        })
        .filter(Boolean);

      dispatch(addRequests(normalized));
    } catch (err) {
      setError(
        getErrorMessage(err, "Could not load your connection requests."),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (!feedback || feedback.type === "error") return undefined;

    const timer = window.setTimeout(() => setFeedback(null), 4500);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const list = Array.isArray(requests) ? requests : [];
  const showSkeleton = loading && list.length === 0;
  const showErrorState = Boolean(error) && list.length === 0;

  const reviewRequest = async (status, requestId) => {
    if (reviewing) return;

    setReviewing({ id: requestId, status });
    setFeedback(null);

    try {
      await axios.post(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {},
        { withCredentials: true },
      );

      dispatch(removeRequest(requestId));

      if (status === "accepted") {
        // Force the connections page to fetch the newly accepted developer.
        dispatch(removeConnections());
      }

      setFeedback({
        type: "success",
        message:
          status === "accepted"
            ? "Request accepted. This developer is now in your connections."
            : "Request rejected. They won't appear in your pending requests.",
      });
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Could not update this connection request.",
      );

      setFeedback({ type: "error", message });

      if (/not found/i.test(message)) {
        dispatch(removeRequest(requestId));
      }
    } finally {
      setReviewing(null);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="Inbox"
        title="Connection requests"
        description="Developers who want to connect with you. Accept the ones that feel right and pass on the rest — no pressure."
        actions={
          <button
            type="button"
            onClick={fetchRequests}
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
        {list.length > 0 && (
          <p className="text-xs text-base-content/55">
            {list.length} pending {list.length === 1 ? "request" : "requests"}
          </p>
        )}
      </PageHeader>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
          className="mb-6"
        />
      )}

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
            onClick={fetchRequests}
            className="btn btn-outline btn-sm shrink-0 border-base-300"
          >
            Try again
          </button>
        </div>
      )}

      {showSkeleton ? (
        <RowSkeleton count={4} />
      ) : showErrorState ? (
        <EmptyState
          icon="alertCircle"
          title="We couldn't load your requests"
          description={error}
          action={
            <button
              type="button"
              onClick={fetchRequests}
              className="btn btn-primary btn-sm gap-2"
            >
              <Icon name="refresh" size={15} />
              Try again
            </button>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No pending requests"
          description="You're all caught up. When another developer wants to connect, their request will appear here."
          action={
            <Link to="/" className="btn btn-primary btn-sm gap-2">
              <Icon name="sparkles" size={15} />
              Discover developers
            </Link>
          }
        />
      ) : (
        <div className="space-y-3.5">
          {list.map((request) => {
            const sender = request.fromUserId;
            const fullName = getFullName(sender) || "Developer";
            const receivedAt = formatReceivedAt(request.createdAt);
            const meta = [
              sender.age ? `${sender.age} years` : "",
              GENDER_LABELS[sender.gender] || "",
            ]
              .filter(Boolean)
              .join(" · ");

            const accepting =
              reviewing?.id === request._id && reviewing.status === "accepted";
            const rejecting =
              reviewing?.id === request._id && reviewing.status === "rejected";

            return (
              <article
                key={request._id}
                className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-200/60 p-5 transition-colors hover:border-primary/20 sm:flex-row sm:items-center"
              >
                <Avatar
                  src={sender.profilePhoto}
                  user={sender}
                  size="lg"
                  className="ring-2 ring-primary/20"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h2 className="text-lg font-semibold tracking-tight text-base-content">
                      {fullName}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                      <Icon name="inbox" size={11} />
                      Wants to connect
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-base-content/60">
                    {[meta, receivedAt ? `Received ${receivedAt}` : ""]
                      .filter(Boolean)
                      .join(" · ") || "New connection request"}
                  </p>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-base-content/60">
                    {sender.about || "This developer has not added a bio yet."}
                  </p>

                  {sender.skill.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {sender.skill.slice(0, 6).map((skill) => (
                        <SkillBadge key={skill}>{skill}</SkillBadge>
                      ))}
                      {sender.skill.length > 6 && (
                        <span className="inline-flex items-center rounded-full border border-base-300 bg-base-300/40 px-2.5 py-1 font-mono text-[11px] leading-none text-base-content/50">
                          +{sender.skill.length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-2 sm:flex-col md:flex-row">
                  <button
                    type="button"
                    onClick={() => reviewRequest("accepted", request._id)}
                    disabled={Boolean(reviewing)}
                    className="btn btn-primary btn-sm flex-1 gap-1.5 sm:flex-none md:flex-1"
                    aria-label={`Accept connection request from ${fullName}`}
                  >
                    {accepting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Icon name="check" size={15} />
                    )}
                    {accepting ? "Accepting…" : "Accept"}
                  </button>

                  <button
                    type="button"
                    onClick={() => reviewRequest("rejected", request._id)}
                    disabled={Boolean(reviewing)}
                    className="btn btn-outline btn-sm flex-1 gap-1.5 border-base-300 text-base-content/60 hover:border-error/40 hover:bg-error/10 hover:text-error sm:flex-none md:flex-1"
                    aria-label={`Reject connection request from ${fullName}`}
                  >
                    {rejecting ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <Icon name="x" size={15} />
                    )}
                    {rejecting ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Requests;

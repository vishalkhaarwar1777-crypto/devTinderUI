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

  const list = Array.isArray(connections) ? connections : [];
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
        {list.length > 0 && (
          <p className="text-xs text-base-content/55">
            {list.length} {list.length === 1 ? "connection" : "connections"}
          </p>
        )}
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
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((connection) => {
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

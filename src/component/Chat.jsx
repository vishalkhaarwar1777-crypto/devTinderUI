import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "./ui/Avatar";
import EmptyState from "./ui/EmptyState";
import Icon from "./ui/Icon";
import SkillBadge from "./ui/SkillBadge";
import { BASE_URL, GENDER_LABELS } from "../utils/constants";
import { addConnections } from "../utils/connectionSlice";
import {
  getFullName,
  normalizeUsers,
} from "../utils/normalizeUser";
import { getErrorMessage } from "../utils/apiError";

const Chat = () => {
  const { connectionId } = useParams();
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();

  const connectionFromStore = useMemo(() => {
    if (!Array.isArray(connections)) return null;
    return connections.find((item) => item._id === connectionId) ?? null;
  }, [connections, connectionId]);

  const [fetchedConnection, setFetchedConnection] = useState(null);
  const [loading, setLoading] = useState(!connectionFromStore);
  const [error, setError] = useState("");

  useEffect(() => {
    if (connectionFromStore) return undefined;

    let active = true;

    const loadConnection = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/connection`, {
          withCredentials: true,
        });

        const users = normalizeUsers(res.data?.data ?? []);
        dispatch(addConnections(users));

        if (!active) return;

        const match = users.find((item) => item._id === connectionId) ?? null;
        setFetchedConnection(match);

        if (!match) {
          setError(
            "This developer is not in your connections. They may have removed the connection.",
          );
        }
      } catch (err) {
        if (active) {
          setError(
            getErrorMessage(err, "Could not load this conversation."),
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadConnection();

    return () => {
      active = false;
    };
  }, [connectionFromStore, connectionId, dispatch]);

  const connection = connectionFromStore ?? fetchedConnection;
  const fullName = getFullName(connection) || "Developer";

  if (loading && !connection) {
    return (
      <div className="page-enter mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center">
        <div className="flex items-center gap-2.5 text-sm text-base-content/50">
          <span className="loading loading-spinner loading-sm text-primary" />
          Opening conversation…
        </div>
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="page-enter mx-auto max-w-2xl">
        <EmptyState
          icon="message"
          title="Conversation unavailable"
          description={
            error ||
            "We couldn't find this developer in your connections."
          }
          action={
            <Link to="/connections" className="btn btn-primary btn-sm gap-2">
              <Icon name="users" size={15} />
              Back to connections
            </Link>
          }
        />
      </div>
    );
  }

  const meta = [
    connection.age ? `${connection.age} years` : "",
    GENDER_LABELS[connection.gender] || "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="page-enter mx-auto max-w-3xl">
      <Link
        to="/connections"
        className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-base-content/50 transition-colors hover:bg-base-200 hover:text-base-content"
      >
        <Icon name="arrowRight" size={15} className="rotate-180" />
        Back to connections
      </Link>

      <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-200/60">
        <header className="flex flex-col gap-4 border-b border-base-300/60 p-5 sm:flex-row sm:items-center sm:p-6">
          <Avatar
            src={connection.profilePhoto}
            user={connection}
            size="lg"
            className="ring-2 ring-primary/25"
          />

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-semibold tracking-tight">
              {fullName}
            </h1>
            <p className="mt-1 text-xs text-base-content/60">
              {meta || "Connected developer"}
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs text-success">
            <span className="size-1.5 rounded-full bg-success" />
            Connected
          </span>
        </header>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-100/30 px-6 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-2xl border border-base-300 bg-base-200 text-primary">
              <Icon name="message" size={24} />
            </span>

            <h2 className="mt-5 text-lg font-semibold tracking-tight">
              Messaging is coming soon
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-base-content/50">
              Your connection is saved, but the DevTinder API does not expose a
              messaging endpoint yet. This screen is ready for it when it ships.
            </p>

            <Link
              to="/connections"
              className="btn btn-primary btn-sm mt-6 gap-2"
            >
              <Icon name="users" size={15} />
              View all connections
            </Link>
          </div>

          {connection.about && (
            <section className="mt-6">
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-base-content/55">
                About {connection.firstName || "this developer"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-base-content/60">
                {connection.about}
              </p>
            </section>
          )}

          {connection.skill?.length > 0 && (
            <section className="mt-6">
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-base-content/55">
                Skills
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {connection.skill.map((skill) => (
                  <SkillBadge key={skill}>{skill}</SkillBadge>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

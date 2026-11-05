import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Alert from "./ui/Alert";
import Avatar from "./ui/Avatar";
import EmptyState from "./ui/EmptyState";
import Icon from "./ui/Icon";
import SkillBadge from "./ui/SkillBadge";
import apiClient from "../utils/apiClient";
import { GENDER_LABELS } from "../utils/constants";
import { addConnections } from "../utils/connectionSlice";
import { getErrorMessage } from "../utils/apiError";
import { getFullName, normalizeUsers } from "../utils/normalizeUser";

// Stable reference so the scroll effect does not run on every render.
const EMPTY_THREAD = [];
const PAGE_SIZE = 30;

const Chat = () => {
  const { connectionId } = useParams();
  const dispatch = useDispatch();

  const connections = useSelector((store) => store.connections);
  const currentUser = useSelector((store) => store.user);

  const [connectionsLoading, setConnectionsLoading] = useState(
    !Array.isArray(connections),
  );
  const [connectionsError, setConnectionsError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Each conversation keeps its own thread, draft, errors and pagination so
  // switching chats never shows one person's data under another person's name.
  const [threads, setThreads] = useState({});
  const [drafts, setDrafts] = useState({});
  const [hasMore, setHasMore] = useState({});
  const [pages, setPages] = useState({});
  const [threadErrors, setThreadErrors] = useState({});
  const [sendErrors, setSendErrors] = useState({});

  // Which conversation the messages in `threads` belong to. Deriving the
  // loading flag avoids setting state synchronously inside the fetch effect.
  const [loadedFor, setLoadedFor] = useState(null);
  const [sending, setSending] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const messagesLoading = loadedFor !== connectionId;
  const threadError = threadErrors[connectionId] ?? "";
  const sendError = sendErrors[connectionId] ?? "";

  const threadRef = useRef(null);
  const didFetchConnectionsRef = useRef(false);
  const scrollAnchorRef = useRef(null);

  // Get the person from the same data the connections page uses. Opening a
  // chat from a hard refresh still works because we fetch the list when Redux
  // does not have it yet.
  const fetchConnections = useCallback(async () => {
    setConnectionsLoading(true);
    setConnectionsError("");

    try {
      const res = await apiClient.get("/user/connection");

      dispatch(addConnections(normalizeUsers(res.data?.data ?? [])));
    } catch (err) {
      setConnectionsError(
        getErrorMessage(err, "Could not load this conversation."),
      );
    } finally {
      setConnectionsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(connections)) return;
    if (didFetchConnectionsRef.current) return;

    didFetchConnectionsRef.current = true;
    fetchConnections();
  }, [connections, fetchConnections]);

  // Load the newest page of messages for the conversation in the URL. The API
  // returns the page oldest-first and tells us whether older pages exist.
  useEffect(() => {
    if (!connectionId) return undefined;

    let cancelled = false;

    const loadThread = async () => {
      try {
        const res = await apiClient.get(`/user/messages/${connectionId}`, {
          params: { page: 1, limit: PAGE_SIZE },
        });

        if (cancelled) return;

        const data = Array.isArray(res.data?.data) ? res.data.data : [];

        setThreads((previous) => ({ ...previous, [connectionId]: data }));
        setHasMore((previous) => ({
          ...previous,
          [connectionId]: Boolean(res.data?.hasMore),
        }));
        setPages((previous) => ({ ...previous, [connectionId]: 1 }));
        setThreadErrors((previous) => ({ ...previous, [connectionId]: "" }));

        // Best effort: opening a conversation marks the other person's
        // messages as read. A failure must not break the chat.
        apiClient
          .post(`/user/messages/${connectionId}/read`)
          .catch(() => {});
      } catch (err) {
        if (cancelled) return;

        setThreads((previous) => ({ ...previous, [connectionId]: [] }));
        setThreadErrors((previous) => ({
          ...previous,
          [connectionId]: getErrorMessage(
            err,
            "Could not load this conversation.",
          ),
        }));
      } finally {
        if (!cancelled) setLoadedFor(connectionId);
      }
    };

    loadThread();

    return () => {
      cancelled = true;
    };
  }, [connectionId, reloadKey]);

  const messages = threads[connectionId] ?? EMPTY_THREAD;
  const draft = drafts[connectionId] ?? "";

  const setDraft = (value) =>
    setDrafts((previous) => ({ ...previous, [connectionId]: value }));

  const setSendError = (value) =>
    setSendErrors((previous) => ({ ...previous, [connectionId]: value }));

  // Scroll to the newest message. When older messages were prepended, keep the
  // reader at the same place instead of jumping to the bottom.
  useEffect(() => {
    const node = threadRef.current;

    if (!node) return;

    if (scrollAnchorRef.current != null) {
      node.scrollTop = node.scrollHeight - scrollAnchorRef.current;
      scrollAnchorRef.current = null;
    } else {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  const connection = (Array.isArray(connections) ? connections : []).find(
    (item) => item._id === connectionId,
  );

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMore[connectionId]) return;

    const nextPage = (pages[connectionId] ?? 1) + 1;
    const node = threadRef.current;

    scrollAnchorRef.current = node ? node.scrollHeight : null;
    setLoadingOlder(true);
    setSendError("");

    try {
      const res = await apiClient.get(`/user/messages/${connectionId}`, {
        params: { page: nextPage, limit: PAGE_SIZE },
      });

      const older = Array.isArray(res.data?.data) ? res.data.data : [];

      setThreads((previous) => {
        const existing = previous[connectionId] ?? [];
        const seen = new Set(existing.map((message) => message._id));

        return {
          ...previous,
          [connectionId]: [
            ...older.filter((message) => !seen.has(message._id)),
            ...existing,
          ],
        };
      });
      setHasMore((previous) => ({
        ...previous,
        [connectionId]: Boolean(res.data?.hasMore),
      }));
      setPages((previous) => ({ ...previous, [connectionId]: nextPage }));
    } catch (err) {
      scrollAnchorRef.current = null;
      setSendError(
        getErrorMessage(err, "Could not load older messages."),
      );
    } finally {
      setLoadingOlder(false);
    }
  };

  const sendMessage = async () => {
    const text = draft.trim();

    if (!text || sending) return;

    const tempId = `pending-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      senderId: currentUser?._id ?? "",
      text,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setSending(true);
    setSendError("");
    setThreads((previous) => ({
      ...previous,
      [connectionId]: [...(previous[connectionId] ?? []), optimisticMessage],
    }));
    setDraft("");

    try {
      const res = await apiClient.post(`/user/messages/${connectionId}`, {
        text,
      });

      const saved = res.data?.data ?? { ...optimisticMessage, pending: false };

      setThreads((previous) => ({
        ...previous,
        [connectionId]: (previous[connectionId] ?? []).map((message) =>
          message._id === tempId ? saved : message,
        ),
      }));
    } catch (err) {
      // Put the message back in the box so nothing the user typed is lost.
      setThreads((previous) => ({
        ...previous,
        [connectionId]: (previous[connectionId] ?? []).filter(
          (message) => message._id !== tempId,
        ),
      }));
      setDraft(text);
      setSendError(getErrorMessage(err, "Could not send your message."));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const retry = () => {
    if (!Array.isArray(connections)) {
      didFetchConnectionsRef.current = true;
      fetchConnections();
      return;
    }

    // Show the loading state again while the retry runs.
    setLoadedFor(null);
    setReloadKey((key) => key + 1);
  };

  if (connectionsLoading) {
    return (
      <div className="page-enter mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center gap-2.5 text-sm text-base-content/55">
        <span className="loading loading-spinner loading-sm text-primary" />
        Loading conversation…
      </div>
    );
  }

  if (!connection) {
    const error = connectionsError || threadError;

    return (
      <EmptyState
        icon={error ? "alertCircle" : "message"}
        title={error ? "We couldn't load this conversation" : "Connection not found"}
        description={
          error ||
          "This conversation is only available for one of your accepted connections."
        }
        action={
          error ? (
            <button
              type="button"
              onClick={retry}
              className="btn btn-primary btn-sm gap-2"
            >
              <Icon name="refresh" size={15} />
              Try again
            </button>
          ) : (
            <Link to="/connections" className="btn btn-primary btn-sm gap-2">
              <Icon name="users" size={15} />
              Back to connections
            </Link>
          )
        }
      />
    );
  }

  const fullName = getFullName(connection) || "Developer";
  const meta = [
    connection.age ? `${connection.age} years` : "",
    GENDER_LABELS[connection.gender] || "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="page-enter mx-auto max-w-5xl">
      {/* Top navigation */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          to="/connections"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-base-content/50 hover:bg-base-200"
        >
          <Icon name="arrowRight" size={15} className="rotate-180" />
          Back to connections
        </Link>

        <span className="font-mono text-xs uppercase text-base-content/40">
          Direct message
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        {/* Chat section */}
        <section className="flex h-[calc(100vh-15rem)] min-h-[30rem] max-h-[46rem] flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-200/60">
          {/* Chat header */}
          <header className="flex items-center gap-3 border-b border-base-300/60 px-4 py-3.5">
            <Avatar
              src={connection.profilePhoto}
              user={connection}
              size="md"
            />

            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-semibold">{fullName}</h1>

              <p className="text-xs text-base-content/55">
                {meta || "Connected developer"}
              </p>
            </div>

            <span className="rounded-full bg-success/10 px-3 py-1 text-xs text-success">
              Connected
            </span>
          </header>

          {/* Messages */}
          <div
            ref={threadRef}
            className="flex-1 overflow-y-auto px-3 py-5 sm:px-5"
          >
            {messagesLoading ? (
              <div className="flex h-full items-center justify-center gap-2.5 text-sm text-base-content/50">
                <span className="loading loading-spinner loading-sm text-primary" />
                Loading messages…
              </div>
            ) : threadError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-base-content/50">
                <p>{threadError}</p>
                <button
                  type="button"
                  onClick={retry}
                  className="btn btn-outline btn-sm gap-2 border-base-300"
                >
                  <Icon name="refresh" size={15} />
                  Try again
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-base-content/50">
                Start your conversation!
              </div>
            ) : (
              <div className="space-y-3">
                {hasMore[connectionId] && (
                  <div className="flex justify-center pb-1">
                    <button
                      type="button"
                      onClick={loadOlderMessages}
                      disabled={loadingOlder}
                      className="btn btn-ghost btn-xs gap-1.5 text-base-content/55"
                    >
                      {loadingOlder ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <Icon name="chevronDown" size={13} className="rotate-180" />
                      )}
                      {loadingOlder ? "Loading…" : "Load older messages"}
                    </button>
                  </div>
                )}

                {messages.map((message) => {
                  const mine = message.senderId === currentUser?._id;

                  return (
                    <div
                      key={message._id}
                      className={`flex items-end gap-2 ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!mine && (
                        <Avatar
                          src={connection.profilePhoto}
                          user={connection}
                          size="xs"
                        />
                      )}

                      <div
                        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm ${
                          mine
                            ? "rounded-br-md bg-primary text-primary-content"
                            : "rounded-bl-md border border-base-300 bg-base-100 text-base-content"
                        } ${message.pending ? "opacity-70" : ""}`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.text}
                        </p>

                        <p className="mt-1 text-[10px] opacity-60">
                          {message.pending
                            ? "Sending…"
                            : formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Send errors */}
          {sendError && (
            <div className="px-3 sm:px-4">
              <Alert
                type="error"
                message={sendError}
                onDismiss={() => setSendError("")}
              />
            </div>
          )}

          {/* Message input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="border-t border-base-300/60 p-3 sm:p-4"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-base-300 bg-base-100/50 p-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={Math.min(4, draft.split("\n").length)}
                maxLength={2000}
                placeholder={`Message ${connection.firstName || "developer"}...`}
                className="min-h-9 max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm focus:outline-none"
              />

              <button
                type="submit"
                disabled={!draft.trim() || sending}
                className="btn btn-primary btn-sm btn-square"
                aria-label="Send message"
              >
                {sending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Icon name="send" size={15} />
                )}
              </button>
            </div>

            <p className="mt-2 px-1 text-[11px] text-base-content/45">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </section>

        {/* Developer profile */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-base-300 bg-base-200/60 p-5">
            <h2 className="font-mono text-xs uppercase text-base-content/55">
              Developer
            </h2>

            <div className="mt-3 flex items-center gap-3">
              <Avatar
                src={connection.profilePhoto}
                user={connection}
                size="md"
              />

              <div>
                <p className="text-sm font-medium">{fullName}</p>

                <p className="text-xs text-base-content/55">
                  {meta || "Connected developer"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-base-content/60">
              {connection.about || "This developer has not added a bio yet."}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {(connection.skill ?? []).map((skill) => (
                <SkillBadge key={skill}>{skill}</SkillBadge>
              ))}

              {(connection.skill ?? []).length === 0 && (
                <span className="text-xs text-base-content/50">
                  No skills listed yet
                </span>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-base-300 bg-base-100/40 p-5">
            <h2 className="text-sm font-medium">Start strong</h2>

            <ul className="mt-3 space-y-2 text-xs text-base-content/60">
              <li>• Talk about your projects.</li>
              <li>• Ask about their skills.</li>
              <li>• Share your ideas.</li>
            </ul>

            <Link
              to="/connections"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              Browse connections
              <Icon name="arrowRight" size={13} />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Chat;

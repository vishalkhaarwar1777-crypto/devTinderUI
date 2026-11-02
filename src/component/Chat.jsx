
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "./ui/Alert";
import Avatar from "./ui/Avatar";
import Icon from "./ui/Icon";
import SkillBadge from "./ui/SkillBadge";

const Chat = () => {
  // Sample developer data
  const connection = {
    _id: "user-2",
    firstName: "Rahul",
    lastName: "Sharma",
    age: 24,
    gender: "Male",
    profilePhoto: "",
    about: "Full Stack Developer. Interested in building projects.",
    skill: ["React", "Node.js", "MongoDB", "JavaScript"],
  };

  const currentUser = {
    _id: "user-1",
  };

  // Sample messages
  const [messages, setMessages] = useState([
    {
      _id: "1",
      senderId: "user-2",
      text: "Hey! How are you?",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      senderId: "user-1",
      text: "I'm good! What about you?",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "3",
      senderId: "user-2",
      text: "I'm doing great. Are you working on any project?",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");

  const threadRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    const node = threadRef.current;

    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [messages]);

  // Send message locally
  const sendMessage = () => {
    const text = draft.trim();

    if (!text) return;

    const newMessage = {
      _id: Date.now().toString(),
      senderId: currentUser._id,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((previous) => [...previous, newMessage]);
    setDraft("");
    setSendError("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (value) => {
    return new Date(value).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const fullName = `${connection.firstName} ${connection.lastName}`;

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
              <h1 className="text-sm font-semibold">
                {fullName}
              </h1>

              <p className="text-xs text-base-content/55">
                {connection.age} years · {connection.gender}
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
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-base-content/50">
                Start your conversation!
              </div>
            ) : (
              <div className="space-y-3">

                {messages.map((message) => {
                  const mine =
                    message.senderId === currentUser._id;

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
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.text}
                        </p>

                        <p className="mt-1 text-[10px] opacity-60">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}

              </div>
            )}
          </div>

          {/* Error message */}
          {sendError && (
            <Alert
              type="error"
              message={sendError}
              onDismiss={() => setSendError("")}
            />
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
                placeholder={`Message ${connection.firstName}...`}
                className="min-h-9 max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm focus:outline-none"
              />

              <button
                type="submit"
                disabled={!draft.trim()}
                className="btn btn-primary btn-sm btn-square"
              >
                <Icon name="send" size={15} />
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
                <p className="text-sm font-medium">
                  {fullName}
                </p>

                <p className="text-xs text-base-content/55">
                  {connection.age} years · {connection.gender}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-base-content/60">
              {connection.about}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {connection.skill.map((skill) => (
                <SkillBadge key={skill}>
                  {skill}
                </SkillBadge>
              ))}
            </div>

          </section>

          <section className="rounded-2xl border border-base-300 bg-base-100/40 p-5">

            <h2 className="text-sm font-medium">
              Start strong
            </h2>

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

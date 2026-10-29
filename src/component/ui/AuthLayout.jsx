import Icon from "./Icon";

const features = [
  {
    icon: "sparkles",
    title: "A feed built for developers",
    description:
      "Discover people who are actually building — filtered by the skills you care about.",
  },
  {
    icon: "inbox",
    title: "Requests without the noise",
    description:
      "Accept or pass in one click. Your connections stay in one clean place.",
  },
  {
    icon: "zap",
    title: "Made for real collaboration",
    description:
      "Find a teammate for your next side project, open-source idea, or startup.",
  },
];

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="page-enter grid min-h-[calc(100vh-12rem)] items-center gap-12 py-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
    <section className="hidden lg:block">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-primary">
        Developer network
      </p>

      <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.15] tracking-tight text-base-content xl:text-5xl">
        Meet the developers who will build your next big idea.
      </h1>

      <p className="mt-5 max-w-md text-base leading-7 text-base-content/55">
        DevTinder is a focused network for developers. Share what you build,
        connect with complementary skills, and start the conversation.
      </p>

      <ul className="mt-9 max-w-md space-y-5">
        {features.map((feature) => (
          <li key={feature.title} className="flex gap-3.5">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Icon name={feature.icon} size={17} />
            </span>
            <div>
              <p className="text-sm font-medium text-base-content">
                {feature.title}
              </p>
              <p className="mt-0.5 text-sm leading-6 text-base-content/50">
                {feature.description}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 max-w-md overflow-hidden rounded-2xl border border-base-300 bg-base-200/70 shadow-2xl shadow-black/25">
        <div className="flex items-center gap-1.5 border-b border-base-300/70 px-4 py-3">
          <span className="size-2 rounded-full bg-error/60" />
          <span className="size-2 rounded-full bg-warning/60" />
          <span className="size-2 rounded-full bg-success/60" />
          <span className="ml-auto font-mono text-[10px] tracking-wide text-base-content/50">
            match.ts
          </span>
        </div>

        <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-6 text-base-content/65">
          <code>
            <span className="text-primary">const</span> match ={" "}
            <span className="text-accent">await</span> DevTinder.
            <span className="text-secondary">connect</span>({"{"}
            {"\n"}  skills: [<span className="text-success">"React"</span>,{" "}
            <span className="text-success">"Node.js"</span>],{"\n"}  mindset:{" "}
            <span className="text-success">"build in public"</span>,{"\n"}
            {"}"});{"\n\n"}
            <span className="text-base-content/50">
              {"// ship something meaningful"}
            </span>
          </code>
        </pre>
      </div>
    </section>

    <section className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-base-300 bg-base-200/75 p-6 shadow-2xl shadow-black/25 backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-base-content">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm leading-6 text-base-content/55">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </section>
  </div>
);

export default AuthLayout;

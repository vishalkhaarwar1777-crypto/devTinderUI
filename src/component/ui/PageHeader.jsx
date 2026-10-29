const PageHeader = ({
  eyebrow,
  title,
  description,
  actions,
  children,
  className = "",
}) => (
  <header className={`mb-8 ${className}`}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2.5 max-w-2xl text-sm leading-6 text-base-content/55">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>

    {children && <div className="mt-6">{children}</div>}
  </header>
);

export default PageHeader;

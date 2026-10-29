import Icon from "./Icon";

const EmptyState = ({
  icon = "sparkles",
  title,
  description,
  action,
  className = "",
}) => (
  <div
    className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-base-300 bg-base-200/40 px-6 py-14 text-center sm:py-16 ${className}`}
  >
    <span className="grid size-14 place-items-center rounded-2xl border border-base-300 bg-base-200 text-primary">
      <Icon name={icon} size={24} />
    </span>

    <h2 className="mt-5 text-lg font-semibold tracking-tight text-base-content">
      {title}
    </h2>

    {description && (
      <p className="mt-2 max-w-sm text-sm leading-6 text-base-content/55">
        {description}
      </p>
    )}

    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;

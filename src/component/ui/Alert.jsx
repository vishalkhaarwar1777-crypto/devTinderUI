import Icon from "./Icon";

const variants = {
  error: {
    container: "border-error/30 bg-error/10",
    icon: "text-error",
    iconName: "alertCircle",
  },
  success: {
    container: "border-success/30 bg-success/10",
    icon: "text-success",
    iconName: "checkCircle",
  },
  info: {
    container: "border-info/30 bg-info/10",
    icon: "text-info",
    iconName: "info",
  },
};

const Alert = ({
  type = "info",
  title,
  children,
  message,
  onDismiss,
  className = "",
}) => {
  const variant = variants[type] ?? variants.info;
  const body = children ?? message;

  if (!body && !title) return null;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${variant.container} ${className}`}
    >
      <Icon
        name={variant.iconName}
        size={18}
        className={`mt-0.5 shrink-0 ${variant.icon}`}
      />

      <div className="min-w-0 flex-1">
        {title && (
          <p className="font-medium text-base-content">{title}</p>
        )}
        {body && (
          <p className={`text-base-content/70 ${title ? "mt-0.5" : ""}`}>
            {body}
          </p>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-base-content/55 transition-colors hover:bg-base-300/60 hover:text-base-content"
          aria-label="Dismiss message"
        >
          <Icon name="x" size={15} />
        </button>
      )}
    </div>
  );
};

export default Alert;

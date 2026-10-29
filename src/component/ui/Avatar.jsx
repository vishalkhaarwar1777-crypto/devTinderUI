import { useState } from "react";
import { getInitials, getFullName } from "../../utils/normalizeUser";

const sizes = {
  xs: "size-8 text-[10px]",
  sm: "size-10 text-xs",
  md: "size-12 text-sm",
  lg: "size-16 text-base",
  xl: "size-20 text-xl",
  "2xl": "size-24 text-2xl sm:size-28 sm:text-3xl",
};

const Avatar = ({
  src,
  name,
  user,
  size = "md",
  ring = false,
  className = "",
}) => {
  const [failedSrc, setFailedSrc] = useState(null);

  const label = name || getFullName(user);
  const initials = getInitials(user || { firstName: name });
  const failed = Boolean(src) && failedSrc === src;

  const ringClass = ring
    ? "ring-4 ring-primary/25 ring-offset-4 ring-offset-base-200"
    : "";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-base-300 font-semibold text-base-content/70 ${sizes[size] ?? sizes.md} ${ringClass} ${className}`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={label ? `${label}'s profile photo` : "Developer profile photo"}
          className="size-full object-cover"
          loading="lazy"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  );
};

export default Avatar;

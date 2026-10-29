import { Link } from "react-router-dom";
import Icon from "./Icon";

const Logo = ({ compact = false, className = "" }) => {
  const content = (
    <>
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/20 transition-shadow duration-200 group-hover:shadow-primary/35">
        <Icon name="code" size={18} strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="text-[1.05rem] font-semibold tracking-tight text-base-content">
          Dev<span className="text-primary">Tinder</span>
        </span>
      )}
    </>
  );

  if (compact) {
    return (
      <span
        className={`group inline-flex items-center ${className}`}
        aria-hidden="true"
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      to="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="DevTinder home"
    >
      {content}
    </Link>
  );
};

export default Logo;

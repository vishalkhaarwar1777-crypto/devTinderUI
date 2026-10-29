import { Link } from "react-router-dom";
import Icon from "./ui/Icon";

const NotFound = () => (
  <div className="page-enter flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
      Error 404
    </p>

    <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
      404
    </h1>

    <p className="mt-3 max-w-sm text-sm leading-6 text-base-content/50">
      This page doesn&apos;t exist. It may have moved, or the link might be
      broken.
    </p>

    <div className="mt-7 flex flex-wrap justify-center gap-2">
      <Link to="/" className="btn btn-primary btn-sm gap-2">
        <Icon name="sparkles" size={15} />
        Back to feed
      </Link>
      <Link
        to="/connections"
        className="btn btn-outline btn-sm gap-2 border-base-300"
      >
        <Icon name="users" size={15} />
        Connections
      </Link>
    </div>
  </div>
);

export default NotFound;

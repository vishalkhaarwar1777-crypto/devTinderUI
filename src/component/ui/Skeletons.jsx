export const CardSkeleton = ({ count = 6 }) => (
  <div
    className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
    role="status"
    aria-label="Loading developer profiles"
  >
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex min-h-[19rem] flex-col rounded-2xl border border-base-300 bg-base-200/60 p-5"
      >
        <div className="flex items-center gap-4">
          <div className="size-14 animate-pulse rounded-full bg-base-300" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-base-300" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-base-300/70" />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-base-300/70" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-base-300/70" />
          <div className="h-3 w-3/5 animate-pulse rounded bg-base-300/70" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-base-300/70" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-base-300/70" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-base-300/70" />
        </div>

        <div className="mt-auto flex gap-2 pt-6">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-base-300/70" />
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-base-300/70" />
        </div>
      </div>
    ))}
    <span className="sr-only">Loading…</span>
  </div>
);

export const RowSkeleton = ({ count = 4 }) => (
  <div
    className="space-y-3"
    role="status"
    aria-label="Loading connection requests"
  >
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col gap-4 rounded-2xl border border-base-300 bg-base-200/60 p-5 sm:flex-row sm:items-center"
      >
        <div className="size-14 animate-pulse rounded-full bg-base-300" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 animate-pulse rounded bg-base-300" />
          <div className="h-3 w-full max-w-md animate-pulse rounded bg-base-300/70" />
          <div className="h-3 w-28 animate-pulse rounded bg-base-300/70" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-base-300/70" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-base-300/70" />
        </div>
      </div>
    ))}
    <span className="sr-only">Loading…</span>
  </div>
);

const pulse = "animate-pulse rounded bg-base-300/70";

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
            <div className={`h-4 w-2/3 ${pulse}`} />
            <div className={`h-3 w-1/3 ${pulse}`} />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className={`h-3 w-full ${pulse}`} />
          <div className={`h-3 w-11/12 ${pulse}`} />
          <div className={`h-3 w-3/5 ${pulse}`} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <div className={`h-6 w-16 rounded-full ${pulse}`} />
          <div className={`h-6 w-20 rounded-full ${pulse}`} />
          <div className={`h-6 w-14 rounded-full ${pulse}`} />
        </div>

        <div className="mt-auto flex gap-2 pt-6">
          <div className={`h-10 flex-1 rounded-lg ${pulse}`} />
          <div className={`h-10 flex-1 rounded-lg ${pulse}`} />
        </div>
      </div>
    ))}
    <span className="sr-only">Loading developer profiles</span>
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
          <div className={`h-4 w-40 ${pulse}`} />
          <div className={`h-3 w-full max-w-md ${pulse}`} />
          <div className={`h-3 w-28 ${pulse}`} />
        </div>
        <div className="flex gap-2">
          <div className={`h-10 w-24 rounded-lg ${pulse}`} />
          <div className={`h-10 w-24 rounded-lg ${pulse}`} />
        </div>
      </div>
    ))}
    <span className="sr-only">Loading connection requests</span>
  </div>
);

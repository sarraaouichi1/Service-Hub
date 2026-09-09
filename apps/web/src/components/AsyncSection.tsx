import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

/**
 * Renders a query's three states in one place.
 *
 * Every screen reading server data needs the same shape — pending, failed,
 * loaded — and writing it out each time is how they drift apart. The error
 * state says what failed and offers the retry, rather than leaving a blank
 * panel and no way forward.
 */
export function AsyncSection<T>({
  query,
  children,
  label = "data",
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  label?: string;
}) {
  if (query.isPending) {
    return <div className="async-state" role="status">Loading {label}…</div>;
  }

  if (query.isError) {
    return (
      <div className="async-state async-error" role="alert">
        <span>Couldn't load {label}. {query.error.message}</span>
        <button type="button" className="btn btn-secondary" onClick={() => void query.refetch()}>
          Try again
        </button>
      </div>
    );
  }

  return <>{children(query.data)}</>;
}

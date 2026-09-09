import { Suspense, lazy } from "react";

/**
 * TanStack Router devtools — a floating panel showing the matched route tree,
 * params, and search state.
 *
 * Loaded lazily and only in development: in a production build the condition is
 * statically false, so the dynamic import is dropped and the package never
 * reaches the bundle.
 */
const Devtools = import.meta.env.PROD
  ? () => null
  : lazy(() =>
      import("@tanstack/router-devtools").then(m => ({ default: m.TanStackRouterDevtools })),
    );

export function RouterDevtools() {
  if (import.meta.env.PROD) return null;
  return (
    <Suspense fallback={null}>
      <Devtools position="bottom-right" />
    </Suspense>
  );
}

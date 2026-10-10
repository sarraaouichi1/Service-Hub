import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree";

// Scrolling layouts (hub, Patch) scroll the document, so a new page must start
// at the top and back/forward must return to where the reader was.
export const router = createRouter({ routeTree, scrollRestoration: true });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

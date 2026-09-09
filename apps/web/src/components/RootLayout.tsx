import { Outlet } from "@tanstack/react-router";
import { RouterDevtools } from "./RouterDevtools";

/** Renders whichever module route matched, plus the dev-only router devtools. */
export function RootLayout() {
  return (
    <>
      <Outlet />
      <RouterDevtools />
    </>
  );
}

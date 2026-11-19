/**
 * The one-click accounts the sign-in page offers. The page prefills
 * DEMO_PASSWORD and the seed (re)sets exactly these accounts to it, so the two
 * cannot disagree — when the page carried its own literal, the deployed demo
 * was seeded with a different SEED_PASSWORD and every chip failed to sign in.
 *
 * The seed resets them on every run because a demo account's password can be
 * changed by whoever is using it, which would lock the chip out for everyone.
 *
 * Public by design: this password ships in the browser bundle. Never seed these
 * accounts into a real deployment.
 */
export const DEMO_PASSWORD = "ChangeMe123!dev";

export const DEMO_ACCOUNTS = [
  { label: "Project Manager", email: "manager@scheidt-bachmann.de" },
  { label: "Sales Team", email: "sales@scheidt-bachmann.de" },
  { label: "DevOps", email: "devops@scheidt-bachmann.de" },
  { label: "Admin", email: "admin@scheidt-bachmann.de" },
] as const;

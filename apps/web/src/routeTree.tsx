// Route definitions. Kept separate from the router instance so the tree can
// be imported (by tests, or a render harness) without creating browser history.
import {
  createRootRoute,
  createRoute,
  redirect,
} from "@tanstack/react-router";

import type { ProjectStatus, RouteStaticData } from "./types";
import { WIZARD_STEPS } from "./data/wizardSteps";
import { getSession } from "./api";
import { RootLayout } from "./components/RootLayout";
import { LoginView } from "./modules/auth/LoginView";
import { LandingHub } from "./modules/landing/LandingHub";
import { OnboardingLayout } from "./modules/onboarding/OnboardingLayout";
import { DashboardView } from "./modules/onboarding/views/DashboardView";
import { ProjectsView } from "./modules/onboarding/views/ProjectsView";
import { WizardView } from "./modules/onboarding/views/WizardView";
import { ReviewQueueView } from "./modules/onboarding/views/ReviewQueueView";
import { ApprovedView } from "./modules/onboarding/views/ApprovedView";
import { AdminTemplates } from "./modules/onboarding/admin/AdminTemplates";
import { AdminRules } from "./modules/onboarding/admin/AdminRules";
import { AdminUsers } from "./modules/onboarding/admin/AdminUsers";
import { AdminSettings } from "./modules/onboarding/admin/AdminSettings";
import { AccountSettingsView } from "./modules/onboarding/views/settings/AccountSettingsView";
import { PrivacySecurityView } from "./modules/onboarding/views/settings/PrivacySecurityView";
import { NotificationPreferencesView } from "./modules/onboarding/views/settings/NotificationPreferencesView";
import { PatchLayout } from "./modules/patch/PatchLayout";
import { PatchDashboardView } from "./modules/patch/views/PatchDashboardView";
import { PatchBulletinsView } from "./modules/patch/views/PatchBulletinsView";
import { PatchScheduleView } from "./modules/patch/views/PatchScheduleView";
import { PatchProcessView } from "./modules/patch/views/PatchProcessView";
import { PatchSystemsView } from "./modules/patch/views/PatchSystemsView";
import { PatchAutomoxView } from "./modules/patch/views/PatchAutomoxView";
import { PatchServiceTiersView } from "./modules/patch/views/PatchServiceTiersView";

const LAST_WIZARD_STEP = WIZARD_STEPS.length - 1;

const PROJECT_STATUSES: (ProjectStatus | "all")[] = [
  "all", "draft", "progress", "review", "sales-approval", "approved", "onboarded",
];

const rootRoute = createRootRoute({ component: RootLayout });

/**
 * Everything except the login screen needs a session, and the session is put
 * into route context so layouts can read the signed-in user without asking for
 * it again. This gates navigation, not data — it is an identity check, and once
 * there is a real backend the server has to enforce access for itself.
 */
async function requireSession() {
  const session = await getSession();
  if (!session) throw redirect({ to: "/login" });
  return { session };
}

// ─── Sign in ────────────────────────────────────────────────────────────────
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  beforeLoad: async () => {
    if (await getSession()) throw redirect({ to: "/" });
  },
  component: LoginView,
  staticData: { title: "Sign in" } satisfies RouteStaticData,
});

// ─── Landing hub ────────────────────────────────────────────────────────────
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: requireSession,
  component: LandingHub,
});

// ─── Onboarding module ──────────────────────────────────────────────────────
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "onboarding",
  beforeLoad: requireSession,
  component: OnboardingLayout,
});

const onboardingIndexRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/onboarding/dashboard" });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "dashboard",
  component: DashboardView,
  staticData: { title: "Dashboard" } satisfies RouteStaticData,
});

/**
 * The projects list keeps its filter and search text in the URL, so a filtered
 * view can be bookmarked, shared, and restored by the back button.
 */
const projectsRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "projects",
  component: ProjectsView,
  staticData: { title: "All Projects" } satisfies RouteStaticData,
  validateSearch: (search: Record<string, unknown>) => {
    const status = search.status as ProjectStatus | "all" | undefined;
    return {
      status: status && PROJECT_STATUSES.includes(status) ? status : ("all" as const),
      q: typeof search.q === "string" && search.q !== "" ? search.q : undefined,
    };
  },
});

const wizardIndexRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "wizard",
  beforeLoad: () => {
    throw redirect({ to: "/onboarding/wizard/$step", params: { step: "0" }, search: { project: undefined } });
  },
});

/** `step` is the wizard position; `project` names the project being edited. */
const wizardRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "wizard/$step",
  component: WizardView,
  // Normalise out-of-range steps so the URL always names a real step rather
  // than rendering a clamped view behind a bogus address.
  beforeLoad: ({ params, search }) => {
    const parsed = Number(params.step);
    const step = Math.min(Math.max(Number.isFinite(parsed) ? Math.trunc(parsed) : 0, 0), LAST_WIZARD_STEP);
    if (String(step) !== params.step) {
      throw redirect({ to: "/onboarding/wizard/$step", params: { step: String(step) }, search });
    }
  },
  staticData: { title: "Onboarding" } satisfies RouteStaticData,
  validateSearch: (search: Record<string, unknown>) => {
    const project = Number(search.project);
    return { project: Number.isFinite(project) && project > 0 ? project : undefined };
  },
});

const reviewQueueRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "review-queue",
  component: ReviewQueueView,
  staticData: { title: "Review Queue" } satisfies RouteStaticData,
});

const approvedRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "approved",
  component: ApprovedView,
  staticData: { title: "Approved & Onboarded" } satisfies RouteStaticData,
});

const adminTemplatesRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "admin/templates",
  component: AdminTemplates,
  staticData: { title: "Admin — Countries" } satisfies RouteStaticData,
});

const adminRulesRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "admin/rules",
  component: AdminRules,
  staticData: { title: "Admin — Validation Rules" } satisfies RouteStaticData,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "admin/users",
  component: AdminUsers,
  staticData: { title: "Admin — User Management" } satisfies RouteStaticData,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "admin/settings",
  component: AdminSettings,
  staticData: { title: "Admin — Platform Settings" } satisfies RouteStaticData,
});

const accountSettingsRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "settings/account",
  component: AccountSettingsView,
  staticData: { title: "Account Settings" } satisfies RouteStaticData,
});

const privacySecurityRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "settings/privacy",
  component: PrivacySecurityView,
  staticData: { title: "Privacy & Security" } satisfies RouteStaticData,
});

const notificationPreferencesRoute = createRoute({
  getParentRoute: () => onboardingRoute,
  path: "settings/notifications",
  component: NotificationPreferencesView,
  staticData: { title: "Notification Preferences" } satisfies RouteStaticData,
});

// ─── Patch module ───────────────────────────────────────────────────────────
const patchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "patch",
  beforeLoad: requireSession,
  component: PatchLayout,
});

const patchIndexRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/patch/dashboard" });
  },
});

const patchDashboardRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "dashboard",
  component: () => <PatchDashboardView />,
  staticData: { title: "Patch Dashboard" } satisfies RouteStaticData,
});

const patchProcessRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "process",
  component: PatchProcessView,
  staticData: { title: "6-Step Patching Process" } satisfies RouteStaticData,
});

const patchSystemsRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "systems",
  component: PatchSystemsView,
  staticData: { title: "Supported Systems & Updates" } satisfies RouteStaticData,
});

const patchAutomoxRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "automox",
  component: PatchAutomoxView,
  staticData: { title: "Automox Cloud Engine" } satisfies RouteStaticData,
});

const patchTiersRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "tiers",
  component: PatchServiceTiersView,
  staticData: { title: "Service Tiers" } satisfies RouteStaticData,
});

const patchBulletinsRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "bulletins",
  component: PatchBulletinsView,
  staticData: { title: "Patch Bulletins" } satisfies RouteStaticData,
});

const patchScheduleRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "schedule",
  component: PatchScheduleView,
  staticData: { title: "Patch Schedule" } satisfies RouteStaticData,
});

const patchBasicRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "services/basic",
  component: () => <PatchDashboardView />,
  staticData: { title: "Basic Service" } satisfies RouteStaticData,
});

const patchPremiumRoute = createRoute({
  getParentRoute: () => patchRoute,
  path: "services/premium",
  component: () => <PatchDashboardView />,
  staticData: { title: "Premium Service" } satisfies RouteStaticData,
});

export const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  onboardingRoute.addChildren([
    onboardingIndexRoute,
    dashboardRoute,
    projectsRoute,
    wizardIndexRoute,
    wizardRoute,
    reviewQueueRoute,
    approvedRoute,
    adminTemplatesRoute,
    adminRulesRoute,
    adminUsersRoute,
    adminSettingsRoute,
    accountSettingsRoute,
    privacySecurityRoute,
    notificationPreferencesRoute,
  ]),
  patchRoute.addChildren([
    patchIndexRoute,
    patchDashboardRoute,
    patchProcessRoute,
    patchSystemsRoute,
    patchAutomoxRoute,
    patchTiersRoute,
    patchBulletinsRoute,
    patchScheduleRoute,
    patchBasicRoute,
    patchPremiumRoute,
  ]),
]);


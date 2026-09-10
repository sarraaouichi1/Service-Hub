# CLAUDE.md

Working notes for this repository. Read this before changing anything.

## What this is

**entervo Service Hub** — an internal B2B platform for Scheidt & Bachmann's
*entervo smart*, used by S&B staff and partners on desktop browsers. Two
modules behind an authenticated, role-gated shell:

- **Onboarding** — a 7-step wizard that provisions a customer onto the platform,
  plus admin screens (country templates, validation rules, users, settings).
- **Patch Management** — bulletins, schedule, service tiers.

It began as a single 2,382-line `App.jsx` written by a "vibe coding" developer,
with all data, CSS and components inline. It has been taken over and scaled into
a real product. Several conventions below exist specifically to stop it sliding
back.

## Layout

```
apps/web         React 19 · Vite · TanStack Router · React Hook Form · TanStack Query
apps/api         Fastify · Prisma · Postgres
packages/shared  Zod schemas · domain types · the RBAC table
```

`packages/shared` is the point of the split. A validation rule, a domain type,
or a role's permissions are written **once** and imported by both sides, so the
browser and the server cannot disagree. When you add something that both sides
must agree on, it goes here — not into one side with a copy in the other.

## Commands

```bash
# Everything, in containers
cp .env.example .env                 # then set SESSION_SECRET
docker compose up -d --build
docker compose exec api pnpm --filter @service-hub/api db:seed

# Locally, against containerised Postgres
pnpm install
docker compose up -d db
pnpm --filter @service-hub/shared build
pnpm --filter @service-hub/api db:migrate
pnpm --filter @service-hub/api db:seed
pnpm dev                             # api :3001, web :5173

# The verification gate — run all of it before claiming anything works
pnpm typecheck && pnpm lint && pnpm build
pnpm --filter @service-hub/api test  # needs Postgres up and migrated
```

The app is on :8080 in containers, :5173 locally. `db:seed` creates one account
per role — `admin@`, `manager@`, `sales@`, `reviewer@`, `devops@`, `partner@`
and `customer@` at `scheidt-bachmann.de`, all sharing `SEED_PASSWORD`. The full
table, with what each role may do, is in `README.md`. Local and demo only.

## How the pieces fit

A signed-in request goes: browser → nginx (or the Vite proxy) → Fastify
`onRequest` hook, which

1. refuses the write if `Origin` isn't ours,
2. HMACs the cookie token and looks up the session,
3. re-derives permissions from the user's **current** roles,
4. hands off to a route guard that checks one permission.

Step 3 happens per request rather than being baked into the session, so a role
change takes effect immediately.

## Decisions that are easy to undo by accident

These are load-bearing. Don't "simplify" them without reading why.

### Structure

- **`src/routeTree.tsx` is separate from `src/router.tsx`.** `createRouter`
  builds browser history at module scope, so importing the router in Node throws
  `window is not defined`. Keeping the tree separate lets tests and render
  harnesses import it.
- **Views use `getRouteApi("/path")`, not imported route objects.** Importing a
  route from `routeTree.tsx` creates a cycle, since the tree imports the views.
- **The wizard's React Hook Form instance lives in `OnboardingProvider`**, shared
  via `FormProvider`. It cannot live in the wizard route: each step is its own
  route, so a form owned by a step is destroyed on every Continue.
- **`packages/shared` must emit Node-correct ESM** — relative imports carry `.js`
  extensions and its tsconfig is `NodeNext`. Without that, `tsc` emits
  extensionless imports that Vite tolerates and Node's ESM loader refuses; the
  API builds fine and dies on boot.
- **`src/api/` is plain async functions; `src/queries/` adds caching.** Keeping
  them apart means the functions stay usable outside React and swapping the
  fetching library touches one folder. Don't put `useQuery` in `src/api/`.

### Validation

- **`packages/shared/src/schemas/rules.ts` is the single definition of every
  field rule.** Each entry carries both its admin-table display columns and the
  `check` the wizard runs. Adding a rule in one place and not the other is the
  drift this exists to prevent.
- **Rules describe *shape*; step schemas own *required-ness*.** A rule can't know
  whether a field is required — that depends which step you're on.
- **Wizard fields use `z.preprocess(v => v ?? "", …)`, never `.optional()`.**
  Zod 4 skips an absent key whose schema is optional, so required checks silently
  passed on a fresh draft where the key had never been touched.
- **An administrator can change a rule's `active` and `severity`, nothing else.**
  Patterns and checks stay in code — that's the definition, and the admin table
  shows exactly what runs. `createOnboardingSchemas(overrides)` applies the
  stored flags; both the wizard and the submit endpoint use it, so the toggles
  genuinely change enforcement.
- **`Field` renders caption → control → one message slot.** The slot shows `hint`
  by default and is *replaced* by `error`. Client validation and server 422 field
  errors both land there, so they never stack. This was asked for explicitly.
- **Continue validates; Back and the step nav don't.** Gating navigation both
  ways would trap a user in a half-filled step.
- **`mode: "onTouched"`** keeps a field quiet while first filled in, speaks up on
  blur or on Continue, then re-checks live. It also keeps `formState.isValid`
  maintained, which gates the submit button. `onChange` scolds mid-typing;
  `onSubmit` breaks `isValid`.

### Security

These are invariants. Breaking one is a vulnerability, not a style regression.

- **Guards ask about permissions, never roles.** Moving a capability between
  roles must be a change to `packages/shared/src/rbac.ts` and nothing else.
- **The client's permission checks decide what to *draw*; the server decides what
  to *allow*.** Hiding a button is a courtesy. Every endpoint enforces for itself.
- **Sessions: a random token in an httpOnly cookie, only its HMAC stored.** A
  dumped database holds no usable sessions, and rotating `SESSION_SECRET` revokes
  every session at once. Never store the token itself.
- **Sign-in failures are deliberately indistinguishable** — same message for a
  wrong password and an unknown address, and the unknown path still burns
  hashing time via `wastePasswordTime`. Removing that reintroduces account
  enumeration.
- **Only failed sign-ins count toward the rate limit.** Counting successes
  punishes a busy shared office for being busy.
- **`linkOrCreateUser` matches on issuer+subject, then only a *verified* email.**
  Matching an unverified email, or keying users on email instead of the subject
  claim, would let one person claim another's account.
- **PSP credentials are write-only.** `pspKey`, `pspSecret` and `uiPassword` are
  accepted on a write and never returned by a read; a blank value on save means
  "leave it alone". Anything credential-shaped added later must join
  `SECRET_FIELDS` in `apps/api/src/routes/projects.ts`.
- **The last active administrator cannot be demoted, deactivated or deleted**, and
  nobody can delete their own account.
- **The web app always calls same-origin `/api`.** nginx proxies it in the
  container, Vite in dev. That keeps the session cookie first-party. Never point
  the client at an absolute API URL.

### Data

- **`apps/web/src/data/` holds presentation only** — `display.ts` (status
  colours, role colours, `progressPct`) and `wizardSteps.ts` (static UI config).
  Everything else is server state, reached through `src/api/` and `src/queries/`.
- **Query keys are declared once** in `src/queries/index.ts` (`keys`), so an
  invalidation can't miss a query by spelling its key differently.
- **Reference data (products, PSPs, patch bulletins) is served from server
  constants, not tables.** It's configured by S&B, not edited through the hub.
- **Seeding rows with explicit ids requires advancing Postgres's identity
  sequences afterwards** (`setval(pg_get_serial_sequence(...))` in
  `prisma/seed.ts`). Without it the first insert that lets the database pick an
  id collides with a seeded row.
- **Router devtools are lazy-loaded behind `import.meta.env.PROD`** so the
  package is dropped from production builds.

## Writing code here

- **Match the surrounding code.** This codebase comments the *why* — the
  non-obvious constraint, the bug a shape prevents — and not the *what*. Follow
  that. A comment restating the line below it is noise.
- **Prefer deriving over duplicating.** Headline counts come from the data
  (`countByStatus`), product names from the catalogue lookup, rule rows from the
  registry. Hardcoded figures that can drift are the original sin of this
  codebase.
- **Repeated UI is one object.** `AsyncSection` renders every query's three
  states; `createFieldBinder`/`useStepFields` binds every wizard field. When you
  find yourself writing the third near-identical helper, hoist it.
- **Errors say what went wrong and what to do.** No blank panels, no bare
  "Error". `AsyncSection`'s failure state offers the retry.

## Verifying

The gate is `pnpm typecheck && pnpm lint && pnpm build`, plus
`pnpm --filter @service-hub/api test`. **None of that proves the UI works** — for
anything user-facing, drive the running app.

- The Chrome extension is not connected on this machine; browser MCP tools fail
  with "Browser extension is not connected". Use Playwright
  (`/opt/homebrew/bin/playwright`, Python, Chromium already downloaded).
  `chromium-cli` is not installed.
- Write browser checks as labelled PASS/FAIL assertions and re-run them after
  refactors. That harness caught a Zod bug (absent optional keys skipping
  required checks) and proved the React Hook Form rewrite preserved behaviour
  exactly. Worth moving into the repo with a real test runner.
- `pnpm --filter @service-hub/api test` runs the real server against a real
  Postgres. Its logger is noisy — filter with `grep -E "^(PASS|FAIL)"`.

### Traps that have actually bitten

- **Never `lsof -ti:<port> | xargs kill`.** Doing that on 3001 killed Docker
  Desktop's port-forwarding process and took the whole daemon down. Kill the
  specific process, or use `docker compose stop`.
- **Read the whole `docker compose build` output, not the last two lines.** A
  build can fail while the tail still looks plausible; the stale image then runs
  happily and "verification" tests yesterday's code. Confirm the artifact
  (`docker compose exec api grep … dist/…`) when something should have changed.
- **`page.goto` is a full reload** and resets anything not persisted. To test
  behaviour spanning wizard steps, navigate in-app via the step nav.
- **Every route but `/login` needs a session**, and `/login` bounces an existing
  one to the hub — so sign out before signing in as someone else.
- **`timeout` is not on PATH** (macOS). Poll with
  `for i in $(seq 1 30); do curl -sf … && break; sleep 1; done`.
- **Port 5433 is taken on this machine**; compose uses `DB_PORT` (5434 locally).
- **Prisma's engine download** needs `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`
  in the Docker build, or `prisma generate` fails on a checksum fetch.

## Deliberately not done

Don't re-report these as new findings.

- **OIDC** is a seam, not an implementation —
  `apps/api/src/auth/providers/oidc.ts` documents what filling it in involves.
  Everything around it is already provider-agnostic.
- **Password reset** doesn't exist. Deliberate: if SSO lands first it never needs
  building.
- **PSP secrets are write-only but still stored in the draft's JSON**, not
  encrypted in a secret store. That's the floor, not the finish.
- **Rate limiting is in-memory**, so it protects one instance and resets with the
  process. More than one API instance means moving those counters to Redis; the
  shape doesn't change.
- **The Review/Approve/Confirm Payment flow has no notifications or audit
  writes** — the status changes, nothing announces it.
- **Soft warnings are documented but never surfaced.** Rules with
  `severity: "warning"` render in the admin table and are excluded from blocking,
  but the warning-with-confirmation flow the admin screen describes doesn't
  exist.
- **`AUDIT_LOG` is still static seed data**, not written by anything.

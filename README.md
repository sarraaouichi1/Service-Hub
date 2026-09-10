# entervo Service Hub

Internal B2B platform for Scheidt & Bachmann's *entervo smart*. Two modules —
**Onboarding** (a 7-step wizard plus admin screens) and **Patch Management** —
behind an authenticated, role-gated shell.

## Layout

```
apps/web        React 19 + Vite + TanStack Router + React Hook Form
apps/api        Fastify + Prisma + Postgres
packages/shared Zod schemas, domain types, and the RBAC table — imported by both
```

`packages/shared` is the point of the split: a validation rule or a role's
permissions are written once and used by the browser and the server, so the two
cannot drift.

## Running it

### Docker (everything)

```bash
cp .env.example .env          # then set SESSION_SECRET
docker compose up -d --build
docker compose exec api pnpm --filter @service-hub/api db:seed
```

The app is on <http://localhost:8080>. nginx serves the built app and proxies
`/api` to the API container, so the session cookie is first-party and CORS never
comes into it.

### Locally

```bash
pnpm install
docker compose up -d db                      # just Postgres
pnpm --filter @service-hub/shared build
pnpm --filter @service-hub/api db:migrate
pnpm --filter @service-hub/api db:seed
pnpm dev                                     # api :3001, web :5173
```

Vite proxies `/api` to the API, matching what nginx does in the container.

## Signing in

`db:seed` creates one account per role so every permission path can be exercised.
All seven share the password in `SEED_PASSWORD` (`ChangeMe123!dev` by default).

| Role | Email | Can do |
|---|---|---|
| Admin | `admin@scheidt-bachmann.de` | everything |
| Project Manager | `manager@scheidt-bachmann.de` | create, edit and submit projects; read templates, rules and users |
| Sales | `sales@scheidt-bachmann.de` | read projects; confirm payment |
| Reviewer | `reviewer@scheidt-bachmann.de` | read projects; review, approve; read rules and the audit log |
| DevOps | `devops@scheidt-bachmann.de` | read projects; read and schedule patches |
| Partner | `partner@scheidt-bachmann.de` | create, edit and submit projects; read patches |
| Customer | `customer@scheidt-bachmann.de` | read projects |

The addresses are role-based so they're easy to remember; the display names stay
human so the demo data reads naturally. One shared domain keeps them uniform —
they are not real mailboxes.

**Local and demo only.** That password is the default committed in
`.env.example`. Set `SEED_PASSWORD` and `SESSION_SECRET` to real values in any
deployed environment, or don't seed at all.

`packages/shared/src/rbac.ts` is the authority on what each role may do; the
table above summarises it.

## Verifying

```bash
pnpm typecheck                               # every package
pnpm lint
pnpm build
pnpm --filter @service-hub/api test          # auth + RBAC against a real database
```

The API tests need Postgres up and the schema migrated; they run the real server
rather than replacing the parts that matter.

## Authentication

Email and password, with the session in an httpOnly cookie. `AUTH_PROVIDER=local`
today; the OIDC seam is `apps/api/src/auth/providers/`, and switching to it does
not touch the session, user table, roles or guards. See that folder's comments
for what implementing it involves.

Roles and permissions are ours either way: an identity provider says who someone
is, `packages/shared/src/rbac.ts` says what they may do.

## Environment

See `.env.example`. `SESSION_SECRET` must be set to something real before this is
deployed anywhere — rotating it signs everyone out, which is the intended way to
revoke every session at once.

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

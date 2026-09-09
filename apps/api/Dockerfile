# The API is a workspace package, so the build context is the repo root: it
# needs the lockfile and the shared package, not just apps/api.
FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @service-hub/shared build \
 && pnpm --filter @service-hub/api exec prisma generate \
 && pnpm --filter @service-hub/api build

FROM base AS runtime
ENV NODE_ENV=production
# Prisma's query engine needs OpenSSL present on Alpine.
RUN apk add --no-cache openssl \
 && addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app /app
USER app
EXPOSE 3001
# Schema changes are applied on boot so a fresh database comes up usable.
CMD ["sh", "-c", "pnpm --filter @service-hub/api db:deploy && pnpm --filter @service-hub/api start"]

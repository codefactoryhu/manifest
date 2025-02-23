FROM node:lts-alpine AS base

FROM base AS deps

RUN corepack enable && corepack prepare pnpm@v10.4.1 --activate
WORKDIR /manifest/deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --prod

FROM base AS build

RUN corepack enable
WORKDIR /manifest/build
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base

WORKDIR /manifest
COPY --from=deps /manifest/deps .
COPY --from=build /manifest/build/build .

ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080
CMD ["node", "index.js"]

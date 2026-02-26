# Base image
FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

# Install dependencies
COPY package.json ./
COPY pnpm-lock.yaml ./pnpm-lock.yaml
RUN test -f pnpm-lock.yaml || touch pnpm-lock.yaml
RUN pnpm install --frozen-lockfile=false

# Copy source
COPY . .

# Build Next.js and Express server
RUN pnpm prisma:generate && pnpm build && pnpm server:build

EXPOSE 3000
EXPOSE 4000

CMD ["sh", "-c", "pnpm server:start & pnpm start"]

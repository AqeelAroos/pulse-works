FROM node:20-slim

RUN apt-get update -y && apt-get install -y openssl

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build
RUN cd apps/api && pnpm build

WORKDIR /app/apps/api

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
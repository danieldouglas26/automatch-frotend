# ==========================================
# STAGE 1: Prune Monorepo for Next.js (web)
# ==========================================
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo@latest
COPY . .
RUN turbo prune web --docker

# ==========================================
# STAGE 2: Install dependencies
# ==========================================
FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@9.0.0

# Copia arquivos de definição de pacotes e lock
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

# ==========================================
# STAGE 3: Build Next.js Web App
# ==========================================
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm@9.0.0

# Copia os fontes completos podados
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/ .

# Injeta a URL da API do Gateway (Necessário no build do Next.js)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm --filter web build

# ==========================================
# STAGE 4: Production Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app
ENV PORT=3000
ENV NODE_ENV=production
RUN npm install -g pnpm@9.0.0

# Copia os arquivos necessários e a pasta de dependências construídas
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/turbo.json ./turbo.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]

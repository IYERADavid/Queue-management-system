# Queue Management System — container image (Phase 3: Docker).
# Build: docker build -t queue-management-system .
# Run:  docker run -p 3000:3000 queue-management-system
#
# Next.js `output: 'standalone'` nests the runnable app under `.next/standalone/<workspace-folder>/`.
# Override if your clone directory name differs:
#   docker build --build-arg STANDALONE_SUBDIR=your-folder-name -t queue-management-system .
ARG STANDALONE_SUBDIR=Queue-management-system

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
ARG STANDALONE_SUBDIR=Queue-management-system
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/${STANDALONE_SUBDIR} ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

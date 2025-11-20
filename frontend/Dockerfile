# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app

# Stage 2: Builder
FROM base AS builder

# 1. Copy only package files (caches better)
COPY package*.json ./

# 2. Install ALL dependencies (dev + prod)
# FORCE npm to install dev deps by resetting NODE_ENV
ENV NODE_ENV=development
RUN npm ci

# 3. Copy full project
COPY . .

# 4. Build the application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy built output & node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Switch to production for runtime
ENV NODE_ENV=production

USER nextjs

EXPOSE 8080
CMD ["npm", "start"]


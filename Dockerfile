# Stage 1: Builder
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy workspace files
COPY package.json package-lock.json ./
COPY apps/desktop ./apps/desktop

# Install desktop dependencies
WORKDIR /app/apps/desktop
RUN npm install --legacy-peer-deps

# Build React web app
RUN npm run build:web

# Stage 2: Runtime - Serve with Node
FROM node:20-alpine

WORKDIR /app

# Install serve (lightweight HTTP server)
RUN npm install -g serve

# Copy built artifacts from builder
COPY --from=builder /app/apps/desktop/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start serving the built app
CMD ["serve", "-s", "dist", "-l", "3000"]

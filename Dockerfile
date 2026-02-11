# Stage 1: Builder
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy package files (root + desktop)
COPY package.json package-lock.json ./
COPY apps/desktop/package.json apps/desktop/package-lock.json ./apps/desktop/

# Install dependencies (root workspace)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy project files
COPY . .

# Install desktop dependencies
RUN cd apps/desktop && npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Build applications
RUN cd apps/desktop && npm run build:web

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/apps/desktop/dist ./apps/desktop/dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "run", "start:web"]

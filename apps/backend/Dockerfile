FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build TypeScript
RUN pnpm run build

# Create data directory
RUN mkdir -p ./data

# Expose port
EXPOSE 18789

# Start server
CMD ["pnpm", "start"]

FROM node:20-alpine3.20
 
# Set working directory
WORKDIR /usr/src/app

# Install pnpm (matching repo version)
RUN npm install -g pnpm@8.15.1

# Copy workspace manifests
COPY .npmrc package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile && rm -f .npmrc

# Build the event-publisher app (and its deps via Nx)
RUN pnpm run event-publisher:build

# Start the event-publisher using Nx script
CMD ["pnpm", "run", "event-publisher:start"]

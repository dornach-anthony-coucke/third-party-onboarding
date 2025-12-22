FROM node:20-alpine3.19
 
# Set working directory
WORKDIR /usr/src/app

# Install pnpm (matching repo version)
RUN npm install -g pnpm@8.15.1

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.json ./
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the write-api app (and its deps via Nx)
RUN pnpm run write-api:build

# Default port used by write-api
EXPOSE 3000

# Start the write-api using Nx script
CMD ["pnpm", "run", "write-api:start"]

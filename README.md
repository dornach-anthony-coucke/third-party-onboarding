# Third-Party Onboarding Monorepo

A monorepo for third-party onboarding services with NestJS APIs and reusable packages, powered by Nx.

## Project Structure

```
third-party-onboarding/
├── packages/
│   ├── drizzle-core/              # Drizzle ORM database configuration
│   └── database-nest-module/      # NestJS Database module
├── apps/
│   └── write-api/                 # NestJS Write API (commands)
├── infra/                         # Infrastructure (Docker Compose)
├── nx.json                        # Nx configuration
└── pnpm-workspace.yaml            # PNPM workspace configuration
```

## Packages

### @third-party-onboarding-manager/drizzle-core

Core Drizzle ORM configuration for PostgreSQL database connections.

- Configurable connection pooling
- SSL support
- Type-safe database access

### @third-party-onboarding-manager/database-nest-module

Reusable NestJS Database module that wraps drizzle-core for use in NestJS applications.

- Global NestJS module
- Synchronous and asynchronous configuration
- Injectable database connection

## Applications

### Write API (@third-party-onboarding-manager/write-api)

NestJS REST API application for handling commands (write operations).

- Built with `tsup` (instead of nest-cli)
- Tested with `Vitest` (no e2e tests initially)
- Uses the database-nest-module for database access
- Command handling for write operations

**Note:** A Read API (for queries) will be added in the future.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages and apps
pnpm run build
```

### Development

```bash
# Build all packages
pnpm run build

# Build only affected projects (since last commit)
pnpm run build:affected

# Run tests across all packages
pnpm run test

# Run tests only for affected projects
pnpm run test:affected

# Lint code
pnpm run lint

# Lint only affected projects
pnpm run lint:affected

# Format code
pnpm run format

# View dependency graph
pnpm run graph

# Run a specific project's target
pnpm nx run write-api:build
pnpm nx run drizzle-core:test

# Run Write API with global commands
pnpm run write-api:dev
pnpm run write-api:build
pnpm run write-api:start
pnpm run write-api:test
```

### Running the Write API

```bash
# Start in development mode (from root)
pnpm run write-api:dev

# Or navigate to the write-api app
cd apps/write-api

# Create .env file (copy from .env.example)
cp .env.example .env

# Start in development mode
pnpm run dev

# Or build and start in production
pnpm run write-api:build
pnpm run write-api:start
```

The Write API will be available at `http://localhost:3000/api`

## Nx Features

This monorepo uses Nx for:

- **Smart rebuilds**: Only rebuilds affected projects
- **Task orchestration**: Manages dependencies between projects
- **Caching**: Caches build and test results for faster execution
- **Parallel execution**: Runs tasks in parallel when possible
- **Dependency graph**: Visualize project dependencies with `pnpm run graph`

## Database Setup

Start the PostgreSQL database using Docker Compose:

```bash
cd infra
docker compose up -d
```

The database will be available at:

```
postgresql://postgres:postgres@localhost:5432/third-party-onboarding
```

See [infra/README.md](./infra/README.md) for more details.

## Release Management

This project uses Changesets for version management and releases:

```bash
# Add a changeset (describe your changes)
pnpm changeset

# Update package versions based on changesets
pnpm changeset:version

# Publish packages (for maintainers)
pnpm changeset:publish
```

## Code Quality

- **ESLint 9**: Modern flat config with TypeScript ESLint v8
- **Prettier 3**: Latest formatting standards
- **Consistent imports**: Type imports enforced
- **Nullish coalescing**: Safer than `||` operator

## Future Plans

- React frontend application in the same monorepo
- End-to-end testing library
- Additional microservices

## Tech Stack

- **Monorepo**: Nx + PNPM Workspaces
- **Backend**: NestJS, Express
- **Database**: PostgreSQL, Drizzle ORM
- **Build Tool**: tsup
- **Testing**: Vitest
- **Language**: TypeScript
- **Code Quality**: ESLint 9 + Prettier 3
- **Release Management**: Changesets

## License

Private - All Rights Reserved

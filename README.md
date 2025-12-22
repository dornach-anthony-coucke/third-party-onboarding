# Third-Party Onboarding Monorepo

A monorepo for third-party onboarding services with NestJS API and reusable packages, powered by Nx.

## Project Structure

```
third-party-onboarding/
├── packages/
│   ├── drizzle-core/              # Drizzle ORM database configuration
│   └── database-nest-module/      # NestJS Database module
├── apps/
│   └── api/                       # NestJS API application
├── nx.json                        # Nx configuration
└── pnpm-workspace.yaml            # PNPM workspace configuration
```

## Packages

### @third-party-onboarding/drizzle-core

Core Drizzle ORM configuration for PostgreSQL database connections.

- Configurable connection pooling
- SSL support
- Type-safe database access

### @third-party-onboarding/database-nest-module

Reusable NestJS Database module that wraps drizzle-core for use in NestJS applications.

- Global NestJS module
- Synchronous and asynchronous configuration
- Injectable database connection

## Applications

### API (@third-party-onboarding/api)

NestJS REST API application.

- Built with `tsup` (instead of nest-cli)
- Tested with `Vitest` (no e2e tests initially)
- Uses the database-nest-module for database access

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
pnpm nx run api:build
pnpm nx run drizzle-core:test
```

### Running the API

```bash
# Build dependencies and run API
pnpm nx run api:dev

# Or navigate to the api app
cd apps/api

# Create .env file (copy from .env.example)
cp .env.example .env

# Start in development mode
pnpm run dev

# Or build and start in production
pnpm nx run api:build
pnpm nx run api:start
```

The API will be available at `http://localhost:3000/api`

## Nx Features

This monorepo uses Nx for:

- **Smart rebuilds**: Only rebuilds affected projects
- **Task orchestration**: Manages dependencies between projects
- **Caching**: Caches build and test results for faster execution
- **Parallel execution**: Runs tasks in parallel when possible
- **Dependency graph**: Visualize project dependencies with `pnpm run graph`

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

## License

Private - All Rights Reserved

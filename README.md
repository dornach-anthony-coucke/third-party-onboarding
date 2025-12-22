# Third-Party Onboarding Monorepo

A monorepo for third-party onboarding services with NestJS API and reusable packages.

## Project Structure

```
third-party-onboarding/
├── packages/
│   ├── drizzle-core/              # Drizzle ORM database configuration
│   └── database-nest-module/      # NestJS Database module
├── apps/
│   └── api/                       # NestJS API application
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

# Run tests across all packages
pnpm run test

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Running the API

```bash
# Navigate to the api app
cd apps/api

# Create .env file (copy from .env.example)
cp .env.example .env

# Start in development mode
pnpm run dev

# Or build and start in production
pnpm run build
pnpm run start
```

The API will be available at `http://localhost:3000/api`

## Future Plans

- React frontend application in the same monorepo
- End-to-end testing library
- Additional microservices

## Tech Stack

- **Monorepo**: PNPM Workspaces
- **Backend**: NestJS, Express
- **Database**: PostgreSQL, Drizzle ORM
- **Build Tool**: tsup
- **Testing**: Vitest
- **Language**: TypeScript

## License

Private - All Rights Reserved
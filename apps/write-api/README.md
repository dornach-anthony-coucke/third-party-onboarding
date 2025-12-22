# Write API Application

NestJS Write API application for handling commands, using the database-nest-module.

## Features

- Built with tsup (not nest-cli)
- Tests with Vitest
- Uses @third-party-onboarding-manager/database-nest-module for database access
- Health check endpoint
- CORS enabled
- Global API prefix
- Command handling (write operations)

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start development server (from root)
pnpm run write-api:dev

# Or from this directory
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

## Environment Variables

Create a `.env` file in the root of the project:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/third-party-onboarding
DATABASE_SSL=false
PORT=3000
```

## Endpoints

- `GET /api` - Welcome message
- `GET /api/health` - Health check

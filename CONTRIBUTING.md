# Contributing to Third-Party Onboarding

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL (for running the API with database)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build all packages:

```bash
pnpm run build
```

## Project Structure

This is a pnpm workspace monorepo with the following structure:

```
third-party-onboarding/
├── apps/                           # Applications
│   └── api/                        # NestJS API application
├── packages/                       # Reusable packages
│   ├── drizzle-core/              # Drizzle DB core configuration
│   └── database-nest-module/      # NestJS database module
```

## Working with Packages

### Adding a New Package

1. Create a new directory under `packages/`
2. Add a `package.json` with the naming convention `@third-party-onboarding/<package-name>`
3. Add your package to the workspace by running `pnpm install` at the root
4. Reference it in other packages using `workspace:*` in dependencies

### Building

Build all packages and apps:

```bash
pnpm run build
```

Build a specific package:

```bash
cd packages/<package-name>
pnpm run build
```

### Testing

Run all tests:

```bash
pnpm run test
```

Run tests for a specific package:

```bash
cd apps/api
pnpm run test
```

Run tests in watch mode:

```bash
cd apps/api
pnpm run test:watch
```

### Linting and Formatting

Lint all code:

```bash
pnpm run lint
```

Format all code:

```bash
pnpm run format
```

Check formatting:

```bash
pnpm run format:check
```

## Adding Dependencies

### To a specific package

```bash
cd packages/<package-name>
pnpm add <dependency>
```

### To a workspace package

```bash
cd packages/<package-name>
pnpm add @third-party-onboarding/<other-package>@workspace:*
```

## Running the API

1. Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_SSL=false
PORT=3000
```

2. Build all packages:

```bash
pnpm run build
```

3. Start the API:

```bash
cd apps/api
pnpm run start:dev
```

The API will be available at `http://localhost:3000/api`

## Code Style

- Use TypeScript for all code
- Follow the ESLint configuration
- Format code with Prettier before committing
- Write tests for new features

## Commit Guidelines

- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issues in commit messages when applicable

## Future Additions

When adding a React frontend:

1. Create `apps/frontend` directory
2. Add the frontend app to the pnpm workspace
3. Update the main README with frontend instructions

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

This is an Nx-powered monorepo with pnpm workspaces:

```
third-party-onboarding/
├── apps/                           # Applications
│   └── api/                        # NestJS API application
│       └── project.json            # Nx project configuration
├── packages/                       # Reusable packages
│   ├── drizzle-core/              # Drizzle DB core configuration
│   │   └── project.json           # Nx project configuration
│   └── database-nest-module/      # NestJS database module
│       └── project.json           # Nx project configuration
└── nx.json                        # Nx workspace configuration
```

## Working with Nx

### Nx Commands

Run tasks for all projects:

```bash
pnpm nx run-many -t build
pnpm nx run-many -t test
pnpm nx run-many -t lint
```

Run tasks for affected projects only:

```bash
pnpm nx affected -t build
pnpm nx affected -t test
pnpm nx affected -t lint
```

Run a task for a specific project:

```bash
pnpm nx run api:build
pnpm nx run drizzle-core:test
pnpm nx run database-nest-module:lint
```

Visualize the dependency graph:

```bash
pnpm run graph
```

### Understanding Affected

Nx's affected command only runs tasks on projects that are affected by your changes. This is much faster than running tasks on all projects. Nx determines affected projects by:

- Analyzing git changes
- Following dependency relationships
- Using cached results when possible

## Working with Packages

### Adding a New Package

1. Create a new directory under `packages/`
2. Add a `package.json` with the naming convention `@third-party-onboarding/<package-name>`
3. Create a `project.json` for Nx configuration:

```json
{
  "name": "package-name",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/package-name/src",
  "projectType": "library",
  "tags": ["type:package"],
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "outputs": ["{projectRoot}/dist"],
      "options": {
        "command": "tsup",
        "cwd": "{projectRoot}"
      }
    }
  }
}
```

4. Reference it in other packages using `workspace:*` in dependencies
5. Run `pnpm install` at the root

### Building

Build all packages and apps:

```bash
pnpm run build
```

Build a specific package:

```bash
pnpm nx run drizzle-core:build
```

Build only affected projects:

```bash
pnpm run build:affected
```

### Testing

Run all tests:

```bash
pnpm run test
```

Run tests for a specific package:

```bash
pnpm nx run api:test
```

Run tests only for affected projects:

```bash
pnpm run test:affected
```

Run tests in watch mode:

```bash
pnpm nx run api:test:watch
```

### Linting and Formatting

Lint all code:

```bash
pnpm run lint
```

Lint only affected projects:

```bash
pnpm run lint:affected
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
pnpm nx run api:dev
# or
cd apps/api
pnpm run dev
```

The API will be available at `http://localhost:3000/api`

## Database Setup

Start the PostgreSQL database:

```bash
cd infra
docker compose up -d
```

Stop the database:

```bash
cd infra
docker compose down
```

## Code Style

This project uses modern ESLint and Prettier configurations:

- **ESLint 9** with flat config
- **TypeScript ESLint v8** for strict type checking
- **Prettier 3** with latest formatting standards
- Type imports enforced with inline syntax
- Nullish coalescing (`??`) preferred over `||`

Run linting and formatting:

```bash
pnpm run lint
pnpm run format
```

## Release Management

This project uses Changesets for versioning:

### Adding Changes

When you make changes, add a changeset:

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages changed
2. Choose the type of change (major, minor, patch)
3. Write a summary of changes

### Releasing (Maintainers)

Update versions:

```bash
pnpm changeset:version
```

Publish:

```bash
pnpm changeset:publish
```

## Commit Guidelines

- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issues in commit messages when applicable
- Add changesets for all user-facing changes

## Future Additions

When adding a React frontend:

1. Create `apps/frontend` directory
2. Add the frontend app to the pnpm workspace
3. Update the main README with frontend instructions

# @third-party-onboarding/drizzle-core

Core Drizzle ORM configuration package for database connections.

## Features

- Drizzle ORM setup with PostgreSQL
- Configurable connection pooling
- SSL support
- Type-safe database access

## Usage

```typescript
import { createDrizzleCore } from '@third-party-onboarding/drizzle-core';

const drizzleCore = createDrizzleCore({
  connectionString: process.env.DATABASE_URL,
  maxConnections: 10,
  ssl: true,
});

const db = drizzleCore.getDb();
```

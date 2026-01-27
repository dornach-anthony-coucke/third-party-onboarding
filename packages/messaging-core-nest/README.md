# @third-party-onboarding-manager/database-nest-module

Reusable NestJS Database module based on @third-party-onboarding-manager/drizzle-core.

## Features

- Global NestJS module for database access
- Synchronous and asynchronous configuration
- Drizzle ORM integration
- Injectable database connection

## Usage

### Synchronous configuration

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';

@Module({
  imports: [
    DatabaseModule.forRoot({
      connectionString: process.env.DATABASE_URL,
      maxConnections: 10,
      ssl: true,
    }),
  ],
})
export class AppModule {}
```

### Asynchronous configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get('DATABASE_URL'),
        maxConnections: 10,
        ssl: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Injecting the database

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@third-party-onboarding-manager/database-nest-module';

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE_CONNECTION) private db: any) {}

  async findAll() {
    return this.db.select().from(users);
  }
}
```

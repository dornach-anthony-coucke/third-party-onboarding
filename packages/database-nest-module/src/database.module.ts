import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { schemas } from '@third-party-onboarding-manager/drizzle-core';
import { DATABASE_TOKEN } from './tokens/db.token.js';
import { POOL_TOKEN } from './tokens/pool.token.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: POOL_TOKEN,
      useFactory: (config: ConfigService) => {
        return new Pool({
          host: config.get<string>('THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_HOST'),
          port: config.get<number>('THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_PORT'),
          database: config.get<string>('THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_NAME'),
          user: config.get<string>('THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_USER'),
          password: config.get<string>('THIRD_PARTY_ONBOARDING_MANAGER_DATABASE_PASSWORD'),
          // Rely on PGSSLMODE env for SSL; omit ssl to avoid forcing TLS
        });
      },
      inject: [ConfigService],
    },
    {
      provide: DATABASE_TOKEN,
      useFactory: (pool: Pool) =>
        drizzle(pool, {
          schema: schemas,
          logger: process.env.NODE_ENV === 'development' ? true : false,
        }),
      inject: [POOL_TOKEN],
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}

import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { schemas } from '@third-party-onboarding/drizzle-core';
import { DATABASE_TOKEN } from './tokens/db.token.js';
import { POOL_TOKEN } from './tokens/pool.token.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: POOL_TOKEN,
      useFactory: (config: ConfigService) =>
        new Pool({
          host: config.get<string>('ONBOARDING_DATABASE_HOST'),
          port: config.get<number>('ONBOARDING_DATABASE_PORT'),
          database: config.get<string>('ONBOARDING_DATABASE_NAME'),
          user: config.get<string>('ONBOARDING_DATABASE_USER'),
          password: config.get<string>('ONBOARDING_DATABASE_PASSWORD'),
        }),
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

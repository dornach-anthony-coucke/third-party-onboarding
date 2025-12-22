import { DynamicModule, Module, Provider, OnModuleDestroy } from '@nestjs/common';
import { DrizzleCore, DrizzleCoreConfig } from '@third-party-onboarding/drizzle-core';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';
export const DRIZZLE_CORE_INSTANCE = 'DRIZZLE_CORE_INSTANCE';

export interface DatabaseModuleOptions {
  connectionString: string;
  maxConnections?: number;
  ssl?: boolean;
}

export interface DatabaseModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<DatabaseModuleOptions> | DatabaseModuleOptions;
  inject?: any[];
}

@Module({})
export class DatabaseModule implements OnModuleDestroy {
  async onModuleDestroy() {
    // Cleanup is handled by individual DrizzleCore instances
  }

  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    const drizzleCoreProvider: Provider = {
      provide: DRIZZLE_CORE_INSTANCE,
      useFactory: () => {
        const config: DrizzleCoreConfig = {
          connectionString: options.connectionString,
          maxConnections: options.maxConnections,
          ssl: options.ssl,
        };
        return new DrizzleCore(config);
      },
    };

    const drizzleProvider: Provider = {
      provide: DATABASE_CONNECTION,
      useFactory: (drizzleCore: DrizzleCore) => {
        return drizzleCore.getDb();
      },
      inject: [DRIZZLE_CORE_INSTANCE],
    };

    return {
      module: DatabaseModule,
      providers: [drizzleCoreProvider, drizzleProvider],
      exports: [drizzleProvider],
      global: true,
    };
  }

  static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const drizzleCoreProvider: Provider = {
      provide: DRIZZLE_CORE_INSTANCE,
      useFactory: async (...args: any[]) => {
        const moduleOptions = await options.useFactory(...args);
        const config: DrizzleCoreConfig = {
          connectionString: moduleOptions.connectionString,
          maxConnections: moduleOptions.maxConnections,
          ssl: moduleOptions.ssl,
        };
        return new DrizzleCore(config);
      },
      inject: options.inject || [],
    };

    const drizzleProvider: Provider = {
      provide: DATABASE_CONNECTION,
      useFactory: (drizzleCore: DrizzleCore) => {
        return drizzleCore.getDb();
      },
      inject: [DRIZZLE_CORE_INSTANCE],
    };

    return {
      module: DatabaseModule,
      providers: [drizzleCoreProvider, drizzleProvider],
      exports: [drizzleProvider],
      global: true,
    };
  }
}

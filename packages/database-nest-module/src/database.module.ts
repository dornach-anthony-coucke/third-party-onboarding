import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DrizzleCore, DrizzleCoreConfig } from '@third-party-onboarding/drizzle-core';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

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
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions): DynamicModule {
    const drizzleProvider: Provider = {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        const config: DrizzleCoreConfig = {
          connectionString: options.connectionString,
          maxConnections: options.maxConnections,
          ssl: options.ssl,
        };
        const drizzleCore = new DrizzleCore(config);
        return drizzleCore.getDb();
      },
    };

    return {
      module: DatabaseModule,
      providers: [drizzleProvider],
      exports: [drizzleProvider],
      global: true,
    };
  }

  static forRootAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const drizzleProvider: Provider = {
      provide: DATABASE_CONNECTION,
      useFactory: async (...args: any[]) => {
        const moduleOptions = await options.useFactory(...args);
        const config: DrizzleCoreConfig = {
          connectionString: moduleOptions.connectionString,
          maxConnections: moduleOptions.maxConnections,
          ssl: moduleOptions.ssl,
        };
        const drizzleCore = new DrizzleCore(config);
        return drizzleCore.getDb();
      },
      inject: options.inject || [],
    };

    return {
      module: DatabaseModule,
      providers: [drizzleProvider],
      exports: [drizzleProvider],
      global: true,
    };
  }
}

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

export interface DrizzleCoreConfig {
  connectionString: string;
  maxConnections?: number;
  ssl?: boolean;
}

export class DrizzleCore {
  private client: ReturnType<typeof postgres>;
  private db: ReturnType<typeof drizzle>;

  constructor(config: DrizzleCoreConfig) {
    this.client = postgres(config.connectionString, {
      max: config.maxConnections || 10,
      ssl: config.ssl ? 'require' : false,
    });
    this.db = drizzle(this.client);
  }

  getDb() {
    return this.db;
  }

  getClient() {
    return this.client;
  }

  async close() {
    await this.client.end();
  }
}

export function createDrizzleCore(config: DrizzleCoreConfig): DrizzleCore {
  return new DrizzleCore(config);
}

import type * as schemas from '../schemas/index.js';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

export type DrizzleDB = NodePgDatabase<typeof schemas>;

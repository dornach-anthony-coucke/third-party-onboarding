import { pgTable, serial, text, jsonb, timestamp, bigint } from 'drizzle-orm/pg-core';

export const outboxTable = pgTable('outbox', {
  id: serial('id').primaryKey(),
  aggregateId: bigint('aggregate_id', { mode: 'bigint' }).notNull(),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

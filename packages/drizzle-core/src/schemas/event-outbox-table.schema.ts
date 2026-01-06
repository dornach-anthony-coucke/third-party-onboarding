import { pgTable, serial, text, jsonb, timestamp, bigint } from 'drizzle-orm/pg-core';

// Outbox dédiée aux events d'intégration émis par le BC
export const outboxEventsTable = pgTable('event_outbox', {
  id: serial('id').primaryKey(),
  aggregateId: bigint('aggregate_id', { mode: 'bigint' }).notNull(),
  routingKey: text('routing_key').notNull(),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

import { pgTable, serial, text, jsonb, timestamp, index, bigint } from 'drizzle-orm/pg-core';

export const eventstoreTable = pgTable(
  'eventstore',
  {
    id: serial('id').primaryKey(),
    aggregateId: bigint('aggregate_id', { mode: 'bigint' }).notNull(),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_onboarding_manager_events_aggregate_id').on(table.aggregateId)],
);

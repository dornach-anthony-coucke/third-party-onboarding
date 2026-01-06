import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

// Outbox dédiée aux commands sortantes vers d'autres BC
export const commandOutboxTable = pgTable('command_outbox', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(),
  destinationBoundedContext: text('destination_bounded_context').notNull(),
  routingKey: text('routing_key').notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

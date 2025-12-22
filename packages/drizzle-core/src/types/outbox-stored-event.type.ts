import type { outboxTable } from '../schemas/outbox-table.schema.js';

export type OutboxStoredEvent<PayloadType = unknown> = typeof outboxTable.$inferSelect & {
  payload: PayloadType;
};

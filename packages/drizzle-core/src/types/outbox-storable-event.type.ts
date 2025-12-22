import type { outboxTable } from '../schemas/outbox-table.schema.js';

export type OutboxStorableEvent<PayloadType = unknown> = typeof outboxTable.$inferInsert & {
  payload: PayloadType;
};

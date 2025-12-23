import type { eventstoreTable } from '../schemas/eventstore-table.schema.js';

export type EventstoreStoredEvent<PayloadType = unknown> = typeof eventstoreTable.$inferSelect & {
  payload: PayloadType;
};

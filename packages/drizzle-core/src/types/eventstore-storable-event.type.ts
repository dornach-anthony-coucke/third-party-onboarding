import type { eventstoreTable } from '../schemas/eventstore-table.schema.js';

export type EventstoreStorableEvent<PayloadType = unknown> = typeof eventstoreTable.$inferInsert & {
  payload: PayloadType;
};

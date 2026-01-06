import type { outboxEventsTable } from '../schemas/event-outbox-table.schema.js';

// Outbox d'events : storable = ce qu'on insère dans la table `outbox_events`
export type OutboxStorableEvent<PayloadType = unknown> = typeof outboxEventsTable.$inferInsert & {
  payload: PayloadType;
};

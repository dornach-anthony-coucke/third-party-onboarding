import type { outboxEventsTable } from '../schemas/event-outbox-table.schema.js';
import type { commandOutboxTable } from '../schemas/command-outbox-table.schema.js';

// Events outbox : lecture depuis la table `outbox_events`
export type OutboxStoredEvent<PayloadType = unknown> = typeof outboxEventsTable.$inferSelect & {
  payload: PayloadType;
};

// Commands outbox : lecture depuis la table `command_outbox`
export type OutboxStoredCommand<PayloadType = unknown> = typeof commandOutboxTable.$inferSelect & {
  payload: PayloadType;
};

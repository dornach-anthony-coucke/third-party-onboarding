import type { commandOutboxTable } from '../schemas/command-outbox-table.schema.js';

// Outbox de commands : storable = ce qu'on insère dans la table `command_outbox`
export type DestinationBoundedContext =
  | 'third-party-onboarding-manager'
  | 'company-registry'
  | 'account-registry';

export interface CommandOutboxMetadata {
  destinationBoundedContext: DestinationBoundedContext;
}

export type OutboxStorableCommand<PayloadType = unknown> = typeof commandOutboxTable.$inferInsert &
  CommandOutboxMetadata & {
    payload: PayloadType;
  };

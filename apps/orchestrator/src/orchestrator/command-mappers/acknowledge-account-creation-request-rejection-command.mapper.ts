import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { AcknowledgeAccountCreationRequestRejectionCommand } from '@dornach/third-party-onboarding-manager-application';
import type { AcknowledgeAccountCreationRequestRejectionCommandPayload } from '../command-payloads/acknowledge-account-creation-request-rejection-command-payload.interface.js';

export const mapAcknowledgeAccountCreationRequestRejectionCommandToOutboxStorableCommand =
  createMapper(
    'AcknowledgeAccountCreationRequestRejectionCommand',
    'OutboxStorableCommand',
    (
      acknowledgeAccountCreationRequestRejectionCommand: AcknowledgeAccountCreationRequestRejectionCommand,
    ): databaseTypes.OutboxStorableCommand<AcknowledgeAccountCreationRequestRejectionCommandPayload> => {
      return {
        destinationBoundedContext: 'third-party-onboarding-manager',
        routingKey: 'onboarding.acknowledge_account_creation_request_rejection',
        payload: acknowledgeAccountCreationRequestRejectionCommand,
        type: 'AcknowledgeAccountCreationRequestRejectionCommand',
        createdAt: acknowledgeAccountCreationRequestRejectionCommand.createdAt,
      };
    },
  );

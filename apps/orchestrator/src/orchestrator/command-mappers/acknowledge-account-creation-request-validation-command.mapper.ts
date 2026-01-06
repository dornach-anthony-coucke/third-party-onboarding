import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { AcknowledgeAccountCreationRequestValidationCommand } from '@dornach/third-party-onboarding-manager-application';
import type { AcknowledgeAccountCreationRequestValidationCommandPayload } from '../command-payloads/acknowledge-account-creation-request-validation-command-payload.interface.js';

export const mapAcknowledgeAccountCreationRequestValidationCommandToOutboxStorableCommand =
  createMapper(
    'AcknowledgeAccountCreationRequestValidationCommand',
    'OutboxStorableCommand',
    (
      acknowledgeAccountCreationRequestValidationCommand: AcknowledgeAccountCreationRequestValidationCommand,
    ): databaseTypes.OutboxStorableCommand<AcknowledgeAccountCreationRequestValidationCommandPayload> => {
      return {
        destinationBoundedContext: 'third-party-onboarding-manager',
        routingKey: 'onboarding.acknowledge_account_creation_request_validation',
        payload: acknowledgeAccountCreationRequestValidationCommand,
        type: 'AcknowledgeAccountCreationRequestValidationCommand',
        createdAt: acknowledgeAccountCreationRequestValidationCommand.createdAt,
      };
    },
  );

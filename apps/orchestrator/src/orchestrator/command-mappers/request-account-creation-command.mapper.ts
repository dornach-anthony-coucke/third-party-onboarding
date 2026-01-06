import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { RequestThirdPartyAccountCreationCommand } from '@dornach/third-party-account-registry-contracts';
import type { RequestAccountCreationCommandPayload } from '../command-payloads/request-account-creation-command-payload.interface.js';

export const mapRequestAccountCreationCommandToOutboxStorableCommand = createMapper(
  'RequestThirdPartyAccountCreationCommand',
  'OutboxStorableCommand',
  (
    requestAccountCreationCommand: RequestThirdPartyAccountCreationCommand,
  ): databaseTypes.OutboxStorableCommand<RequestAccountCreationCommandPayload> => {
    return {
      destinationBoundedContext: 'account-registry',
      routingKey: 'account.request_creation',
      payload: requestAccountCreationCommand,
      type: 'RequestAccountCreationCommand',
      createdAt: requestAccountCreationCommand.createdAt,
    };
  },
);

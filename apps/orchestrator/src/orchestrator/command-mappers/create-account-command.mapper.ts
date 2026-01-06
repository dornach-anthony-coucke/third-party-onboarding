import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { CreateThirdPartyAccountCommand } from '@dornach/third-party-account-registry-contracts';
import type { CreateAccountCommandPayload } from '../command-payloads/create-account-command-payload.interface.js';

export const mapCreateAccountCommandToOutboxStorableCommand = createMapper(
  'CreateThirdPartyAccountCommand',
  'OutboxStorableCommand',
  (
    createAccountCommand: CreateThirdPartyAccountCommand,
  ): databaseTypes.OutboxStorableCommand<CreateAccountCommandPayload> => {
    return {
      destinationBoundedContext: 'account-registry',
      routingKey: 'account.create',
      payload: createAccountCommand,
      type: 'CreateAccountCommand',
      createdAt: createAccountCommand.createdAt,
    };
  },
);

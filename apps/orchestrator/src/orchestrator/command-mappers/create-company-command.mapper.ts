import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { CreateCompanyCommand } from '@dornach/company-registry-contracts';
import type { CreateCompanyCommandPayload } from '../command-payloads/create-company-command-payload.interface.js';

export const mapCreateCompanyCommandToOutboxStorableCommand = createMapper(
  'CreateCompanyCommand',
  'OutboxStorableCommand',
  (
    createCompanyCommand: CreateCompanyCommand,
  ): databaseTypes.OutboxStorableCommand<CreateCompanyCommandPayload> => {
    return {
      destinationBoundedContext: 'company-registry',
      routingKey: 'company.create',
      payload: createCompanyCommand,
      type: 'CreateCompanyCommand',
      createdAt: createCompanyCommand.createdAt,
    };
  },
);

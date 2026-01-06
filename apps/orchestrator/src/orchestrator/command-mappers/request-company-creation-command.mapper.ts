import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { RequestCompanyCreationCommand } from '@dornach/company-registry-contracts';
import type { RequestCompanyCreationCommandPayload } from '../command-payloads/request-company-creation-command-payload.interface';

export const mapRequestCompanyCreationCommandToOutboxStorableCommand = createMapper(
  'RequestCompanyCreationCommand',
  'OutboxStorableCommand',
  (
    requestCompanyCreationCommand: RequestCompanyCreationCommand,
  ): databaseTypes.OutboxStorableCommand<RequestCompanyCreationCommandPayload> => {
    return {
      destinationBoundedContext: 'company-registry',
      routingKey: 'company.request_creation',
      payload: requestCompanyCreationCommand,
      type: 'RequestCompanyCreationCommand',
      createdAt: requestCompanyCreationCommand.createdAt,
    };
  },
);

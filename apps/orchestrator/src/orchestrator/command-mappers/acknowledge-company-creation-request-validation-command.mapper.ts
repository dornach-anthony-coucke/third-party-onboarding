import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { AcknowledgeCompanyCreationRequestValidationCommand } from '@dornach/third-party-onboarding-manager-application';
import type { AcknowledgeCompanyCreationRequestValidationCommandPayload } from '../command-payloads/acknowledge-company-creation-request-validation-command-payload.interface.js';

export const mapAcknowledgeCompanyCreationRequestValidationCommandToOutboxStorableCommand =
  createMapper(
    'AcknowledgeCompanyCreationRequestValidationCommand',
    'OutboxStorableCommand',
    (
      acknowledgeCompanyCreationRequestValidationCommand: AcknowledgeCompanyCreationRequestValidationCommand,
    ): databaseTypes.OutboxStorableCommand<AcknowledgeCompanyCreationRequestValidationCommandPayload> => {
      return {
        destinationBoundedContext: 'third-party-onboarding-manager',
        routingKey: 'onboarding.acknowledge_company_creation_request_validation',
        payload: acknowledgeCompanyCreationRequestValidationCommand,
        type: 'AcknowledgeCompanyCreationRequestValidationCommand',
        createdAt: acknowledgeCompanyCreationRequestValidationCommand.createdAt,
      };
    },
  );

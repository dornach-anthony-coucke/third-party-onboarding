import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { createMapper } from '@couckedev/mapper-registry';
import type { AcknowledgeCompanyCreationRequestRejectionCommand } from '@dornach/third-party-onboarding-manager-application';
import type { AcknowledgeCompanyCreationRequestRejectionCommandPayload } from '../command-payloads/acknowledge-company-creation-request-rejection-command-payload.interface.js';

export const mapAcknowledgeCompanyCreationRequestRejectionCommandToOutboxStorableCommand =
  createMapper(
    'AcknowledgeCompanyCreationRequestRejectionCommand',
    'OutboxStorableCommand',
    (
      acknowledgeCompanyCreationRequestRejectionCommand: AcknowledgeCompanyCreationRequestRejectionCommand,
    ): databaseTypes.OutboxStorableCommand<AcknowledgeCompanyCreationRequestRejectionCommandPayload> => {
      return {
        destinationBoundedContext: 'third-party-onboarding-manager',
        routingKey: 'onboarding.acknowledge_company_creation_request_rejection',
        payload: acknowledgeCompanyCreationRequestRejectionCommand,
        type: 'AcknowledgeCompanyCreationRequestRejectionCommand',
        createdAt: acknowledgeCompanyCreationRequestRejectionCommand.createdAt,
      };
    },
  );

import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { CompanyCreationRequestValidationAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { CompanyCreationRequestValidationAcknowledgedEventPayload } from '../../event-payloads/company-creation-request-validation-acknowledged-event.payload.js';

export const mapCompanyCreationRequestValidationAcknowledgedEventToOutboxStorableEvent =
  createMapper(
    'CompanyCreationRequestValidationAcknowledgedEvent',
    'OutboxStorableEvent',
    (
      companyCreationRequestValidationAcknowledgedEvent: CompanyCreationRequestValidationAcknowledgedEvent,
    ): databaseTypes.OutboxStorableEvent<CompanyCreationRequestValidationAcknowledgedEventPayload> => {
      return {
        type: 'CompanyCreationRequestValidationAcknowledgedEvent',
        aggregateId: BigInt(companyCreationRequestValidationAcknowledgedEvent.onboardingRequestId),
        routingKey: 'onboarding.company_creation_request_validation_acknowledged',
        payload: {
          onboardingRequestId:
            companyCreationRequestValidationAcknowledgedEvent.onboardingRequestId,
        },
      };
    },
  );

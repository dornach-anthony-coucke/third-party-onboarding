import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { CompanyCreationRequestValidationAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { CompanyCreationRequestValidationAcknowledgedEventPayload } from '../../event-payloads/company-creation-request-validation-acknowledged-event.payload.js';

export const mapCompanyCreationRequestValidationAcknowledgedEventToEventstoreStorableEvent =
  createMapper(
    'CompanyCreationRequestValidationAcknowledgedEvent',
    'EventstoreStorableEvent',
    (
      companyCreationRequestValidationAcknowledgedEvent: CompanyCreationRequestValidationAcknowledgedEvent,
    ): databaseTypes.EventstoreStorableEvent<CompanyCreationRequestValidationAcknowledgedEventPayload> => {
      return {
        type: 'CompanyCreationRequestValidationAcknowledgedEvent',
        aggregateId: BigInt(companyCreationRequestValidationAcknowledgedEvent.onboardingRequestId),
        payload: {
          onboardingRequestId:
            companyCreationRequestValidationAcknowledgedEvent.onboardingRequestId,
        },
      };
    },
  );

import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { CompanyCreationRequestRejectionAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { CompanyCreationRequestRejectionAcknowledgedEventPayload } from '../../event-payloads/company-creation-request-rejection-acknowledged-event.payload.js';

export const mapCompanyCreationRequestRejectionAcknowledgedEventToEventstoreStorableEvent =
  createMapper(
    'CompanyCreationRequestRejectionAcknowledgedEvent',
    'EventstoreStorableEvent',
    (
      companyCreationRequestRejectionAcknowledgedEvent: CompanyCreationRequestRejectionAcknowledgedEvent,
    ): databaseTypes.EventstoreStorableEvent<CompanyCreationRequestRejectionAcknowledgedEventPayload> => {
      return {
        type: 'CompanyCreationRequestRejectionAcknowledgedEvent',
        aggregateId: BigInt(companyCreationRequestRejectionAcknowledgedEvent.onboardingRequestId),
        payload: {
          onboardingRequestId: companyCreationRequestRejectionAcknowledgedEvent.onboardingRequestId,
          errors: companyCreationRequestRejectionAcknowledgedEvent.errors,
        },
      };
    },
  );

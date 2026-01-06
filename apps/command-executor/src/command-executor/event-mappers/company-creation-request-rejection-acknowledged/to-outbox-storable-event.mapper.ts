import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { CompanyCreationRequestRejectionAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { CompanyCreationRequestRejectionAcknowledgedEventPayload } from '../../event-payloads/company-creation-request-rejection-acknowledged-event.payload.js';

export const mapCompanyCreationRequestRejectionAcknowledgedEventToOutboxStorableEvent =
  createMapper(
    'CompanyCreationRequestRejectionAcknowledgedEvent',
    'OutboxStorableEvent',
    (
      companyCreationRequestRejectionAcknowledgedEvent: CompanyCreationRequestRejectionAcknowledgedEvent,
    ): databaseTypes.OutboxStorableEvent<CompanyCreationRequestRejectionAcknowledgedEventPayload> => {
      return {
        type: 'CompanyCreationRequestRejectionAcknowledgedEvent',
        aggregateId: BigInt(companyCreationRequestRejectionAcknowledgedEvent.onboardingRequestId),
        routingKey: 'onboarding.company_creation_request_rejection_acknowledged',
        payload: {
          onboardingRequestId: companyCreationRequestRejectionAcknowledgedEvent.onboardingRequestId,
          errors: companyCreationRequestRejectionAcknowledgedEvent.errors,
        },
      };
    },
  );

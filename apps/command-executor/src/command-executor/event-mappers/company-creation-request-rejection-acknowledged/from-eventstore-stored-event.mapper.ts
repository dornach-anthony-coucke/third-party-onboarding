import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { CompanyCreationRequestRejectionAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { CompanyCreationRequestRejectionAcknowledgedEventPayload } from '../../event-payloads/company-creation-request-rejection-acknowledged-event.payload.js';

export const mapEventstoreStoredEventToCompanyCreationRequestValidationAcknowledgedEvent =
  createMapper(
    'EventstoreStoredEvent',
    'CompanyCreationRequestRejectionAcknowledgedEvent',
    (
      storedEvent: databaseTypes.EventstoreStoredEvent<CompanyCreationRequestRejectionAcknowledgedEventPayload>,
    ): CompanyCreationRequestRejectionAcknowledgedEvent => {
      return new CompanyCreationRequestRejectionAcknowledgedEvent(
        storedEvent.payload.onboardingRequestId,
        storedEvent.payload.errors,
      );
    },
  );

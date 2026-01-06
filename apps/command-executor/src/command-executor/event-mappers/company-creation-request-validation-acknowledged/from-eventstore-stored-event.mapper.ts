import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { CompanyCreationRequestValidationAcknowledgedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { CompanyCreationRequestValidationAcknowledgedEventPayload } from '../../event-payloads/company-creation-request-validation-acknowledged-event.payload.js';

export const mapEventstoreStoredEventToCompanyCreationRequestValidationAcknowledgedEvent =
  createMapper(
    'EventstoreStoredEvent',
    'CompanyCreationRequestValidationAcknowledgedEvent',
    (
      storedEvent: databaseTypes.EventstoreStoredEvent<CompanyCreationRequestValidationAcknowledgedEventPayload>,
    ): CompanyCreationRequestValidationAcknowledgedEvent => {
      return new CompanyCreationRequestValidationAcknowledgedEvent(
        storedEvent.payload.onboardingRequestId,
      );
    },
  );

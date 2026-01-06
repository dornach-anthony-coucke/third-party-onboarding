import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { OnboardingRequestValidationRejectedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { OnboardingRequestValidationRejectedEventPayload } from '../../event-payloads/onboarding-request-validation-rejected-event.payload.js';

export const mapEventstoreStoredEventToOnboardingRequestValidationRejectedEvent = createMapper(
  'EventstoreStoredEvent',
  'OnboardingRequestValidationRejectedEvent',
  (
    storedEvent: databaseTypes.EventstoreStoredEvent<OnboardingRequestValidationRejectedEventPayload>,
  ): OnboardingRequestValidationRejectedEvent => {
    return new OnboardingRequestValidationRejectedEvent(
      storedEvent.payload.onboardingRequestId,
      storedEvent.payload.companyRequestValidationErrors,
      storedEvent.payload.accountRequestValidationErrors,
    );
  },
);

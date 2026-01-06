import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { OnboardingRequestValidatedEvent } from '@dornach/third-party-onboarding-manager-domain';
import type { OnboardingRequestValidatedEventPayload } from '../../event-payloads/onboarding-request-validated-event.payload.js';

export const mapEventstoreStoredEventToOnboardingRequestValidatedEvent = createMapper(
  'EventstoreStoredEvent',
  'OnboardingRequestValidatedEvent',
  (
    storedEvent: databaseTypes.EventstoreStoredEvent<OnboardingRequestValidatedEventPayload>,
  ): OnboardingRequestValidatedEvent => {
    return new OnboardingRequestValidatedEvent(storedEvent.payload.onboardingRequestId);
  },
);

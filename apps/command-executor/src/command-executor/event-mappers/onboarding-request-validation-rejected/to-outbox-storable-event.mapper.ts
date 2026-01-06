import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { OnboardingRequestValidationRejectedEventPayload } from '../../event-payloads/onboarding-request-validation-rejected-event.payload.js';
import type { OnboardingRequestValidationRejectedEvent } from '@dornach/third-party-onboarding-manager-domain';

export const mapOnboardingRequestValidationRejectedEventToOutboxStorableEvent = createMapper(
  'OnboardingRequestValidationRejectedEvent',
  'OutboxStorableEvent',
  (
    onboardingRequestValidationRejectedEvent: OnboardingRequestValidationRejectedEvent,
  ): databaseTypes.OutboxStorableEvent<OnboardingRequestValidationRejectedEventPayload> => {
    return {
      type: 'OnboardingRequestValidationRejectedEvent',
      aggregateId: BigInt(onboardingRequestValidationRejectedEvent.onboardingRequestId),
      routingKey: 'onboarding.request_validation_rejected',
      payload: {
        onboardingRequestId: onboardingRequestValidationRejectedEvent.onboardingRequestId,
        companyRequestValidationErrors:
          onboardingRequestValidationRejectedEvent.companyRequestValidationErrors,
        accountRequestValidationErrors:
          onboardingRequestValidationRejectedEvent.accountRequestValidationErrors,
      },
    };
  },
);

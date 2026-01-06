import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { OnboardingRequestedIntegrationEvent } from '@dornach/third-party-onboarding-manager-application';
import type { OnboardingRequestedEvent } from '@dornach/third-party-onboarding-manager-domain';

export const mapOnboardingRequestedEventToOutboxStorableEvent = createMapper(
  'OnboardingRequestedEvent',
  'OutboxStorableEvent',
  (
    onboardingRequestedEvent: OnboardingRequestedEvent,
  ): databaseTypes.OutboxStorableEvent<OnboardingRequestedIntegrationEvent> => {
    const { companyLegalIdentity, headquarterAddress } =
      onboardingRequestedEvent.registrationData.company;
    const { accountTypeCode } = onboardingRequestedEvent.registrationData.account;
    const integrationEvent: OnboardingRequestedIntegrationEvent = {
      eventType: onboardingRequestedEvent.eventType,
      onboardingRequestId: onboardingRequestedEvent.onboardingRequestId,
      occuredAt: onboardingRequestedEvent.occuredAt,
      registrationData: {
        company: {
          legalIdentity: {
            legalName: companyLegalIdentity.legalName,
            legalId: companyLegalIdentity.legalId,
            legalForm: companyLegalIdentity.legalForm,
          },
        },
        headquarter: {
          address: {
            line1: headquarterAddress.line1,
            city: headquarterAddress.city,
            country: headquarterAddress.country,
            line2: headquarterAddress.line2,
            line3: headquarterAddress.line3,
            zipCode: headquarterAddress.zipCode,
          },
        },
        account: {
          accountTypeCode,
        },
      },
    };

    return {
      aggregateId: BigInt(onboardingRequestedEvent.onboardingRequestId),
      routingKey: 'onboarding.requested',
      type: 'OnboardingRequestedIntegrationEvent',
      occurredAt: onboardingRequestedEvent.occuredAt,
      payload: integrationEvent,
    };
  },
);

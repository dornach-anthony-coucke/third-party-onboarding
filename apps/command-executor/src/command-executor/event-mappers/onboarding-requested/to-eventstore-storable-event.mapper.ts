import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { OnboardingRequestedEventPayload } from '../../event-payloads/onboarding-requested-event.payload.js';
import type { OnboardingRequestedEvent } from '@dornach/third-party-onboarding-manager-domain';

export const mapOnboardingRequestedEventToEventstoreStorableEvent = createMapper(
  'OnboardingRequestedEvent',
  'EventstoreStorableEvent',
  (
    onboardingRequestedEvent: OnboardingRequestedEvent,
  ): databaseTypes.EventstoreStorableEvent<OnboardingRequestedEventPayload> => {
    const { companyLegalIdentity, headquarterAddress } =
      onboardingRequestedEvent.registrationData.company;
    const { accountTypeCode } = onboardingRequestedEvent.registrationData.account;
    return {
      type: 'OnboardingRequestedEvent',
      aggregateId: BigInt(onboardingRequestedEvent.onboardingRequestId),
      payload: {
        onboardingRequestId: onboardingRequestedEvent.onboardingRequestId,
        company: {
          companyLegalIdentity: {
            legalName: companyLegalIdentity.legalName,
            legalId: companyLegalIdentity.legalId,
            legalForm: companyLegalIdentity.legalForm,
          },
          headquarterAddress: {
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
  },
);

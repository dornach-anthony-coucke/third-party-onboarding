import { createMapper } from '@couckedev/mapper-registry';
import type { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import type { OnboardingRequestedEventPayload } from '../../event-payloads/onboarding-requested-event.payload.js';
import {
  AccountRegistrationDataVO,
  CompanyLegalIdentityVO,
  CompanyRegistrationDataVO,
  HeadquarterAddressVO,
  OnboardingRequestedEvent,
} from '@dornach/third-party-onboarding-manager-domain';

export const mapEventstoreStoredEventToOnboardingRequestedEvent = createMapper(
  'EventstoreStoredEvent',
  'OnboardingRequestedEvent',
  (
    storedEvent: databaseTypes.EventstoreStoredEvent<OnboardingRequestedEventPayload>,
  ): OnboardingRequestedEvent => {
    const { company, account } = storedEvent.payload;
    const companyLegalIdentityVO = new CompanyLegalIdentityVO(
      company.companyLegalIdentity.legalName,
      company.companyLegalIdentity.legalId,
      company.companyLegalIdentity.legalForm,
    );
    const headquarterAddressVO = new HeadquarterAddressVO(
      company.headquarterAddress.line1,
      company.headquarterAddress.country,
      company.headquarterAddress.city,
      company.headquarterAddress.line2,
      company.headquarterAddress.line3,
      company.headquarterAddress.zipCode,
    );
    const companyRegistrationData = CompanyRegistrationDataVO.create(
      companyLegalIdentityVO,
      headquarterAddressVO,
    );
    const accountRegistrationData = AccountRegistrationDataVO.create(account.accountTypeCode);
    return new OnboardingRequestedEvent(storedEvent.payload.onboardingRequestId, {
      company: companyRegistrationData,
      account: accountRegistrationData,
    });
  },
);

import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OnboardingProcessManager } from '@dornach/third-party-onboarding-manager-application';
import { OnboardingRequestedEventPayloadDto } from '../dtos/onboarding-requested-event-payload.dto.js';
import {
  AccountRegistrationDataVO,
  CompanyLegalIdentityVO,
  CompanyRegistrationDataVO,
  HeadquarterAddressVO,
  OnboardingRequestedEvent,
} from '@dornach/third-party-onboarding-manager-domain';
import { PROCESS_MANAGER_TOKEN } from '../tokens/process-manager.token.js';

@Controller()
export class OnboardingRequestedEventHandler {
  constructor(
    @Inject(PROCESS_MANAGER_TOKEN)
    private readonly onboardingProcessManager: OnboardingProcessManager,
  ) {}

  @EventPattern('onboarding.requested')
  async handle(@Payload('payload') eventPayload: OnboardingRequestedEventPayloadDto) {
    console.log(eventPayload);
    const { legalName, legalId, legalForm } = eventPayload.registrationData.company.legalIdentity;
    const companylegalIdentityVO = new CompanyLegalIdentityVO(legalName, legalId, legalForm);
    const { line1, country, city, line2, line3, zipcode } =
      eventPayload.registrationData.headquarter.address;
    const headquarterAddressVO = new HeadquarterAddressVO(
      line1,
      country,
      city,
      line2,
      line3,
      zipcode,
    );
    const companyRegistrtionDataVO = CompanyRegistrationDataVO.create(
      companylegalIdentityVO,
      headquarterAddressVO,
    );
    const { accountTypeCode } = eventPayload.registrationData.account;
    const accountRegistrationDataVO = AccountRegistrationDataVO.create(accountTypeCode);
    const onboardingRequestedEvent = new OnboardingRequestedEvent(
      eventPayload.onboardingRequestId,
      {
        company: companyRegistrtionDataVO,
        account: accountRegistrationDataVO,
      },
    );
    await this.onboardingProcessManager.onOnboardingRequested(onboardingRequestedEvent);
  }
}

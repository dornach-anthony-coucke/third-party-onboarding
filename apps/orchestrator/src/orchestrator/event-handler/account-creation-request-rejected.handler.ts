import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OnboardingProcessManager } from '@dornach/third-party-onboarding-manager-application';
import { PROCESS_MANAGER_TOKEN } from '../tokens/process-manager.token.js';
import { ThirdPartyAccountCreationRequestRejectedIntegrationEvent } from '@dornach/third-party-account-registry-contracts';
import { AccountCreationRequestRejectedEventPayloadDto } from '../dtos/account-creation-request-rejected-event-payload.dto.js';

@Controller()
export class AccountCreationRequestRejectedEventHandler {
  constructor(
    @Inject(PROCESS_MANAGER_TOKEN)
    private readonly onboardingProcessManager: OnboardingProcessManager,
  ) {}

  @EventPattern('account.creation_request_rejected')
  async handle(@Payload('payload') eventPayload: AccountCreationRequestRejectedEventPayloadDto) {
    console.log(eventPayload);
    const accountCreationRequestRejectedEvent: ThirdPartyAccountCreationRequestRejectedIntegrationEvent =
      {
        requestContext: eventPayload.requestContext,
        errors: eventPayload.errors,
        occuredAt: eventPayload.occuredAt,
        eventType: eventPayload.eventType,
      };

    console.log(accountCreationRequestRejectedEvent);
    await this.onboardingProcessManager.onAccountCreationRequestRejected(
      accountCreationRequestRejectedEvent,
    );
  }
}

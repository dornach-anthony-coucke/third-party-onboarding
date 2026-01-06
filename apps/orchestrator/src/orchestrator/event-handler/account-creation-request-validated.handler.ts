import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OnboardingProcessManager } from '@dornach/third-party-onboarding-manager-application';
import { PROCESS_MANAGER_TOKEN } from '../tokens/process-manager.token.js';
import { AccountCreationRequestValidatedEventPayloadDto } from '../dtos/account-creation-request-validated-event-payload.dto.js';
import { ThirdPartyAccountCreationRequestValidatedIntegrationEvent } from '@dornach/third-party-account-registry-contracts';

@Controller()
export class AccountCreationRequestValidatedEventHandler {
  constructor(
    @Inject(PROCESS_MANAGER_TOKEN)
    private readonly onboardingProcessManager: OnboardingProcessManager,
  ) {}

  @EventPattern('account.creation_request_validated')
  async handle(@Payload('payload') eventPayload: AccountCreationRequestValidatedEventPayloadDto) {
    const accountCreationRequestValidatedEvent: ThirdPartyAccountCreationRequestValidatedIntegrationEvent =
      {
        requestContext: eventPayload.requestContext,
        occuredAt: eventPayload.occuredAt,
        eventType: eventPayload.eventType,
      };
    await this.onboardingProcessManager.onAccountCreationRequestValidated(
      accountCreationRequestValidatedEvent,
    );
  }
}

import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OnboardingProcessManager } from '@dornach/third-party-onboarding-manager-application';
import { PROCESS_MANAGER_TOKEN } from '../tokens/process-manager.token.js';
import { CompanyCreationRequestValidatedEventPayloadDto } from '../dtos/company-creation-request-validated-event-payload.dto.js';
import { CompanyCreationRequestValidatedIntegrationEvent } from '@dornach/company-registry-contracts';

@Controller()
export class CompanyCreationRequestValidatedEventHandler {
  constructor(
    @Inject(PROCESS_MANAGER_TOKEN)
    private readonly onboardingProcessManager: OnboardingProcessManager,
  ) {}

  @EventPattern('company.creation_request_validated')
  async handle(@Payload('payload') eventPayload: CompanyCreationRequestValidatedEventPayloadDto) {
    const companyCreationRequestValidatedEvent: CompanyCreationRequestValidatedIntegrationEvent = {
      requestContext: eventPayload.requestContext,
      occuredAt: eventPayload.occuredAt,
      eventType: eventPayload.eventType,
    };
    await this.onboardingProcessManager.onCompanyCreationRequestValidated(
      companyCreationRequestValidatedEvent,
    );
  }
}

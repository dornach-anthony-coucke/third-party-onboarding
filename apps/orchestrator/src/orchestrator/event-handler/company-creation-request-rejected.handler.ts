import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { OnboardingProcessManager } from '@dornach/third-party-onboarding-manager-application';
import { PROCESS_MANAGER_TOKEN } from '../tokens/process-manager.token.js';
import { CompanyCreationRequestRejectedEventPayloadDto } from '../dtos/company-creation-request-rejected-event-payload.dto.js';
import { CompanyCreationRequestRejectedIntegrationEvent } from '@dornach/company-registry-contracts';

@Controller()
export class CompanyCreationRequestRejectedEventHandler {
  constructor(
    @Inject(PROCESS_MANAGER_TOKEN)
    private readonly onboardingProcessManager: OnboardingProcessManager,
  ) {}

  @EventPattern('company.creation_request_rejected')
  async handle(@Payload('payload') eventPayload: CompanyCreationRequestRejectedEventPayloadDto) {
    const companyCreationRequestRejectedEvent: CompanyCreationRequestRejectedIntegrationEvent = {
      requestContext: eventPayload.requestContext,
      errors: eventPayload.errors,
      occuredAt: eventPayload.occuredAt,
      eventType: eventPayload.eventType,
    };
    await this.onboardingProcessManager.onCompanyCreationRequestRejected(
      companyCreationRequestRejectedEvent,
    );
  }
}

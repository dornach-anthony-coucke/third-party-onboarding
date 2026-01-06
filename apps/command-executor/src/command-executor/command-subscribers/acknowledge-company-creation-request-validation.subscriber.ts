import { AcknowledgeCompanyCreationRequestValidationCommand } from '@dornach/third-party-onboarding-manager-application';
import type { AcknowledgeCompanyCreationRequestValidationMessagePayloadDto } from '../dtos/acknowledge-company-creation-request-validation-message-payload.dto.js';
import { AcknowledgeCompanyCreationRequestValidationNestHandler } from '../command-handlers/acknowledge-company-creation-request-validation.handler.js';
import type {
  MessageEnvelope,
  MessageListener,
} from '@third-party-onboarding-manager/messaging-core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AcknowledgeCompanyCreationRequestValidationSubscriber implements MessageListener<AcknowledgeCompanyCreationRequestValidationMessagePayloadDto> {
  constructor(
    private readonly acknowledgeCompanyCreationRequestValidationHandler: AcknowledgeCompanyCreationRequestValidationNestHandler,
  ) {}

  readonly messageType = 'onboarding.acknowledge_company_creation_request_validation';

  async handle(
    message: MessageEnvelope<
      'COMMAND',
      AcknowledgeCompanyCreationRequestValidationMessagePayloadDto
    >,
  ) {
    const acknowledgeCompanyCreationRequestValidationCommand =
      new AcknowledgeCompanyCreationRequestValidationCommand(message.payload.onboardingRequestId);
    await this.acknowledgeCompanyCreationRequestValidationHandler.execute(
      acknowledgeCompanyCreationRequestValidationCommand,
    );
  }
}

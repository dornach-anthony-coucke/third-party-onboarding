import { AcknowledgeAccountCreationRequestValidationCommand } from '@dornach/third-party-onboarding-manager-application';
import type { AcknowledgeAccountCreationRequestValidationMessagePayloadDto } from '../dtos/acknowledge-account-creation-request-validation-message-payload.dto.js';
import { AcknowledgeAccountCreationRequestValidationNestHandler } from '../command-handlers/acknowledge-account-creation-request-validation.handler.js';
import type {
  MessageEnvelope,
  MessageListener,
} from '@third-party-onboarding-manager/messaging-core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AcknowledgeAccountCreationRequestValidationSubscriber implements MessageListener<AcknowledgeAccountCreationRequestValidationMessagePayloadDto> {
  constructor(
    private readonly acknowledgeAccountCreationRequestValidationHandler: AcknowledgeAccountCreationRequestValidationNestHandler,
  ) {}

  readonly messageType = 'onboarding.acknowledge_account_creation_request_validation';

  async handle(
    message: MessageEnvelope<
      'COMMAND',
      AcknowledgeAccountCreationRequestValidationMessagePayloadDto
    >,
  ) {
    const acknowledgeAccountCreationRequestValidationCommand =
      new AcknowledgeAccountCreationRequestValidationCommand(message.payload.onboardingRequestId);
    await this.acknowledgeAccountCreationRequestValidationHandler.execute(
      acknowledgeAccountCreationRequestValidationCommand,
    );
  }
}

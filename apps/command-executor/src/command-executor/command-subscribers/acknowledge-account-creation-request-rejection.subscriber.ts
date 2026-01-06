import { AcknowledgeAccountCreationRequestRejectionCommand } from '@dornach/third-party-onboarding-manager-application';
import type { AcknowledgeAccountCreationRequestRejectionMessagePayloadDto } from '../dtos/acknowledge-account-creation-request-rejection-message-payload.dto.js';
import { AcknowledgeAccountCreationRequestRejectionNestHandler } from '../command-handlers/acknowledge-account-creation-request-rejection.handler.js';
import type {
  MessageEnvelope,
  MessageListener,
} from '@third-party-onboarding-manager/messaging-core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AcknowledgeAccountCreationRequestRejectionSubscriber implements MessageListener<AcknowledgeAccountCreationRequestRejectionCommand> {
  constructor(
    private readonly acknowledgeAccountCreationRequestRejectionHandler: AcknowledgeAccountCreationRequestRejectionNestHandler,
  ) {}

  readonly messageType = 'onboarding.acknowledge_account_creation_request_rejection';

  async handle(
    message: MessageEnvelope<
      'COMMAND',
      AcknowledgeAccountCreationRequestRejectionMessagePayloadDto
    >,
  ) {
    const acknowledgeAccountCreationRequestRejectionCommand =
      new AcknowledgeAccountCreationRequestRejectionCommand(
        message.payload.onboardingRequestId,
        message.payload.errors,
      );
    await this.acknowledgeAccountCreationRequestRejectionHandler.execute(
      acknowledgeAccountCreationRequestRejectionCommand,
    );
  }
}

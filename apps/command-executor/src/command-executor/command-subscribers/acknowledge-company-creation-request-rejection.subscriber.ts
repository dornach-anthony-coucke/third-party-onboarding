import { AcknowledgeCompanyCreationRequestRejectionCommand } from '@dornach/third-party-onboarding-manager-application';
import type { AcknowledgeCompanyCreationRequestRejectionMessagePayloadDto } from '../dtos/acknowledge-company-creation-request-rejection-message-payload.dto.js';
import { AcknowledgeCompanyCreationRequestRejectionNestHandler } from '../command-handlers/acknowledge-company-creation-request-rejection.handler.js';
import type {
  MessageEnvelope,
  MessageListener,
} from '@third-party-onboarding-manager/messaging-core';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AcknowledgeCompanyCreationRequestRejectionSubscriber implements MessageListener<AcknowledgeCompanyCreationRequestRejectionMessagePayloadDto> {
  constructor(
    private readonly acknowledgeCompanyCreationRequestRejectionHandler: AcknowledgeCompanyCreationRequestRejectionNestHandler,
  ) {}

  readonly messageType = 'onboarding.acknowledge_company_creation_request_rejection';

  async handle(
    message: MessageEnvelope<
      'COMMAND',
      AcknowledgeCompanyCreationRequestRejectionMessagePayloadDto
    >,
  ) {
    const acknowledgeCompanyCreationRequestRejectionCommand =
      new AcknowledgeCompanyCreationRequestRejectionCommand(
        message.payload.onboardingRequestId,
        message.payload.errors,
      );
    await this.acknowledgeCompanyCreationRequestRejectionHandler.execute(
      acknowledgeCompanyCreationRequestRejectionCommand,
    );
  }
}

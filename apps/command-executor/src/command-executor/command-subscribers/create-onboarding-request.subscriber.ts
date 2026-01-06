import { CreateOnboardingRequestCommand } from '@dornach/third-party-onboarding-manager-application';
import type { CreateOnboardingRequestMessagePayloadDto } from '../dtos/create-onboarding-request-message-payload.dto.js';
import { CreateOnboardingRequestNestHandler } from '../command-handlers/create-onboarding-request.handler.js';
import type {
  MessageEnvelope,
  MessageListener,
} from '@third-party-onboarding-manager/messaging-core';
import { Inject, Injectable } from '@nestjs/common';
import { CREATE_ONBOARDING_REQUEST_HANDLER } from '../tokens/create-onboarding-request-handler.token.js';

@Injectable()
export class CreateOnboardingRequestSubscriber implements MessageListener<CreateOnboardingRequestMessagePayloadDto> {
  constructor(
    @Inject(CREATE_ONBOARDING_REQUEST_HANDLER)
    private readonly createOnboardingRequestHandler: CreateOnboardingRequestNestHandler,
  ) {}

  readonly messageType = 'onboarding.create-request';

  async handle(message: MessageEnvelope<'COMMAND', CreateOnboardingRequestMessagePayloadDto>) {
    const createOnboardingRequestCommand = new CreateOnboardingRequestCommand(
      message.payload.company,
      message.payload.account,
    );
    await this.createOnboardingRequestHandler.execute(createOnboardingRequestCommand);
  }
}

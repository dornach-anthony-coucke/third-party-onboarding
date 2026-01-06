import { Injectable } from '@nestjs/common';
import { OnboardingRepositoryAdapter } from '../repositories/onboarding-repository.adapter';
import {
  AcknowledgeAccountCreationRequestRejectionCommand,
  AcknowledgeAccountCreationRequestRejectionHandler,
} from '@dornach/third-party-onboarding-manager-application';

@Injectable()
export class AcknowledgeAccountCreationRequestRejectionNestHandler {
  private readonly handler: AcknowledgeAccountCreationRequestRejectionHandler;

  constructor(protected readonly onboardingManagerRepository: OnboardingRepositoryAdapter) {
    this.handler = new AcknowledgeAccountCreationRequestRejectionHandler(
      onboardingManagerRepository,
    );
  }

  async execute(command: AcknowledgeAccountCreationRequestRejectionCommand) {
    await this.handler.execute(command);
  }
}

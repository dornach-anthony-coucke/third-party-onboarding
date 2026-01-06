import { Injectable } from '@nestjs/common';
import { OnboardingRepositoryAdapter } from '../repositories/onboarding-repository.adapter';
import {
  AcknowledgeAccountCreationRequestValidationCommand,
  AcknowledgeAccountCreationRequestValidationHandler,
} from '@dornach/third-party-onboarding-manager-application';

@Injectable()
export class AcknowledgeAccountCreationRequestValidationNestHandler {
  private readonly handler: AcknowledgeAccountCreationRequestValidationHandler;

  constructor(protected readonly onboardingManagerRepository: OnboardingRepositoryAdapter) {
    this.handler = new AcknowledgeAccountCreationRequestValidationHandler(
      onboardingManagerRepository,
    );
  }

  async execute(command: AcknowledgeAccountCreationRequestValidationCommand) {
    await this.handler.execute(command);
  }
}

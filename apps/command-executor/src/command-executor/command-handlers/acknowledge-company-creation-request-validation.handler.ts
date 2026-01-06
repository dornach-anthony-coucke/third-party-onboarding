import { Injectable } from '@nestjs/common';
import { OnboardingRepositoryAdapter } from '../repositories/onboarding-repository.adapter';
import {
  AcknowledgeCompanyCreationRequestValidationCommand,
  AcknowledgeCompanyCreationRequestValidationHandler,
} from '@dornach/third-party-onboarding-manager-application';

@Injectable()
export class AcknowledgeCompanyCreationRequestValidationNestHandler {
  private readonly handler: AcknowledgeCompanyCreationRequestValidationHandler;

  constructor(protected readonly onboardingManagerRepository: OnboardingRepositoryAdapter) {
    this.handler = new AcknowledgeCompanyCreationRequestValidationHandler(
      onboardingManagerRepository,
    );
  }

  async execute(command: AcknowledgeCompanyCreationRequestValidationCommand) {
    await this.handler.execute(command);
  }
}

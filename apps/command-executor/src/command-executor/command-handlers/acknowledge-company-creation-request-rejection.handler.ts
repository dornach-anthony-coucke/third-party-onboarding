import { Injectable } from '@nestjs/common';
import { OnboardingRepositoryAdapter } from '../repositories/onboarding-repository.adapter';
import {
  AcknowledgeCompanyCreationRequestRejectionCommand,
  AcknowledgeCompanyCreationRequestRejectionHandler,
} from '@dornach/third-party-onboarding-manager-application';

@Injectable()
export class AcknowledgeCompanyCreationRequestRejectionNestHandler {
  private readonly handler: AcknowledgeCompanyCreationRequestRejectionHandler;

  constructor(protected readonly onboardingManagerRepository: OnboardingRepositoryAdapter) {
    this.handler = new AcknowledgeCompanyCreationRequestRejectionHandler(
      onboardingManagerRepository,
    );
  }

  async execute(command: AcknowledgeCompanyCreationRequestRejectionCommand) {
    await this.handler.execute(command);
  }
}

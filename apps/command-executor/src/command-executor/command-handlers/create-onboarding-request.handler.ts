import { Injectable } from '@nestjs/common';
import { OnboardingRepositoryAdapter } from '../repositories/onboarding-repository.adapter';
import {
  CreateOnboardingRequestCommand,
  CreateOnboardingRequestHandler,
} from '@dornach/third-party-onboarding-manager-application';

@Injectable()
export class CreateOnboardingRequestNestHandler {
  private readonly handler: CreateOnboardingRequestHandler;

  constructor(protected readonly onboardingManagerRepository: OnboardingRepositoryAdapter) {
    this.handler = new CreateOnboardingRequestHandler(onboardingManagerRepository);
  }

  async execute(command: CreateOnboardingRequestCommand) {
    await this.handler.execute(command);
  }
}

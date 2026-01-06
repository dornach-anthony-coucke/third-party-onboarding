import {
  CreateOnboardingRequestCommand,
  CreateOnboardingRequestHandler,
} from '@dornach/third-party-onboarding-manager-application';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OnboardingRepositoryAdapter } from '../repositories/command-outbox.repository.js';

@CommandHandler(CreateOnboardingRequestCommand)
export class CreateOnboardingRequestNestHandler implements ICommandHandler<CreateOnboardingRequestCommand> {
  private businessHandler: CreateOnboardingRequestHandler | null = null;
  constructor(protected readonly onboardingRepository: OnboardingRepositoryAdapter) {
    this.businessHandler = new CreateOnboardingRequestHandler(onboardingRepository);
  }

  async execute(command: CreateOnboardingRequestCommand): Promise<void> {
    if (this.businessHandler !== null) {
      await this.businessHandler.execute(command);
    }
  }
}

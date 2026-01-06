import { CommandBusPort } from '@dornach/shared-cqrs';
import { CommandOutboxRepository } from '../repositories/command-outbox.repository';
import { Injectable } from '@nestjs/common';
import { OnboardingManagerCommand } from '@dornach/third-party-onboarding-manager-application';

@Injectable()
export class OnboardingManagerCommandBusAdapter implements CommandBusPort<OnboardingManagerCommand> {
  public constructor(protected readonly commandOutboxRepository: CommandOutboxRepository) {}

  async execute(command: OnboardingManagerCommand): Promise<void> {
    await this.commandOutboxRepository.saveCommand(command);
  }
}

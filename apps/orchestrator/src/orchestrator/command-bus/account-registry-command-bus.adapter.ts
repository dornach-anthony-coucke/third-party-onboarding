import { CommandBusPort } from '@dornach/shared-cqrs';
import { CommandOutboxRepository } from '../repositories/command-outbox.repository';
import { Injectable } from '@nestjs/common';
import { ThirdPartyAccountRegistryPublicCommand } from '@dornach/third-party-account-registry-contracts';

@Injectable()
export class AccountRegistryCommandBusAdapter implements CommandBusPort<ThirdPartyAccountRegistryPublicCommand> {
  public constructor(protected readonly commandOutboxRepository: CommandOutboxRepository) {}

  async execute(command: ThirdPartyAccountRegistryPublicCommand): Promise<void> {
    await this.commandOutboxRepository.saveCommand(command);
  }
}

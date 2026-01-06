import { CommandBusPort } from '@dornach/shared-cqrs';
import type { CompanyRegistryPublicCommand } from '@dornach/company-registry-contracts';
import { CommandOutboxRepository } from '../repositories/command-outbox.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompanyRegistryCommandBusAdapter implements CommandBusPort<CompanyRegistryPublicCommand> {
  public constructor(protected readonly commandOutboxRepository: CommandOutboxRepository) {}

  async execute(command: CompanyRegistryPublicCommand): Promise<void> {
    await this.commandOutboxRepository.saveCommand(command);
  }
}

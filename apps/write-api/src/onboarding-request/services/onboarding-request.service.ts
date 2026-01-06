import { Inject, Injectable } from '@nestjs/common';
import { CreateOnboardingRequestCommand } from '@dornach/third-party-onboarding-manager-application';
import { CommandOutboxRepository } from '../repositories/command-outbox.repository.js';
import { MAPPER_REGISTRY_TOKEN } from '@third-party-onboarding-manager/mapper-registry-nest-module';
import { MapperRegistry } from '@couckedev/mapper-registry';

@Injectable()
export class OnboardingRequestService {
  constructor(
    private readonly commandOutboxRepository: CommandOutboxRepository,
    @Inject(MAPPER_REGISTRY_TOKEN) private readonly mapperRegistry: MapperRegistry,
  ) {}

  async createOnboardingRequest(command: CreateOnboardingRequestCommand): Promise<void> {
    await this.commandOutboxRepository.saveCommand(command);
  }
}

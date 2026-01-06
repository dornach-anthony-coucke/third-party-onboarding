import { Inject, Injectable } from '@nestjs/common';
import { types as databaseTypes } from '@third-party-onboarding-manager/drizzle-core';
import { schemas } from '@third-party-onboarding-manager/drizzle-core';
import { MapperRegistry } from '@couckedev/mapper-registry';
import { DATABASE_TOKEN } from '@third-party-onboarding-manager/database-nest-module';
import { MAPPER_REGISTRY_TOKEN } from '@third-party-onboarding-manager/mapper-registry-nest-module';
import { OnboardingManagerCommand } from '@dornach/third-party-onboarding-manager-application';

@Injectable()
export class CommandOutboxRepository {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly database: databaseTypes.DrizzleDB,
    @Inject(MAPPER_REGISTRY_TOKEN)
    private readonly mapperRegistry: MapperRegistry,
  ) {}

  async saveCommand(onboardingManagerCommand: OnboardingManagerCommand) {
    const outboxStorableCommand = this.mapperRegistry.maps<
      typeof onboardingManagerCommand,
      databaseTypes.OutboxStorableCommand
    >(onboardingManagerCommand.commandType, 'OutboxStorableCommand', onboardingManagerCommand);
    await this.database.insert(schemas.commandOutboxTable).values(outboxStorableCommand);
  }
}

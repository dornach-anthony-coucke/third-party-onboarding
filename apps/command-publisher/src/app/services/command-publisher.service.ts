import { Inject, Injectable } from '@nestjs/common';
import type { types as drizzleCoreTypes } from '@third-party-onboarding-manager/drizzle-core';
import {
  ONBOARDING_MANAGER_INTERNAL_COMMAND_PUBLISHER,
  COMPANY_REGISTRY_PUBLIC_COMMAND_PUBLISHER,
  ACCOUNT_REGISTRY_PUBLIC_COMMAND_PUBLISHER,
} from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessageEnvelope, MessagePublisher } from '@third-party-onboarding-manager/messaging-core';
import { randomUUID } from 'crypto';

@Injectable()
export class CommandPublisher {
  constructor(
    @Inject(ONBOARDING_MANAGER_INTERNAL_COMMAND_PUBLISHER)
    private readonly onboardingManagerInternalCommandClient: MessagePublisher,
    @Inject(COMPANY_REGISTRY_PUBLIC_COMMAND_PUBLISHER)
    private readonly companyRegistryPublicClient: MessagePublisher,
    @Inject(ACCOUNT_REGISTRY_PUBLIC_COMMAND_PUBLISHER)
    private readonly accountRegistryPublicCommandClient: MessagePublisher,
  ) {}

  private getClientForDestination(destinationBoundedContext: string): MessagePublisher {
    switch (destinationBoundedContext) {
      case 'third-party-onboarding-manager':
        return this.onboardingManagerInternalCommandClient;
      case 'company-registry':
        return this.companyRegistryPublicClient;
      case 'account-registry':
        return this.accountRegistryPublicCommandClient;
      default:
        throw new Error(`Unknown destinationBoundedContext: ${destinationBoundedContext}`);
    }
  }

  async publishCommand(command: drizzleCoreTypes.OutboxStoredCommand<unknown>): Promise<void> {
    const messagePublisher = this.getClientForDestination(command.destinationBoundedContext);
    const message: MessageEnvelope<'COMMAND', unknown> = {
      id: randomUUID(),
      type: command.type,
      destinationBoundedContext: command.destinationBoundedContext,
      payload: command.payload ?? {},
    };

    await messagePublisher.publish(message);
  }
}

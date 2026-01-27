import { Inject, Injectable } from '@nestjs/common';
import type { types as drizzleCoreTypes } from '@third-party-onboarding-manager/drizzle-core';
import { MessageEnvelope, PublisherRegistry } from '@third-party-onboarding-manager/messaging-core';
import { PUBLISHER_REGISTRY } from '@third-party-onboarding-manager/messaging-core-nest';
import { randomUUID } from 'crypto';

@Injectable()
export class CommandPublisher {
  constructor(
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
  ) {}

  async publishCommand(command: drizzleCoreTypes.OutboxStoredCommand<unknown>): Promise<void> {
    const messagePublisher = this.publisherRegistry.get(command.destinationBoundedContext);
    const message: MessageEnvelope<'COMMAND', unknown> = {
      id: randomUUID(),
      type: command.type,
      destinationBoundedContext: command.destinationBoundedContext,
      payload: command.payload ?? {},
    };

    await messagePublisher.publish(message);
  }
}

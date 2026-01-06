import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type { types as drizzleCoreTypes } from '@third-party-onboarding-manager/drizzle-core';

@Injectable()
export class EventPublisher {
  constructor(
    @Inject('ONBOARDING_MANAGER_PUBLIC_EVENT_CLIENT')
    private readonly onboardingManagerEventClient: ClientProxy,
  ) {}

  private getClientForDestination(destinationBoundedContext: string): ClientProxy {
    switch (destinationBoundedContext) {
      case 'third-party-onboarding-manager':
        return this.onboardingManagerEventClient;
      default:
        throw new Error(`Unknown destinationBoundedContext: ${destinationBoundedContext}`);
    }
  }

  async publishEvent(event: drizzleCoreTypes.OutboxStoredEvent<unknown>): Promise<void> {
    const routingKey = event.routingKey;
    const payload = {
      type: event.type,
      payload: event.payload ?? {},
    };

    await lastValueFrom(this.onboardingManagerEventClient.emit(routingKey, payload));
  }
}

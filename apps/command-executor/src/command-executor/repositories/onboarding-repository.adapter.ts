import {
  OnboardingEvent,
  OnboardingRepositoryPort,
  OnboardingRequestAggregate,
} from '@dornach/third-party-onboarding-manager-domain';
import { Inject, Injectable } from '@nestjs/common';
import { types as drizzleCoreTypes } from '@third-party-onboarding-manager/drizzle-core';
import { schemas } from '@third-party-onboarding-manager/drizzle-core';
import { MapperRegistry } from '@couckedev/mapper-registry';
import { eq, sql } from 'drizzle-orm';
import { DATABASE_TOKEN } from '@third-party-onboarding-manager/database-nest-module';
import { MAPPER_REGISTRY_TOKEN } from '@third-party-onboarding-manager/mapper-registry-nest-module';

@Injectable()
export class OnboardingRepositoryAdapter implements OnboardingRepositoryPort {
  constructor(
    @Inject(DATABASE_TOKEN) private readonly database: drizzleCoreTypes.DrizzleDB,
    @Inject(MAPPER_REGISTRY_TOKEN)
    private readonly eventMapperRegistry: MapperRegistry,
  ) {}

  async getNextRequestId(): Promise<string> {
    const res = await this.database.execute<{ value: string }>(
      sql`select nextval(${schemas.onboardingRequestIdSequence.seqName})::text as value`,
    );

    const id = res.rows[0]?.value;
    if (!id) {
      throw new Error('Failed to generate onboarding request id from sequence');
    }
    return id;
  }

  async loadOnboardingRequestOrFail(
    onboardingRequestId: string,
  ): Promise<OnboardingRequestAggregate> {
    const eventstoreStoredEvents = await this.database
      .select()
      .from(schemas.eventstoreTable)
      .where(eq(schemas.eventstoreTable.aggregateId, BigInt(onboardingRequestId)));

    const domainEvents: OnboardingEvent[] = eventstoreStoredEvents.map(
      (eventstoreStoredEvent: drizzleCoreTypes.EventstoreStoredEvent) =>
        this.eventMapperRegistry.maps<drizzleCoreTypes.EventstoreStoredEvent, OnboardingEvent>(
          'EventstoreStoredEvent',
          eventstoreStoredEvent.type,
          eventstoreStoredEvent,
        ),
    );

    return OnboardingRequestAggregate.rehydrate(onboardingRequestId, domainEvents);
  }

  async saveOnboardingRequest(
    onboardingRequestAggregate: OnboardingRequestAggregate,
  ): Promise<void> {
    const domainEvents = onboardingRequestAggregate.getUncommittedEvents();

    if (!domainEvents.length) {
      return;
    }

    const eventstoreStorableEvents: drizzleCoreTypes.EventstoreStorableEvent[] = domainEvents.map(
      (domainEvent: OnboardingEvent) =>
        this.eventMapperRegistry.maps<typeof domainEvent, drizzleCoreTypes.EventstoreStorableEvent>(
          domainEvent.eventType,
          'EventstoreStorableEvent',
          domainEvent,
        ),
    );

    const outboxStorableEvents: drizzleCoreTypes.OutboxStorableEvent[] = domainEvents.map(
      (domainEvent: OnboardingEvent) =>
        this.eventMapperRegistry.maps<typeof domainEvent, drizzleCoreTypes.OutboxStorableEvent>(
          domainEvent.eventType,
          'OutboxStorableEvent',
          domainEvent,
        ),
    );

    await this.database.transaction(async (tx) => {
      await tx.insert(schemas.eventstoreTable).values(eventstoreStorableEvents);
      await tx.insert(schemas.outboxEventsTable).values(outboxStorableEvents);
    });
  }
}

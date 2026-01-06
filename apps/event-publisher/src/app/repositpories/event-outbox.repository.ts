import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from '@third-party-onboarding-manager/database-nest-module';
import { types as drizzleCoreTypes } from '@third-party-onboarding-manager/drizzle-core';
import { schemas } from '@third-party-onboarding-manager/drizzle-core';
import { inArray, isNull } from 'drizzle-orm';

@Injectable()
export class EventOutboxRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly database: drizzleCoreTypes.DrizzleDB) {}

  async findUnprocessed(limit = 100): Promise<drizzleCoreTypes.OutboxStoredEvent<unknown>[]> {
    const outboxStoredEvents: drizzleCoreTypes.OutboxStoredEvent<unknown>[] = await this.database
      .select()
      .from(schemas.outboxEventsTable)
      .where(isNull(schemas.outboxEventsTable.processedAt))
      .orderBy(schemas.outboxEventsTable.occurredAt)
      .limit(limit)
      .execute();

    return outboxStoredEvents;
  }

  async markAsProcessed(ids: number[]): Promise<void> {
    if (!ids.length) return;

    await this.database
      .update(schemas.outboxEventsTable)
      .set({ processedAt: new Date() })
      .where(
        inArray(
          schemas.outboxEventsTable.id,
          ids.map((id) => Number(id)),
        ),
      )
      .execute();
  }
}

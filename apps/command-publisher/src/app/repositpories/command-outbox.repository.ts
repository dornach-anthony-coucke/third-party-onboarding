import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_TOKEN } from '@third-party-onboarding-manager/database-nest-module';
import { types as drizzleCoreTypes } from '@third-party-onboarding-manager/drizzle-core';
import { schemas } from '@third-party-onboarding-manager/drizzle-core';
import { inArray, isNull } from 'drizzle-orm';

@Injectable()
export class CommandOutboxRepository {
  constructor(@Inject(DATABASE_TOKEN) private readonly database: drizzleCoreTypes.DrizzleDB) {}

  async findUnprocessed(limit = 100): Promise<drizzleCoreTypes.OutboxStoredCommand<unknown>[]> {
    const outboxStoredCommands: drizzleCoreTypes.OutboxStoredCommand<unknown>[] =
      await this.database
        .select()
        .from(schemas.commandOutboxTable)
        .where(isNull(schemas.commandOutboxTable.processedAt))
        .orderBy(schemas.commandOutboxTable.createdAt)
        .limit(limit)
        .execute();

    return outboxStoredCommands;
  }

  async markAsProcessed(ids: number[]): Promise<void> {
    if (!ids.length) return;

    await this.database
      .update(schemas.commandOutboxTable)
      .set({ processedAt: new Date() })
      .where(
        inArray(
          schemas.commandOutboxTable.id,
          ids.map((id) => Number(id)),
        ),
      )
      .execute();
  }
}

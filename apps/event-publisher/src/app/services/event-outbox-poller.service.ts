import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventOutboxRepository } from '../repositpories/event-outbox.repository';
import { EventPublisher } from './event-publisher.service';

@Injectable()
export class EventOutboxPoller implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly outboxRepository: EventOutboxRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  private readonly logger = new Logger(EventOutboxPoller.name);

  private isRunning = false;
  private stopRequested = false;

  private readonly intervalMs = Number(process.env.EVENT_OUTBOX_POLL_INTERVAL_MS ?? 8000);

  async onModuleInit() {
    this.logger.log('Starting event outbox poller');
    await this.startLoop();
  }

  onModuleDestroy() {
    this.logger.log('Stopping event outbox poller');
    this.stopRequested = true;
  }

  private async startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;

    while (!this.stopRequested) {
      try {
        await this.pollOnce();
      } catch (error) {
        this.logger.error('Error during event outbox polling', error as Error);
      }

      await new Promise((resolve) => setTimeout(resolve, this.intervalMs));
    }

    this.isRunning = false;
  }

  private async pollOnce() {
    const outboxRecords = await this.outboxRepository.findUnprocessed(100);
    if (!outboxRecords.length) {
      return;
    }

    this.logger.log(`Found ${outboxRecords.length} unprocessed event outbox records`);

    const processedIds: number[] = [];

    for (const cmd of outboxRecords) {
      await this.eventPublisher.publishEvent(cmd);
      processedIds.push(cmd.id as number);
    }

    await this.outboxRepository.markAsProcessed(processedIds);
    this.logger.log(`Marked ${processedIds.length} event outbox records as processed`);
  }
}

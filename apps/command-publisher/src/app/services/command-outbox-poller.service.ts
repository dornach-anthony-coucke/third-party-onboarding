import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { CommandOutboxRepository } from '../repositpories/command-outbox.repository';
import { CommandPublisher } from './command-publisher.service';

@Injectable()
export class CommandOutboxPoller implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly outboxRepository: CommandOutboxRepository,
    private readonly commandPublisher: CommandPublisher,
  ) {}

  private readonly logger = new Logger(CommandOutboxPoller.name);

  private isRunning = false;
  private stopRequested = false;

  private readonly intervalMs = Number(process.env.COMMAND_OUTBOX_POLL_INTERVAL_MS ?? 8000);

  async onModuleInit() {
    this.logger.log('Starting command outbox poller');
    await this.startLoop();
  }

  onModuleDestroy() {
    this.logger.log('Stopping command outbox poller');
    this.stopRequested = true;
  }

  private async startLoop() {
    if (this.isRunning) return;
    this.isRunning = true;

    while (!this.stopRequested) {
      try {
        await this.pollOnce();
      } catch (error) {
        this.logger.error('Error during command outbox polling', error as Error);
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

    this.logger.log(`Found ${outboxRecords.length} unprocessed command outbox records`);

    const processedIds: number[] = [];

    for (const cmd of outboxRecords) {
      await this.commandPublisher.publishCommand(cmd);
      processedIds.push(cmd.id);
    }

    await this.outboxRepository.markAsProcessed(processedIds);
    this.logger.log(`Marked ${processedIds.length} command outbox records as processed`);
  }
}

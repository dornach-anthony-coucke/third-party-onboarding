import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { AbstractQueueConsumer } from '@third-party-onboarding-manager/messaging-core';

@Injectable()
export class ConsumerRunner implements OnModuleInit, OnModuleDestroy {
  private running = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly consumer: AbstractQueueConsumer,
    private readonly pollIntervalInMs = 1000,
  ) {}

  async onModuleInit() {
    await this.schedule();
  }

  private async schedule() {
    if (!this.running) return;

    await this.consumer.poll();

    if (!this.running) return;

    this.timer = setTimeout(() => void this.schedule(), this.pollIntervalInMs);
  }

  onModuleDestroy() {
    this.running = false;
    if (this.timer === null) return;
    clearTimeout(this.timer);
  }
}

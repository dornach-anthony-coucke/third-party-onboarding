# @third-party-onboarding-manager/messaging-aws-nest

NestJS module for AWS messaging (SQS/SNS clients, configuration, and publisher registration).

## Purpose

This module provides **everything you need for AWS messaging**:

✅ Provides AWS SQS and SNS clients (`forRoot`)
✅ Provides AWS configuration (region, account, endpoint)
✅ Registers AWS publishers into PublisherRegistry (`forFeature`)
✅ Used by both consumer and publisher apps

## Architecture Philosophy

This module is **AWS-specific and assumes it**. Each messaging transport (AWS, RabbitMQ, Kafka, NATS) has its own self-contained module with:
- Infrastructure (clients, config)
- Publisher registration logic
- Transport-specific implementation

**Principle**: Convention over code sharing. Each transport follows the same pattern but with its own implementation.

## Clean Separation

```
messaging-aws-nest     → AWS infrastructure + AWS publishers
messaging-rabbitmq-nest (future) → RabbitMQ infrastructure + RabbitMQ publishers
messaging-kafka-nest (future)    → Kafka infrastructure + Kafka publishers
messaging-core-nest       → Core abstractions (PublisherRegistry, MessageRouter)
```

## Usage

### For Apps That Only Consume Messages

Consumer apps (like command-executor, orchestrator) only need AWS clients:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(), // ✅ Only AWS clients - NO publishers
  ],
  providers: [MyConsumer], // Uses AWS_SQS_CLIENT_PROVIDER
})
export class ConsumerAppModule {}
```

### For Apps That Publish Messages

Publisher apps import the separate `messaging-publishers-nest` module:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessagingPublishersModule } from '@third-party-onboarding-manager/messaging-publishers-nest';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MessagingCoreModule.forRoot(), // Provides PublisherRegistry
    MessagingAwsNestModule.forRoot(), // Provides AWS clients
    MessagingPublishersModule.forFeature([ // Registers publishers
      {
        key: 'company-registry',
        queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        type: 'sqs',
      },
    ]),
  ],
})
export class PublisherAppModule {}
```

## API

### `MessagingAwsNestModule.forRoot()`

Provides AWS infrastructure globally.

**Provides:**
- `AWS_SQS_CLIENT_PROVIDER` - SQS client for queues
- `AWS_SNS_CLIENT_PROVIDER` - SNS client for topics  
- `AWS_TRANSPORT_CONFIG` - AWS configuration (region, account, endpoint)

**Does NOT provide:**
- Publishers (use `MessagingPublishersModule.forFeature()` instead)

## Using AWS Clients

### In a Consumer

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { AWS_SQS_CLIENT_PROVIDER } from '@third-party-onboarding-manager/messaging-aws-nest';
import type { QueueClient } from '@third-party-onboarding-manager/messaging-core';

@Injectable()
export class MyConsumer {
  constructor(
    @Inject(AWS_SQS_CLIENT_PROVIDER)
    private readonly queueClient: QueueClient,
  ) {}

  async consume() {
    const messages = await this.queueClient.receiveMessages('my-queue-url', 10);
    // Process messages...
  }
}
```

### In a Publisher

Use `PublisherRegistry` instead of direct AWS clients:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { PUBLISHER_REGISTRY } from '@third-party-onboarding-manager/messaging-core-nest';
import type { PublisherRegistry } from '@third-party-onboarding-manager/messaging-core';

@Injectable()
export class MyPublisher {
  constructor(
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
  ) {}

  async publish(data: any) {
    const publisher = this.publisherRegistry.get('company-registry');
    await publisher.publish({
      id: randomUUID(),
      type: 'company.create',
      destinationBoundedContext: 'company-registry',
      payload: data,
    });
  }
}
```

## Environment Variables

Required AWS configuration:

- `AWS_REGION` - AWS region (e.g., 'us-east-1')
- `AWS_ACCOUNT_ID` - AWS account ID
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `AWS_ENDPOINT_URL` (optional) - Custom endpoint for LocalStack

## Benefits

✅ **Clean Separation** - Infrastructure separate from publisher registration
✅ **Minimal Imports** - Consumer apps don't get publisher code
✅ **Explicit** - Clear which module provides what
✅ **Interchangeable** - Easy to swap AWS for NATS/Kafka by changing this module
✅ **Modular** - Each concern in its own module

## Migration from Old API

### Old (God Module)

```typescript
@Module({
  imports: [
    MessagingAwsNestModule, // ⚠️ Registered ALL publishers
  ],
})
export class AppModule {}
```

### New (Separated)

**Consumer-only app:**
```typescript
@Module({
  imports: [
    MessagingAwsNestModule.forRoot(), // ✅ Only infrastructure
  ],
})
export class AppModule {}
```

**Publisher app:**
```typescript
@Module({
  imports: [
    MessagingAwsNestModule.forRoot(), // Infrastructure
    MessagingPublishersModule.forFeature([...]), // Publishers
  ],
})
export class AppModule {}
```

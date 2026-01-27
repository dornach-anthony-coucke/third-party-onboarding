# @third-party-onboarding-manager/messaging-publishers-nest

NestJS module for registering message publishers into the `PublisherRegistry`.

## Purpose

This module is **separate from messaging infrastructure** to maintain clean separation of concerns:

✅ Apps that **only consume** messages don't need this module
✅ Apps that **publish** messages use `forFeature()` to register publishers
✅ Keeps the door open for **swapping transport implementations** (AWS → NATS, Kafka, RabbitMQ, etc.)
✅ **Transport-agnostic configuration** - supports different messaging paradigms

## Transport-Agnostic Configuration

The configuration is intentionally generic to support different messaging paradigms:

| Transport | Destination | Metadata | Paradigm |
|-----------|-------------|----------|-----------|
| **AWS SQS** | Queue name | `{ transportType: 'sqs' }` | Point-to-point direct |
| **AWS SNS** | Topic name | `{ transportType: 'sns' }` | Pub/sub via topic |
| **RabbitMQ** | Exchange name | `{ routingKey, exchangeType }` | Exchange routing |
| **Kafka** | Topic name | `{ partitionKey, compressionType }` | Topic + partitions |
| **NATS** | Subject | `{ streamName, durable }` | Subject-based |

## Installation

This is a workspace package. Add it to your app's dependencies:

```json
{
  "dependencies": {
    "@third-party-onboarding-manager/messaging-publishers-nest": "workspace:*"
  }
}
```

## Usage

### For Apps That Publish Messages (AWS)

```typescript
import { Module } from '@nestjs/common';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest-module';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessagingPublishersModule } from '@third-party-onboarding-manager/messaging-publishers-nest';

@Module({
  imports: [
    MessagingCoreModule.forRoot(), // Provides PublisherRegistry
    MessagingAwsNestModule.forRoot(), // Provides AWS clients
    MessagingPublishersModule.forFeature([
      {
        key: 'company-registry',
        destination: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        metadata: { transportType: 'sqs' },
      },
      {
        key: 'notifications',
        destination: 'NOTIFICATIONS_TOPIC',
        metadata: { transportType: 'sns' },
      },
    ]),
  ],
})
export class AppModule {}
```

### For Apps That Publish Messages (RabbitMQ - Future)

```typescript
import { MessagingRabbitMQNestModule } from '@third-party-onboarding-manager/messaging-rabbitmq-nest';
import { MessagingPublishersModule } from '@third-party-onboarding-manager/messaging-publishers-nest';

@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingRabbitMQNestModule.forRoot(), // ← Different infrastructure
    MessagingPublishersModule.forFeature([
      {
        key: 'company-registry',
        destination: 'COMPANY_REGISTRY_EXCHANGE',
        metadata: {
          routingKey: 'company.commands.create',
          exchangeType: 'topic'
        },
      },
    ]),
  ],
})
export class AppModule {}
```

### For Apps That Only Consume Messages

```typescript
import { Module } from '@nestjs/common';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest-module';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';

@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(), // Only provides AWS clients for consumers
    // NO MessagingPublishersModule - this app doesn't publish!
  ],
  providers: [MyConsumer],
})
export class ConsumerAppModule {}
```

## API

### `MessagingPublishersModule.forFeature(publishers)`

Registers publishers into the `PublisherRegistry`.

**Parameters:**
- `publishers: PublisherConfig[]` - Array of publisher configurations

**PublisherConfig:**
```typescript
interface PublisherConfig {
  key: string;        // Registry key (e.g., 'company-registry')
  destination: string;  // Environment variable name
  metadata?: Record<string, unknown>; // Transport-specific metadata
}
```

**AWS-specific type-safe config:**
```typescript
interface AwsPublisherConfig extends PublisherConfig {
  metadata: {
    transportType: 'sqs' | 'sns';
  };
}
```

**RabbitMQ-specific type-safe config (future):**
```typescript
interface RabbitMQPublisherConfig extends PublisherConfig {
  metadata: {
    routingKey: string;
    exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  };
}
```

**Examples:**

```typescript
// AWS SQS
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    destination: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
    metadata: { transportType: 'sqs' }
  }
])

// AWS SNS
MessagingPublishersModule.forFeature([
  {
    key: 'notifications',
    destination: 'NOTIFICATIONS_TOPIC',
    metadata: { transportType: 'sns' }
  }
])

// RabbitMQ (future)
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    destination: 'COMPANY_REGISTRY_EXCHANGE',
    metadata: {
      routingKey: 'company.commands.create',
      exchangeType: 'topic'
    }
  }
])
```

## Benefits

✅ **Clean Separation** - Publishing logic separate from infrastructure
✅ **Optional** - Consumer-only apps don't import it
✅ **Explicit** - Clear which publishers each module registers
✅ **Interchangeable** - Easy to swap AWS for NATS/Kafka later
✅ **Modular** - Register publishers only where needed

## Future-Proofing

When switching from AWS to another transport (e.g., NATS):

1. Keep `MessagingPublishersModule` API the same
2. Create `MessagingNatsNestModule.forRoot()` for NATS clients
3. Update `createPublisherProvider()` to create NATS publishers
4. Apps only change infrastructure import, not publisher registration

```typescript
// Switch from AWS to NATS - minimal changes:
@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingNatsNestModule.forRoot(), // ← Only this line changes
    MessagingPublishersModule.forFeature([...]), // ← Same!
  ],
})
export class AppModule {}
```

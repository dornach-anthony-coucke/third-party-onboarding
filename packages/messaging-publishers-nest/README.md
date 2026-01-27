# @third-party-onboarding-manager/messaging-publishers-nest

NestJS module for registering message publishers into the `PublisherRegistry`.

## Purpose

This module is **separate from messaging infrastructure** to maintain clean separation of concerns:

✅ Apps that **only consume** messages don't need this module
✅ Apps that **publish** messages use `forFeature()` to register publishers
✅ Keeps the door open for **swapping transport implementations** (AWS → NATS, Kafka, etc.)

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

### For Apps That Publish Messages

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
        queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        type: 'sqs',
      },
      {
        key: 'notifications',
        queueName: 'NOTIFICATIONS_TOPIC',
        type: 'sns',
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
  queueName: string;  // Environment variable name (e.g., 'COMPANY_QUEUE')
  type: 'sqs' | 'sns'; // Publisher type
}
```

**Example:**
```typescript
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
    type: 'sqs'
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

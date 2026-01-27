# @third-party-onboarding-manager/messaging-aws-nest

Reusable NestJS messaging module based on @third-party-onboarding-manager/messaging-aws and AWS SQS/SNS.

## Features

- Global AWS messaging infrastructure (SQS/SNS clients)
- Decoupled publisher registration via `forFeature()`
- Integration with `PublisherRegistry` for interchangeable publishers
- Support for both SQS queues and SNS topics
- Type-safe configuration

## New Decoupled API (Recommended)

### Basic Setup

1. **Import core infrastructure in your root module:**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest-module';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MessagingCoreModule.forRoot(), // Provides PublisherRegistry
    MessagingAwsNestModule.forRoot(), // Provides AWS clients globally
  ],
})
export class AppModule {}
```

2. **Register publishers in feature modules where needed:**

```typescript
import { Module } from '@nestjs/common';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';

@Module({
  imports: [
    MessagingAwsNestModule.forFeature([
      {
        key: 'company-registry', // Registry key to lookup the publisher
        queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE', // Environment variable name
        type: 'sqs', // 'sqs' or 'sns'
      },
    ]),
  ],
  providers: [MyService],
})
export class MyFeatureModule {}
```

### Using Publishers

Publishers are accessed via the `PublisherRegistry`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { PUBLISHER_REGISTRY } from '@third-party-onboarding-manager/messaging-core-nest-module';
import { PublisherRegistry } from '@third-party-onboarding-manager/messaging-core';
import { randomUUID } from 'crypto';

@Injectable()
export class MyService {
  constructor(
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
  ) {}

  async sendCommand(payload: any) {
    const publisher = this.publisherRegistry.get('company-registry');
    await publisher.publish({
      id: randomUUID(),
      type: 'company.create',
      destinationBoundedContext: 'company-registry',
      payload,
    });
  }
}
```

### Multiple Publishers Example

```typescript
@Module({
  imports: [
    MessagingAwsNestModule.forFeature([
      {
        key: 'company-registry',
        queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        type: 'sqs',
      },
      {
        key: 'account-registry',
        queueName: 'ACCOUNT_REGISTRY_PUBLIC_COMMANDS_QUEUE',
        type: 'sqs',
      },
      {
        key: 'notifications',
        queueName: 'NOTIFICATIONS_TOPIC_NAME',
        type: 'sns',
      },
    ]),
  ],
})
export class MyFeatureModule {}
```

## Legacy API (Deprecated)

The static module import still works but registers ALL publishers globally:

```typescript
@Module({
  imports: [
    MessagingAwsNestModule, // ⚠️ Deprecated: Registers all publishers
  ],
})
export class AppModule {}
```

**Migration:** Replace with `forRoot()` + `forFeature()` for better decoupling.

## Benefits of the New API

✅ **Decoupled** - Register publishers only where needed
✅ **Flexible** - Different modules can register different publishers
✅ **Explicit** - Clear which publishers each module uses
✅ **Maintainable** - No need to modify shared module when adding publishers
✅ **Testable** - Easier to mock publishers at module level

## Environment Variables

Required environment variables (provided by AWS infrastructure):

- `AWS_REGION` - AWS region
- `AWS_ACCOUNT_ID` - AWS account ID
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

Queue/topic names (per publisher):
- Environment variable name specified in `queueName` field of `PublisherConfig`

Example:
- `COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE=company-public-commands`
- `NOTIFICATIONS_TOPIC_NAME=notifications-topic`

# Migration Guide: Decoupled Publisher Registration

## Overview

The `MessagingAwsNestModule` now supports decoupled publisher registration through a new dynamic module API. This allows you to:

1. **Register publishers only where you need them** - No need to import all publishers globally
2. **Keep infrastructure separate from business logic** - AWS clients are provided globally via `forRoot()`, publishers are registered locally via `forFeature()`
3. **Maintain interchangeability** - Publishers are still accessed via the `PublisherRegistry`, making it easy to swap implementations

## New API

### `MessagingAwsNestModule.forRoot()`

Provides AWS infrastructure (SQS/SNS clients, configuration) without registering any publishers. Use this in your root `AppModule`.

```typescript
@Module({
  imports: [
    MessagingCoreModule.forRoot(), // Provides PublisherRegistry
    MessagingAwsNestModule.forRoot(), // Provides AWS clients
  ],
})
export class AppModule {}
```

### `MessagingAwsNestModule.forFeature(publishers)`

Registers specific publishers into the `PublisherRegistry`. Use this in feature modules to register only the publishers you need.

```typescript
@Module({
  imports: [
    MessagingAwsNestModule.forFeature([
      {
        key: 'company-registry',
        queueName: 'COMPANY_REGISTRY_PUBLIC_COMMANDS_QUEUE', // Environment variable name
        type: 'sqs'
      },
      {
        key: 'notifications',
        queueName: 'NOTIFICATIONS_TOPIC', // Environment variable name
        type: 'sns'
      }
    ])
  ],
})
export class MyFeatureModule {}
```

## Migration Examples

### Before (Tightly Coupled)

Every app had to import the entire `MessagingAwsNestModule` which registered ALL publishers:

```typescript
// apps/command-publisher/src/app/app.module.ts
@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule, // ⚠️ Registers ALL publishers (onboarding, company, account)
  ],
})
export class AppModule {}
```

**Problems:**
- App gets publishers it doesn't need
- Can't control which publishers are available
- Tightly coupled to specific bounded contexts

### After (Decoupled)

Apps register only the publishers they need:

```typescript
// apps/command-publisher/src/app/app.module.ts
@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(), // ✅ Only provides AWS infrastructure
    MessagingAwsNestModule.forFeature([ // ✅ Registers only needed publishers
      {
        key: 'third-party-onboarding-manager',
        queueName: 'ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE',
        type: 'sqs',
      },
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
    ]),
  ],
})
export class AppModule {}
```

**Benefits:**
- Explicit about which publishers are used
- Easy to add/remove publishers
- Each feature module can register its own publishers independently

### Example: Feature Module with Single Publisher

A feature module that only needs one publisher:

```typescript
// apps/my-app/src/notification/notification.module.ts
@Module({
  imports: [
    MessagingAwsNestModule.forFeature([
      {
        key: 'notification-service',
        queueName: 'NOTIFICATION_QUEUE',
        type: 'sqs'
      }
    ])
  ],
  providers: [NotificationService],
})
export class NotificationModule {}

// apps/my-app/src/notification/notification.service.ts
@Injectable()
export class NotificationService {
  constructor(
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
  ) {}

  async sendNotification(data: any) {
    const publisher = this.publisherRegistry.get('notification-service');
    await publisher.publish({
      id: randomUUID(),
      type: 'notification.send',
      destinationBoundedContext: 'notification-service',
      payload: data,
    });
  }
}
```

## Backward Compatibility

The static module import still works for backward compatibility but is **deprecated**:

```typescript
@Module({
  imports: [
    MessagingAwsNestModule, // ⚠️ DEPRECATED: Still works but registers all publishers globally
  ],
})
export class AppModule {}
```

**Migration Path:**
1. Replace `MessagingAwsNestModule` with `MessagingAwsNestModule.forRoot()`
2. Add `MessagingAwsNestModule.forFeature([...])` with the publishers you actually use
3. Test that everything still works

## Benefits Summary

✅ **Decoupled** - Publishers are registered where they're needed, not globally
✅ **Flexible** - Easy to add/remove publishers per feature module
✅ **Explicit** - Clear which publishers each module uses
✅ **Maintainable** - No need to modify shared module when adding new publishers
✅ **Testable** - Can mock publishers at the feature module level
✅ **Interchangeable** - Still uses `PublisherRegistry` for abstraction

# Migration Guide: Decoupled Publisher Registration

## Overview

The `MessagingAwsNestModule` now supports decoupled publisher registration through a new dynamic module API. This allows you to:

1. **Register publishers only where you need them** - No need to import all publishers globally
2. **Keep infrastructure separate from business logic** - AWS clients are provided globally via `forRoot()`, publishers are registered locally via `forFeature()`
3. **Maintain interchangeability** - Publishers are still accessed via the `PublisherRegistry`, making it easy to swap implementations

## Problem Statement

**Original French:**
> Mon problème ici, c'est que j'ai un couplage fort entre les publishers et mon module nest messaging-aws-nest
> 
> Moi j'aurais aimé pouvoir enregistrer mes publishers là où j'en ai besoin, sans avoir à reinjecter à chaque app toutes les queues et tous les topics
> 
> Je veux avoir quelque chose d'interchangeable (on tend vers ça), mais aussi quelque chose de découpler et où on peut enregistrer les choses là où on en a besoin

**Translation:**
> My problem here is that I have a strong coupling between publishers and my messaging-aws-nest module
> 
> I would like to be able to register my publishers where I need them, without having to reinject all the queues and all the topics in each app
> 
> I want to have something interchangeable (we're moving towards that), but also something decoupled where we can register things where we need them

## Solution

The new `forRoot()` / `forFeature()` API pattern solves this by:

1. **Decoupling infrastructure from registration** - `forRoot()` provides AWS clients globally, `forFeature()` registers publishers locally
2. **On-demand registration** - Each module explicitly declares which publishers it needs
3. **No global pollution** - Apps only get the publishers they register, not all of them
4. **Maintained abstraction** - Publishers are still accessed via `PublisherRegistry` for interchangeability

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
- Must modify the shared module to add new publishers

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
- ✅ Explicit about which publishers are used
- ✅ Easy to add/remove publishers without touching shared module
- ✅ Each feature module can register its own publishers independently
- ✅ Decoupled - no tight coupling to specific bounded contexts

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

### Example: Consumer-Only App (No Publishers Needed)

An app that only consumes messages doesn't need to register any publishers:

```typescript
// apps/command-executor/src/command-executor/command-executor.module.ts
@Module({
  imports: [
    MessagingAwsNestModule.forRoot(), // ✅ Only provides AWS clients for consumers
    MessagingCoreModule.forRoot(),
    // No forFeature() needed - this app only consumes, doesn't publish!
  ],
  providers: [
    OnboardingManagerInternalCommandConsumer, // Uses AWS_SQS_CLIENT_PROVIDER
    // ... other providers
  ],
})
export class CommandExecutorModule {}
```

**Benefit:** Apps that only consume messages don't get publishers they don't need!

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
4. Remove any unused environment variables if you no longer register certain publishers

## Benefits Summary

✅ **Decoupled** - Publishers are registered where they're needed, not globally
✅ **Flexible** - Easy to add/remove publishers per feature module
✅ **Explicit** - Clear which publishers each module uses
✅ **Maintainable** - No need to modify shared module when adding new publishers
✅ **Testable** - Can mock publishers at the feature module level
✅ **Interchangeable** - Still uses `PublisherRegistry` for abstraction
✅ **No Global Pollution** - Apps only get what they register
✅ **Separation of Concerns** - Infrastructure (AWS clients) separate from business logic (publishers)

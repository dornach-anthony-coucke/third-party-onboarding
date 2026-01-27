# Exemple: Migration de l'Orchestrator

## État actuel

L'orchestrator utilise:
- RabbitMQ pour consommer des events (via NestJS ClientsModule)
- Pattern Outbox pour publier des commandes (via CommandOutboxRepository)

```typescript
// apps/orchestrator/src/orchestrator/orchestrator.module.ts
@Module({
  imports: [
    MapperRegistryModule.forFeature(orchestratorCommandMappers)
  ],
  providers: [
    CommandOutboxRepository, // Écrit dans command_outbox
    // ... command bus adapters
  ],
  controllers: [
    OnboardingRequestedEventHandler, // Consomme via RabbitMQ
    // ... other event handlers
  ],
})
export class OrchestratorModule {}
```

## Scénario 1: Orchestrator écoute 3 queues SQS (sans publier)

Si demain vous voulez que l'orchestrator écoute 3 queues SQS au lieu de RabbitMQ:

```typescript
// apps/orchestrator/src/orchestrator/orchestrator.module.ts
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest-module';

@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(), // ✅ Infrastructure AWS SEULEMENT
    // ❌ PAS de MessagingPublishersModule - on ne publie pas directement!
    MapperRegistryModule.forFeature(orchestratorCommandMappers),
  ],
  providers: [
    CommandOutboxRepository, // Continue d'utiliser l'outbox pattern
    
    // Nouveaux consumers SQS
    OnboardingRequestedEventConsumer, // Écoute queue 1
    AccountValidatedEventConsumer,    // Écoute queue 2
    CompanyValidatedEventConsumer,    // Écoute queue 3
    
    // Command bus adapters inchangés
    CompanyRegistryCommandBusAdapter,
    AccountRegistryCommandBusAdapter,
    OnboardingManagerCommandBusAdapter,
  ],
})
export class OrchestratorModule {}
```

**Consumer exemple**:

```typescript
// apps/orchestrator/src/orchestrator/consumers/onboarding-requested-event.consumer.ts
import { Injectable, Inject } from '@nestjs/common';
import { AbstractQueueConsumer, MessageRouter } from '@third-party-onboarding-manager/messaging-core';
import { AWS_SQS_CLIENT_PROVIDER, AWS_TRANSPORT_CONFIG } from '@third-party-onboarding-manager/messaging-aws-nest';

@Injectable()
export class OnboardingRequestedEventConsumer extends AbstractQueueConsumer {
  constructor(
    @Inject(MESSAGE_ROUTER) protected readonly messageRouter: MessageRouter,
    @Inject(AWS_SQS_CLIENT_PROVIDER) protected readonly queueClient: QueueClient,
    @Inject(AWS_TRANSPORT_CONFIG) private readonly awsConfig: AwsMessagingConfig,
    private readonly configService: ConfigService,
  ) {
    super(messageRouter, queueClient);
  }

  get queueName(): string {
    return createQueueUrl(
      this.awsConfig,
      this.configService.getOrThrow('ONBOARDING_EVENTS_QUEUE'),
    );
  }

  protected parse(rawMessage: RawQueueMessage): MessageEnvelope<'EVENT', unknown> {
    return StandardMessageParser.parseEvent(rawMessage);
  }

  protected onError(error: unknown, rawMessage: RawQueueMessage) {
    console.error('Error processing event', error, rawMessage);
  }
}
```

**Points clés**:
- ✅ Utilise `MessagingAwsNestModule.forRoot()` pour les clients SQS
- ✅ N'utilise PAS `MessagingPublishersModule` car on utilise l'outbox pattern
- ✅ 3 consumers différents pour 3 queues différentes
- ✅ Code léger - pas de publishers

## Scénario 2: Orchestrator publie directement (sans outbox)

Si vous voulez que l'orchestrator publie directement au lieu d'utiliser l'outbox:

```typescript
// apps/orchestrator/src/orchestrator/orchestrator.module.ts
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessagingPublishersModule } from '@third-party-onboarding-manager/messaging-publishers-nest';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest-module';

@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(), // Infrastructure AWS
    MessagingPublishersModule.forFeature([ // Publishers pour publier directement
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
        key: 'third-party-onboarding-manager',
        queueName: 'ONBOARDING_MANAGER_INTERNAL_COMMANDS_QUEUE',
        type: 'sqs',
      },
    ]),
    MapperRegistryModule.forFeature(orchestratorCommandMappers),
  ],
  providers: [
    // Plus de CommandOutboxRepository - on publie directement
    
    // Consumers SQS
    OnboardingRequestedEventConsumer,
    AccountValidatedEventConsumer,
    CompanyValidatedEventConsumer,
    
    // Command bus adapters qui utilisent PublisherRegistry
    CompanyRegistryCommandBusAdapter,
    AccountRegistryCommandBusAdapter,
    OnboardingManagerCommandBusAdapter,
  ],
})
export class OrchestratorModule {}
```

**Command Bus Adapter exemple**:

```typescript
// apps/orchestrator/src/orchestrator/command-bus/company-registry-command-bus.adapter.ts
import { Injectable, Inject } from '@nestjs/common';
import { PUBLISHER_REGISTRY } from '@third-party-onboarding-manager/messaging-core-nest-module';
import { PublisherRegistry } from '@third-party-onboarding-manager/messaging-core';

@Injectable()
export class CompanyRegistryCommandBusAdapter {
  constructor(
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
  ) {}

  async send(command: CreateCompanyCommand): Promise<void> {
    const publisher = this.publisherRegistry.get('company-registry');
    await publisher.publish({
      id: randomUUID(),
      type: 'company.create',
      destinationBoundedContext: 'company-registry',
      payload: command,
    });
  }
}
```

**Points clés**:
- ✅ Utilise `MessagingAwsNestModule.forRoot()` pour l'infrastructure
- ✅ Utilise `MessagingPublishersModule.forFeature()` pour les publishers
- ✅ Plus besoin de `CommandOutboxRepository` et `CommandOutboxPoller`
- ✅ Publication directe via `PublisherRegistry`

## Scénario 3: Approche hybride (consomme SQS, publie via outbox)

Configuration la plus courante - consommer directement, publier via outbox:

```typescript
// apps/orchestrator/src/orchestrator/orchestrator.module.ts
@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(), // ✅ Infrastructure AWS pour consumers
    // ❌ PAS de MessagingPublishersModule - on utilise l'outbox
    DatabaseModule, // Pour CommandOutboxRepository
    MapperRegistryModule.forFeature(orchestratorCommandMappers),
  ],
  providers: [
    CommandOutboxRepository, // Écrit dans outbox
    
    // Consumers SQS (écoute 3 queues)
    OnboardingRequestedEventConsumer,
    AccountValidatedEventConsumer,
    CompanyValidatedEventConsumer,
    
    // Command bus adapters utilisent CommandOutboxRepository
    CompanyRegistryCommandBusAdapter,
    AccountRegistryCommandBusAdapter,
    OnboardingManagerCommandBusAdapter,
  ],
})
export class OrchestratorModule {}
```

**Avantages de cette approche**:
- ✅ Consommation SQS directe (pas de RabbitMQ)
- ✅ Publication via outbox (transactionnalité)
- ✅ Le command-publisher s'occupe de publier depuis l'outbox
- ✅ Pas de code de publishing dans l'orchestrator

## Comparaison des approches

| Approche | Consommation | Publication | Modules requis | Complexité |
|----------|--------------|-------------|----------------|------------|
| **Actuelle** | RabbitMQ | Outbox | Aucun messaging module | Moyenne |
| **Scénario 1** | 3 queues SQS | Outbox | MessagingAwsNestModule | Moyenne |
| **Scénario 2** | 3 queues SQS | Directe | MessagingAwsNestModule + MessagingPublishersModule | Haute |
| **Scénario 3** | 3 queues SQS | Outbox | MessagingAwsNestModule | Moyenne |

## Recommandation

Pour l'orchestrator, je recommande le **Scénario 3** (hybride):

1. **Consommation**: Migrer de RabbitMQ vers 3 consumers SQS
2. **Publication**: Garder l'outbox pattern (CommandOutboxRepository)
3. **Imports**: Seulement `MessagingAwsNestModule.forRoot()`

**Pourquoi?**
- ✅ Simple - pas de code de publishing dans l'orchestrator
- ✅ Transactionnel - l'outbox garantit la cohérence
- ✅ Séparation - command-publisher gère la publication
- ✅ Léger - pas de `MessagingPublishersModule` nécessaire

## Code d'exemple complet (Scénario 3)

```typescript
// apps/orchestrator/src/orchestrator/orchestrator.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding-manager/database-nest-module';
import { MessagingAwsNestModule } from '@third-party-onboarding-manager/messaging-aws-nest';
import { MessagingCoreModule } from '@third-party-onboarding-manager/messaging-core-nest-module';
import { MapperRegistryModule } from '@third-party-onboarding-manager/mapper-registry-nest-module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(), // Infrastructure AWS pour les 3 consumers
    MapperRegistryModule.forFeature(orchestratorCommandMappers),
  ],
  providers: [
    CommandOutboxRepository,
    
    // 3 consumers SQS
    OnboardingEventsConsumer,      // Queue 1: onboarding events
    CompanyRegistryEventsConsumer, // Queue 2: company events
    AccountRegistryEventsConsumer, // Queue 3: account events
    
    // Consumer runners
    {
      provide: 'ONBOARDING_EVENTS_CONSUMER_RUNNER',
      useFactory: (consumer) => new ConsumerRunner(consumer, 10000),
      inject: [OnboardingEventsConsumer],
    },
    {
      provide: 'COMPANY_EVENTS_CONSUMER_RUNNER',
      useFactory: (consumer) => new ConsumerRunner(consumer, 10000),
      inject: [CompanyRegistryEventsConsumer],
    },
    {
      provide: 'ACCOUNT_EVENTS_CONSUMER_RUNNER',
      useFactory: (consumer) => new ConsumerRunner(consumer, 10000),
      inject: [AccountRegistryEventsConsumer],
    },
    
    // Command bus adapters (utilisent outbox)
    CompanyRegistryCommandBusAdapter,
    AccountRegistryCommandBusAdapter,
    OnboardingManagerCommandBusAdapter,
    
    // Process manager
    {
      provide: PROCESS_MANAGER_TOKEN,
      useFactory: (
        companyBus: CompanyRegistryCommandBusAdapter,
        accountBus: AccountRegistryCommandBusAdapter,
        onboardingBus: OnboardingManagerCommandBusAdapter,
      ) => new OnboardingProcessManager(onboardingBus, companyBus, accountBus),
      inject: [
        CompanyRegistryCommandBusAdapter,
        AccountRegistryCommandBusAdapter,
        OnboardingManagerCommandBusAdapter,
      ],
    },
  ],
})
export class OrchestratorModule {}
```

## Conclusion

Avec la nouvelle architecture:

✅ **Orchestrator consomme 3 queues** - Utilise `MessagingAwsNestModule.forRoot()` SEULEMENT
✅ **Orchestrator publie via outbox** - Pas besoin de `MessagingPublishersModule`
✅ **Code propre et léger** - Pas de code de publishing
✅ **Séparation des responsabilités** - command-publisher publie depuis l'outbox

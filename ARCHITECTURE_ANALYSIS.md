# Analyse de l'architecture de messaging - Séparation des responsabilités

## Vue d'ensemble

Ce document analyse l'architecture de messaging actuelle du projet third-party-onboarding et identifie les problèmes de séparation des responsabilités, particulièrement dans les bibliothèques de messaging et les applications command-publisher et command-executor.

## Architecture actuelle

### Structure des bibliothèques de messaging

```
messaging-core (interfaces abstraites)
├── MessagePublisher (interface)
├── MessageListener (interface)  
├── QueueClient (interface)
├── MessageRouter (routeur de messages générique)
└── AbstractQueueConsumer (classe de base pour consumers)

messaging-aws (implémentation AWS)
├── SqsPublisher (implémentation de MessagePublisher)
├── SnsPublisher (implémentation de MessagePublisher)
├── SqsQueueClient (implémentation de QueueClient)
└── Factories (createQueueUrl, createTopicArn)

messaging-core-nest-module (intégration NestJS - core)
├── MessagingCoreModule (module dynamique NestJS)
├── ConsumerRunner (service de polling)
└── Tokens d'injection (MESSAGE_ROUTER, MESSAGE_LISTENERS)

messaging-aws-nest (intégration NestJS - AWS)
├── MessagingAwsNestModule
├── Publishers pré-configurés (onboarding-manager, company-registry, account-registry)
└── Tokens spécifiques (AWS_SQS_CLIENT_PROVIDER, AWS_SNS_CLIENT_PROVIDER, etc.)
```

### Flux command-publisher

1. **CommandOutboxPoller** (service NestJS)
   - Poll la table `command_outbox` toutes les ~8 secondes
   - Récupère les commandes non traitées
   - Appelle `CommandPublisher.publishCommand()` pour chacune
   - Marque les enregistrements comme traités

2. **CommandPublisher** (service NestJS)
   - Contient un **switch statement hardcodé** qui route par `destinationBoundedContext`
   - Utilise 3 publishers SQS pré-configurés injectés depuis `messaging-aws-nest`
   - Enveloppe la commande dans un `MessageEnvelope`

### Flux command-executor

1. **OnboardingManagerInternalCommandConsumer** (extends AbstractQueueConsumer)
   - Poll une queue SQS spécifiée par variable d'environnement
   - Parse les messages bruts en `MessageEnvelope`
   - Délègue au `MessageRouter`

2. **MessageRouter** (depuis messaging-core)
   - Dispatch vers les `MessageListener` enregistrés
   - Mapping basé sur `message.type`

3. **CreateOnboardingRequestSubscriber** (implémente MessageListener)
   - Écoute les messages de type `'onboarding.create-request'`
   - Transforme le payload en commande métier
   - Exécute le handler

4. **ConsumerRunner** (depuis messaging-core-nest-module)
   - Service qui poll le consumer à intervalle régulier
   - Intervalle hardcodé à 10000ms dans le module

## Problèmes identifiés

### 1. Couplage fort dans CommandPublisher ⚠️ CRITIQUE

**Localisation:** `apps/command-publisher/src/app/services/command-publisher.service.ts:23-32`

```typescript
private getClientForDestination(destinationBoundedContext: string): MessagePublisher {
  switch (destinationBoundedContext) {
    case 'third-party-onboarding-manager':
      return this.onboardingManagerInternalCommandClient;
    case 'company-registry':
      return this.companyRegistryPublicClient;
    case 'account-registry':
      return this.accountRegistryPublicCommandClient;
    default:
      throw new Error(`Unknown destinationBoundedContext: ${destinationBoundedContext}`);
  }
}
```

**Problème:**
- Le service est fortement couplé à des bounded contexts spécifiques
- Ajouter un nouveau bounded context nécessite de modifier le code
- Violation du principe Open/Closed
- Difficile à tester unitairement

**Impact:**
- Maintenance difficile
- Pas d'extensibilité
- Risque de régression à chaque ajout

### 2. Pattern Outbox non abstrait ⚠️

**Localisation:** `apps/command-publisher/src/app/services/command-outbox-poller.service.ts`

**Problème:**
- La logique du pattern Outbox est mélangée avec la logique métier spécifique
- Intervalle de polling hardcodé (ligne 17: `Number(process.env.COMMAND_OUTBOX_POLL_INTERVAL_MS ?? 8000)`)
- Pas de réutilisabilité pour d'autres types d'outbox (events, etc.)
- Logique de polling/retry non configurable

**Impact:**
- Code dupliqué si on veut un event-outbox-poller similaire
- Difficile à tester
- Pas de contrôle fin sur la stratégie de retry

### 3. Configuration dispersée dans le code ⚠️

**Localisations multiples:**
- `command-outbox-poller.service.ts:17` - intervalle de polling en variable d'environnement
- `command-executor.module.ts:38` - intervalle hardcodé à 10000ms
- Multiples références à des noms de queues dans les providers

**Problème:**
- Configuration mélangée avec le code
- Pas de centralisation
- Difficile de changer les intervalles sans modifier le code
- Incohérence entre les différentes parties

**Impact:**
- Configuration non documentée
- Risque d'erreurs
- Pas de validation des configs

### 4. Enregistrement manuel des listeners ⚠️

**Localisation:** `apps/command-executor/src/command-executor/command-executor.module.ts:32`

```typescript
{ provide: MESSAGE_LISTENERS, useExisting: CreateOnboardingRequestSubscriber },
CreateOnboardingRequestSubscriber,
```

**Problème:**
- Chaque listener doit être ajouté manuellement au module
- Pas de découverte automatique
- Facile d'oublier d'enregistrer un listener

**Impact:**
- Code boilerplate
- Risque d'erreurs
- Maintenance fastidieuse

### 5. Publishers spécifiques plutôt qu'un registry pattern ⚠️

**Localisation:** `packages/messaging-aws-nest/src/messaging-aws-nest.module.ts`

**Problème:**
- Un provider spécifique pour chaque bounded context:
  - `onboardingManagerInternalCommandPublisherProvider`
  - `companyRegistryPublicCommandPublisherProvider`
  - `accountRegistryPublicCommandPublisherProvider`
- Duplication de code
- Pas de pattern de registry

**Impact:**
- Ajouter un nouveau bounded context nécessite de créer un nouveau provider
- Code verbeux
- Maintenance difficile

### 6. Parsing de messages non standardisé ⚠️

**Localisation:** `apps/command-executor/src/command-executor/consumers/onboarding-manager-internal-command.consumer.ts:32-42`

```typescript
protected parse(rawMessage: RawQueueMessage): MessageEnvelope<'COMMAND', unknown> {
  const messageAttributes = rawMessage.attributes;
  if (!messageAttributes?.type) throw new Error('Unprocessable message : type is missing');

  return {
    id: rawMessage.id,
    destinationBoundedContext: 'third-party-onboarding-manager',
    payload: rawMessage.body,
    type: messageAttributes.type,
  };
}
```

**Problème:**
- Chaque consumer doit implémenter sa propre logique de parsing
- `destinationBoundedContext` hardcodé
- Pas de validation du format du message
- Duplication si on ajoute d'autres consumers

**Impact:**
- Code fragile face aux changements de format
- Duplication de logique
- Pas de garantie de cohérence

### 7. Manque de découplage du transport AWS ⚠️

**Localisation:** Multiple (consumers, publishers, providers)

**Problème:**
- Les applications sont directement liées à AWS SQS/SNS
- Impossible de changer facilement pour Kafka, RabbitMQ, NATS, etc.
- Dépendances AWS dans le code métier

**Impact:**
- Vendor lock-in
- Impossible de tester avec un message bus différent
- Migration difficile

## Solutions proposées

### Solution 1: PublisherRegistry pattern

**Objectif:** Éliminer le switch statement et permettre l'ajout dynamique de publishers

**Implémentation:**

1. Créer un `PublisherRegistry` dans messaging-core:
```typescript
// packages/messaging-core/src/classes/publisher-registry.ts
export class PublisherRegistry {
  private publishers = new Map<string, MessagePublisher>();

  register(key: string, publisher: MessagePublisher): void {
    this.publishers.set(key, publisher);
  }

  get(key: string): MessagePublisher {
    const publisher = this.publishers.get(key);
    if (!publisher) {
      throw new PublisherNotFoundError(key);
    }
    return publisher;
  }
}
```

2. Créer un module NestJS pour enregistrer les publishers:
```typescript
// packages/messaging-core-nest-module/src/lib/publisher-registry.module.ts
@Module({})
export class PublisherRegistryModule {
  static forRoot(config: PublisherRegistryConfig): DynamicModule {
    // Configuration dynamique des publishers
  }
}
```

3. Refactorer CommandPublisher pour utiliser le registry:
```typescript
@Injectable()
export class CommandPublisher {
  constructor(
    @Inject(PUBLISHER_REGISTRY) private readonly registry: PublisherRegistry,
  ) {}

  async publishCommand(command: OutboxStoredCommand<unknown>): Promise<void> {
    const publisher = this.registry.get(command.destinationBoundedContext);
    const message: MessageEnvelope<'COMMAND', unknown> = {
      id: randomUUID(),
      type: command.type,
      destinationBoundedContext: command.destinationBoundedContext,
      payload: command.payload ?? {},
    };
    await publisher.publish(message);
  }
}
```

**Avantages:**
- ✅ Pas de switch statement
- ✅ Open/Closed principle respecté
- ✅ Ajout de nouveaux bounded contexts via configuration
- ✅ Testabilité améliorée

### Solution 2: Abstraction du pattern Outbox

**Objectif:** Créer une classe générique réutilisable pour le pattern Outbox

**Implémentation:**

1. Créer une classe générique OutboxPoller:
```typescript
// packages/messaging-core/src/classes/outbox-poller.ts
export abstract class AbstractOutboxPoller<T> implements OnModuleInit, OnModuleDestroy {
  protected abstract readonly repository: OutboxRepository<T>;
  protected abstract readonly publisher: OutboxPublisher<T>;
  protected abstract readonly config: OutboxPollerConfig;

  private isRunning = false;
  private stopRequested = false;

  async onModuleInit() {
    await this.startLoop();
  }

  onModuleDestroy() {
    this.stopRequested = true;
  }

  private async startLoop() {
    // Logique générique de polling
  }

  protected abstract onError(error: unknown, item: T): void | Promise<void>;
}

export interface OutboxPollerConfig {
  intervalMs: number;
  batchSize: number;
}
```

2. Implémenter pour les commandes:
```typescript
@Injectable()
export class CommandOutboxPoller extends AbstractOutboxPoller<OutboxStoredCommand> {
  constructor(
    protected readonly repository: CommandOutboxRepository,
    protected readonly publisher: CommandPublisher,
    @Inject(OUTBOX_POLLER_CONFIG) protected readonly config: OutboxPollerConfig,
  ) {
    super();
  }

  protected onError(error: unknown, command: OutboxStoredCommand): void {
    this.logger.error('Error publishing command', error, command);
  }
}
```

**Avantages:**
- ✅ Réutilisable pour events, notifications, etc.
- ✅ Configuration externalisée
- ✅ Stratégie de retry personnalisable
- ✅ Testabilité améliorée

### Solution 3: Configuration centralisée

**Objectif:** Externaliser toute la configuration dans des fichiers de config

**Implémentation:**

1. Créer un schéma de configuration:
```typescript
// config/messaging.config.ts
export interface MessagingConfig {
  outbox: {
    commands: {
      pollIntervalMs: number;
      batchSize: number;
    };
    events: {
      pollIntervalMs: number;
      batchSize: number;
    };
  };
  consumers: {
    [key: string]: {
      queueName: string;
      pollIntervalMs: number;
    };
  };
  publishers: {
    [key: string]: {
      type: 'sqs' | 'sns';
      destination: string;
    };
  };
}
```

2. Utiliser ConfigModule de NestJS:
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [messagingConfig],
      validate: validateMessagingConfig,
    }),
  ],
})
export class AppModule {}
```

**Avantages:**
- ✅ Configuration centralisée et documentée
- ✅ Validation des configs
- ✅ Facile à modifier sans toucher au code
- ✅ Environnements multiples

### Solution 4: Auto-discovery des listeners

**Objectif:** Découverte automatique des listeners via decorators

**Implémentation:**

1. Créer un decorator:
```typescript
// packages/messaging-core-nest-module/src/decorators/message-listener.decorator.ts
export const MessageListenerDecorator = (messageType: string) => {
  return (target: any) => {
    Reflect.defineMetadata(MESSAGE_LISTENER_METADATA, messageType, target);
    return Injectable()(target);
  };
};
```

2. Créer un scanner:
```typescript
export class MessageListenerScanner {
  static scan(module: any): MessageListener[] {
    // Scanner les classes avec le metadata MESSAGE_LISTENER_METADATA
    // Retourner les instances
  }
}
```

3. Utiliser dans les subscribers:
```typescript
@MessageListenerDecorator('onboarding.create-request')
export class CreateOnboardingRequestSubscriber implements MessageListener {
  // ...
}
```

**Avantages:**
- ✅ Pas d'enregistrement manuel
- ✅ Convention over configuration
- ✅ Moins d'erreurs

### Solution 5: Parsing standardisé

**Objectif:** Créer un parser générique dans messaging-core

**Implémentation:**

```typescript
// packages/messaging-core/src/classes/message-parser.ts
export class StandardMessageParser {
  static parse<T extends MessageType>(
    rawMessage: RawQueueMessage,
    messageType: T,
    boundedContext?: string,
  ): MessageEnvelope<T, unknown> {
    const messageAttributes = rawMessage.attributes;
    if (!messageAttributes?.type) {
      throw new Error('Unprocessable message: type is missing');
    }

    return {
      id: rawMessage.id,
      type: messageAttributes.type,
      destinationBoundedContext: boundedContext,
      payload: rawMessage.body,
      version: messageAttributes.version 
        ? Number(messageAttributes.version) 
        : undefined,
    };
  }
}
```

Utiliser dans les consumers:
```typescript
protected parse(rawMessage: RawQueueMessage): MessageEnvelope<'COMMAND', unknown> {
  return StandardMessageParser.parse(
    rawMessage, 
    'COMMAND', 
    'third-party-onboarding-manager'
  );
}
```

**Avantages:**
- ✅ Logique centralisée
- ✅ Cohérence garantie
- ✅ Facile à tester et maintenir

### Solution 6: Abstraction du transport

**Objectif:** Permettre de changer de message bus sans modifier le code métier

**Implémentation:**

1. Garder les interfaces dans messaging-core
2. Créer des packages séparés par transport:
   - `messaging-aws` (existant)
   - `messaging-kafka` (nouveau)
   - `messaging-rabbitmq` (nouveau)
   - `messaging-nats` (nouveau)

3. Utiliser des modules NestJS conditionnels:
```typescript
// apps/command-publisher/src/app/app.module.ts
const messagingModule = process.env.MESSAGE_BUS_TYPE === 'kafka'
  ? MessagingKafkaNestModule
  : MessagingAwsNestModule;

@Module({
  imports: [
    messagingModule,
    // ...
  ],
})
export class AppModule {}
```

**Avantages:**
- ✅ Pas de vendor lock-in
- ✅ Tests avec différents transports
- ✅ Migration facilitée

## Recommandations de priorité

### Priorité HAUTE (à faire immédiatement)

1. **PublisherRegistry pattern** - Élimine le couplage critique
2. **Configuration centralisée** - Améliore la maintenabilité
3. **Parsing standardisé** - Évite les bugs de parsing

### Priorité MOYENNE (à planifier)

4. **Abstraction Outbox** - Facilite la réutilisabilité
5. **Auto-discovery listeners** - Réduit le boilerplate

### Priorité BASSE (nice to have)

6. **Abstraction transport** - Utile si changement de bus prévu

## Conclusion

L'architecture actuelle fonctionne mais souffre de plusieurs problèmes de séparation des responsabilités qui rendent le code difficile à maintenir et à étendre. Les solutions proposées permettent de:

- ✅ Respecter les principes SOLID
- ✅ Améliorer la testabilité
- ✅ Faciliter l'ajout de nouveaux bounded contexts
- ✅ Réduire le couplage
- ✅ Améliorer la réutilisabilité du code

Les changements peuvent être implémentés de manière incrémentale sans tout refactorer d'un coup.

# Architecture Messaging - Séparation Modulaire

## Vue d'ensemble

L'architecture messaging a été complètement refactorisée pour une séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│  messaging-core (interfaces abstraites)                     │
│  - MessagePublisher, QueueClient, etc.                      │
│  - Pas de dépendances sur AWS/NATS/Kafka                    │
└─────────────────────────────────────────────────────────────┘
                            ↑
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────────────────────┐           ┌──────────────────────────┐
│ messaging-aws         │           │ messaging-nats (futur)   │
│ - SqsPublisher        │           │ - NatsPublisher          │
│ - SnsPublisher        │           │ - NatsQueueClient        │
│ - SqsQueueClient      │           │                          │
└───────────────────────┘           └──────────────────────────┘
         ↑                                      ↑
         │                                      │
┌────────┴────────────┐              ┌─────────┴────────────────┐
│ messaging-aws-nest  │              │ messaging-nats-nest      │
│ INFRASTRUCTURE PURE │              │ (futur)                  │
│ - Clients AWS       │              │                          │
│ - Config AWS        │              │                          │
│ PAS de publishers   │              │                          │
└─────────────────────┘              └──────────────────────────┘
         ↑                                      ↑
         │                                      │
         └──────────────────┬───────────────────┘
                            │
                ┌───────────────────────────────┐
                │ messaging-publishers-nest     │
                │ REGISTRATION DES PUBLISHERS   │
                │ - forFeature([...])           │
                │ - Agnostique du transport     │
                └───────────────────────────────┘
                            ↑
                            │
                ┌───────────┴───────────┐
                │                       │
        ┌───────────────┐      ┌───────────────┐
        │ command-      │      │ command-      │
        │ publisher     │      │ executor      │
        │ (publie)      │      │ (consomme)    │
        └───────────────┘      └───────────────┘
```

## Modules

### 1. `messaging-core`

**Responsabilité**: Interfaces et abstractions pures
**Dépendances**: Aucune
**Contient**:
- `MessagePublisher` (interface)
- `QueueClient` (interface)
- `PublisherRegistry` (registre)
- `MessageRouter` (routeur)

### 2. `messaging-aws`

**Responsabilité**: Implémentation AWS des interfaces
**Dépendances**: `messaging-core`, AWS SDK
**Contient**:
- `SqsPublisher` (implémente `MessagePublisher`)
- `SnsPublisher` (implémente `MessagePublisher`)
- `SqsQueueClient` (implémente `QueueClient`)

### 3. `messaging-aws-nest` ⭐

**Responsabilité**: Infrastructure AWS UNIQUEMENT
**Dépendances**: `messaging-aws`, NestJS
**Fournit**:
- `AWS_SQS_CLIENT_PROVIDER` - Client SQS
- `AWS_SNS_CLIENT_PROVIDER` - Client SNS
- `AWS_TRANSPORT_CONFIG` - Configuration AWS

**Ne fournit PAS**:
- ❌ Publishers
- ❌ Registration dans PublisherRegistry

**Utilisation**:
```typescript
// Apps qui consomment OU qui publient
@Module({
  imports: [
    MessagingAwsNestModule.forRoot(), // Juste l'infrastructure
  ],
})
```

### 4. `messaging-publishers-nest` ⭐ NOUVEAU

**Responsabilité**: Enregistrement des publishers dans le PublisherRegistry
**Dépendances**: `messaging-core`, `messaging-aws`, `messaging-aws-nest`
**Fournit**:
- Enregistrement dynamique de publishers via `forFeature()`
- Agnostique du transport (fonctionne avec AWS, fonctionnera avec NATS)

**Utilisation**:
```typescript
// SEULEMENT les apps qui publient
@Module({
  imports: [
    MessagingPublishersModule.forFeature([
      { key: 'company-registry', queueName: 'COMPANY_QUEUE', type: 'sqs' }
    ]),
  ],
})
```

### 5. `messaging-core-nest-module`

**Responsabilité**: Abstractions NestJS
**Fournit**:
- `PublisherRegistry` (singleton)
- `MessageRouter` (singleton)
- Tokens d'injection

## Cas d'usage

### App qui PUBLIE (command-publisher)

```typescript
@Module({
  imports: [
    MessagingCoreModule.forRoot(),          // PublisherRegistry
    MessagingAwsNestModule.forRoot(),       // Clients AWS
    MessagingPublishersModule.forFeature([  // Publishers
      {
        key: 'company-registry',
        queueName: 'COMPANY_QUEUE',
        type: 'sqs',
      },
    ]),
  ],
})
export class CommandPublisherModule {}
```

**Bénéfices**:
- ✅ Déclare explicitement les publishers dont elle a besoin
- ✅ Ne dépend pas de publishers inutilisés
- ✅ Peut ajouter des publishers sans modifier un module partagé

### App qui CONSOMME (command-executor, orchestrator)

```typescript
@Module({
  imports: [
    MessagingCoreModule.forRoot(),     // MessageRouter
    MessagingAwsNestModule.forRoot(),  // Clients AWS SEULEMENT
    // PAS de MessagingPublishersModule !
  ],
  providers: [
    MyConsumer, // Utilise AWS_SQS_CLIENT_PROVIDER
  ],
})
export class CommandExecutorModule {}
```

**Bénéfices**:
- ✅ Ne charge PAS de code de publishing
- ✅ Plus léger
- ✅ Séparation claire des responsabilités

### App qui fait les DEUX

```typescript
@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingAwsNestModule.forRoot(),
    MessagingPublishersModule.forFeature([...]), // Seulement si nécessaire
  ],
  providers: [
    MyConsumer,  // Consomme
    MyPublisher, // Publie
  ],
})
export class HybridModule {}
```

## Interchangeabilité (AWS → NATS)

### Aujourd'hui (AWS)

```typescript
@Module({
  imports: [
    MessagingAwsNestModule.forRoot(),       // ← AWS
    MessagingPublishersModule.forFeature([...]),
  ],
})
```

### Demain (NATS)

```typescript
@Module({
  imports: [
    MessagingNatsNestModule.forRoot(),      // ← NATS (change UNE ligne)
    MessagingPublishersModule.forFeature([...]), // ← Inchangé !
  ],
})
```

**Ce qui change**:
- ✅ Import du module d'infrastructure (`MessagingAwsNestModule` → `MessagingNatsNestModule`)
- ✅ Variables d'environnement (URLs AWS → URLs NATS)

**Ce qui ne change PAS**:
- ✅ `MessagingPublishersModule` - même API
- ✅ Services métier - même code
- ✅ `PublisherRegistry` - même abstraction

## Migration depuis l'ancien code

### Ancien (God Module)

```typescript
@Module({
  imports: [
    MessagingAwsNestModule, // ⚠️ Tout était dedans
  ],
})
```

**Problèmes**:
- Toutes les apps avaient TOUS les publishers
- Impossible de ne charger que l'infrastructure
- Couplage fort

### Nouveau (Modulaire)

**Consumer-only app**:
```typescript
@Module({
  imports: [
    MessagingAwsNestModule.forRoot(), // Infrastructure seulement
  ],
})
```

**Publisher app**:
```typescript
@Module({
  imports: [
    MessagingAwsNestModule.forRoot(),        // Infrastructure
    MessagingPublishersModule.forFeature([...]), // Publishers
  ],
})
```

## Principes de design

1. **Single Responsibility**: Chaque module a UNE responsabilité claire
2. **Dependency Inversion**: Dépendances vers les abstractions, pas les implémentations
3. **Open/Closed**: Facile d'ajouter de nouveaux transports sans modifier le code existant
4. **Interface Segregation**: Les consumers ne dépendent pas du code de publishing
5. **Explicit over Implicit**: Chaque app déclare explicitement ce dont elle a besoin

## Avantages

### Pour le développement
- ✅ Code plus propre et modulaire
- ✅ Chaque app charge seulement ce dont elle a besoin
- ✅ Séparation claire infrastructure / logique métier
- ✅ Facile de comprendre les dépendances

### Pour les tests
- ✅ Mock facile de l'infrastructure (juste `forRoot()`)
- ✅ Mock facile des publishers (juste `PublisherRegistry`)
- ✅ Tests unitaires sans dépendances AWS

### Pour l'évolution
- ✅ Ajout de nouveaux publishers sans toucher au code partagé
- ✅ Migration vers NATS/Kafka minimale
- ✅ Pas de couplage aux bounded contexts spécifiques

## Prochaines étapes possibles

1. ✅ Créer `messaging-nats` (implémentation NATS)
2. ✅ Créer `messaging-nats-nest` (infrastructure NATS)
3. ✅ Mettre à jour `messaging-publishers-nest` pour supporter NATS
4. ✅ Switcher une app de AWS vers NATS en changeant UNE ligne

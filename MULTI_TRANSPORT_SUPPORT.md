# Support Multi-Transport - Paradigmes de Messaging

## Problème : Différences de Paradigmes

Les différents message brokers utilisent des paradigmes différents :

### AWS SQS/SNS
- **SQS** : Envoi direct à une queue (point-to-point)
- **SNS** : Envoi à un topic (pub/sub)
- Deux mécanismes distincts

### RabbitMQ
- **Toujours via Exchange** : Impossible d'envoyer directement à une queue
- Exchange route vers une ou plusieurs queues
- Patterns : direct, topic, fanout, headers

### Kafka
- **Topics avec partitions** : Messages envoyés à un topic
- Partitionnement automatique ou par clé
- Pas de notion de queue

### NATS
- **Subjects** : Système de pub/sub avec wildcards
- Peut faire du point-to-point via queue groups
- JetStream pour persistence

## Solution : Configuration Agnostique

### Nouvelle Interface `PublisherConfig`

```typescript
interface PublisherConfig {
  key: string;           // Clé dans le registry
  destination: string;   // Variable d'environnement (agnostique)
  metadata?: Record<string, unknown>; // Métadonnées spécifiques au transport
}
```

**Avantages** :
- ✅ Agnostique du transport
- ✅ Flexible via `metadata`
- ✅ Chaque infrastructure interprète selon ses besoins

### Exemples d'Utilisation

#### AWS SQS (point-to-point)

```typescript
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    destination: 'COMPANY_REGISTRY_QUEUE', // Env var
    metadata: { transportType: 'sqs' }
  }
])
```

#### AWS SNS (pub/sub)

```typescript
MessagingPublishersModule.forFeature([
  {
    key: 'notifications',
    destination: 'NOTIFICATIONS_TOPIC', // Env var
    metadata: { transportType: 'sns' }
  }
])
```

#### RabbitMQ (exchange + routing key)

```typescript
// Hypothetical - to be implemented in messaging-rabbitmq-nest
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    destination: 'COMPANY_REGISTRY_EXCHANGE', // Env var
    metadata: {
      routingKey: 'company.commands.create',
      exchangeType: 'topic'
    }
  }
])
```

#### Kafka (topic + partition)

```typescript
// Hypothetical - to be implemented in messaging-kafka-nest
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    destination: 'COMPANY_REGISTRY_TOPIC', // Env var
    metadata: {
      partitionKey: 'companyId',
      compressionType: 'gzip'
    }
  }
])
```

#### NATS (subject)

```typescript
// Hypothetical - to be implemented in messaging-nats-nest
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    destination: 'COMPANY_REGISTRY_SUBJECT', // Env var
    metadata: {
      streamName: 'COMMANDS',
      durable: true
    }
  }
])
```

## Architecture pour Supporter RabbitMQ

### 1. Créer `messaging-rabbitmq` (core)

```typescript
// packages/messaging-rabbitmq/src/rabbitmq-publisher.ts
import type { MessagePublisher, MessageEnvelope } from '@third-party-onboarding-manager/messaging-core';
import type { Connection, Channel } from 'amqplib';

export class RabbitMQPublisher implements MessagePublisher {
  constructor(
    private readonly channel: Channel,
    private readonly exchange: string,
    private readonly routingKey: string,
  ) {}

  async publish(message: MessageEnvelope<unknown, unknown>): Promise<void> {
    const payload = JSON.stringify(message);
    
    this.channel.publish(
      this.exchange,      // Exchange name
      this.routingKey,    // Routing key
      Buffer.from(payload),
      {
        persistent: true,
        contentType: 'application/json',
        messageId: message.id,
        type: message.type,
      }
    );
  }
}
```

### 2. Créer `messaging-rabbitmq-nest` (NestJS)

```typescript
// packages/messaging-rabbitmq-nest/src/messaging-rabbitmq-nest.module.ts
import { Module, DynamicModule } from '@nestjs/common';

@Module({})
export class MessagingRabbitMQNestModule {
  /**
   * Provides RabbitMQ infrastructure (connection, channel)
   */
  static forRoot(): DynamicModule {
    return {
      module: MessagingRabbitMQNestModule,
      providers: [
        RabbitMQConnectionProvider,  // Creates AMQP connection
        RabbitMQChannelProvider,     // Creates channel
        RabbitMQConfigProvider,      // Loads config
      ],
      exports: [
        RabbitMQConnectionProvider,
        RabbitMQChannelProvider,
        RabbitMQConfigProvider,
      ],
      global: true,
    };
  }
}
```

### 3. Créer le factory provider pour RabbitMQ

```typescript
// packages/messaging-publishers-nest/src/create-rabbitmq-publisher.provider.ts
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQPublisher } from '@third-party-onboarding-manager/messaging-rabbitmq';
import { PUBLISHER_REGISTRY } from '@third-party-onboarding-manager/messaging-core-nest-module';
import type { PublisherRegistry } from '@third-party-onboarding-manager/messaging-core';
import { RABBITMQ_CHANNEL_PROVIDER } from '@third-party-onboarding-manager/messaging-rabbitmq-nest';
import type { PublisherConfig, RabbitMQPublisherConfig } from './publisher-config.interface.js';

export function createRabbitMQPublisherProvider(config: PublisherConfig): Provider {
  return {
    provide: `PUBLISHER_INITIALIZER_${config.key}`,
    useFactory: (
      channel: Channel,
      configService: ConfigService,
      publisherRegistry: PublisherRegistry,
    ) => {
      const exchangeName = configService.getOrThrow(config.destination);
      const routingKey = (config.metadata?.routingKey as string) ?? '#';
      const exchangeType = (config.metadata?.exchangeType as string) ?? 'topic';
      
      // Assert exchange exists
      channel.assertExchange(exchangeName, exchangeType, { durable: true });
      
      publisherRegistry.register(
        config.key,
        new RabbitMQPublisher(channel, exchangeName, routingKey)
      );
      
      return { key: config.key, initialized: true };
    },
    inject: [RABBITMQ_CHANNEL_PROVIDER, ConfigService, PUBLISHER_REGISTRY],
  };
}
```

### 4. Usage avec RabbitMQ

```typescript
// apps/command-publisher/src/app/app.module.ts
import { MessagingRabbitMQNestModule } from '@third-party-onboarding-manager/messaging-rabbitmq-nest';
import { MessagingPublishersModule } from '@third-party-onboarding-manager/messaging-publishers-nest';

@Module({
  imports: [
    MessagingCoreModule.forRoot(),
    MessagingRabbitMQNestModule.forRoot(), // ← RabbitMQ infrastructure
    MessagingPublishersModule.forFeature([
      {
        key: 'company-registry',
        destination: 'COMPANY_REGISTRY_EXCHANGE',
        metadata: {
          routingKey: 'company.commands.create',
          exchangeType: 'topic'
        }
      }
    ]),
  ],
})
export class AppModule {}
```

## Migration AWS → RabbitMQ

### Avant (AWS SQS)

```typescript
MessagingAwsNestModule.forRoot()
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    destination: 'COMPANY_QUEUE',
    metadata: { transportType: 'sqs' }
  }
])
```

**Env var**: `COMPANY_QUEUE=company-public-commands`

### Après (RabbitMQ)

```typescript
MessagingRabbitMQNestModule.forRoot() // ← Change infrastructure
MessagingPublishersModule.forFeature([
  {
    key: 'company-registry',
    destination: 'COMPANY_EXCHANGE', // ← Change env var name
    metadata: {                      // ← Change metadata
      routingKey: 'company.commands',
      exchangeType: 'topic'
    }
  }
])
```

**Env var**: `COMPANY_EXCHANGE=company-exchange`

**Changements** :
- ✅ Ligne d'import du module d'infrastructure
- ✅ Nom de la variable d'environnement
- ✅ Métadonnées (routingKey au lieu de transportType)
- ✅ Le code métier reste INCHANGÉ !

## Tableau Comparatif des Transports

| Transport | Destination | Metadata | Paradigme |
|-----------|-------------|----------|-----------|
| **AWS SQS** | Queue name | `{ transportType: 'sqs' }` | Point-to-point direct |
| **AWS SNS** | Topic name | `{ transportType: 'sns' }` | Pub/sub via topic |
| **RabbitMQ** | Exchange name | `{ routingKey: '...', exchangeType: '...' }` | Exchange routing |
| **Kafka** | Topic name | `{ partitionKey: '...', compressionType: '...' }` | Topic + partitions |
| **NATS** | Subject | `{ streamName: '...', durable: true }` | Subject-based |

## Types TypeScript pour Transport-Specific Config

```typescript
// packages/messaging-publishers-nest/src/publisher-config.interface.ts

export interface PublisherConfig {
  key: string;
  destination: string;
  metadata?: Record<string, unknown>;
}

// AWS-specific (type-safe)
export interface AwsPublisherConfig extends PublisherConfig {
  metadata: {
    transportType: 'sqs' | 'sns';
  };
}

// RabbitMQ-specific (type-safe)
export interface RabbitMQPublisherConfig extends PublisherConfig {
  metadata: {
    routingKey: string;
    exchangeType?: 'direct' | 'topic' | 'fanout' | 'headers';
  };
}

// Kafka-specific (type-safe)
export interface KafkaPublisherConfig extends PublisherConfig {
  metadata: {
    partitionKey?: string;
    compressionType?: 'gzip' | 'snappy' | 'lz4';
  };
}

// NATS-specific (type-safe)
export interface NatsPublisherConfig extends PublisherConfig {
  metadata: {
    streamName?: string;
    durable?: boolean;
  };
}
```

## Conclusion

Notre configuration est maintenant **vraiment agnostique** du transport :

✅ **Configuration générique** : `destination` + `metadata`
✅ **Supporte tous les paradigmes** : Point-to-point, pub/sub, exchange-based, etc.
✅ **Type-safe pour chaque transport** : Interfaces spécifiques optionnelles
✅ **Facile de changer** : Juste l'infrastructure + metadata
✅ **Code métier inchangé** : `PublisherRegistry` reste le même

Le paradigme de chaque transport est géré par son module d'infrastructure (messaging-aws-nest, messaging-rabbitmq-nest, etc.), pas par le code métier!

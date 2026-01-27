# Guide de Migration - PublisherRegistry Pattern

Ce document explique comment migrer du pattern switch-based publisher vers le PublisherRegistry pattern.

## Changements effectués

### 1. PublisherRegistry dans messaging-core

**Nouveau fichier:** `packages/messaging-core/src/classes/publisher-registry.ts`

Le `PublisherRegistry` est un registre qui permet d'enregistrer et de récupérer des `MessagePublisher` par clé (généralement le nom du bounded context).

```typescript
// Enregistrer un publisher
publisherRegistry.register('company-registry', sqsPublisher);

// Récupérer un publisher
const publisher = publisherRegistry.get('company-registry');

// Vérifier l'existence
if (publisherRegistry.has('company-registry')) { ... }
```

**Avantages:**
- ✅ Pas de switch statement hardcodé
- ✅ Ajout de nouveaux bounded contexts via configuration
- ✅ Respect du principe Open/Closed
- ✅ Facilite les tests unitaires

### 2. StandardMessageParser dans messaging-core

**Nouveau fichier:** `packages/messaging-core/src/classes/standard-message-parser.ts`

Le `StandardMessageParser` fournit une logique de parsing standardisée pour convertir les messages bruts de la queue en `MessageEnvelope`.

```typescript
// Pour les commandes (nécessite bounded context)
const envelope = StandardMessageParser.parseCommand(rawMessage, 'third-party-onboarding-manager');

// Pour les events (pas de bounded context)
const envelope = StandardMessageParser.parseEvent(rawMessage);

// Parsing générique
const envelope = StandardMessageParser.parse(rawMessage, 'COMMAND', 'my-context');
```

**Avantages:**
- ✅ Logique de parsing centralisée et cohérente
- ✅ Validation des attributs de message
- ✅ Gestion de la version des messages
- ✅ Réduction de la duplication de code

### 3. PUBLISHER_REGISTRY token dans messaging-core-nest-module

**Nouveau fichier:** `packages/messaging-core-nest-module/src/tokens/publisher-registry.token.ts`

Token d'injection pour le `PublisherRegistry`:

```typescript
export const PUBLISHER_REGISTRY = Symbol('PUBLISHER_REGISTRY');
```

Le `MessagingCoreModule` fournit maintenant le `PublisherRegistry` en plus du `MessageRouter`.

### 4. PublisherRegistryInitializer dans messaging-aws-nest

**Nouveau fichier:** `packages/messaging-aws-nest/src/providers/publisher-registry-initializer.provider.ts`

Ce provider initialise le `PublisherRegistry` avec tous les publishers des bounded contexts configurés:

```typescript
publisherRegistry.register('third-party-onboarding-manager', new SqsPublisher(...));
publisherRegistry.register('company-registry', new SqsPublisher(...));
publisherRegistry.register('account-registry', new SqsPublisher(...));
```

**Note importante:** Les tokens individuels (`ONBOARDING_MANAGER_INTERNAL_COMMAND_PUBLISHER`, etc.) sont **conservés pour la rétro-compatibilité**. Ils peuvent être supprimés dans une future version majeure.

### 5. Refactoring de CommandPublisher

**Fichier modifié:** `apps/command-publisher/src/app/services/command-publisher.service.ts`

**Avant:**
```typescript
@Injectable()
export class CommandPublisher {
  constructor(
    @Inject(ONBOARDING_MANAGER_INTERNAL_COMMAND_PUBLISHER)
    private readonly onboardingManagerInternalCommandClient: MessagePublisher,
    @Inject(COMPANY_REGISTRY_PUBLIC_COMMAND_PUBLISHER)
    private readonly companyRegistryPublicClient: MessagePublisher,
    @Inject(ACCOUNT_REGISTRY_PUBLIC_COMMAND_PUBLISHER)
    private readonly accountRegistryPublicCommandClient: MessagePublisher,
  ) {}

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

  async publishCommand(command: OutboxStoredCommand<unknown>): Promise<void> {
    const messagePublisher = this.getClientForDestination(command.destinationBoundedContext);
    // ...
  }
}
```

**Après:**
```typescript
@Injectable()
export class CommandPublisher {
  constructor(
    @Inject(PUBLISHER_REGISTRY)
    private readonly publisherRegistry: PublisherRegistry,
  ) {}

  async publishCommand(command: OutboxStoredCommand<unknown>): Promise<void> {
    const messagePublisher = this.publisherRegistry.get(command.destinationBoundedContext);
    // ...
  }
}
```

**Changements:**
- ❌ Suppression de 3 injections de dépendances spécifiques
- ❌ Suppression du switch statement
- ✅ Ajout d'une seule injection: `PUBLISHER_REGISTRY`
- ✅ Lookup dynamique via `publisherRegistry.get()`

Le code est maintenant **ouvert à l'extension** (ajout de bounded contexts) mais **fermé à la modification** (pas besoin de changer le code).

### 6. Refactoring de OnboardingManagerInternalCommandConsumer

**Fichier modifié:** `apps/command-executor/src/command-executor/consumers/onboarding-manager-internal-command.consumer.ts`

**Avant:**
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

**Après:**
```typescript
protected parse(rawMessage: RawQueueMessage): MessageEnvelope<'COMMAND', unknown> {
  return StandardMessageParser.parseCommand(rawMessage, 'third-party-onboarding-manager');
}
```

**Changements:**
- ❌ Suppression de la logique de parsing custom
- ✅ Utilisation de `StandardMessageParser.parseCommand()`
- ✅ Une seule ligne de code
- ✅ Cohérence garantie avec les autres consumers

### 7. Mise à jour de AppModule dans command-publisher

**Fichier modifié:** `apps/command-publisher/src/app/app.module.ts`

Ajout de `MessagingCoreModule.forRoot()` dans les imports pour avoir accès au `PUBLISHER_REGISTRY`.

```typescript
@Module({
  imports: [
    // ...
    MessagingCoreModule.forRoot(),  // Nouveau
    MessagingAwsNestModule,
  ],
  // ...
})
export class AppModule {}
```

## Comment ajouter un nouveau bounded context

**Avant (ancien système):**
1. Créer un nouveau token dans `messaging-aws-nest/src/tokens/`
2. Créer un nouveau provider dans `messaging-aws-nest/src/providers/`
3. Ajouter le provider au module `MessagingAwsNestModule`
4. Exporter le token
5. Injecter le publisher dans `CommandPublisher`
6. Ajouter un nouveau case dans le switch statement

**Après (nouveau système):**
1. Ajouter la variable d'environnement pour la queue (ex: `NEW_CONTEXT_QUEUE`)
2. Modifier `publisherRegistryInitializerProvider` pour enregistrer le nouveau publisher:

```typescript
// Dans packages/messaging-aws-nest/src/providers/publisher-registry-initializer.provider.ts
const newContextQueueUrl = createQueueUrl(
  transportConfig,
  configService.getOrThrow('NEW_CONTEXT_QUEUE'),
);
publisherRegistry.register('new-context', new SqsPublisher(sqsClient, newContextQueueUrl));
```

C'est tout! Le `CommandPublisher` fonctionnera automatiquement avec le nouveau bounded context.

## Migration pour d'autres consumers

Si vous avez d'autres consumers qui parsent des messages, vous pouvez les migrer vers `StandardMessageParser`:

```typescript
// Consumer de commandes
protected parse(rawMessage: RawQueueMessage): MessageEnvelope<'COMMAND', unknown> {
  return StandardMessageParser.parseCommand(rawMessage, 'my-bounded-context');
}

// Consumer d'events
protected parse(rawMessage: RawQueueMessage): MessageEnvelope<'EVENT', unknown> {
  return StandardMessageParser.parseEvent(rawMessage);
}
```

## Tests

Pour tester le `PublisherRegistry`:

```typescript
describe('PublisherRegistry', () => {
  let registry: PublisherRegistry;

  beforeEach(() => {
    registry = new PublisherRegistry();
  });

  it('should register and retrieve a publisher', () => {
    const mockPublisher = { publish: jest.fn() };
    registry.register('test-context', mockPublisher);
    
    const retrieved = registry.get('test-context');
    expect(retrieved).toBe(mockPublisher);
  });

  it('should throw when publisher not found', () => {
    expect(() => registry.get('unknown')).toThrow('No publisher found for key: unknown');
  });

  it('should prevent duplicate registration', () => {
    const mockPublisher = { publish: jest.fn() };
    registry.register('test-context', mockPublisher);
    
    expect(() => registry.register('test-context', mockPublisher))
      .toThrow('Publisher already registered for key: test-context');
  });
});
```

Pour tester `CommandPublisher`:

```typescript
describe('CommandPublisher', () => {
  it('should use registry to publish commands', async () => {
    const mockPublisher = { publish: jest.fn() };
    const registry = new PublisherRegistry();
    registry.register('company-registry', mockPublisher);
    
    const commandPublisher = new CommandPublisher(registry);
    
    const command = {
      id: 1,
      type: 'company.create',
      destinationBoundedContext: 'company-registry',
      payload: { name: 'ACME' },
    };
    
    await commandPublisher.publishCommand(command);
    
    expect(mockPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'company.create',
        destinationBoundedContext: 'company-registry',
      })
    );
  });
});
```

## Compatibilité

**Rétro-compatibilité:** ✅ Complète

Les anciens tokens (`ONBOARDING_MANAGER_INTERNAL_COMMAND_PUBLISHER`, etc.) sont toujours disponibles. Si du code existant les utilise, il continuera de fonctionner.

**Migration recommandée:** Migrer progressivement vers `PUBLISHER_REGISTRY` pour bénéficier des avantages du pattern.

## Prochaines étapes

1. **Configuration centralisée** - Externaliser les configurations de polling dans des fichiers de config
2. **Abstraction Outbox** - Créer un `AbstractOutboxPoller` générique
3. **Auto-discovery des listeners** - Implémenter la découverte automatique via decorators

## Questions fréquentes

**Q: Dois-je supprimer les anciens tokens?**
R: Non, ils sont conservés pour la compatibilité. Ils seront dépréciés dans une future version.

**Q: Comment puis-je utiliser SNS au lieu de SQS?**
R: Dans `publisherRegistryInitializerProvider`, utilisez `SnsPublisher` au lieu de `SqsPublisher`:
```typescript
const topicArn = createTopicArn(transportConfig, queueName);
registry.register('my-context', new SnsPublisher(snsClient, topicArn));
```

**Q: Puis-je avoir différents types de publishers pour différents contexts?**
R: Oui! Le registry accepte n'importe quelle implémentation de `MessagePublisher`, que ce soit SQS, SNS, ou même une implémentation custom.

**Q: Comment gérer les erreurs si un publisher n'existe pas?**
R: Le `PublisherRegistry.get()` lance une erreur claire. Vous pouvez vérifier l'existence avec `has()` avant:
```typescript
if (registry.has(boundedContext)) {
  const publisher = registry.get(boundedContext);
} else {
  // Gérer le cas où le publisher n'existe pas
}
```

## Conclusion

Le `PublisherRegistry` pattern élimine le couplage fort et les switch statements, rendant le code plus maintenable et extensible. Les nouveaux bounded contexts peuvent être ajoutés par configuration sans modifier le code métier.

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { MessageListener, MessageRouter } from '@third-party-onboarding-manager/messaging-core';
import { MESSAGE_LISTENERS } from './tokens/message-listeners.token.js';
import { MESSAGE_ROUTER } from './tokens/message-router.token.js';

@Module({})
export class MessagingCoreModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      // valeur par défaut pour que l'injection fonctionne même si aucun listener n'est déclaré
      { provide: MESSAGE_LISTENERS, useValue: [] },

      {
        provide: MESSAGE_ROUTER,
        useFactory: (listeners: MessageListener<unknown>[]) => new MessageRouter(listeners),
        inject: [MESSAGE_LISTENERS],
      },
    ];

    return {
      module: MessagingCoreModule,
      providers,
      exports: [MESSAGE_ROUTER, MESSAGE_LISTENERS],
    };
  }
}

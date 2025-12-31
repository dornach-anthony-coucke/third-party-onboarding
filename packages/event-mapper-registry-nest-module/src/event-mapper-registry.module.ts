import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { EVENT_MAPPER_REGISTRY_TOKEN } from './tokens/event-mapper-registry.token.js';
import { MapperRegistry, MapperRegistryItem } from '@couckedev/mapper-registry';

@Global()
@Module({})
export class EventMapperRegistryModule {
  static forRoot(): DynamicModule {
    const registryProvider: Provider = {
      provide: EVENT_MAPPER_REGISTRY_TOKEN,
      useValue: MapperRegistry.createWithMappers([]),
    };

    return {
      module: EventMapperRegistryModule,
      providers: [registryProvider],
      exports: [EVENT_MAPPER_REGISTRY_TOKEN],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static forFeature(mappers: MapperRegistryItem<any, any>[]): DynamicModule {
    const initProvider: Provider = {
      provide: Symbol('EVENT_MAPPER_REGISTER_INIT'),
      useFactory: (registry: MapperRegistry) => {
        mappers.map((mapper) => registry.register(mapper));
        return true;
      },
      inject: [EVENT_MAPPER_REGISTRY_TOKEN],
    };

    return {
      module: EventMapperRegistryModule,
      providers: [initProvider],
    };
  }
}

import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { MAPPER_REGISTRY_TOKEN } from './tokens/mapper-registry.token.js';
import { MapperRegistry, MapperRegistryItem } from '@couckedev/mapper-registry';

@Global()
@Module({})
export class MapperRegistryModule {
  static forRoot(): DynamicModule {
    const registryProvider: Provider = {
      provide: MAPPER_REGISTRY_TOKEN,
      useValue: MapperRegistry.createWithMappers([]),
    };

    return {
      module: MapperRegistryModule,
      providers: [registryProvider],
      exports: [MAPPER_REGISTRY_TOKEN],
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static forFeature(mappers: MapperRegistryItem<any, any>[]): DynamicModule {
    const initProvider: Provider = {
      provide: Symbol('MAPPER_REGISTER_INIT'),
      useFactory: (registry: MapperRegistry) => {
        mappers.map((mapper) => registry.register(mapper));
        return true;
      },
      inject: [MAPPER_REGISTRY_TOKEN],
    };

    return {
      module: MapperRegistryModule,
      providers: [initProvider],
    };
  }
}

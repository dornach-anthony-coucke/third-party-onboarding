import { AWS_TRANSPORT_CONFIG } from '../tokens/aws-transport-config.token';
import { ConfigService } from '@nestjs/config';

export const AwsTransportConfigProvider = {
  provide: AWS_TRANSPORT_CONFIG,
  useFactory: (configService: ConfigService) => ({
    credentials: {
      accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
    },
    endpoint: configService.getOrThrow<string>('AWS_URL'),
    region: configService.getOrThrow<string>('AWS_REGION'),
    accountId: configService.getOrThrow<string>('AWS_ACCOUNT_ID'),
  }),
  inject: [ConfigService],
};

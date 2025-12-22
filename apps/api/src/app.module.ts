import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from '@third-party-onboarding/database-nest-module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connectionString: configService.get('DATABASE_URL') ?? 'postgresql://localhost:5432/dev',
        maxConnections: 10,
        ssl: configService.get('DATABASE_SSL') === 'true',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

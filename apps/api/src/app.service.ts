import { Injectable, Inject } from '@nestjs/common';
import { DATABASE_CONNECTION } from '@third-party-onboarding/database-nest-module';

@Injectable()
export class AppService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: this.db ? 'connected' : 'disconnected',
    };
  }

  getHello() {
    return {
      message: 'Welcome to Third-Party Onboarding API',
      version: '0.0.1',
    };
  }
}

import { describe, it, expect } from 'vitest';
import { AppService } from './app.service';

describe('AppService', () => {
  it('should return health status', () => {
    const mockDb = {};
    const appService = new AppService(mockDb);
    const health = appService.getHealth();

    expect(health.status).toBe('ok');
    expect(health.database).toBe('connected');
    expect(health.timestamp).toBeDefined();
  });

  it('should return hello message', () => {
    const mockDb = {};
    const appService = new AppService(mockDb);
    const hello = appService.getHello();

    expect(hello.message).toBe('Welcome to Third-Party Onboarding API');
    expect(hello.version).toBe('0.0.1');
  });
});

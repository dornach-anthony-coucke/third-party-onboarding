import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('ready')
  isReady() {
    return true;
  }
}

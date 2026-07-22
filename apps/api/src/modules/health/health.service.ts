import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'rps-anything-backend',
      timestamp: new Date().toISOString(),
    };
  }
}

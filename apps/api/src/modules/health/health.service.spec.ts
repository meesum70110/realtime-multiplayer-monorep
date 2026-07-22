import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns the health payload', () => {
    const service = new HealthService();

    expect(service.getHealth()).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'rps-anything-backend',
      }),
    );
  });
});

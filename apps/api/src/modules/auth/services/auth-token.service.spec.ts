import { ConfigService } from '@nestjs/config';

import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  const configService = {
    get: jest.fn((key: string, fallback: unknown) => {
      const values: Record<string, unknown> = {
        'auth.accessTokenSecret': 'test-secret',
        'auth.accessTokenTtlMinutes': 60,
        'auth.refreshTokenTtlDays': 30,
      };

      return values[key] ?? fallback;
    }),
  } as unknown as ConfigService;

  let service: AuthTokenService;

  beforeEach(() => {
    service = new AuthTokenService(configService);
  });

  it('creates and verifies an access token', () => {
    const token = service.createAccessToken({
      sessionId: 'session-1',
      userId: 'user-1',
    });

    expect(service.verifyAccessToken(token)).toEqual(
      expect.objectContaining({
        sessionId: 'session-1',
        sub: 'user-1',
        type: 'access',
      }),
    );
  });

  it('rejects a tampered access token', () => {
    const token = service.createAccessToken({
      sessionId: 'session-1',
      userId: 'user-1',
    });

    expect(service.verifyAccessToken(`${token}tampered`)).toBeNull();
  });
});

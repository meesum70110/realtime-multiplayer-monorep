import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  accessTokenSecret:
    process.env.AUTH_ACCESS_TOKEN_SECRET ?? 'change-me-before-production',
  accessTokenTtlMinutes: Number.parseInt(
    process.env.AUTH_ACCESS_TOKEN_TTL_MINUTES ?? '60',
    10,
  ),
  refreshTokenTtlDays: Number.parseInt(
    process.env.AUTH_REFRESH_TOKEN_TTL_DAYS ?? '30',
    10,
  ),
}));

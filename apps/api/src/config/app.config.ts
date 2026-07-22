import { registerAs } from '@nestjs/config';

function parseCorsOrigins(rawValue: string): string[] {
  return rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export default registerAs('app', () => ({
  name: 'rps-anything-backend',
  env: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigin: parseCorsOrigins(
    process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  ),
}));

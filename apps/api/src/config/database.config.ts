import { registerAs } from '@nestjs/config';

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USERNAME ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? 'postgres',
  database: process.env.DATABASE_NAME ?? 'rps_anything',
  ssl: parseBoolean(process.env.DATABASE_SSL, false),
  synchronize: parseBoolean(process.env.DATABASE_SYNC, true),
}));

type EnvRecord = Record<string, unknown>;

function readString(
  config: EnvRecord,
  key: string,
  fallback?: string,
): string {
  const value = config[key];

  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim();
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Environment variable ${key} is required`);
}

function readNumber(config: EnvRecord, key: string, fallback?: number): number {
  const value = config[key];

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsedValue = Number.parseInt(value, 10);

    if (Number.isFinite(parsedValue)) {
      return parsedValue;
    }
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Environment variable ${key} must be a number`);
}

function readBoolean(
  config: EnvRecord,
  key: string,
  fallback?: boolean,
): boolean {
  const value = config[key];

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.toLowerCase().trim();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  if (fallback !== undefined) {
    return fallback;
  }

  throw new Error(`Environment variable ${key} must be a boolean`);
}

export function validateEnv(config: EnvRecord): EnvRecord {
  return {
    ...config,
    NODE_ENV: readString(config, 'NODE_ENV', 'development'),
    PORT: readNumber(config, 'PORT', 3001),
    API_PREFIX: readString(config, 'API_PREFIX', 'api'),
    CORS_ORIGIN: readString(config, 'CORS_ORIGIN', 'http://localhost:3000'),
    DATABASE_HOST: readString(config, 'DATABASE_HOST', 'localhost'),
    DATABASE_PORT: readNumber(config, 'DATABASE_PORT', 5432),
    DATABASE_USERNAME: readString(config, 'DATABASE_USERNAME', 'postgres'),
    DATABASE_PASSWORD: readString(config, 'DATABASE_PASSWORD', 'postgres'),
    DATABASE_NAME: readString(config, 'DATABASE_NAME', 'rps_anything'),
    DATABASE_SSL: readBoolean(config, 'DATABASE_SSL', false),
    DATABASE_SYNC: readBoolean(config, 'DATABASE_SYNC', true),
    AUTH_ACCESS_TOKEN_SECRET: readString(
      config,
      'AUTH_ACCESS_TOKEN_SECRET',
      'change-me-before-production',
    ),
    AUTH_ACCESS_TOKEN_TTL_MINUTES: readNumber(
      config,
      'AUTH_ACCESS_TOKEN_TTL_MINUTES',
      60,
    ),
    AUTH_REFRESH_TOKEN_TTL_DAYS: readNumber(
      config,
      'AUTH_REFRESH_TOKEN_TTL_DAYS',
      30,
    ),
  };
}

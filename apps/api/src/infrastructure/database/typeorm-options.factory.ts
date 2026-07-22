import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'node:path';

export function createTypeOrmOptions(
  configService: ConfigService,
): TypeOrmModuleOptions {
  const sslEnabled = configService.get<boolean>('database.ssl', false);

  return {
    type: 'postgres',
    host: configService.get<string>('database.host', 'localhost'),
    port: configService.get<number>('database.port', 5432),
    username: configService.get<string>('database.username', 'postgres'),
    password: configService.get<string>('database.password', 'postgres'),
    database: configService.get<string>('database.database', 'rps_anything'),
    autoLoadEntities: true,
    synchronize: configService.get<boolean>('database.synchronize', true),
    logging: configService.get<string>('app.env', 'development') !== 'production',
    entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  };
}

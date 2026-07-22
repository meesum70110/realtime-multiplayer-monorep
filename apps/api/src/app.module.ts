import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MatchmakingModule } from './modules/matchmaking/matchmaking.module';
import { MatchesModule } from './modules/matches/matches.module';
import { RealtimeModule } from './modules/realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      load: [appConfig, authConfig, databaseConfig],
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    RealtimeModule,
    MatchesModule,
    MatchmakingModule,
  ],
})
export class AppModule {}

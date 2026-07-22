import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from './entities/user.entity';
import { AuthTokenService } from './services/auth-token.service';
import { PasswordHasherService } from './services/password-hasher.service';
import { SessionAuthService } from './services/session-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SessionEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthTokenService,
    PasswordHasherService,
    SessionAuthService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
  exports: [AuthTokenService, PasswordHasherService, SessionAuthService],
})
export class AuthModule {}

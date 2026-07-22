import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { SessionEntity } from '../entities/session.entity';
import { UserEntity } from '../entities/user.entity';
import { AccessTokenPayload } from '../types/access-token-payload.type';
import { AuthTokenService } from './auth-token.service';

export type AuthenticatedSessionContext = {
  payload: AccessTokenPayload;
  session: SessionEntity;
  user: UserEntity;
};

@Injectable()
export class SessionAuthService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
    private readonly authTokenService: AuthTokenService,
  ) {}

  async authenticateAccessToken(
    accessToken: string,
  ): Promise<AuthenticatedSessionContext> {
    const payload = this.authTokenService.verifyAccessToken(accessToken);

    if (payload === null) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const session = await this.sessionsRepository.findOne({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        revokedAt: IsNull(),
      },
      relations: {
        user: true,
      },
    });

    if (session === null || session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    return {
      payload,
      session,
      user: session.user,
    };
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthenticatedRequest } from '../../../common/auth/authenticated-request.interface';
import { IS_PUBLIC_ROUTE_KEY } from '../../../common/auth/public.decorator';
import { SessionAuthService } from '../services/session-auth.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionAuthService: SessionAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType<'http' | 'ws' | 'rpc'>() !== 'http') {
      return true;
    }

    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublicRoute) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const accessToken = this.extractAccessToken(request);

    if (accessToken === null) {
      throw new UnauthorizedException('Authentication required');
    }

    const authenticatedSession =
      await this.sessionAuthService.authenticateAccessToken(accessToken);

    request.auth = {
      accessToken,
      sessionId: authenticatedSession.session.id,
      userId: authenticatedSession.session.userId,
    };
    request.user = authenticatedSession.user;

    return true;
  }

  private extractAccessToken(request: AuthenticatedRequest): string | null {
    const authorizationHeader = request.headers.authorization;

    if (typeof authorizationHeader !== 'string') {
      return null;
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== 'Bearer' || token === undefined || token.length === 0) {
      return null;
    }

    return token;
  }
}

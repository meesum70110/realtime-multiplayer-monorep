import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { AuthenticatedSocket } from '../../common/auth/authenticated-socket.interface';
import { SessionAuthService } from '../auth/services/session-auth.service';

@WebSocketGateway({
  cors: {
    credentials: true,
    origin: true,
  },
  namespace: 'realtime',
})
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server?: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly sessionAuthService: SessionAuthService) {}

  async handleConnection(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    try {
      const accessToken = this.extractAccessToken(client);

      if (accessToken === null) {
        client.disconnect(true);
        return;
      }

      const authenticatedSession =
        await this.sessionAuthService.authenticateAccessToken(accessToken);

      client.data.auth = {
        sessionId: authenticatedSession.session.id,
        userId: authenticatedSession.user.id,
      };
      client.data.user = authenticatedSession.user;

      await client.join(this.getUserRoom(authenticatedSession.user.id));
      client.emit('connection_ready', {
        user_id: authenticatedSession.user.id,
      });
    } catch {
      this.logger.warn('Rejected realtime connection');
      client.disconnect(true);
    }
  }

  emitToUser(userId: string, event: string, payload: unknown): void {
    this.server?.to(this.getUserRoom(userId)).emit(event, payload);
  }

  emitToUsers(userIds: string[], event: string, payloadFactory: (userId: string) => unknown): void {
    for (const userId of userIds) {
      this.emitToUser(userId, event, payloadFactory(userId));
    }
  }

  emitToMatch(matchId: string, event: string, payload: unknown): void {
    this.server?.to(this.getMatchRoom(matchId)).emit(event, payload);
  }

  async addUsersToMatchRoom(userIds: string[], matchId: string): Promise<void> {
    if (this.server === undefined) {
      return;
    }

    for (const userId of userIds) {
      await this.server
        .in(this.getUserRoom(userId))
        .socketsJoin(this.getMatchRoom(matchId));
    }
  }

  getUserRoom(userId: string): string {
    return `user:${userId}`;
  }

  getMatchRoom(matchId: string): string {
    return `match:${matchId}`;
  }

  private extractAccessToken(client: AuthenticatedSocket): string | null {
    const authToken = client.handshake.auth.token;

    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const accessToken = client.handshake.auth.accessToken;

    if (typeof accessToken === 'string' && accessToken.length > 0) {
      return accessToken;
    }

    const authorizationHeader = client.handshake.headers.authorization;

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

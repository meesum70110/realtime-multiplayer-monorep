import { randomUUID } from 'node:crypto';

import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { AuthenticatedSocket } from '../../common/auth/authenticated-socket.interface';
import { SessionAuthService } from '../auth/services/session-auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server?: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  /** userId → active socket ids (multi-tab safe). */
  private readonly onlineUsers = new Map<string, Set<string>>();

  /** Fired when a user has zero remaining sockets (true disconnect). */
  private readonly fullyDisconnectedHandlers: Array<
    (userId: string) => void | Promise<void>
  > = [];

  constructor(private readonly sessionAuthService: SessionAuthService) {}

  onUserFullyDisconnected(
    handler: (userId: string) => void | Promise<void>,
  ): void {
    this.fullyDisconnectedHandlers.push(handler);
  }

  async handleConnection(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    try {
      const accessToken = this.extractAccessToken(client);

      if (accessToken === null) {
        await this.acceptAnonymousGuest(client);
        return;
      }

      const authenticatedSession =
        await this.sessionAuthService.authenticateAccessToken(accessToken);

      client.data.auth = {
        sessionId: authenticatedSession.session.id,
        userId: authenticatedSession.user.id,
        isGuest: false,
      };
      client.data.user = authenticatedSession.user;

      await this.finishConnection(client, authenticatedSession.user.id, false);
    } catch {
      this.logger.warn('Rejected realtime connection (invalid token)');
      client.disconnect(true);
    }
  }

  /** Tokenless sockets get an ephemeral guest id so presence/health checks can connect. */
  private async acceptAnonymousGuest(client: AuthenticatedSocket): Promise<void> {
    const guestUserId = randomUUID();

    client.data.auth = {
      sessionId: null,
      userId: guestUserId,
      isGuest: true,
    };

    await this.finishConnection(client, guestUserId, true);
  }

  private async finishConnection(
    client: AuthenticatedSocket,
    userId: string,
    isGuest: boolean,
  ): Promise<void> {
    await client.join(this.getUserRoom(userId));
    this.trackConnect(userId, client.id);

    const playersOnline = this.getOnlineUserCount();
    client.emit('connection_ready', {
      user_id: userId,
      players_online: playersOnline,
      is_guest: isGuest,
    });
    this.broadcastPresence();
  }

  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket): void {
    const userId = client.data.auth?.userId;
    if (userId === undefined) {
      return;
    }

    const fullyGone = this.trackDisconnect(userId, client.id);
    this.broadcastPresence();

    if (fullyGone) {
      for (const handler of this.fullyDisconnectedHandlers) {
        void Promise.resolve(handler(userId)).catch((error: unknown) => {
          this.logger.warn(
            `Disconnect handler failed for ${userId}: ${String(error)}`,
          );
        });
      }
    }
  }

  getOnlineUserCount(): number {
    return this.onlineUsers.size;
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

  private trackConnect(userId: string, socketId: string): void {
    const sockets = this.onlineUsers.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    this.onlineUsers.set(userId, sockets);
  }

  /** @returns true when the user has no remaining sockets. */
  private trackDisconnect(userId: string, socketId: string): boolean {
    const sockets = this.onlineUsers.get(userId);
    if (sockets === undefined) {
      return true;
    }

    sockets.delete(socketId);
    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
      return true;
    }

    return false;
  }

  private broadcastPresence(): void {
    this.server?.emit('presence_updated', {
      players_online: this.getOnlineUserCount(),
    });
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

import { randomUUID } from 'node:crypto';

import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { AuthenticatedSocket } from '../../common/auth/authenticated-socket.interface';
import { SessionAuthService } from '../auth/services/session-auth.service';

/** Strict max length for match chat / emote payloads. */
const CHAT_TEXT_MAX = 50;
/** Minimum gap between chat emits from the same socket. */
const CHAT_RATE_LIMIT_MS = 2_000;

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

  /** socketId → last successful chat emit timestamp (rate limit). */
  private readonly chatLastSentAt = new Map<string, number>();

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
    this.chatLastSentAt.delete(client.id);

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

  /**
   * Match chat / quick emotes. Client emits `send_chat_message`;
   * server relays `chat_message` strictly to others in `match:{id}`.
   * Enforces 50-char max + 1 message / 2s per socket.
   */
  @SubscribeMessage('send_chat_message')
  handleSendChatMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    body: { match_id?: unknown; text?: unknown },
  ): void {
    const userId = client.data.auth?.userId;
    if (userId === undefined) {
      return;
    }

    const now = Date.now();
    const lastSent = this.chatLastSentAt.get(client.id) ?? 0;
    if (now - lastSent < CHAT_RATE_LIMIT_MS) {
      return;
    }

    const matchId =
      typeof body?.match_id === 'string' ? body.match_id.trim() : '';
    const rawText = typeof body?.text === 'string' ? body.text : '';
    const normalized = rawText.replace(/\s+/g, ' ').trim();

    // Strict length gate — drop oversized payloads instead of silently clipping spam.
    if (!matchId || !normalized || normalized.length > CHAT_TEXT_MAX) {
      return;
    }

    const text = normalized;

    const fromDisplayName =
      client.data.user?.displayName?.trim() ||
      (client.data.auth?.isGuest ? 'Guest' : 'Rival');

    const payload = {
      match_id: matchId,
      from_user_id: userId,
      from_display_name: fromDisplayName,
      text,
      sent_at: new Date().toISOString(),
    };

    this.chatLastSentAt.set(client.id, now);

    // Exclude sender — they already render the bubble optimistically.
    client.to(this.getMatchRoom(matchId)).emit('chat_message', payload);
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

import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { UserEntity } from '../auth/entities/user.entity';
import { MatchEntity } from '../matches/entities/match.entity';
import { MatchStatus } from '../matches/entities/match-status.enum';
import { MatchesService } from '../matches/matches.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { JoinQueueDto } from './dto/join-queue.dto';
import { QueueStatus } from './enums/queue-status.enum';
import { FifoMatchmakingStrategy } from './services/fifo-matchmaking.strategy';
import { MatchmakingModeService } from './services/matchmaking-mode.service';
import { MatchmakingQueueService } from './services/matchmaking-queue.service';
import { PrivateLobbyService } from './services/private-lobby.service';
import { MatchmakingQueueEntry } from './types/matchmaking-queue-entry.type';

@Injectable()
export class MatchmakingService {
  constructor(
    private readonly fifoMatchmakingStrategy: FifoMatchmakingStrategy,
    private readonly matchmakingModeService: MatchmakingModeService,
    private readonly matchmakingQueueService: MatchmakingQueueService,
    private readonly privateLobbyService: PrivateLobbyService,
    private readonly matchesService: MatchesService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async joinQueue(user: UserEntity, request: JoinQueueDto): Promise<Record<string, unknown>> {
    const activeMode = this.matchmakingModeService.getActiveMode();

    if (
      request.mode_type !== undefined &&
      request.mode_type !== activeMode.modeType
    ) {
      throw new BadRequestException('Requested mode is not active');
    }

    const existingEntry = this.matchmakingQueueService.getActiveEntryForUser(user.id);

    if (existingEntry !== null) {
      return this.toQueueResponse(existingEntry);
    }

    const queueEntry = this.matchmakingQueueService.enqueue(user.id, activeMode);

    this.realtimeGateway.emitToUser(user.id, 'queue_joined', {
      ...this.toQueueResponse(queueEntry),
      estimated_wait_time: this.matchmakingQueueService.getEstimatedWaitTimeSeconds(
        queueEntry.id,
      ),
    });

    await this.tryMatch(queueEntry);

    const updatedEntry =
      this.matchmakingQueueService.getEntryForUserOrThrow(queueEntry.id, user.id);

    return this.toQueueResponse(updatedEntry);
  }

  getQueueStatus(queueEntryId: string, userId: string): Record<string, unknown> {
    const queueEntry = this.matchmakingQueueService.getEntryForUserOrThrow(
      queueEntryId,
      userId,
    );

    return {
      ...this.toQueueResponse(queueEntry),
      estimated_wait_time: this.matchmakingQueueService.getEstimatedWaitTimeSeconds(
        queueEntry.id,
      ),
    };
  }

  cancelQueue(queueEntryId: string, userId: string): { message: string } {
    const queueEntry = this.matchmakingQueueService.getEntryForUserOrThrow(
      queueEntryId,
      userId,
    );

    if (queueEntry.status === QueueStatus.Matched) {
      throw new ConflictException('Match already found');
    }

    if (queueEntry.status === QueueStatus.Cancelled) {
      return { message: 'Queue search already cancelled' };
    }

    const cancelledEntry = this.matchmakingQueueService.cancel(queueEntryId, userId);

    this.realtimeGateway.emitToUser(userId, 'queue_cancelled', {
      queue_entry_id: cancelledEntry.id,
      queue_status: cancelledEntry.status,
    });

    return { message: 'Queue search cancelled' };
  }

  createPrivateLobby(user: UserEntity): Record<string, unknown> {
    // Leave any public queue before hosting a private room.
    const active = this.matchmakingQueueService.getActiveEntryForUser(user.id);
    if (active !== null && active.status === QueueStatus.Waiting) {
      this.matchmakingQueueService.cancel(active.id, user.id);
    }

    const lobby = this.privateLobbyService.create(user.id);

    this.realtimeGateway.emitToUser(user.id, 'private_lobby_created', {
      invite_code: lobby.code,
    });

    return {
      invite_code: lobby.code,
      status: 'waiting',
      message: 'Private room created — share the code with a friend',
    };
  }

  async joinPrivateLobby(
    user: UserEntity,
    inviteCode: string,
  ): Promise<Record<string, unknown>> {
    const lobby = this.privateLobbyService.takeForJoin(inviteCode, user.id);
    const activeMode = this.matchmakingModeService.getActiveMode();

    const match = await this.matchesService.createLobbyMatch({
      modeSnapshot: activeMode,
      player1UserId: lobby.hostUserId,
      player2UserId: user.id,
    });

    await this.realtimeGateway.addUsersToMatchRoom(
      [lobby.hostUserId, user.id],
      match.id,
    );

    const syntheticQueueId = match.id;
    this.realtimeGateway.emitToUser(lobby.hostUserId, 'match_found', {
      match_id: match.id,
      match_status: MatchStatus.Lobby,
      mode_type: match.modeType,
      player_side: 'player_1',
      queue_entry_id: syntheticQueueId,
    });
    this.realtimeGateway.emitToUser(user.id, 'match_found', {
      match_id: match.id,
      match_status: MatchStatus.Lobby,
      mode_type: match.modeType,
      player_side: 'player_2',
      queue_entry_id: syntheticQueueId,
    });

    return {
      status: 'matched',
      match_id: match.id,
      invite_code: lobby.code,
      message: 'Joined private room',
    };
  }

  cancelPrivateLobby(userId: string): { message: string } {
    const result = this.privateLobbyService.cancelForUser(userId);
    return {
      message: result.cancelled
        ? 'Private room cancelled'
        : 'No private room to cancel',
    };
  }

  private async tryMatch(queueEntry: MatchmakingQueueEntry): Promise<void> {
    const opponent = this.fifoMatchmakingStrategy.findOpponent(
      queueEntry,
      this.matchmakingQueueService.listWaitingEntries(),
    );

    if (opponent === null) {
      return;
    }

    const match = await this.matchesService.createLobbyMatch({
      modeSnapshot: queueEntry.modeSnapshot,
      player1UserId: opponent.userId,
      player2UserId: queueEntry.userId,
    });

    const updatedOpponentEntry = this.matchmakingQueueService.markMatched(
      opponent.id,
      match.id,
    );
    const updatedQueueEntry = this.matchmakingQueueService.markMatched(
      queueEntry.id,
      match.id,
    );

    await this.realtimeGateway.addUsersToMatchRoom(
      [opponent.userId, queueEntry.userId],
      match.id,
    );

    this.emitMatchFound(updatedOpponentEntry, match, 'player_1');
    this.emitMatchFound(updatedQueueEntry, match, 'player_2');
  }

  private emitMatchFound(
    queueEntry: MatchmakingQueueEntry,
    match: MatchEntity,
    playerSide: 'player_1' | 'player_2',
  ): void {
    this.realtimeGateway.emitToUser(queueEntry.userId, 'match_found', {
      match_id: match.id,
      match_status: MatchStatus.Lobby,
      mode_type: match.modeType,
      player_side: playerSide,
      queue_entry_id: queueEntry.id,
    });
  }

  private toQueueResponse(queueEntry: MatchmakingQueueEntry): Record<string, unknown> {
    return {
      best_of: queueEntry.modeSnapshot.bestOf,
      level_max: queueEntry.modeSnapshot.levelMax,
      level_min: queueEntry.modeSnapshot.levelMin,
      level_mode_type: queueEntry.modeSnapshot.levelModeType,
      match_id: queueEntry.matchId,
      mode_type: queueEntry.modeSnapshot.modeType,
      queue_entry_id: queueEntry.id,
      queue_status: queueEntry.status,
      round_time_limit_seconds: queueEntry.modeSnapshot.roundTimeLimitSeconds,
      rule_type: queueEntry.modeSnapshot.ruleType,
      theme_name: queueEntry.modeSnapshot.themeName,
      total_points_per_player: queueEntry.modeSnapshot.totalPointsPerPlayer,
    };
  }
}

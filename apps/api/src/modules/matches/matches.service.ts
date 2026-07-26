import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { UserEntity } from '../auth/entities/user.entity';
import { MatchmakingQueueService } from '../matchmaking/services/matchmaking-queue.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MatchmakingModeSnapshot } from '../matchmaking/types/matchmaking-mode-snapshot.type';
import { RoundSubmissionEntity } from './entities/round-submission.entity';
import { MatchEntity } from './entities/match.entity';
import { MatchStatus } from './entities/match-status.enum';
import { EndMatchResponse } from './dto/end-match-response.type';
import { MatchRoundsService } from './services/match-rounds.service';
import { RematchService } from './services/rematch.service';
import { MatchLobbyResponse } from './types/match-lobby-response.type';

@Injectable()
export class MatchesService implements OnModuleInit {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchesRepository: Repository<MatchEntity>,
    @InjectRepository(RoundSubmissionEntity)
    private readonly roundSubmissionsRepository: Repository<RoundSubmissionEntity>,
    private readonly matchmakingQueueService: MatchmakingQueueService,
    private readonly matchRoundsService: MatchRoundsService,
    private readonly rematchService: RematchService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  onModuleInit(): void {
    this.realtimeGateway.onUserFullyDisconnected((userId) => {
      void this.handleUserFullyDisconnected(userId);
    });
  }

  async createLobbyMatch(input: {
    modeSnapshot: MatchmakingModeSnapshot;
    player1UserId: string;
    player2UserId: string;
  }): Promise<MatchEntity> {
    const { modeSnapshot, player1UserId, player2UserId } = input;
    const remainingPoints =
      modeSnapshot.totalPointsPerPlayer === null
        ? null
        : modeSnapshot.totalPointsPerPlayer;

    const match = this.matchesRepository.create({
      bestOf: modeSnapshot.bestOf,
      endedAt: null,
      levelMax: modeSnapshot.levelMax,
      levelMin: modeSnapshot.levelMin,
      levelModeType: modeSnapshot.levelModeType,
      matchStatus: MatchStatus.Lobby,
      modeType: modeSnapshot.modeType,
      player1RemainingPoints: remainingPoints,
      player1Score: 0,
      player1UserId,
      player2RemainingPoints: remainingPoints,
      player2Score: 0,
      player2UserId,
      roundTimeLimitSeconds: modeSnapshot.roundTimeLimitSeconds,
      ruleType: modeSnapshot.ruleType,
      startedAt: null,
      themeName: modeSnapshot.themeName,
      totalPointsPerPlayer: modeSnapshot.totalPointsPerPlayer,
      winnerUserId: null,
    });

    const savedMatch = await this.matchesRepository.save(match);

    await this.matchRoundsService.createInitialRound(savedMatch.id);

    return savedMatch;
  }

  async getLobbyMatchForUser(
    matchId: string,
    userId: string,
  ): Promise<MatchLobbyResponse> {
    const match = await this.matchesRepository.findOne({
      where: { id: matchId },
      relations: {
        player1User: true,
        player2User: true,
      },
    });

    if (match === null) {
      throw new NotFoundException('Match not found');
    }

    if (match.player1UserId !== userId && match.player2UserId !== userId) {
      throw new ForbiddenException('You do not have access to this match');
    }

    const currentRound = await this.matchRoundsService.ensureCurrentRound(match);
    const currentRoundSubmissions =
      currentRound === null
        ? []
        : await this.roundSubmissionsRepository.find({
            where: { roundId: currentRound.id },
          });

    const player1Submitted = currentRoundSubmissions.some(
      (submission) => submission.userId === match.player1UserId,
    );
    const player2Submitted = currentRoundSubmissions.some(
      (submission) => submission.userId === match.player2UserId,
    );

    return {
      best_of: match.bestOf,
      created_at: match.createdAt.toISOString(),
      current_round_id: currentRound?.id ?? null,
      current_round_number: currentRound?.roundNumber ?? null,
      current_round_status: currentRound?.roundStatus ?? null,
      level_max: match.levelMax,
      level_min: match.levelMin,
      level_mode_type: match.levelModeType,
      match_id: match.id,
      match_status: match.matchStatus,
      mode_type: match.modeType,
      player_1: {
        display_name: match.player1User.displayName,
        id: match.player1User.id,
        submitted: player1Submitted,
      },
      player_1_score: match.player1Score,
      player_2: {
        display_name: match.player2User.displayName,
        id: match.player2User.id,
        submitted: player2Submitted,
      },
      player_2_score: match.player2Score,
      player_side: match.player1UserId === userId ? 'player_1' : 'player_2',
      round_ends_at: this.computeRoundEndsAt(
        currentRound?.startedAt ?? null,
        match.roundTimeLimitSeconds,
      ),
      round_time_limit_seconds: match.roundTimeLimitSeconds,
      rule_type: match.ruleType,
      theme_name: match.themeName,
      total_points_per_player: match.totalPointsPerPlayer,
    };
  }

  private computeRoundEndsAt(
    startedAt: Date | null | undefined,
    roundTimeLimitSeconds: number,
  ): string | null {
    if (startedAt == null) {
      return null;
    }

    return new Date(
      startedAt.getTime() + roundTimeLimitSeconds * 1000,
    ).toISOString();
  }

  async endMatchForTesting(
    matchId: string,
    userId: string,
  ): Promise<EndMatchResponse> {
    const match = await this.matchesRepository.findOne({
      where: { id: matchId },
    });

    if (match === null) {
      throw new NotFoundException('Match not found');
    }

    if (match.player1UserId !== userId && match.player2UserId !== userId) {
      throw new ForbiddenException('You do not have access to this match');
    }

    const isAlreadyEnded =
      match.matchStatus === MatchStatus.Cancelled ||
      match.matchStatus === MatchStatus.Completed;

    // Leaving an active match is a forfeit — award the remaining player.
    if (!isAlreadyEnded) {
      const winnerUserId =
        match.player1UserId === userId
          ? match.player2UserId
          : match.player1UserId;

      match.matchStatus = MatchStatus.Completed;
      match.winnerUserId = winnerUserId;
      match.endedAt = new Date();
      await this.matchesRepository.save(match);

      this.rematchService.clear(match.id);
      const releasedUserIds =
        this.matchmakingQueueService.releaseEntriesForMatch(match.id);

      const payload = {
        match_id: match.id,
        winner_user_id: winnerUserId,
        forfeited_user_id: userId,
        reason: 'leave',
        final_score: {
          player_1: match.player1Score,
          player_2: match.player2Score,
        },
      };

      this.realtimeGateway.emitToUser(winnerUserId, 'match_forfeited', payload);
      this.realtimeGateway.emitToMatch(match.id, 'match_forfeited', payload);

      return {
        match_id: match.id,
        match_status: match.matchStatus,
        message: 'Match forfeited',
        released_players: releasedUserIds.length,
      };
    }

    this.rematchService.clear(match.id);
    const releasedUserIds =
      this.matchmakingQueueService.releaseEntriesForMatch(match.id);

    this.realtimeGateway.emitToMatch(match.id, 'match_ended', {
      match_id: match.id,
      match_status: match.matchStatus,
      released_players: releasedUserIds.length,
    });

    return {
      match_id: match.id,
      match_status: match.matchStatus,
      message: 'Match already ended',
      released_players: releasedUserIds.length,
    };
  }

  /**
   * Rage-quit / disconnect: complete the active match and award the remaining player.
   */
  async forfeitActiveMatchForUser(userId: string): Promise<void> {
    const match = await this.findActiveMatchForUser(userId);
    if (match === null) {
      return;
    }

    const winnerUserId =
      match.player1UserId === userId
        ? match.player2UserId
        : match.player1UserId;

    match.matchStatus = MatchStatus.Completed;
    match.winnerUserId = winnerUserId;
    match.endedAt = new Date();
    await this.matchesRepository.save(match);

    this.rematchService.clear(match.id);
    this.matchmakingQueueService.releaseEntriesForMatch(match.id);

    const payload = {
      match_id: match.id,
      winner_user_id: winnerUserId,
      forfeited_user_id: userId,
      reason: 'disconnect',
      final_score: {
        player_1: match.player1Score,
        player_2: match.player2Score,
      },
    };

    this.realtimeGateway.emitToUser(winnerUserId, 'match_forfeited', payload);
    this.realtimeGateway.emitToMatch(match.id, 'match_forfeited', payload);
  }

  async requestRematch(
    matchId: string,
    user: UserEntity,
  ): Promise<Record<string, unknown>> {
    const match = await this.matchesRepository.findOne({
      where: { id: matchId },
    });

    if (match === null) {
      throw new NotFoundException('Match not found');
    }

    if (match.player1UserId !== user.id && match.player2UserId !== user.id) {
      throw new ForbiddenException('You do not have access to this match');
    }

    if (
      match.matchStatus !== MatchStatus.Completed &&
      match.matchStatus !== MatchStatus.Cancelled
    ) {
      throw new ConflictException('Match is still in progress');
    }

    const state = this.rematchService.ensureState(
      match.id,
      match.player1UserId,
      match.player2UserId,
    );
    state.requesterIds.add(user.id);

    const opponentUserId =
      match.player1UserId === user.id
        ? match.player2UserId
        : match.player1UserId;

    if (state.requesterIds.has(opponentUserId)) {
      this.rematchService.clear(match.id);

      const rematch = await this.createLobbyMatch({
        modeSnapshot: this.modeSnapshotFromMatch(match),
        player1UserId: match.player1UserId,
        player2UserId: match.player2UserId,
      });

      await this.realtimeGateway.addUsersToMatchRoom(
        [match.player1UserId, match.player2UserId],
        rematch.id,
      );

      const syntheticQueueId = rematch.id;
      this.realtimeGateway.emitToUser(match.player1UserId, 'match_found', {
        match_id: rematch.id,
        match_status: MatchStatus.Lobby,
        mode_type: rematch.modeType,
        player_side: 'player_1',
        queue_entry_id: syntheticQueueId,
      });
      this.realtimeGateway.emitToUser(match.player2UserId, 'match_found', {
        match_id: rematch.id,
        match_status: MatchStatus.Lobby,
        mode_type: rematch.modeType,
        player_side: 'player_2',
        queue_entry_id: syntheticQueueId,
      });

      return {
        status: 'matched',
        match_id: rematch.id,
        message: 'Rematch started',
      };
    }

    this.realtimeGateway.emitToUser(opponentUserId, 'rematch_requested', {
      match_id: match.id,
      from_user_id: user.id,
      from_display_name: user.displayName,
    });

    return {
      status: 'waiting',
      match_id: match.id,
      message: 'Waiting for opponent to accept rematch',
    };
  }

  async declineRematch(
    matchId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const match = await this.matchesRepository.findOne({
      where: { id: matchId },
    });

    if (match === null) {
      throw new NotFoundException('Match not found');
    }

    if (match.player1UserId !== userId && match.player2UserId !== userId) {
      throw new ForbiddenException('You do not have access to this match');
    }

    const state = this.rematchService.get(matchId);
    this.rematchService.clear(matchId);

    const opponentUserId =
      match.player1UserId === userId
        ? match.player2UserId
        : match.player1UserId;

    if (state !== null && state.requesterIds.has(opponentUserId)) {
      this.realtimeGateway.emitToUser(opponentUserId, 'rematch_declined', {
        match_id: matchId,
        by_user_id: userId,
      });
    }

    return { message: 'Rematch declined' };
  }

  private async handleUserFullyDisconnected(userId: string): Promise<void> {
    await this.forfeitActiveMatchForUser(userId);

    const cleared = this.rematchService.clearForUser(userId);
    for (const state of cleared) {
      const opponentUserId =
        state.player1UserId === userId
          ? state.player2UserId
          : state.player1UserId;
      if (state.requesterIds.has(opponentUserId)) {
        this.realtimeGateway.emitToUser(opponentUserId, 'rematch_declined', {
          match_id: state.matchId,
          by_user_id: userId,
        });
      }
    }
  }

  private async findActiveMatchForUser(
    userId: string,
  ): Promise<MatchEntity | null> {
    return this.matchesRepository.findOne({
      where: [
        {
          player1UserId: userId,
          matchStatus: In([MatchStatus.Lobby, MatchStatus.InProgress]),
        },
        {
          player2UserId: userId,
          matchStatus: In([MatchStatus.Lobby, MatchStatus.InProgress]),
        },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  private modeSnapshotFromMatch(match: MatchEntity): MatchmakingModeSnapshot {
    return {
      bestOf: match.bestOf,
      levelMax: match.levelMax,
      levelMin: match.levelMin,
      levelModeType: match.levelModeType,
      modeType: match.modeType,
      roundTimeLimitSeconds: match.roundTimeLimitSeconds,
      ruleType: match.ruleType,
      themeName: match.themeName,
      totalPointsPerPlayer: match.totalPointsPerPlayer,
    };
  }
}

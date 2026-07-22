import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MatchmakingQueueService } from '../matchmaking/services/matchmaking-queue.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { MatchmakingModeSnapshot } from '../matchmaking/types/matchmaking-mode-snapshot.type';
import { RoundSubmissionEntity } from './entities/round-submission.entity';
import { MatchEntity } from './entities/match.entity';
import { MatchStatus } from './entities/match-status.enum';
import { EndMatchResponse } from './dto/end-match-response.type';
import { MatchRoundsService } from './services/match-rounds.service';
import { MatchLobbyResponse } from './types/match-lobby-response.type';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(MatchEntity)
    private readonly matchesRepository: Repository<MatchEntity>,
    @InjectRepository(RoundSubmissionEntity)
    private readonly roundSubmissionsRepository: Repository<RoundSubmissionEntity>,
    private readonly matchmakingQueueService: MatchmakingQueueService,
    private readonly matchRoundsService: MatchRoundsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

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
      round_time_limit_seconds: match.roundTimeLimitSeconds,
      rule_type: match.ruleType,
      theme_name: match.themeName,
      total_points_per_player: match.totalPointsPerPlayer,
    };
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

    if (!isAlreadyEnded) {
      match.matchStatus = MatchStatus.Cancelled;
      match.endedAt = new Date();
      await this.matchesRepository.save(match);
    }

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
      message: isAlreadyEnded
        ? 'Match already ended'
        : 'Match ended for testing',
      released_players: releasedUserIds.length,
    };
  }
}

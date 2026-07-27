import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../../auth/entities/user.entity';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { MatchEntity } from '../entities/match.entity';
import { ItemEntity } from '../entities/item.entity';
import { ItemIconStatus } from '../entities/item-icon-status.enum';
import { MatchStatus } from '../entities/match-status.enum';
import { RoundEntity } from '../entities/round.entity';
import { RoundStatus } from '../entities/round-status.enum';
import { RoundSubmissionEntity } from '../entities/round-submission.entity';
import { MatchRoundSuggestionsResponse } from '../types/match-round-suggestions-response.type';
import { MatchRoundSubmitResponse } from '../types/match-round-submit-response.type';
import { MatchRoundValidationResult } from '../types/match-round-validation-result.type';
import { MatchCatalogService } from './match-catalog.service';
import { DuelResultsService } from './duel-results.service';

@Injectable()
export class MatchRoundsService {
  constructor(
    @InjectRepository(ItemEntity)
    private readonly itemsRepository: Repository<ItemEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchesRepository: Repository<MatchEntity>,
    @InjectRepository(RoundEntity)
    private readonly roundsRepository: Repository<RoundEntity>,
    @InjectRepository(RoundSubmissionEntity)
    private readonly roundSubmissionsRepository: Repository<RoundSubmissionEntity>,
    private readonly matchCatalogService: MatchCatalogService,
    private readonly duelResultsService: DuelResultsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async createInitialRound(matchId: string): Promise<RoundEntity> {
    const existingRound = await this.roundsRepository.findOne({
      where: { matchId, roundNumber: 1 },
    });

    if (existingRound !== null) {
      return existingRound;
    }

    const round = this.roundsRepository.create({
      battleDescription: null,
      lockedAt: null,
      matchId,
      resolvedAt: null,
      roundNumber: 1,
      roundStatus: RoundStatus.Open,
      // Armed later via startRound so the face-off countdown doesn't burn the timer.
      startedAt: null,
      winnerUserId: null,
    });

    return this.roundsRepository.save(round);
  }

  /**
   * Arms the round clock for both clients. Idempotent — the first caller sets
   * `started_at`; later callers receive the same `round_ends_at`.
   */
  async startRound(
    matchId: string,
    roundId: string,
    user: UserEntity,
  ): Promise<{
    round_id: string;
    round_number: number;
    round_ends_at: string;
    round_time_limit_seconds: number;
  }> {
    const { match, round } = await this.getPlayableRoundForUser(
      matchId,
      roundId,
      user.id,
    );

    if (round.roundStatus !== RoundStatus.Open) {
      throw new ConflictException('Round is not open');
    }

    if (match.matchStatus === MatchStatus.Lobby) {
      match.matchStatus = MatchStatus.InProgress;
      match.startedAt = match.startedAt ?? new Date();
      await this.matchesRepository.save(match);
    }

    if (round.startedAt === null) {
      round.startedAt = new Date();
      await this.roundsRepository.save(round);

      const roundEndsAt = new Date(
        round.startedAt.getTime() + match.roundTimeLimitSeconds * 1000,
      ).toISOString();

      this.realtimeGateway.emitToMatch(match.id, 'round_started', {
        round_id: round.id,
        round_number: round.roundNumber,
        round_ends_at: roundEndsAt,
        round_time_limit_seconds: match.roundTimeLimitSeconds,
      });

      return {
        round_id: round.id,
        round_number: round.roundNumber,
        round_ends_at: roundEndsAt,
        round_time_limit_seconds: match.roundTimeLimitSeconds,
      };
    }

    return {
      round_id: round.id,
      round_number: round.roundNumber,
      round_ends_at: new Date(
        round.startedAt.getTime() + match.roundTimeLimitSeconds * 1000,
      ).toISOString(),
      round_time_limit_seconds: match.roundTimeLimitSeconds,
    };
  }

  async ensureCurrentRound(match: MatchEntity): Promise<RoundEntity | null> {
    const currentRound = await this.getCurrentRound(match.id);

    if (currentRound !== null) {
      return currentRound;
    }

    if (
      match.matchStatus === MatchStatus.Cancelled ||
      match.matchStatus === MatchStatus.Completed
    ) {
      return null;
    }

    return this.createInitialRound(match.id);
  }

  async getCurrentRound(matchId: string): Promise<RoundEntity | null> {
    return this.roundsRepository.findOne({
      where: { matchId },
      order: {
        roundNumber: 'DESC',
      },
    });
  }

  async validateInput(
    matchId: string,
    roundId: string,
    user: UserEntity,
    input: string,
  ): Promise<MatchRoundValidationResult> {
    const { round } = await this.getPlayableRoundForUser(
      matchId,
      roundId,
      user.id,
    );

    if (round.roundStatus !== RoundStatus.Open) {
      throw new ConflictException('Round is not open for validation');
    }

    return this.evaluateInput(input);
  }

  async getSuggestions(
    matchId: string,
    roundId: string,
    user: UserEntity,
  ): Promise<MatchRoundSuggestionsResponse> {
    await this.getPlayableRoundForUser(
      matchId,
      roundId,
      user.id,
    );

    return {
      suggestions: this.matchCatalogService.getSuggestions(),
    };
  }

  async submitInput(
    matchId: string,
    roundId: string,
    user: UserEntity,
    input: string,
  ): Promise<MatchRoundSubmitResponse> {
    const { match, round } = await this.getPlayableRoundForUser(
      matchId,
      roundId,
      user.id,
    );

    if (round.roundStatus !== RoundStatus.Open) {
      throw new ConflictException('Round is not open for submissions');
    }

    const existingSubmission = await this.roundSubmissionsRepository.findOne({
      where: {
        roundId: round.id,
        userId: user.id,
      },
    });

    if (existingSubmission !== null) {
      throw new ConflictException('You already submitted for this round');
    }

    const validationResult = this.evaluateInput(input);

    if (!validationResult.is_valid) {
      throw new BadRequestException(validationResult.invalid_reason ?? 'Invalid input');
    }

    const item = await this.getOrCreateItem(
      input,
      validationResult.normalized_input,
    );

    const submission = this.roundSubmissionsRepository.create({
      isLocked: true,
      itemId: item.id,
      lockedAt: new Date(),
      normalizedInput: validationResult.normalized_input,
      rawInput: input.trim(),
      roundId: round.id,
      userId: user.id,
    });

    const savedSubmission = await this.roundSubmissionsRepository.save(submission);
    const submissions = await this.roundSubmissionsRepository.find({
      where: { roundId: round.id },
      relations: {
        item: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const opponentUserId =
      match.player1UserId === user.id ? match.player2UserId : match.player1UserId;

    this.realtimeGateway.emitToUser(opponentUserId, 'opponent_submitted', {
      round_id: round.id,
      round_status:
        submissions.length >= 2 ? RoundStatus.Resolving : round.roundStatus,
    });

    if (submissions.length >= 2) {
      this.realtimeGateway.emitToMatch(match.id, 'battle_started', {
        round_id: round.id,
        round_status: RoundStatus.Resolving,
      });

      await this.resolveRound(match, round, submissions);
    }

    const updatedRound = await this.roundsRepository.findOneByOrFail({ id: round.id });

    return {
      icon_status: item.iconStatus,
      icon_url: item.iconUrl,
      item_id: item.id,
      round_status: updatedRound.roundStatus,
      submission_id: savedSubmission.id,
    };
  }

  private evaluateInput(input: string): MatchRoundValidationResult {
    const normalizedInput = input.trim().toLowerCase().replace(/\s+/g, ' ');

    if (normalizedInput.length === 0) {
      return {
        invalid_reason: 'Input is required',
        is_valid: false,
        level_match: null,
        normalized_input: normalizedInput,
        power_level: null,
        theme_match: null,
      };
    }

    return {
      invalid_reason: null,
      is_valid: true,
      level_match: null,
      normalized_input: normalizedInput,
      power_level: null,
      theme_match: null,
    };
  }

  private async resolveRound(
    match: MatchEntity,
    round: RoundEntity,
    submissions: RoundSubmissionEntity[],
  ): Promise<void> {
    if (submissions.length !== 2) {
      return;
    }

    const [firstSubmission, secondSubmission] = submissions;
    const duelResolution = await this.duelResultsService.resolve(
      firstSubmission,
      secondSubmission,
    );
    const winnerSubmission = duelResolution.winnerSubmission;
    const isTie =
      duelResolution.winnerSlot === 'tie' || winnerSubmission === null;

    round.roundStatus = RoundStatus.Resolving;
    round.lockedAt = new Date();
    await this.roundsRepository.save(round);

    round.battleDescription = duelResolution.battleDescription;
    round.resolvedAt = new Date();
    round.roundStatus = RoundStatus.Resolved;
    round.winnerUserId = winnerSubmission?.userId ?? null;
    await this.roundsRepository.save(round);

    if (winnerSubmission !== null) {
      if (winnerSubmission.userId === match.player1UserId) {
        match.player1Score += 1;
      } else {
        match.player2Score += 1;
      }
    }

    const winningScore = Math.max(match.player1Score, match.player2Score);
    const requiredWins = Math.floor(match.bestOf / 2) + 1;

    const player1Submission = submissions.find(
      (submission) => submission.userId === match.player1UserId,
    );
    const player2Submission = submissions.find(
      (submission) => submission.userId === match.player2UserId,
    );

    this.realtimeGateway.emitToMatch(match.id, 'battle_resolved', {
      battle_description: round.battleDescription,
      headline: duelResolution.headline,
      player_1_input: player1Submission?.rawInput ?? '',
      player_1_score: match.player1Score,
      player_1_user_id: match.player1UserId,
      player_2_input: player2Submission?.rawInput ?? '',
      player_2_score: match.player2Score,
      player_2_user_id: match.player2UserId,
      round_id: round.id,
      winner_item_id: winnerSubmission?.itemId ?? null,
      winner_user_id: winnerSubmission?.userId ?? null,
      is_tie: isTie,
    });

    if (winningScore >= requiredWins || round.roundNumber >= match.bestOf) {
      match.endedAt = new Date();
      match.matchStatus = MatchStatus.Completed;
      match.winnerUserId =
        match.player1Score >= match.player2Score
          ? match.player1UserId
          : match.player2UserId;

      await this.matchesRepository.save(match);

      this.realtimeGateway.emitToMatch(match.id, 'match_completed', {
        final_score: {
          player_1: match.player1Score,
          player_2: match.player2Score,
        },
        match_id: match.id,
        winner_user_id: match.winnerUserId,
      });

      return;
    }

    await this.matchesRepository.save(match);
    const nextRound = this.roundsRepository.create({
      battleDescription: null,
      lockedAt: null,
      matchId: match.id,
      resolvedAt: null,
      roundNumber: round.roundNumber + 1,
      roundStatus: RoundStatus.Open,
      // Clock is armed when clients call startRound after the verdict beat.
      startedAt: null,
      winnerUserId: null,
    });
    const savedNextRound = await this.roundsRepository.save(nextRound);

    this.realtimeGateway.emitToMatch(match.id, 'next_round_started', {
      round_id: savedNextRound.id,
      round_number: savedNextRound.roundNumber,
      round_ends_at: null,
      round_time_limit_seconds: match.roundTimeLimitSeconds,
    });
  }

  private async getOrCreateItem(
    rawInput: string,
    normalizedInput: string,
  ): Promise<ItemEntity> {
    const existingItem = await this.itemsRepository.findOne({
      where: { normalizedName: normalizedInput },
    });

    if (existingItem !== null && existingItem !== undefined) {
      return existingItem;
    }

    const item = this.itemsRepository.create({
      blockedReason: null,
      iconStatus: ItemIconStatus.Pending,
      iconUrl: null,
      isValid: true,
      metadataJson: null,
      normalizedName: normalizedInput,
      powerLevel: null,
      rawInputExample: rawInput.trim(),
      themeTags: null,
    });

    return this.itemsRepository.save(item);
  }

  private async getPlayableRoundForUser(
    matchId: string,
    roundId: string,
    userId: string,
  ): Promise<{ match: MatchEntity; round: RoundEntity }> {
    const match = await this.matchesRepository.findOne({
      where: { id: matchId },
    });

    if (match === null) {
      throw new NotFoundException('Match not found');
    }

    if (match.player1UserId !== userId && match.player2UserId !== userId) {
      throw new ForbiddenException('You do not have access to this match');
    }

    if (
      match.matchStatus === MatchStatus.Cancelled ||
      match.matchStatus === MatchStatus.Completed
    ) {
      throw new ConflictException('Match is no longer active');
    }

    const round = await this.roundsRepository.findOne({
      where: {
        id: roundId,
        matchId: match.id,
      },
    });

    if (round === null) {
      throw new NotFoundException('Round not found');
    }

    return {
      match,
      round,
    };
  }
}

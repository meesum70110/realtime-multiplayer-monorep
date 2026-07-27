import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DuelResultEntity } from '../entities/duel-result.entity';
import { RoundSubmissionEntity } from '../entities/round-submission.entity';
import { DuelResolverService } from './duel-resolver.service';

type ResolvedDuel = {
  battleDescription: string;
  headline: string;
  source: 'cache' | 'groq' | 'mock_api';
  winnerSlot: 'first' | 'second' | 'tie';
  winnerSubmission: RoundSubmissionEntity | null;
};

@Injectable()
export class DuelResultsService {
  private readonly logger = new Logger(DuelResultsService.name);

  constructor(
    @InjectRepository(DuelResultEntity)
    private readonly duelResultsRepository: Repository<DuelResultEntity>,
    private readonly duelResolverService: DuelResolverService,
  ) {}

  async resolve(
    firstSubmission: RoundSubmissionEntity,
    secondSubmission: RoundSubmissionEntity,
  ): Promise<ResolvedDuel> {
    const pair = this.createCanonicalConceptPair(
      firstSubmission,
      secondSubmission,
    );
    const cachedResult = await this.duelResultsRepository.findOne({
      where: {
        pairKey: pair.pairKey,
      },
    });

    if (cachedResult !== null) {
      const winnerSlot = this.normalizeCachedWinnerSlot(cachedResult);
      return {
        battleDescription: cachedResult.battleDescription,
        headline: cachedResult.headline?.trim() || 'VERDICT',
        source: 'cache',
        winnerSlot,
        winnerSubmission: this.pickWinnerFromCache(
          cachedResult,
          firstSubmission,
          secondSubmission,
          winnerSlot,
        ),
      };
    }

    const resolvedDuel = await this.duelResolverService.resolve({
      firstInput: firstSubmission.normalizedInput,
      secondInput: secondSubmission.normalizedInput,
    });

    const winnerSubmission =
      resolvedDuel.winner_slot === 'tie'
        ? null
        : resolvedDuel.winner_slot === 'first'
          ? firstSubmission
          : secondSubmission;

    const duelResult = this.duelResultsRepository.create({
      battleDescription: resolvedDuel.battle_description,
      headline: resolvedDuel.headline,
      itemAId: pair.itemAId,
      itemBId: pair.itemBId,
      pairKey: pair.pairKey,
      resultType: resolvedDuel.winner_slot === 'tie' ? 'tie' : 'win',
      winnerItemId: winnerSubmission?.itemId ?? null,
      winnerSlot:
        resolvedDuel.winner_slot === 'tie' ? null : resolvedDuel.winner_slot,
    });

    try {
      await this.duelResultsRepository.save(duelResult);
    } catch (error: unknown) {
      // Race: another request may have cached the same concept pair first.
      this.logger.warn(
        `Failed to cache duel result for ${pair.pairKey}: ${String(error)}`,
      );
    }

    return {
      battleDescription: resolvedDuel.battle_description,
      headline: resolvedDuel.headline,
      source: resolvedDuel.battle_description.includes('gets past')
        ? 'mock_api'
        : 'groq',
      winnerSlot: resolvedDuel.winner_slot,
      winnerSubmission,
    };
  }

  private normalizeCachedWinnerSlot(
    duelResult: DuelResultEntity,
  ): 'first' | 'second' | 'tie' {
    if (duelResult.resultType === 'tie' || duelResult.winnerItemId === null) {
      return 'tie';
    }
    if (duelResult.winnerSlot === 'second') {
      return 'second';
    }
    if (duelResult.winnerSlot === 'first') {
      return 'first';
    }
    return 'tie';
  }

  private pickWinnerFromCache(
    duelResult: DuelResultEntity,
    firstSubmission: RoundSubmissionEntity,
    secondSubmission: RoundSubmissionEntity,
    winnerSlot: 'first' | 'second' | 'tie',
  ): RoundSubmissionEntity | null {
    if (winnerSlot === 'tie' || duelResult.winnerItemId === null) {
      return null;
    }

    // Prefer absolute item id so Lion vs Tiger === Tiger vs Lion.
    if (duelResult.winnerItemId === firstSubmission.itemId) {
      return firstSubmission;
    }
    if (duelResult.winnerItemId === secondSubmission.itemId) {
      return secondSubmission;
    }

    // Same-concept edge case (identical item ids): fall back to stored slot.
    if (firstSubmission.itemId === secondSubmission.itemId) {
      return duelResult.winnerSlot === 'second'
        ? secondSubmission
        : firstSubmission;
    }

    return null;
  }

  /**
   * Normalize + alphabetically sort concepts so "Lion vs Tiger" and
   * "Tiger vs Lion" share one cache row.
   */
  private createCanonicalConceptPair(
    firstSubmission: RoundSubmissionEntity,
    secondSubmission: RoundSubmissionEntity,
  ): {
    itemAId: string;
    itemBId: string;
    pairKey: string;
  } {
    const firstConcept = firstSubmission.normalizedInput.trim().toLowerCase();
    const secondConcept = secondSubmission.normalizedInput.trim().toLowerCase();

    if (firstConcept <= secondConcept) {
      return {
        itemAId: firstSubmission.itemId,
        itemBId: secondSubmission.itemId,
        pairKey: `${firstConcept}::${secondConcept}`,
      };
    }

    return {
      itemAId: secondSubmission.itemId,
      itemBId: firstSubmission.itemId,
      pairKey: `${secondConcept}::${firstConcept}`,
    };
  }
}

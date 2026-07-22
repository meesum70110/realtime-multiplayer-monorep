import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DuelResultEntity } from '../entities/duel-result.entity';
import { RoundSubmissionEntity } from '../entities/round-submission.entity';
import { DuelResolverService } from './duel-resolver.service';

type ResolvedDuel = {
  battleDescription: string;
  source: 'cache' | 'mock_api';
  winnerSubmission: RoundSubmissionEntity;
};

@Injectable()
export class DuelResultsService {
  constructor(
    @InjectRepository(DuelResultEntity)
    private readonly duelResultsRepository: Repository<DuelResultEntity>,
    private readonly duelResolverService: DuelResolverService,
  ) {}

  async resolve(
    firstSubmission: RoundSubmissionEntity,
    secondSubmission: RoundSubmissionEntity,
  ): Promise<ResolvedDuel> {
    const pair = this.createCanonicalPair(
      firstSubmission.itemId,
      secondSubmission.itemId,
    );
    const cachedResult = await this.duelResultsRepository.findOne({
      where: {
        pairKey: pair.pairKey,
      },
    });

    if (cachedResult !== null) {
      return {
        battleDescription: cachedResult.battleDescription,
        source: 'cache',
        winnerSubmission: this.pickWinnerFromCache(
          cachedResult,
          firstSubmission,
          secondSubmission,
        ),
      };
    }

    const resolvedDuel = this.duelResolverService.resolve({
      firstInput: firstSubmission.normalizedInput,
      secondInput: secondSubmission.normalizedInput,
    });
    const winnerSubmission =
      resolvedDuel.winner_slot === 'first' ? firstSubmission : secondSubmission;

    const duelResult = this.duelResultsRepository.create({
      battleDescription: resolvedDuel.battle_description,
      itemAId: pair.itemAId,
      itemBId: pair.itemBId,
      pairKey: pair.pairKey,
      resultType: 'win',
      winnerItemId: winnerSubmission.itemId,
      winnerSlot: resolvedDuel.winner_slot,
    });

    await this.duelResultsRepository.save(duelResult);

    return {
      battleDescription: resolvedDuel.battle_description,
      source: 'mock_api',
      winnerSubmission,
    };
  }

  private pickWinnerFromCache(
    duelResult: DuelResultEntity,
    firstSubmission: RoundSubmissionEntity,
    secondSubmission: RoundSubmissionEntity,
  ): RoundSubmissionEntity {
    if (firstSubmission.itemId === secondSubmission.itemId) {
      return duelResult.winnerSlot === 'second'
        ? secondSubmission
        : firstSubmission;
    }

    return duelResult.winnerItemId === firstSubmission.itemId
      ? firstSubmission
      : secondSubmission;
  }

  private createCanonicalPair(firstItemId: string, secondItemId: string): {
    itemAId: string;
    itemBId: string;
    pairKey: string;
  } {
    if (firstItemId <= secondItemId) {
      return {
        itemAId: firstItemId,
        itemBId: secondItemId,
        pairKey: `${firstItemId}::${secondItemId}`,
      };
    }

    return {
      itemAId: secondItemId,
      itemBId: firstItemId,
      pairKey: `${secondItemId}::${firstItemId}`,
    };
  }
}

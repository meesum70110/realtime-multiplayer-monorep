import { Injectable } from '@nestjs/common';

import { MockDuelResolveResponse } from '../types/mock-duel-resolve-response.type';

@Injectable()
export class DuelResolverService {
  resolve(input: {
    firstInput: string;
    secondInput: string;
  }): MockDuelResolveResponse {
    const winnerSlot: 'first' | 'second' =
      Math.random() < 0.5 ? 'first' : 'second';
    const winnerInput =
      winnerSlot === 'first' ? input.firstInput : input.secondInput;
    const loserInput =
      winnerSlot === 'first' ? input.secondInput : input.firstInput;

    return {
      battle_description:
        input.firstInput === input.secondInput
          ? `${winnerInput} clashes with itself and ${winnerSlot} gets the edge.`
          : `${winnerInput} gets past ${loserInput}.`,
      winner_slot: winnerSlot,
    };
  }
}

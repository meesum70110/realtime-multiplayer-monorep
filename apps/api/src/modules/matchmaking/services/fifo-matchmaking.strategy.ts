import { Injectable } from '@nestjs/common';

import { MatchmakingStrategy } from '../types/matchmaking-strategy.interface';
import { MatchmakingQueueEntry } from '../types/matchmaking-queue-entry.type';

@Injectable()
export class FifoMatchmakingStrategy implements MatchmakingStrategy {
  findOpponent(
    currentEntry: MatchmakingQueueEntry,
    waitingEntries: MatchmakingQueueEntry[],
  ): MatchmakingQueueEntry | null {
    for (const waitingEntry of waitingEntries) {
      if (waitingEntry.id === currentEntry.id) {
        continue;
      }

      if (waitingEntry.userId === currentEntry.userId) {
        continue;
      }

      if (this.isModeCompatible(waitingEntry, currentEntry)) {
        return waitingEntry;
      }
    }

    return null;
  }

  private isModeCompatible(
    firstEntry: MatchmakingQueueEntry,
    secondEntry: MatchmakingQueueEntry,
  ): boolean {
    return JSON.stringify(firstEntry.modeSnapshot) === JSON.stringify(secondEntry.modeSnapshot);
  }
}

import { MatchmakingQueueEntry } from './matchmaking-queue-entry.type';

export interface MatchmakingStrategy {
  findOpponent(
    currentEntry: MatchmakingQueueEntry,
    waitingEntries: MatchmakingQueueEntry[],
  ): MatchmakingQueueEntry | null;
}

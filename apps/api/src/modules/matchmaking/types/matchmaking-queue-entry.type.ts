import { QueueStatus } from '../enums/queue-status.enum';
import { MatchmakingModeSnapshot } from './matchmaking-mode-snapshot.type';

export type MatchmakingQueueEntry = {
  cancelledAt: Date | null;
  createdAt: Date;
  id: string;
  matchId: string | null;
  matchedAt: Date | null;
  modeSnapshot: MatchmakingModeSnapshot;
  status: QueueStatus;
  updatedAt: Date;
  userId: string;
};

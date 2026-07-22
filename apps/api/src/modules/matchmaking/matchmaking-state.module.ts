import { Module } from '@nestjs/common';

import { MatchmakingQueueService } from './services/matchmaking-queue.service';

@Module({
  providers: [MatchmakingQueueService],
  exports: [MatchmakingQueueService],
})
export class MatchmakingStateModule {}

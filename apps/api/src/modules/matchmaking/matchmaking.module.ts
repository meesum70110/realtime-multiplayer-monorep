import { Module } from '@nestjs/common';

import { MatchesModule } from '../matches/matches.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { MatchmakingController } from './matchmaking.controller';
import { MatchmakingStateModule } from './matchmaking-state.module';
import { MatchmakingService } from './matchmaking.service';
import { FifoMatchmakingStrategy } from './services/fifo-matchmaking.strategy';
import { MatchmakingModeService } from './services/matchmaking-mode.service';
import { PrivateLobbyService } from './services/private-lobby.service';

@Module({
  imports: [MatchesModule, MatchmakingStateModule, RealtimeModule],
  controllers: [MatchmakingController],
  providers: [
    MatchmakingService,
    FifoMatchmakingStrategy,
    MatchmakingModeService,
    PrivateLobbyService,
  ],
})
export class MatchmakingModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MatchmakingStateModule } from '../matchmaking/matchmaking-state.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { DuelResolverController } from './duel-resolver.controller';
import { DuelResultEntity } from './entities/duel-result.entity';
import { ItemEntity } from './entities/item.entity';
import { MatchEntity } from './entities/match.entity';
import { RoundEntity } from './entities/round.entity';
import { RoundSubmissionEntity } from './entities/round-submission.entity';
import { MatchesController } from './matches.controller';
import { MatchCatalogService } from './services/match-catalog.service';
import { DuelResolverService } from './services/duel-resolver.service';
import { DuelResultsService } from './services/duel-results.service';
import { MatchRoundsService } from './services/match-rounds.service';
import { MatchesService } from './matches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DuelResultEntity,
      ItemEntity,
      MatchEntity,
      RoundEntity,
      RoundSubmissionEntity,
    ]),
    MatchmakingStateModule,
    RealtimeModule,
  ],
  controllers: [DuelResolverController, MatchesController],
  providers: [
    MatchCatalogService,
    DuelResolverService,
    DuelResultsService,
    MatchRoundsService,
    MatchesService,
  ],
  exports: [MatchRoundsService, MatchesService],
})
export class MatchesModule {}

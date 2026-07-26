import { Injectable } from '@nestjs/common';

import { MatchModeType } from '../../matches/entities/match-mode-type.enum';
import { MatchRuleType } from '../../matches/entities/match-rule-type.enum';
import { MatchmakingModeSnapshot } from '../types/matchmaking-mode-snapshot.type';

@Injectable()
export class MatchmakingModeService {
  private readonly activeMode: MatchmakingModeSnapshot = {
    bestOf: 3,
    levelMax: null,
    levelMin: null,
    levelModeType: null,
    modeType: MatchModeType.OneVsOne,
    roundTimeLimitSeconds: 15,
    ruleType: MatchRuleType.Open,
    themeName: null,
    totalPointsPerPlayer: null,
  };

  getActiveMode(): MatchmakingModeSnapshot {
    return { ...this.activeMode };
  }
}

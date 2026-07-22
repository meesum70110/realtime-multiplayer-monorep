import { LevelModeType } from '../../matches/entities/level-mode-type.enum';
import { MatchModeType } from '../../matches/entities/match-mode-type.enum';
import { MatchRuleType } from '../../matches/entities/match-rule-type.enum';

export type MatchmakingModeSnapshot = {
  bestOf: number;
  levelMax: number | null;
  levelMin: number | null;
  levelModeType: LevelModeType | null;
  modeType: MatchModeType;
  roundTimeLimitSeconds: number;
  ruleType: MatchRuleType;
  themeName: string | null;
  totalPointsPerPlayer: number | null;
};

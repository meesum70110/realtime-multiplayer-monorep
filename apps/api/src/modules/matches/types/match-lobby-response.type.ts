import { LevelModeType } from '../entities/level-mode-type.enum';
import { MatchModeType } from '../entities/match-mode-type.enum';
import { MatchRuleType } from '../entities/match-rule-type.enum';
import { MatchStatus } from '../entities/match-status.enum';
import { RoundStatus } from '../entities/round-status.enum';

export type MatchLobbyResponse = {
  best_of: number;
  created_at: string;
  current_round_id: string | null;
  current_round_number: number | null;
  current_round_status: RoundStatus | null;
  level_max: number | null;
  level_min: number | null;
  level_mode_type: LevelModeType | null;
  match_id: string;
  match_status: MatchStatus;
  mode_type: MatchModeType;
  player_1: {
    display_name: string;
    id: string;
    submitted: boolean;
  };
  player_1_score: number;
  player_2: {
    display_name: string;
    id: string;
    submitted: boolean;
  };
  player_2_score: number;
  player_side: 'player_1' | 'player_2';
  /** Absolute ISO timestamp when the current round timer should hit zero. Null if no open round. */
  round_ends_at: string | null;
  round_time_limit_seconds: number;
  rule_type: MatchRuleType;
  theme_name: string | null;
  total_points_per_player: number | null;
};

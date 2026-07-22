import { MatchStatus } from '../entities/match-status.enum';

export type EndMatchResponse = {
  match_id: string;
  match_status: MatchStatus;
  message: string;
  released_players: number;
};

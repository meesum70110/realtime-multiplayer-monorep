import { IsEnum, IsOptional } from 'class-validator';

import { MatchModeType } from '../../matches/entities/match-mode-type.enum';

export class JoinQueueDto {
  @IsOptional()
  @IsEnum(MatchModeType)
  mode_type?: MatchModeType;
}

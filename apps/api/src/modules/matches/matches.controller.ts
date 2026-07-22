import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../common/auth/current-user.decorator';
import { UserEntity } from '../auth/entities/user.entity';
import { SubmitRoundInputDto } from './dto/submit-round-input.dto';
import { ValidateRoundInputDto } from './dto/validate-round-input.dto';
import { MatchRoundsService } from './services/match-rounds.service';
import { MatchesService } from './matches.service';

@Controller('matches')
@UseInterceptors(NoFilesInterceptor())
export class MatchesController {
  constructor(
    private readonly matchRoundsService: MatchRoundsService,
    private readonly matchesService: MatchesService,
  ) {}

  @Get(':matchId')
  getMatch(
    @Param('matchId', new ParseUUIDPipe()) matchId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchesService.getLobbyMatchForUser(matchId, user.id);
  }

  @Post(':matchId/end')
  endMatch(
    @Param('matchId', new ParseUUIDPipe()) matchId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchesService.endMatchForTesting(matchId, user.id);
  }

  @Post(':matchId/rounds/:roundId/validate')
  validateRoundInput(
    @Param('matchId', new ParseUUIDPipe()) matchId: string,
    @Param('roundId', new ParseUUIDPipe()) roundId: string,
    @Body() request: ValidateRoundInputDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchRoundsService.validateInput(
      matchId,
      roundId,
      user,
      request.input,
    );
  }

  @Get(':matchId/rounds/:roundId/suggestions')
  getRoundSuggestions(
    @Param('matchId', new ParseUUIDPipe()) matchId: string,
    @Param('roundId', new ParseUUIDPipe()) roundId: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchRoundsService.getSuggestions(matchId, roundId, user);
  }

  @Post(':matchId/rounds/:roundId/submit')
  submitRoundInput(
    @Param('matchId', new ParseUUIDPipe()) matchId: string,
    @Param('roundId', new ParseUUIDPipe()) roundId: string,
    @Body() request: SubmitRoundInputDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.matchRoundsService.submitInput(
      matchId,
      roundId,
      user,
      request.input,
    );
  }
}
